from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from ..auth import require_deploy_key
from ..database import get_db
from ..models import SSHKey
from ..schemas import SSHKeyCreate, SSHKeyOut

router = APIRouter(prefix="/git/keys", tags=["git"], dependencies=[Depends(require_deploy_key)])


@router.post("", response_model=SSHKeyOut)
def add_key(payload: SSHKeyCreate, db: Session = Depends(get_db)):
    public_key = payload.public_key.strip()
    if not public_key or len(public_key.split()) < 2:
        raise HTTPException(400, "That doesn't look like a public key (expected 'ssh-ed25519 AAAA... [comment]')")
    existing = db.query(SSHKey).filter(SSHKey.public_key == public_key).first()
    if existing:
        raise HTTPException(409, "That key is already registered")
    key = SSHKey(label=payload.label, public_key=public_key)
    db.add(key)
    db.commit()
    db.refresh(key)
    return key


@router.get("", response_model=list[SSHKeyOut])
def list_keys(db: Session = Depends(get_db)):
    return db.query(SSHKey).order_by(SSHKey.created_at.desc()).all()


@router.delete("/{key_id}")
def delete_key(key_id: str, db: Session = Depends(get_db)):
    key = db.get(SSHKey, key_id)
    if key is None:
        raise HTTPException(404, "Key not found")
    db.delete(key)
    db.commit()
    return {"status": "deleted"}


@router.get("/authorized_keys", response_class=PlainTextResponse)
def authorized_keys(db: Session = Depends(get_db)):
    """Fetched by the git-server container on startup (and periodically)
    to build its actual authorized_keys file. Every key can push to every
    repo -- same single-operator trust model as NODE_JOIN_SECRET and
    DEPLOY_API_KEY, no per-repo ACLs in this MVP."""
    keys = db.query(SSHKey).all()
    return "\n".join(k.public_key for k in keys) + "\n"
