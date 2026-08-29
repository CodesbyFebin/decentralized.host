import logging
import os
import shutil
import tarfile
import tempfile
import threading
import time
from pathlib import Path

import docker
import httpx
import psutil
import yaml
from flask import Flask, jsonify, request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dhost.node-agent")

CONTROL_PLANE_URL = os.getenv("CONTROL_PLANE_URL", "http://control-plane:8000")
NODE_JOIN_SECRET = os.getenv("NODE_JOIN_SECRET", "dev-join-secret")
NODE_NAME = os.getenv("NODE_NAME", os.uname().nodename)
NODE_REGION = os.getenv("NODE_REGION", "local")
REGISTRY_HOST = os.getenv("REGISTRY_HOST", "registry:5000")
HEARTBEAT_INTERVAL = int(os.getenv("HEARTBEAT_INTERVAL", "10"))
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "3"))
LOG_API_PORT = int(os.getenv("LOG_API_PORT", "8100"))
TRAEFIK_DYNAMIC_DIR = Path(os.getenv("TRAEFIK_DYNAMIC_DIR", "/etc/traefik/dynamic"))
MESH_NETWORK = os.getenv("MESH_NETWORK", "dhost-mesh")
# How the control plane reaches *this* node's build/log/remove API. Default
# assumes the same-compose case (a Docker-network hostname); a node on a
# genuinely separate machine must set this to its own public host:port,
# e.g. ADVERTISE_ADDRESS=203.0.113.5:8100 -- see DEPLOY.md.
ADVERTISE_ADDRESS = os.getenv("ADVERTISE_ADDRESS", f"node-agent:{LOG_API_PORT}")

docker_client = docker.from_env()
state = {"node_id": None, "token": None}


def _headers() -> dict:
    return {"Authorization": f"Bearer {state['token']}"}


def register() -> None:
    while True:
        try:
            resp = httpx.post(
                f"{CONTROL_PLANE_URL}/auth/node-join",
                json={
                    "join_secret": NODE_JOIN_SECRET,
                    "name": NODE_NAME,
                    "region": NODE_REGION,
                    "cpu_cores": psutil.cpu_count(logical=True),
                    "ram_total_mb": psutil.virtual_memory().total / (1024 * 1024),
                    "advertise_address": ADVERTISE_ADDRESS,
                },
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
            state["node_id"] = data["node_id"]
            state["token"] = data["token"]
            logger.info(f"Registered as node {NODE_NAME} ({state['node_id']})")
            return
        except Exception as e:
            logger.warning(f"Registration failed ({e}), retrying in 5s...")
            time.sleep(5)


def heartbeat_loop() -> None:
    while True:
        try:
            cpu_pct = psutil.cpu_percent(interval=1)
            mem = psutil.virtual_memory()
            httpx.post(
                f"{CONTROL_PLANE_URL}/nodes/heartbeat",
                headers=_headers(),
                json={
                    "cpu_used_pct": cpu_pct,
                    "ram_used_mb": mem.used / (1024 * 1024),
                    "cpu_cores": psutil.cpu_count(logical=True),
                    "ram_total_mb": mem.total / (1024 * 1024),
                },
                timeout=10,
            )
        except Exception as e:
            logger.warning(f"Heartbeat failed: {e}")
        time.sleep(HEARTBEAT_INTERVAL)


def write_traefik_config(name: str, subdomain: str, ip: str, port: int) -> None:
    config = {
        "http": {
            "routers": {
                name: {
                    "rule": f"Host(`{subdomain}`)",
                    "service": name,
                    "entryPoints": ["web"],
                }
            },
            "services": {
                name: {
                    "loadBalancer": {"servers": [{"url": f"http://{ip}:{port}"}]}
                }
            },
        }
    }
    TRAEFIK_DYNAMIC_DIR.mkdir(parents=True, exist_ok=True)
    (TRAEFIK_DYNAMIC_DIR / f"{name}.yml").write_text(yaml.safe_dump(config))


def remove_traefik_config(name: str) -> None:
    path = TRAEFIK_DYNAMIC_DIR / f"{name}.yml"
    if path.exists():
        path.unlink()


def _start_container(name: str, image: str, port: int, subdomain: str) -> "docker.models.containers.Container":
    """(Re)creates the container for `name` from `image` and wires up Traefik routing."""
    container_name = f"dhost-{name}"
    try:
        existing = docker_client.containers.get(container_name)
        existing.remove(force=True)
    except docker.errors.NotFound:
        pass
    remove_traefik_config(name)

    container = docker_client.containers.run(
        image,
        name=container_name,
        detach=True,
        network=MESH_NETWORK,
        restart_policy={"Name": "unless-stopped"},
        mem_limit="256m",
        nano_cpus=1_000_000_000,  # 1 vCPU cap
    )
    container.reload()
    ip = container.attrs["NetworkSettings"]["Networks"][MESH_NETWORK]["IPAddress"]
    write_traefik_config(name, subdomain, ip, port)
    logger.info(f"Started {container_name} ({container.id[:12]}) -> {subdomain} ({ip}:{port})")
    return container


def run_deployment(deployment: dict) -> None:
    name = deployment["name"]
    image = deployment["image"]
    port = deployment.get("container_port", 8080)
    subdomain = deployment.get("subdomain")

    try:
        logger.info(f"Pulling {image}...")
        docker_client.images.pull(image)
        container = _start_container(name, image, port, subdomain)
        report_status(deployment["id"], "running", container_id=container.id)
    except Exception as e:
        logger.error(f"Failed to run deployment {name}: {e}")
        report_status(deployment["id"], "failed", error=str(e))


def _safe_extract_tar(tar_path: str, dest_dir: str) -> None:
    """Extracts tar_path into dest_dir, refusing any member that would escape it
    (a 'tarbomb'/path-traversal archive) -- necessary since this archive is
    user-uploaded content."""
    dest_root = os.path.realpath(dest_dir)
    with tarfile.open(tar_path) as tar:
        for member in tar.getmembers():
            member_path = os.path.realpath(os.path.join(dest_dir, member.name))
            if member_path != dest_root and not member_path.startswith(dest_root + os.sep):
                raise ValueError(f"Refusing to extract unsafe archive member: {member.name}")
        tar.extractall(dest_dir)  # noqa: S202 -- paths validated above


def build_and_run(name: str, port: int, subdomain: str, dockerfile: str, archive_path: str) -> dict:
    """Builds an image from an uploaded source tarball + Dockerfile, pushes it to
    the mesh registry, and starts it -- this is the whole reason the developer
    never needs Docker installed locally: the build happens here, not on their
    machine."""
    build_dir = tempfile.mkdtemp(prefix=f"dhost-build-{name}-")
    try:
        src_dir = os.path.join(build_dir, "src")
        os.makedirs(src_dir, exist_ok=True)
        _safe_extract_tar(archive_path, src_dir)
        (Path(src_dir) / "Dockerfile").write_text(dockerfile)

        image_tag = f"{REGISTRY_HOST}/{name}:latest"
        logger.info(f"Building {image_tag} from uploaded source ({name})...")
        docker_client.images.build(path=src_dir, tag=image_tag, rm=True)
        docker_client.images.push(image_tag)

        container = _start_container(name, image_tag, port, subdomain)
        return {"status": "running", "container_id": container.id, "image": image_tag}
    except Exception as e:
        logger.error(f"Build failed for {name}: {e}")
        return {"status": "failed", "error": str(e)}
    finally:
        shutil.rmtree(build_dir, ignore_errors=True)


def report_status(deployment_id: str, status: str, container_id: str = None, error: str = None) -> None:
    try:
        body = {"status": status}
        if container_id:
            body["container_id"] = container_id
        if error:
            body["error"] = error[:2000]
        httpx.post(
            f"{CONTROL_PLANE_URL}/nodes/{state['node_id']}/deployment-status/{deployment_id}",
            headers=_headers(),
            json=body,
            timeout=10,
        )
    except Exception as e:
        logger.warning(f"Could not report status for {deployment_id}: {e}")


def poll_loop() -> None:
    while True:
        try:
            resp = httpx.get(
                f"{CONTROL_PLANE_URL}/nodes/{state['node_id']}/pending-deployments",
                headers=_headers(),
                timeout=10,
            )
            resp.raise_for_status()
            for deployment in resp.json():
                run_deployment(deployment)
        except Exception as e:
            logger.warning(f"Poll failed: {e}")
        time.sleep(POLL_INTERVAL)


# --- tiny log-streaming API, used by control-plane's /deployments/{name}/logs proxy ---
log_api = Flask(__name__)


@log_api.get("/logs/<container_id>")
def get_logs(container_id: str):
    try:
        container = docker_client.containers.get(container_id)
        logs = container.logs(tail=200).decode("utf-8", errors="replace")
        return jsonify({"logs": logs})
    except docker.errors.NotFound:
        return jsonify({"logs": "(container not found)"}), 404


@log_api.get("/health")
def health():
    return jsonify({"status": "ok"})


@log_api.post("/remove/<name>")
def remove_endpoint(name: str):
    container_name = f"dhost-{name}"
    try:
        container = docker_client.containers.get(container_name)
        container.remove(force=True)
    except docker.errors.NotFound:
        pass
    remove_traefik_config(name)
    return jsonify({"status": "removed"})


@log_api.post("/build")
def build_endpoint():
    name = request.form["name"]
    port = int(request.form.get("container_port", 8080))
    subdomain = request.form["subdomain"]
    dockerfile = request.form["dockerfile"]
    archive = request.files["archive"]

    with tempfile.NamedTemporaryFile(suffix=".tar.gz", delete=False) as f:
        archive.save(f.name)
        archive_path = f.name
    try:
        result = build_and_run(name, port, subdomain, dockerfile, archive_path)
    finally:
        os.unlink(archive_path)

    return jsonify(result), (200 if result["status"] == "running" else 500)


def main() -> None:
    register()
    threading.Thread(target=heartbeat_loop, daemon=True).start()
    threading.Thread(target=poll_loop, daemon=True).start()
    log_api.run(host="0.0.0.0", port=LOG_API_PORT, threaded=True)


if __name__ == "__main__":
    main()
