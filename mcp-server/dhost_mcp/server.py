"""dhost MCP server: exposes the real decentralized.host control-plane API
as MCP tools -- for Claude (or any MCP client) to inspect and operate a
dhost mesh conversationally.

Every tool here is a thin wrapper over a real HTTP call to the control
plane; nothing is simulated. The read-only tool set mirrors the one
already validated inside the console's own AI assistant
(control-plane/app/routers/assistant.py) -- same endpoints, same honesty
rule: if the control plane is unreachable or returns an error, the tool
says so plainly instead of inventing a result.

Two tools (`ship` and `delete_deployment`) are real mutations, not just
reads -- marked with `readOnlyHint=False` in their annotations so any MCP
client surfaces them as consequential, and documented as such in their
docstrings.

Config (env vars, same names the CLI uses):
  DHOST_API_URL   -- control-plane base URL, default http://localhost:8000
  DHOST_DEPLOY_KEY -- Bearer token, default 'dev-deploy-key'
"""
import io
import os
import tarfile
from pathlib import Path
from typing import Optional

import httpx
from mcp.server.mcpserver import MCPServer
from mcp.types import ToolAnnotations

from .detect import detect_stack

API_URL = os.getenv("DHOST_API_URL", "http://localhost:8000").rstrip("/")
DEPLOY_KEY = os.getenv("DHOST_DEPLOY_KEY", "dev-deploy-key")

DEFAULT_IGNORES = {
    ".dhost", ".git", "__pycache__", "node_modules", ".venv", "venv",
    ".DS_Store", "dist", "build", ".next", ".pytest_cache",
}

mcp = MCPServer(
    name="dhost",
    version="0.1.0",
    instructions=(
        "Tools for inspecting and operating a decentralized.host mesh: "
        "real deployments, real container logs, real node health, real "
        "release history (including dhost engine agent reports), and "
        "real shipping/deletion of apps. Everything reflects the actual "
        "state of a running control plane at DHOST_API_URL -- there is "
        "no simulated or placeholder data."
    ),
)


def _client() -> httpx.Client:
    return httpx.Client(
        base_url=API_URL, headers={"Authorization": f"Bearer {DEPLOY_KEY}"}, timeout=30,
    )


def _call(method: str, path: str, **kwargs) -> dict:
    """Every tool funnels through here so error handling is consistent
    and honest -- a failed call returns a plain {"error": ...} dict
    instead of raising into a confusing traceback the MCP client can't
    do anything useful with."""
    try:
        with _client() as client:
            resp = client.request(method, path, **kwargs)
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as e:
        return {"error": f"HTTP {e.response.status_code}: {e.response.text}"}
    except httpx.HTTPError as e:
        return {"error": f"Could not reach control plane at {API_URL}: {e}"}


READ_ONLY = ToolAnnotations(read_only_hint=True, idempotent_hint=True)
MUTATING = ToolAnnotations(read_only_hint=False, idempotent_hint=False)
DESTRUCTIVE = ToolAnnotations(read_only_hint=False, destructive_hint=True, idempotent_hint=True)


@mcp.tool(annotations=READ_ONLY)
def list_deployments() -> list[dict]:
    """List every deployment on the mesh: name, status
    (running/building/failed/pending), live URL, node, and error if any."""
    result = _call("GET", "/deployments")
    return result if isinstance(result, list) else [result]


@mcp.tool(annotations=READ_ONLY)
def get_deployment(name: str) -> dict:
    """Get full detail for one deployment by name."""
    return _call("GET", f"/deployments/{name}")


@mcp.tool(annotations=READ_ONLY)
def get_deployment_logs(name: str) -> dict:
    """Get the last ~200 lines of real container logs for a deployment."""
    return _call("GET", f"/deployments/{name}/logs")


@mcp.tool(annotations=READ_ONLY)
def list_releases(name: str) -> list[dict]:
    """List release history for a deployment -- message, status, error,
    timestamp, and the dhost engine's agent report for each release
    (security scan, AI Dockerfile review, release notes, post-deploy
    health check -- see control-plane/app/engine.py)."""
    result = _call("GET", f"/deployments/{name}/releases")
    return result if isinstance(result, list) else [result]


@mcp.tool(annotations=READ_ONLY)
def list_nodes() -> list[dict]:
    """List mesh nodes with real health status, CPU/RAM usage and capacity."""
    result = _call("GET", "/nodes")
    return result if isinstance(result, list) else [result]


@mcp.tool(annotations=READ_ONLY)
def blockchain_status() -> dict:
    """Whether Solana devnet node-operator credits are enabled on this
    mesh, and the reward configuration if so. Devnet only, no real
    monetary value -- see blockchain/README.md."""
    return _call("GET", "/blockchain/status")


@mcp.tool(annotations=READ_ONLY)
def get_credits(node_id: str) -> dict:
    """Get a node's real devnet credit ledger and total, by node ID (see
    list_nodes for IDs)."""
    return _call("GET", f"/blockchain/credits/{node_id}")


@mcp.tool(annotations=DESTRUCTIVE)
def delete_deployment(name: str) -> dict:
    """MUTATING, DESTRUCTIVE: stops and removes a deployment's container
    and deletes its record. Cannot be undone from here -- the app would
    need to be shipped again."""
    return _call("DELETE", f"/deployments/{name}")


@mcp.tool(annotations=MUTATING)
def ship(project_dir: str, name: str, port: int = 8080, message: str = "") -> dict:
    """MUTATING: detects the stack in a local directory (same detection
    dhost ship uses -- Node/Next.js, Python, Go, or static), packages it,
    and builds+deploys it on the mesh at http://<name>.<BASE_DOMAIN>. This
    is a real build -- it can take anywhere from seconds to several
    minutes depending on the project. project_dir must be an absolute
    path this server process can read."""
    root = Path(project_dir).expanduser().resolve()
    if not root.is_dir():
        return {"error": f"Not a directory: {root}"}

    stack, dockerfile = detect_stack(root)

    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for path in sorted(root.rglob("*")):
            if path.is_dir():
                continue
            rel = path.relative_to(root)
            if any(part in DEFAULT_IGNORES for part in rel.parts):
                continue
            tar.add(path, arcname=str(rel))
    archive_bytes = buf.getvalue()

    with _client() as client:
        try:
            resp = client.post(
                "/deployments/ship",
                data={
                    "name": name, "container_port": str(port), "dockerfile": dockerfile,
                    "message": message or f"shipped via MCP ({stack})",
                },
                files={"archive": ("src.tar.gz", archive_bytes, "application/gzip")},
            )
            resp.raise_for_status()
            result = resp.json()
            result["_detected_stack"] = stack
            return result
        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP {e.response.status_code}: {e.response.text}", "_detected_stack": stack}
        except httpx.HTTPError as e:
            return {"error": f"Could not reach control plane at {API_URL}: {e}"}


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
