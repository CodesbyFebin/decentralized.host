from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import Node

bearer_scheme = HTTPBearer(auto_error=False)


def create_node_token(node_id: str) -> str:
    payload = {
        "sub": node_id,
        "type": "node",
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.NODE_TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def get_current_node(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Node:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing node token")
    try:
        payload = jwt.decode(
            creds.credentials, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired node token")
    if payload.get("type") != "node":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Wrong token type")
    node = db.get(Node, payload.get("sub"))
    if node is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Unknown node")
    return node


def require_deploy_key(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> None:
    if creds is None or creds.credentials != settings.DEPLOY_API_KEY:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid deploy API key")
