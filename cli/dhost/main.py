import io
import os
import subprocess
import sys
import tarfile
import tempfile
import time
from pathlib import Path
from typing import Optional

import httpx
import typer
from rich.console import Console
from rich.table import Table

from . import client as api
from . import ledger
from .detect import detect_stack, maybe_refine_with_ai

app = typer.Typer(help="decentralized.host CLI")
node_app = typer.Typer(help="Manage mesh nodes")
app.add_typer(node_app, name="node")
keys_app = typer.Typer(help="Manage SSH keys allowed to git push")
app.add_typer(keys_app, name="keys")

console = Console()


def _find_repo_root() -> Optional[Path]:
    cur = Path.cwd()
    for candidate in [cur, *cur.parents]:
        if (candidate / "node-agent" / "Dockerfile").exists():
            return candidate
    return None


@app.command()
def init():
    """Scan the current directory and generate an optimized Dockerfile."""
    project_dir = Path.cwd()
    stack, dockerfile = detect_stack(project_dir)
    console.print(f"[bold cyan]⟡[/] Detected: [bold]{stack}[/]")

    dockerfile_refined = maybe_refine_with_ai(stack, dockerfile, project_dir)
    if os.getenv("GOOGLE_API_KEY") and dockerfile_refined != dockerfile:
        console.print("[bold cyan]⟡[/] Refined Dockerfile with Gemini")

    dockerfile_path = project_dir / "Dockerfile"
    if dockerfile_path.exists():
        console.print("[yellow]Dockerfile already exists, leaving it untouched.[/]")
    else:
        dockerfile_path.write_text(dockerfile_refined)
        console.print(f"[bold green]⟡[/] Generated [bold]Dockerfile[/] ({len(dockerfile_refined)} bytes)")

    cfg = api.load_config()
    cfg.setdefault("name", project_dir.name)
    cfg.setdefault("api_url", os.getenv("DHOST_API_URL", "http://localhost:8000"))
    cfg.setdefault("deploy_key", os.getenv("DHOST_DEPLOY_KEY", "dev-deploy-key"))
    api.save_config(cfg)
    console.print(f"[bold green]⟡[/] Created [bold].dhost/config.yml[/]")
    console.print(f"\nNext: [bold]dhost deploy {cfg['name']}[/]")


def _run(cmd: list[str]) -> None:
    console.print(f"[dim]$ {' '.join(cmd)}[/]")
    result = subprocess.run(cmd)
    if result.returncode != 0:
        console.print(f"[bold red]Command failed:[/] {' '.join(cmd)}")
        raise typer.Exit(1)


@app.command()
def deploy(
    name: Optional[str] = typer.Argument(None, help="Deployment name (defaults to config)"),
    port: int = typer.Option(8080, help="Container port your app listens on"),
    registry: str = typer.Option("localhost:5000", help="Registry host:port"),
):
    """Build, push, and deploy the current project onto the mesh."""
    cfg = api.load_config()
    name = name or cfg.get("name") or Path.cwd().name
    image = f"{registry}/{name}:latest"

    if not (Path.cwd() / "Dockerfile").exists():
        console.print("[yellow]No Dockerfile found, running 'dhost init' first...[/]")
        init()

    console.print(f"[bold cyan]⟡[/] Building image [bold]{image}[/]...")
    _run(["docker", "build", "-t", image, "."])

    console.print(f"[bold cyan]⟡[/] Pushing to registry...")
    _run(["docker", "push", image])

    console.print(f"[bold cyan]⟡[/] Scheduling on the mesh...")
    with api.client() as http:
        try:
            resp = http.post("/deployments", json={"name": name, "image": image, "container_port": port})
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            console.print(f"[bold red]Deploy failed:[/] {e.response.text}")
            raise typer.Exit(1)
        except httpx.ConnectError:
            console.print(f"[bold red]Could not reach control plane at {api.api_url()}[/]")
            console.print("Is the mesh running? Try: [bold]docker compose up -d[/]")
            raise typer.Exit(1)

        deployment = resp.json()

        console.print(f"[bold cyan]⟡[/] Waiting for container to come up...")
        for _ in range(60):
            status_resp = http.get(f"/deployments/{name}")
            status_resp.raise_for_status()
            deployment = status_resp.json()
            if deployment["status"] in ("running", "failed"):
                break
            time.sleep(2)

    if deployment["status"] == "running":
        console.print(f"\n[bold green]🎉 Live at http://{deployment['subdomain']}[/]")
    else:
        console.print(f"\n[bold red]Deployment failed:[/] {deployment.get('error')}")
        raise typer.Exit(1)


def _tar_from_dir(root: Path, files: list[str]) -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for rel in files:
            tar.add(root / rel, arcname=rel)
    buf.seek(0)
    return buf.read()


def _do_ship(project_dir: Path, name: str, port: int, message: str, domain: str = "") -> dict:
    stack, dockerfile_content = detect_stack(project_dir)
    console.print(f"[bold cyan]⟡[/] Detected: [bold]{stack}[/]")
    dockerfile_content = maybe_refine_with_ai(stack, dockerfile_content, project_dir)

    files = ledger.iter_project_files(project_dir)
    snapshot = ledger.create_snapshot(project_dir, message, files=files)
    console.print(
        f"[bold cyan]⟡[/] Snapshotted {len(snapshot['files'])} files -> "
        f"[bold]{snapshot['id']}[/] ({message}) -- no Git used"
    )

    console.print("[bold cyan]⟡[/] Uploading source, building on the mesh (no local Docker needed)...")
    archive_bytes = _tar_from_dir(project_dir, files)

    with api.build_client() as http:
        try:
            resp = http.post(
                "/deployments/ship",
                data={
                    "name": name, "container_port": str(port), "dockerfile": dockerfile_content,
                    "message": message, "snapshot_id": snapshot["id"], "custom_domain": domain,
                },
                files={"archive": ("src.tar.gz", archive_bytes, "application/gzip")},
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            console.print(f"[bold red]Ship failed:[/] {e.response.text}")
            raise typer.Exit(1)
        except httpx.ConnectError:
            console.print(f"[bold red]Could not reach control plane at {api.api_url()}[/]")
            console.print("Is the mesh running? Try: [bold]docker compose up -d[/]")
            raise typer.Exit(1)
        return resp.json()


@app.command()
def ship(
    name: Optional[str] = typer.Argument(None, help="Deployment name (defaults to folder name)"),
    port: int = typer.Option(8080, help="Container port your app listens on"),
    message: str = typer.Option("ship", "--message", "-m", help="Snapshot message"),
    domain: str = typer.Option("", "--domain", help="Bind a bare custom domain (e.g. --domain decentralized.host) instead of <name>.<BASE_DOMAIN>"),
):
    """Detect your stack, snapshot it (no Git), and build+deploy it on the mesh
    (no local Docker required -- the build happens on the node agent)."""
    project_dir = Path.cwd()
    cfg = api.load_config()
    name = name or cfg.get("name") or project_dir.name
    cfg["name"] = name
    cfg["port"] = port
    if domain:
        cfg["domain"] = domain
    cfg.setdefault("api_url", os.getenv("DHOST_API_URL", "http://localhost:8000"))
    cfg.setdefault("deploy_key", os.getenv("DHOST_DEPLOY_KEY", "dev-deploy-key"))
    api.save_config(cfg)

    deployment = _do_ship(project_dir, name, port, message, domain=domain or cfg.get("domain", ""))

    if deployment["status"] == "running":
        console.print(f"\n[bold green]🎉 Live at http://{deployment['subdomain']}[/]")
    else:
        console.print(f"\n[bold red]Deployment failed:[/] {deployment.get('error')}")
        raise typer.Exit(1)


@app.command()
def update(message: str = typer.Argument(..., help="What changed")):
    """Snapshot your current changes (no Git) and redeploy instantly."""
    project_dir = Path.cwd()
    cfg = api.load_config()
    if "name" not in cfg:
        console.print("[yellow]No project shipped yet here. Run 'dhost ship' first.[/]")
        raise typer.Exit(1)
    name = cfg["name"]
    port = cfg.get("port", 8080)

    deployment = _do_ship(project_dir, name, port, message, domain=cfg.get("domain", ""))

    if deployment["status"] == "running":
        console.print(f"\n[bold green]✔ Deployed![/] http://{deployment['subdomain']}")
    else:
        console.print(f"\n[bold red]Deployment failed:[/] {deployment.get('error')}")
        raise typer.Exit(1)


@app.command()
def history():
    """Show this project's local snapshot history (no Git involved)."""
    project_dir = Path.cwd()
    snapshots = ledger.list_snapshots(project_dir)
    if not snapshots:
        console.print("[yellow]No snapshots yet. Run 'dhost ship' first.[/]")
        return

    table = Table(title="Snapshot History (.dhost/ledger)")
    for col in ["id", "message", "when", "files"]:
        table.add_column(col)
    for s in reversed(snapshots):
        when = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(s["timestamp"]))
        table.add_row(s["id"], s["message"], when, str(len(s["files"])))
    console.print(table)


@app.command()
def rollback(snapshot_id: str):
    """Restore a previous snapshot and redeploy it -- no Git required."""
    project_dir = Path.cwd()
    snapshot = ledger.get_snapshot(project_dir, snapshot_id)
    if snapshot is None:
        console.print(f"[red]No snapshot matching '{snapshot_id}'[/]")
        raise typer.Exit(1)

    cfg = api.load_config()
    if "name" not in cfg:
        console.print("[yellow]No project shipped yet here. Run 'dhost ship' first.[/]")
        raise typer.Exit(1)
    name = cfg["name"]
    port = cfg.get("port", 8080)

    with tempfile.TemporaryDirectory() as tmp:
        restore_dir = Path(tmp)
        ledger.restore_snapshot(project_dir, snapshot, restore_dir)
        console.print(
            f"[bold cyan]⟡[/] Restored snapshot [bold]{snapshot['id']}[/] "
            f"({snapshot['message']}) to a build sandbox"
        )

        stack, dockerfile_content = detect_stack(restore_dir)
        console.print(f"[bold cyan]⟡[/] Detected: [bold]{stack}[/]")

        files = list(snapshot["files"].keys())
        archive_bytes = _tar_from_dir(restore_dir, files)

        console.print("[bold cyan]⟡[/] Rebuilding and redeploying on the mesh...")
        with api.build_client() as http:
            resp = http.post(
                "/deployments/ship",
                data={
                    "name": name, "container_port": str(port), "dockerfile": dockerfile_content,
                    "message": f"rollback to {snapshot['id']} ({snapshot['message']})",
                    "snapshot_id": snapshot["id"],
                },
                files={"archive": ("src.tar.gz", archive_bytes, "application/gzip")},
            )
            resp.raise_for_status()
            deployment = resp.json()

    if deployment["status"] == "running":
        console.print(f"\n[bold green]✔ Rolled back to {snapshot['id']}![/] http://{deployment['subdomain']}")
    else:
        console.print(f"\n[bold red]Rollback failed:[/] {deployment.get('error')}")
        raise typer.Exit(1)


@app.command()
def status(name: str):
    """Check a deployment's status."""
    with api.client() as http:
        resp = http.get(f"/deployments/{name}")
        if resp.status_code == 404:
            console.print(f"[red]No deployment named '{name}'[/]")
            raise typer.Exit(1)
        resp.raise_for_status()
        d = resp.json()

    table = Table(show_header=False)
    for key in ["name", "status", "image", "node_id", "url", "container_id", "error"]:
        table.add_row(key, str(d.get(key)))
    console.print(table)


@app.command()
def logs(name: str):
    """Stream (tail) a deployment's container logs."""
    with api.client() as http:
        resp = http.get(f"/deployments/{name}/logs")
        resp.raise_for_status()
        console.print(resp.json().get("logs", ""))


@node_app.command("join")
def node_join(
    node_name: Optional[str] = typer.Option(None, help="Name for this node"),
    control_plane_url: str = typer.Option("http://control-plane:8000", help="Control plane URL as seen from inside the mesh network"),
):
    """Register this machine as a node in the mesh (builds & runs the node agent locally)."""
    root = _find_repo_root()
    if root is None:
        console.print("[bold red]Could not find node-agent/Dockerfile.[/] "
                       "Run this from inside the decentralized.host repo.")
        raise typer.Exit(1)

    join_secret = os.getenv("NODE_JOIN_SECRET", "dev-join-secret")
    node_name = node_name or f"node-{int(time.time())}"

    console.print("[bold cyan]⟡[/] Building node-agent image...")
    _run(["docker", "build", "-t", "dhost/node-agent:latest", "-f", str(root / "node-agent" / "Dockerfile"), str(root)])

    container_name = f"dhost-node-agent-{node_name}"
    console.print(f"[bold cyan]⟡[/] Starting node agent '{node_name}'...")
    _run([
        "docker", "run", "-d", "--name", container_name,
        "--network", "dhost-mesh",
        "-v", "/var/run/docker.sock:/var/run/docker.sock",
        "-e", f"CONTROL_PLANE_URL={control_plane_url}",
        "-e", f"NODE_JOIN_SECRET={join_secret}",
        "-e", f"NODE_NAME={node_name}",
        "dhost/node-agent:latest",
    ])
    console.print(f"[bold green]⟡[/] Node agent container '{container_name}' started.")
    console.print("Check it registered with: [bold]dhost node list[/]")


@node_app.command("list")
def node_list():
    """List all nodes in the mesh and their health."""
    with api.client() as http:
        resp = http.get("/nodes")
        resp.raise_for_status()
        nodes = resp.json()

    table = Table(title="Mesh Nodes")
    for col in ["name", "id", "status", "region", "cpu_used_pct", "ram_used_mb", "wallet_pubkey"]:
        table.add_column(col)
    for n in nodes:
        table.add_row(
            n["name"], n["id"][:8], n["status"], n["region"],
            f"{n['cpu_used_pct']:.1f}%", f"{n['ram_used_mb']:.0f}MB",
            n.get("wallet_pubkey") or "-",
        )
    console.print(table)


@app.command()
def wallet(node_id: str, pubkey: str):
    """Associate a Solana devnet wallet with a node (to receive credits)."""
    with api.client() as http:
        resp = http.post(f"/blockchain/nodes/{node_id}/wallet", json={"pubkey": pubkey})
        resp.raise_for_status()
    console.print(f"[bold green]⟡[/] Wallet {pubkey} linked to node {node_id}")


@app.command()
def credits(node_id: str):
    """Show a node's DHOST Credits balance and mint history."""
    with api.client() as http:
        resp = http.get(f"/blockchain/credits/{node_id}")
        if resp.status_code == 404:
            console.print(f"[red]No node '{node_id}'[/]")
            raise typer.Exit(1)
        resp.raise_for_status()
        summary = resp.json()

    console.print(f"Wallet: {summary['wallet_pubkey'] or '(not set)'}")
    console.print(f"[bold]Total credits: {summary['total_credits']}[/]")
    table = Table(title="Ledger")
    for col in ["amount", "tx_signature", "created_at"]:
        table.add_column(col)
    for entry in summary["ledger"]:
        table.add_row(str(entry["amount"]), entry.get("tx_signature") or "-", entry["created_at"])
    console.print(table)


@keys_app.command("add")
def keys_add(label: str, pubkey_path: Path = typer.Argument(..., help="Path to a public key, e.g. ~/.ssh/id_ed25519.pub")):
    """Register an SSH public key allowed to 'git push' to this mesh's git server."""
    if not pubkey_path.exists():
        console.print(f"[red]No such file: {pubkey_path}[/]")
        raise typer.Exit(1)
    public_key = pubkey_path.read_text().strip()
    with api.client() as http:
        resp = http.post("/git/keys", json={"label": label, "public_key": public_key})
        if resp.status_code == 409:
            console.print("[yellow]That key is already registered.[/]")
            return
        resp.raise_for_status()
    console.print(f"[bold green]⟡[/] Registered key '{label}'. It may take up to 30s to sync to the git server.")


@keys_app.command("list")
def keys_list():
    """List SSH keys allowed to git push to this mesh."""
    with api.client() as http:
        resp = http.get("/git/keys")
        resp.raise_for_status()
        keys = resp.json()

    table = Table(title="Authorized git-push keys")
    for col in ["id", "label", "fingerprint", "added"]:
        table.add_column(col)
    for k in keys:
        parts = k["public_key"].split()
        fingerprint = (parts[1][:16] + "…") if len(parts) > 1 else "?"
        table.add_row(k["id"][:8], k["label"], fingerprint, k["created_at"])
    console.print(table)


@app.command()
def clone_url(name: str, ssh_host: str = typer.Option("localhost", help="Hostname/IP where the git server is reachable"), ssh_port: int = typer.Option(2222, help="Port the git server's SSH is published on")):
    """Print the git remote URL for a repo (new or existing) on this mesh's git server."""
    url = f"ssh://git@{ssh_host}:{ssh_port}/repos/{name}.git"
    console.print(url)
    console.print(f"\n[dim]# First push auto-creates the repo and deploys the default branch:[/]")
    console.print(f"[dim]git remote add opengit {url}[/]")
    console.print(f"[dim]git push opengit main[/]")


if __name__ == "__main__":
    app()
