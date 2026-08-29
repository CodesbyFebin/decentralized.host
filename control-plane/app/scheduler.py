from datetime import datetime, timezone

from sqlalchemy.orm import Session

from .config import settings
from .models import Node


def _is_healthy(node: Node) -> bool:
    if node.last_heartbeat is None:
        return False
    hb = node.last_heartbeat
    if hb.tzinfo is None:
        hb = hb.replace(tzinfo=timezone.utc)
    age = (datetime.now(timezone.utc) - hb).total_seconds()
    return age <= settings.HEARTBEAT_STALE_SECONDS


def refresh_node_statuses(db: Session) -> None:
    for node in db.query(Node).all():
        node.status = "healthy" if _is_healthy(node) else "stale"
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
