#!/usr/bin/env python3
"""
Mint DHOST Credits (devnet SPL token) to a node operator's wallet.

Usage:
    python blockchain/scripts/mint_credits.py <wallet_pubkey> <amount>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from creditor import mint_credits  # noqa: E402

RPC_URL = "https://api.devnet.solana.com"
KEYS_DIR = Path(__file__).resolve().parents[1] / ".keys"


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: mint_credits.py <wallet_pubkey> <amount>")
        sys.exit(1)

    wallet, amount = sys.argv[1], int(sys.argv[2])
    mint_address = (KEYS_DIR / "mint_address.txt").read_text().strip()

    result = mint_credits(
        rpc_url=RPC_URL,
        mint_address=mint_address,
        keypair_path=str(KEYS_DIR / "payer.json"),
        destination_wallet=wallet,
        amount=amount,
    )
    print(f"Minted {amount} DHOST credits to {wallet}")
    print(f"Signature: {result['signature']}")
    print(f"Explorer: {result['explorer_url']}")


if __name__ == "__main__":
    main()
