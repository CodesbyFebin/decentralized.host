import os
import shutil
import tarfile
import uuid
from pathlib import Path
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..ai import generate_ai_note
from ..auth import require_deploy_key
from ..config import settings
from ..database import get_db
from ..detect import detect_stack
from ..models import Deployment, Release
from ..schemas import DeploymentCreate, DeploymentOut, DetectResponse, ReleaseOut
from ..scheduler import pick_node

router = APIRouter(
    prefix="/deployments", tags=["deployments"], dependencies=[Depends(require_deploy_key)]
)

UPLOAD_CACHE_DIR = Path(os.getenv("UPLOAD_CACHE_DIR", "/tmp/dhost-uploads"))


def _effective_root(work_dir: Path) -> Path:
    """If everything uploaded lives under a single top-level directory (the
    normal case for a browser folder-drop, where every relative path is
    prefixed with the dropped folder's name), treat that directory as the
    real project root instead of its parent -- otherwise stack detection
    looks one level too high and the build context is wrong (COPY
    requirements.txt would miss)."""
    current = work_dir
    while True:
        entries = list(current.iterdir())
        if len(entries) == 1 and entries[0].is_dir():
            current = entries[0]
        else:
            return current


def _safe_join(base: Path, rel: str) -> Path:
    """Resolves rel under base, refusing anything that would escape it --
    filenames here come from browser-uploaded multipart fields, so treat
    them as untrusted the same way node-agent's tar extraction does."""
    rel = rel.lstrip("/").replace("\\", "/")
    target = (base / rel).resolve()
    base_resolved = base.resolve()
    if target != base_resolved and not str(target).startswith(str(base_resolved) + os.sep):
        raise HTTPException(400, f"Unsafe file path in upload: {rel}")
    return target


def _deployment_out(d: Deployment) -> DeploymentOut:
    url = f"http://{d.subdomain}" if d.subdomain else None
    return DeploymentOut(
        id=d.id, name=d.name, image=d.image, status=d.status, node_id=d.node_id,
        container_id=d.container_id, container_port=d.container_port,
        subdomain=d.subdomain, url=url, error=d.error,
        created_at=d.created_at, updated_at=d.updated_at,
    )


@router.post("", response_model=DeploymentOut)
def create_deployment(payload: DeploymentCreate, db: Session = Depends(get_db)):
    node = pick_node(db)
    if node is None:
        raise HTTPException(503, "No healthy nodes available in the mesh. Run 'dhost node join'.")

    existing = db.query(Deployment).filter(Deployment.name == payload.name).first()
    subdomain = f"{payload.name}.{settings.BASE_DOMAIN}"

    if existing:
        existing.image = payload.image
        existing.container_port = payload.container_port
        existing.node_id = node.id
        existing.status = "pending"
        existing.error = None
        existing.subdomain = subdomain
        deployment = existing
    else:
        deployment = Deployment(
            name=payload.name,
            image=payload.image,
            container_port=payload.container_port,
            node_id=node.id,
            subdomain=subdomain,
            status="pending",
        )
        db.add(deployment)

    db.commit()
    db.refresh(deployment)
    return _deployment_out(deployment)


@router.post("/detect", response_model=DetectResponse)
async def detect_deployment(files: list[UploadFile] = File(...)):
    """Used by the dashboard's Launchpad: the browser uploads a dropped
    folder (each file's multipart filename carries its relative path), this
    detects the stack and generates a Dockerfile, and caches a tarball of
    the source under an upload_id so the follow-up /ship call doesn't need
    to re-upload everything."""
    upload_id = uuid.uuid4().hex
    work_dir = UPLOAD_CACHE_DIR / f"work-{upload_id}"
    work_dir.mkdir(parents=True, exist_ok=True)
    try:
        for f in files:
            rel = f.filename or "file"
            target = _safe_join(work_dir, rel)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(await f.read())

        project_root = _effective_root(work_dir)
        stack, dockerfile = detect_stack(project_root)

        UPLOAD_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        archive_path = UPLOAD_CACHE_DIR / f"{upload_id}.tar.gz"
        with tarfile.open(archive_path, "w:gz") as tar:
            for p in sorted(project_root.rglob("*")):
                if p.is_file():
                    tar.add(p, arcname=str(p.relative_to(project_root)))
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)

    ai_note = generate_ai_note(stack, dockerfile)
    return DetectResponse(upload_id=upload_id, stack=stack, dockerfile=dockerfile, ai_note=ai_note)


@router.post("/ship", response_model=DeploymentOut)
async def ship_deployment(
    name: str = Form(...),
    container_port: int = Form(8080),
    dockerfile: str = Form(...),
    archive: Optional[UploadFile] = File(None),
    upload_id: Optional[str] = Form(None),
    message: str = Form(""),
    snapshot_id: str = Form(""),
    db: Session = Depends(get_db),
):
    """Server-side build path used by `dhost ship`/`dhost update` and the
    dashboard Launchpad: the caller uploads source (directly, or by
    reference via upload_id from a prior /detect call) plus a generated
    Dockerfile, and the node agent (which already has Docker) builds,
    pushes, and runs it. The developer's own machine never needs Docker
    installed."""
    node = pick_node(db)
    if node is None:
        raise HTTPException(503, "No healthy nodes available in the mesh. Run 'dhost node join'.")

    subdomain = f"{name}.{settings.BASE_DOMAIN}"
    deployment = db.query(Deployment).filter(Deployment.name == name).first()
    if deployment:
        deployment.node_id = node.id
        deployment.container_port = container_port
        deployment.subdomain = subdomain
        deployment.status = "building"
        deployment.error = None
    else:
        deployment = Deployment(
            name=name, image=f"{name}:building", container_port=container_port,
            node_id=node.id, subdomain=subdomain, status="building",
        )
        db.add(deployment)
    db.commit()
    db.refresh(deployment)

    if upload_id:
        cached = UPLOAD_CACHE_DIR / f"{upload_id}.tar.gz"
        if not cached.exists():
            raise HTTPException(400, "Unknown or expired upload_id -- try again from Launchpad")
        archive_bytes = cached.read_bytes()
        cached.unlink(missing_ok=True)
    elif archive is not None:
        archive_bytes = await archive.read()
    else:
        raise HTTPException(400, "Provide either 'archive' or 'upload_id'")

    try:
        resp = httpx.post(
            f"{settings.NODE_AGENT_LOG_BASE_URL}/build",
            data={
                "name": name,
                "container_port": str(container_port),
                "subdomain": subdomain,
                "dockerfile": dockerfile,
            },
            files={"archive": ("src.tar.gz", archive_bytes, "application/gzip")},
            timeout=300,
        )
        result = resp.json()
    except httpx.HTTPError as e:
        deployment.status = "failed"
        deployment.error = str(e)
        db.commit()
        raise HTTPException(502, f"Build request to node agent failed: {e}")

    if result.get("status") == "running":
        deployment.status = "running"
        deployment.container_id = result.get("container_id")
        deployment.image = result.get("image", deployment.image)
        deployment.error = None
    else:
        deployment.status = "failed"
        deployment.error = result.get("error", "unknown build error")

    db.add(Release(
        deployment_id=deployment.id,
        deployment_name=deployment.name,
        snapshot_id=snapshot_id or None,
        message=message,
        image=deployment.image,
        status=deployment.status,
        error=deployment.error,
    ))

    db.commit()
    db.refresh(deployment)
    return _deployment_out(deployment)


@router.get("/{name}/releases", response_model=list[ReleaseOut])
def list_releases(name: str, db: Session = Depends(get_db)):
    return (
        db.query(Release)
        .filter(Release.deployment_name == name)
        .order_by(Release.created_at.desc())
        .all()
    )


@router.get("/{name}", response_model=DeploymentOut)
def get_deployment(name: str, db: Session = Depends(get_db)):
    deployment = db.query(Deployment).filter(Deployment.name == name).first()
    if deployment is None:
        raise HTTPException(404, "Deployment not found")
    return _deployment_out(deployment)


@router.get("/{name}/logs")
def get_deployment_logs(name: str, db: Session = Depends(get_db)):
    deployment = db.query(Deployment).filter(Deployment.name == name).first()
    if deployment is None:
        raise HTTPException(404, "Deployment not found")
    if not deployment.container_id:
        return {"logs": "(no container yet)"}
    try:
        resp = httpx.get(
            f"{settings.NODE_AGENT_LOG_BASE_URL}/logs/{deployment.container_id}",
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPError as e:
        raise HTTPException(502, f"Could not reach node agent: {e}")


@router.get("", response_model=list[DeploymentOut])
def list_deployments(db: Session = Depends(get_db)):
    return [_deployment_out(d) for d in db.query(Deployment).all()]


@router.delete("/{name}")
def delete_deployment(name: str, db: Session = Depends(get_db)):
    deployment = db.query(Deployment).filter(Deployment.name == name).first()
    if deployment is None:
        raise HTTPException(404, "Deployment not found")
    try:
        httpx.post(f"{settings.NODE_AGENT_LOG_BASE_URL}/remove/{name}", timeout=15)
    except httpx.HTTPError as e:
        raise HTTPException(502, f"Could not reach node agent to tear down container: {e}")
    db.delete(deployment)
    db.commit()
    return {"status": "deleted"}
