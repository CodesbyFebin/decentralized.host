import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Float, Integer, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship

from .database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Node(Base):
    __tablename__ = "nodes"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, unique=True, nullable=False)
    region = Column(String, default="local")
    status = Column(String, default="pending")  # pending|healthy|stale|offline
    cpu_cores = Column(Float, default=0)
    ram_total_mb = Column(Float, default=0)
    cpu_used_pct = Column(Float, default=0)
    ram_used_mb = Column(Float, default=0)
    wallet_pubkey = Column(String, nullable=True)
    # host:port where THIS node's agent (build/log/remove API) is reachable
    # from the control plane -- e.g. "node-agent:8100" for a same-compose
    # node, or "203.0.113.5:8100" for a genuinely remote machine. Set at
    # join time; the control plane must always address the node a
    # deployment actually landed on by this, never a single global URL.
    advertise_address = Column(String, nullable=True)
    heartbeat_count = Column(Integer, default=0)
    last_heartbeat = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_now)

    deployments = relationship("Deployment", back_populates="node")


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, unique=True, nullable=False)
    image = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending|running|failed|stopped
    node_id = Column(String, ForeignKey("nodes.id"), nullable=True)
    container_id = Column(String, nullable=True)
    container_port = Column(Integer, default=8080)
    subdomain = Column(String, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

    node = relationship("Node", back_populates="deployments")


class Release(Base):
    """One row per successful `dhost ship`/`dhost update` (and Launchpad
    ship). This is the server-side, real half of version history -- the
    source snapshots themselves stay local to whichever machine ran the
    ship (see cli/dhost/ledger.py); this table just records what was
    deployed, when, and with what message, so the dashboard's Git Manager
    can show a genuine history instead of a fabricated one."""
    __tablename__ = "releases"

    id = Column(String, primary_key=True, default=_uuid)
    deployment_id = Column(String, ForeignKey("deployments.id"), nullable=False)
    deployment_name = Column(String, nullable=False)
    snapshot_id = Column(String, nullable=True)
    message = Column(String, default="")
    image = Column(String, nullable=False)
    status = Column(String, nullable=False)  # running|failed
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_now)


class CreditLedger(Base):
    __tablename__ = "credit_ledger"

    id = Column(String, primary_key=True, default=_uuid)
    node_id = Column(String, ForeignKey("nodes.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    tx_signature = Column(String, nullable=True)
    explorer_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)


class SSHKey(Base):
    """Public keys allowed to git push. No per-user accounts exist in this
    MVP (same single-operator trust model as NODE_JOIN_SECRET and
    DEPLOY_API_KEY) -- any registered key can push to any repo."""
    __tablename__ = "ssh_keys"

    id = Column(String, primary_key=True, default=_uuid)
    label = Column(String, nullable=False)
    public_key = Column(Text, nullable=False, unique=True)
    created_at = Column(DateTime, default=_now)
