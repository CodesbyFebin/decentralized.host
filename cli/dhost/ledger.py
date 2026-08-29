"""
Local, Git-free version tracking for decentralized.host.

Every 'dhost ship' / 'dhost update' takes a content-addressed snapshot of
the project (SHA-256 per file, deduplicated blob store) under
.dhost/ledger/. No `git` binary or repository is ever touched -- this is
a real, independent versioning mechanism, not a wrapper around Git.
"""
import hashlib
import json
import shutil
import time
import uuid
from pathlib import Path
from typing import Optional

LEDGER_DIR_NAME = ".dhost/ledger"
DEFAULT_IGNORES = {
    ".dhost", ".git", "__pycache__", "node_modules", ".venv", "venv",
    ".DS_Store", "dist", "build", ".next", ".pytest_cache",
}


def _ledger_paths(project_dir: Path) -> tuple[Path, Path, Path]:
    ledger_dir = project_dir / LEDGER_DIR_NAME
    return ledger_dir, ledger_dir / "objects", ledger_dir / "snapshots.json"


def _load_ignores(project_dir: Path) -> set[str]:
    ignores = set(DEFAULT_IGNORES)
    ignore_file = project_dir / ".dhostignore"
    if ignore_file.exists():
        for line in ignore_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                ignores.add(line)
    return ignores


def _is_ignored(rel_path: Path, ignores: set[str]) -> bool:
    if rel_path.suffix == ".pyc":
        return True
    return any(part in ignores for part in rel_path.parts)


def iter_project_files(project_dir: Path) -> list[str]:
    """Relative paths (as strings) of every file that should be tracked/shipped."""
    ignores = _load_ignores(project_dir)
    files = []
    for path in sorted(project_dir.rglob("*")):
        if path.is_dir():
            continue
        rel = path.relative_to(project_dir)
        if _is_ignored(rel, ignores):
            continue
        files.append(str(rel))
    return files


def _read_snapshots(snapshots_path: Path) -> list[dict]:
    if snapshots_path.exists():
        return json.loads(snapshots_path.read_text())
    return []


def create_snapshot(project_dir: Path, message: str, files: Optional[list[str]] = None) -> dict:
    ledger_dir, objects_dir, snapshots_path = _ledger_paths(project_dir)
    objects_dir.mkdir(parents=True, exist_ok=True)

    if files is None:
        files = iter_project_files(project_dir)

    file_hashes = {}
    for rel in files:
        data = (project_dir / rel).read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        blob_path = objects_dir / digest
        if not blob_path.exists():
            blob_path.write_bytes(data)
        file_hashes[rel] = digest

    snapshots = _read_snapshots(snapshots_path)
    snapshot = {
        "id": uuid.uuid4().hex[:12],
        "message": message,
        "timestamp": time.time(),
        "files": file_hashes,
    }
    snapshots.append(snapshot)
    snapshots_path.write_text(json.dumps(snapshots, indent=2))
    return snapshot


def list_snapshots(project_dir: Path) -> list[dict]:
    _, _, snapshots_path = _ledger_paths(project_dir)
    return _read_snapshots(snapshots_path)


def get_snapshot(project_dir: Path, snapshot_id: str) -> Optional[dict]:
    matches = [s for s in list_snapshots(project_dir) if s["id"].startswith(snapshot_id)]
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        exact = [s for s in matches if s["id"] == snapshot_id]
        return exact[0] if exact else None
    return None


def restore_snapshot(project_dir: Path, snapshot: dict, dest_dir: Path) -> None:
    _, objects_dir, _ = _ledger_paths(project_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    for rel_path, digest in snapshot["files"].items():
        target = dest_dir / rel_path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(objects_dir / digest, target)
