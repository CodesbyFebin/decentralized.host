from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import CreditLedger, Node
from ..schemas import CreditsSummary, WalletSetRequest, NodeOut
from ..auth import get_current_node

router = APIRouter(prefix="/blockchain", tags=["blockchain"])


@router.get("/status")
def blockchain_status():
    return {
        "enabled": settings.ENABLE_BLOCKCHAIN,
        "network": "solana-devnet",
        "mint_address": settings.SOLANA_MINT_ADDRESS or None,
        "credits_per_reward": settings.CREDITS_PER_REWARD,
        "heartbeats_per_reward": settings.HEARTBEATS_PER_REWARD,
    }


@router.post("/nodes/{node_id}/wallet", response_model=NodeOut)
def set_wallet(node_id: str, payload: WalletSetRequest, db: Session = Depends(get_db)):
    node = db.get(Node, node_id)
    if node is None:
        raise HTTPException(404, "Node not found")
    node.wallet_pubkey = payload.pubkey
    db.commit()
    db.refresh(node)
    return node


@router.post("/wallet", response_model=NodeOut)
def set_own_wallet(
    payload: WalletSetRequest,
    node: Node = Depends(get_current_node),
    db: Session = Depends(get_db),
):
    node.wallet_pubkey = payload.pubkey
    db.commit()
    db.refresh(node)
    return node


@router.get("/credits/{node_id}", response_model=CreditsSummary)
def get_credits(node_id: str, db: Session = Depends(get_db)):
    node = db.get(Node, node_id)
    if node is None:
        raise HTTPException(404, "Node not found")
    entries = (
        db.query(CreditLedger)
        .filter(CreditLedger.node_id == node_id)
        .order_by(CreditLedger.created_at.desc())
        .all()
    )
    total = sum(e.amount for e in entries)
    return CreditsSummary(
        node_id=node_id, wallet_pubkey=node.wallet_pubkey, total_credits=total, ledger=entries
    )
