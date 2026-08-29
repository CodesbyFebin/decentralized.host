import os
from pathlib import Path

import httpx
import yaml

CONFIG_DIR = Path(".dhost")
CONFIG_FILE = CONFIG_DIR / "config.yml"


def load_config() -> dict:
    if CONFIG_FILE.exists():
        return yaml.safe_load(CONFIG_FILE.read_text()) or {}
    return {}


def save_config(cfg: dict) -> None:
    CONFIG_DIR.mkdir(exist_ok=True)
    CONFIG_FILE.write_text(yaml.safe_dump(cfg))


def api_url() -> str:
    cfg = load_config()
    return os.getenv("DHOST_API_URL", cfg.get("api_url", "http://localhost:8000"))


def deploy_key() -> str:
    cfg = load_config()
    return os.getenv("DHOST_DEPLOY_KEY", cfg.get("deploy_key", "dev-deploy-key"))


def client() -> httpx.Client:
    return httpx.Client(
        base_url=api_url(),
        headers={"Authorization": f"Bearer {deploy_key()}"},
        timeout=15,
    )


def build_client() -> httpx.Client:
    """Longer timeout for /deployments/ship, which uploads source and waits
    for a real server-side Docker build to finish."""
    return httpx.Client(
        base_url=api_url(),
        headers={"Authorization": f"Bearer {deploy_key()}"},
        timeout=300,
    )
