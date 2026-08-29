"""
Solana devnet credit-token integration for decentralized.host.

Node operators are rewarded with SPL "DHOST Credits" tokens on Solana's
free, public devnet cluster (no real funds involved -- devnet SOL and
devnet tokens have no monetary value, which is why this is the "free
blockchain" option). This module is imported both by the control-plane
service and by the standalone scripts in blockchain/scripts/.
"""
import json
import os
from pathlib import Path
from typing import Optional

from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solana.rpc.api import Client
from spl.token.client import Token
from spl.token.constants import TOKEN_PROGRAM_ID
from spl.token.instructions import get_associated_token_address


class BlockchainNotConfigured(Exception):
    pass


def load_payer(keypair_path: str) -> Keypair:
    path = Path(keypair_path)
    if not path.exists():
        raise BlockchainNotConfigured(
            f"No payer keypair at {keypair_path}. Run "
            "blockchain/scripts/setup_devnet.py first."
        )
    secret = json.loads(path.read_text())
    return Keypair.from_bytes(bytes(secret))


def get_client(rpc_url: str) -> Client:
    return Client(rpc_url)


def get_token(rpc_url: str, mint_address: str, payer: Keypair) -> Token:
    if not mint_address:
        raise BlockchainNotConfigured("SOLANA_MINT_ADDRESS is not set")
    client = get_client(rpc_url)
    return Token(
        conn=client,
        pubkey=Pubkey.from_string(mint_address),
        program_id=TOKEN_PROGRAM_ID,
        payer=payer,
    )


def mint_credits(
    rpc_url: str,
    mint_address: str,
    keypair_path: str,
    destination_wallet: str,
    amount: int,
    decimals: int = 2,
) -> dict:
    """Mint `amount` DHOST Credits to a node operator's wallet on devnet.

    Returns {"signature": ..., "explorer_url": ...}
    """
    payer = load_payer(keypair_path)
    token = get_token(rpc_url, mint_address, payer)
    dest_pubkey = Pubkey.from_string(destination_wallet)

    ata = get_associated_token_address(dest_pubkey, Pubkey.from_string(mint_address))
    client = get_client(rpc_url)
    account_info = client.get_account_info(ata)
    if account_info.value is None:
        token.create_associated_token_account(dest_pubkey)

    raw_amount = int(amount * (10 ** decimals))
    resp = token.mint_to(
        dest=ata,
        mint_authority=payer,
        amount=raw_amount,
    )
    signature = str(resp.value)
    return {
        "signature": signature,
        "explorer_url": f"https://explorer.solana.com/tx/{signature}?cluster=devnet",
    }


def get_balance(rpc_url: str, mint_address: str, wallet: str) -> float:
    client = get_client(rpc_url)
    ata = get_associated_token_address(
        Pubkey.from_string(wallet), Pubkey.from_string(mint_address)
    )
    try:
        bal = client.get_token_account_balance(ata)
        return float(bal.value.ui_amount or 0)
    except Exception:
        return 0.0
