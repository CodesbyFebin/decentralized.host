from datetime import datetime, timezone

from sqlalchemy.orm import Session

from .config import settings
from .models import Node


def _heartbeat_age_seconds(node: Node) -> float | None:
    if node.last_heartbeat is None:
        return None
    hb = node.last_heartbeat
    if hb.tzinfo is None:
        hb = hb.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - hb).total_seconds()


def _is_healthy(node: Node) -> bool:
    age = _heartbeat_age_seconds(node)
    return age is not None and age <= settings.HEARTBEAT_STALE_SECONDS


def refresh_node_statuses(db: Session) -> None:
    """healthy: heartbeating within HEARTBEAT_STALE_SECONDS. stale: recently
    missed a heartbeat but not long enough to act on -- a node's Docker
    runtime restarting is a real, observed case that recovers on its own
    within under two minutes and shouldn't trigger anything. offline: no
    heartbeat for NODE_OFFLINE_SECONDS or more -- long enough that
    app/failover.py will reschedule its running deployments elsewhere."""
    for node in db.query(Node).all():
        if _is_healthy(node):
            node.status = "healthy"
            continue
        age = _heartbeat_age_seconds(node)
        if age is not None and age >= settings.NODE_OFFLINE_SECONDS:
            node.status = "offline"
        else:
            node.status = "stale"
    db.commit()


def pick_node(db: Session) -> Node | None:
    """Weighted pick: healthy nodes ranked by lowest combined CPU/RAM load."""
    refresh_node_statuses(db)
    candidates = db.query(Node).filter(Node.status == "healthy").all()
    if not candidates:
        return None

    def load_score(n: Node) -> float:
        ram_pct = (n.ram_used_mb / n.ram_total_mb * 100) if n.ram_total_mb else 100
        return n.cpu_used_pct + ram_pct

    return min(candidates, key=load_score)
