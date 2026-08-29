from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class NodeJoinRequest(BaseModel):
    join_secret: str
    name: str
    region: str = "local"
    cpu_cores: float = 0
    ram_total_mb: float = 0


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
    heartbeat_count: int
    last_heartbeat: Optional[datetime] = None

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


class ReleaseOut(BaseModel):
    id: str
    deployment_name: str
    snapshot_id: Optional[str] = None
    message: str
    image: str
    status: str
    error: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


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
