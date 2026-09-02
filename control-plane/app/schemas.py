import json
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, field_validator


class NodeJoinRequest(BaseModel):
    join_secret: str
    name: str
    region: str = "local"
    cpu_cores: float = 0
    ram_total_mb: float = 0
    advertise_address: str = ""


class NodeJoinResponse(BaseModel):
    node_id: str
    token: str


class HeartbeatRequest(BaseModel):
    cpu_used_pct: float
    ram_used_mb: float
    cpu_cores: Optional[float] = None
    ram_total_mb: Optional[float] = None


class NodeOut(BaseModel):
    id: str
    name: str
    region: str
    status: str
    cpu_cores: float
    ram_total_mb: float
    cpu_used_pct: float
    ram_used_mb: float
    wallet_pubkey: Optional[str] = None
    advertise_address: Optional[str] = None
    heartbeat_count: int
    last_heartbeat: Optional[datetime] = None

    class Config:
        from_attributes = True


class SSHKeyCreate(BaseModel):
    label: str
    public_key: str


class SSHKeyOut(BaseModel):
    id: str
    label: str
    public_key: str
    created_at: datetime

    class Config:
        from_attributes = True


class DeploymentCreate(BaseModel):
    name: str
    image: str
    container_port: int = 8080


class DeploymentOut(BaseModel):
    id: str
    name: str
    image: str
    status: str
    node_id: Optional[str] = None
    container_id: Optional[str] = None
    container_port: int
    subdomain: Optional[str] = None
    url: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EngineAgentResult(BaseModel):
    agent: str
    status: str
    summary: str
    details: List[str] = []


class ReleaseOut(BaseModel):
    id: str
    deployment_name: str
    snapshot_id: Optional[str] = None
    message: str
    image: str
    status: str
    error: Optional[str] = None
    engine_report: Optional[List[EngineAgentResult]] = None
    created_at: datetime

    class Config:
        from_attributes = True

    @field_validator("engine_report", mode="before")
    @classmethod
    def _parse_engine_report(cls, v):
        # Stored as a JSON-encoded TEXT column (see models.Release), not a
        # native array -- this project has no migration tool, so adding a
        # real JSON/array column type later would need one; a TEXT column
        # with an idempotent ALTER (see main.py's STARTUP_MIGRATIONS) is
        # the same tradeoff already made for every other column here.
        if isinstance(v, str):
            return json.loads(v)
        return v


class DetectResponse(BaseModel):
    upload_id: str
    stack: str
    dockerfile: str
    ai_note: Optional[str] = None


class DeploymentStatusUpdate(BaseModel):
    status: str
    container_id: Optional[str] = None
    error: Optional[str] = None


class WalletSetRequest(BaseModel):
    pubkey: str


class CreditRewardRequest(BaseModel):
    node_id: str
    amount: Optional[int] = None


class CreditEntryOut(BaseModel):
    id: str
    node_id: str
    amount: int
    tx_signature: Optional[str] = None
    explorer_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CreditsSummary(BaseModel):
    node_id: str
    wallet_pubkey: Optional[str]
    total_credits: int
    ledger: List[CreditEntryOut]
