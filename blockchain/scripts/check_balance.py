#!/usr/bin/env python3
"""
Check a wallet's DHOST Credits balance on devnet.

Usage:
    python blockchain/scripts/check_balance.py <wallet_pubkey>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from creditor import get_balance  # noqa: E402

RPC_URL = "https://api.devnet.solana.com"
KEYS_DIR = Path(__file__).resolve().parents[1] / ".keys"


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: check_balance.py <wallet_pubkey>")
        sys.exit(1)

    mint_address = (KEYS_DIR / "mint_address.txt").read_text().strip()
    balance = get_balance(RPC_URL, mint_address, sys.argv[1])
    print(f"Balance: {balance} DHOST credits")


if __name__ == "__main__":
    main()
