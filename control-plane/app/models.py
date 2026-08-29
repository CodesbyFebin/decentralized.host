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
