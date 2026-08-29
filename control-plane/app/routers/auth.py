from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import create_node_token
from ..config import settings
from ..database import get_db
from ..models import Node
from ..schemas import NodeJoinRequest, NodeJoinResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/node-join", response_model=NodeJoinResponse)
def node_join(payload: NodeJoinRequest, db: Session = Depends(get_db)):
    if payload.join_secret != settings.NODE_JOIN_SECRET:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid join secret")

    node = db.query(Node).filter(Node.name == payload.name).first()
    if node is None:
        node = Node(
            name=payload.name,
            region=payload.region,
            cpu_cores=payload.cpu_cores,
            ram_total_mb=payload.ram_total_mb,
            status="pending",
        )
        db.add(node)
    else:
        node.cpu_cores = payload.cpu_cores
        node.ram_total_mb = payload.ram_total_mb
        node.region = payload.region
    db.commit()
    db.refresh(node)

    token = create_node_token(node.id)
    return NodeJoinResponse(node_id=node.id, token=token)
