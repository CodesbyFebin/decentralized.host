from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import blockchain_client
from ..auth import get_current_node
from ..config import settings
from ..database import get_db
from ..models import CreditLedger, Deployment, Node
from ..schemas import HeartbeatRequest, NodeOut, DeploymentOut, DeploymentStatusUpdate
from ..scheduler import refresh_node_statuses

router = APIRouter(prefix="/nodes", tags=["nodes"])


def _deployment_out(d: Deployment) -> DeploymentOut:
    url = f"http://{d.subdomain}" if d.subdomain else None
    return DeploymentOut(
        id=d.id, name=d.name, image=d.image, status=d.status, node_id=d.node_id,
        container_id=d.container_id, container_port=d.container_port,
        subdomain=d.subdomain, url=url, error=d.error,
        created_at=d.created_at, updated_at=d.updated_at,
    )


@router.get("", response_model=list[NodeOut])
def list_nodes(db: Session = Depends(get_db)):
    refresh_node_statuses(db)
    return db.query(Node).all()


@router.post("/heartbeat", response_model=NodeOut)
def heartbeat(
    payload: HeartbeatRequest,
    node: Node = Depends(get_current_node),
    db: Session = Depends(get_db),
):
    node.cpu_used_pct = payload.cpu_used_pct
    node.ram_used_mb = payload.ram_used_mb
    if payload.cpu_cores:
        node.cpu_cores = payload.cpu_cores
    if payload.ram_total_mb:
        node.ram_total_mb = payload.ram_total_mb
    node.last_heartbeat = datetime.now(timezone.utc)
    node.heartbeat_count += 1
    node.status = "healthy"
    db.commit()

    if (
        settings.ENABLE_BLOCKCHAIN
        and node.wallet_pubkey
        and node.heartbeat_count % settings.HEARTBEATS_PER_REWARD == 0
    ):
        result = blockchain_client.reward_node(
            node.id, node.wallet_pubkey, settings.CREDITS_PER_REWARD
        )
        if result:
            db.add(CreditLedger(
                node_id=node.id,
                amount=settings.CREDITS_PER_REWARD,
                tx_signature=result["signature"],
                explorer_url=result["explorer_url"],
            ))
            db.commit()

    db.refresh(node)
    return node


@router.get("/{node_id}/pending-deployments", response_model=list[DeploymentOut])
def pending_deployments(
    node_id: str,
    node: Node = Depends(get_current_node),
    db: Session = Depends(get_db),
):
    if node.id != node_id:
        raise HTTPException(403, "Token does not match node")
    deployments = (
        db.query(Deployment)
        .filter(Deployment.node_id == node_id, Deployment.status == "pending")
        .all()
    )
    return [_deployment_out(d) for d in deployments]


@router.post("/{node_id}/deployment-status/{deployment_id}", response_model=DeploymentOut)
def report_deployment_status(
    node_id: str,
    deployment_id: str,
    payload: DeploymentStatusUpdate,
    node: Node = Depends(get_current_node),
    db: Session = Depends(get_db),
):
    if node.id != node_id:
        raise HTTPException(403, "Token does not match node")
    deployment = db.get(Deployment, deployment_id)
    if deployment is None or deployment.node_id != node_id:
        raise HTTPException(404, "Deployment not found on this node")
    deployment.status = payload.status
    if payload.container_id:
        deployment.container_id = payload.container_id
    if payload.error:
        deployment.error = payload.error
    db.commit()
    db.refresh(deployment)
    return _deployment_out(deployment)
