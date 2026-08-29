"""Thin wrapper around blockchain/creditor.py with graceful degradation
when Solana devnet isn't configured (default) or is unreachable."""
import logging
import sys
from pathlib import Path

sys.path.insert(0, "/app/blockchain")

from .config import settings

logger = logging.getLogger("dhost.blockchain")


def reward_node(node_id: str, wallet_pubkey: str, amount: int) -> dict | None:
    if not settings.ENABLE_BLOCKCHAIN:
        return None
    if not settings.SOLANA_MINT_ADDRESS:
        logger.warning("ENABLE_BLOCKCHAIN=true but SOLANA_MINT_ADDRESS is unset; skipping reward")
        return None
    try:
        from creditor import mint_credits  # imported from /app/blockchain

        return mint_credits(
            rpc_url=settings.SOLANA_RPC_URL,
            mint_address=settings.SOLANA_MINT_ADDRESS,
            keypair_path=settings.SOLANA_PAYER_KEYPAIR_PATH,
            destination_wallet=wallet_pubkey,
            amount=amount,
        )
    except Exception as e:
        logger.error(f"Failed to mint credits for node {node_id}: {e}")
        return None


def get_ledger_total(rpc_url: str, mint_address: str, wallet: str) -> float:
    try:
        from creditor import get_balance

        return get_balance(rpc_url, mint_address, wallet)
    except Exception as e:
        logger.error(f"Failed to read balance for {wallet}: {e}")
        return 0.0
