#!/usr/bin/env python3
"""
One-time setup: create a devnet payer wallet, airdrop free devnet SOL,
and create the DHOST Credits SPL token mint.

Usage:
    python blockchain/scripts/setup_devnet.py

Everything here runs against Solana's public **devnet** cluster, which is
free and has no real monetary value -- this is intentionally not mainnet.
"""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from solders.keypair import Keypair  # noqa: E402
from solana.rpc.api import Client  # noqa: E402
from spl.token.client import Token  # noqa: E402
from spl.token.constants import TOKEN_PROGRAM_ID  # noqa: E402

RPC_URL = "https://api.devnet.solana.com"
KEYS_DIR = Path(__file__).resolve().parents[1] / ".keys"
PAYER_PATH = KEYS_DIR / "payer.json"
MINT_PATH = KEYS_DIR / "mint_address.txt"


def main() -> None:
    KEYS_DIR.mkdir(parents=True, exist_ok=True)
    client = Client(RPC_URL)

    if PAYER_PATH.exists():
        secret = json.loads(PAYER_PATH.read_text())
        payer = Keypair.from_bytes(bytes(secret))
        print(f"Loaded existing payer keypair: {payer.pubkey()}")
    else:
        payer = Keypair()
        PAYER_PATH.write_text(json.dumps(list(bytes(payer))))
        print(f"Generated new devnet payer keypair: {payer.pubkey()}")

    balance = client.get_balance(payer.pubkey()).value
    print(f"Current devnet balance: {balance / 1_000_000_000} SOL")

    if balance < 500_000_000:  # < 0.5 SOL
        print("Requesting free devnet airdrop (2 SOL)...")
        try:
            resp = client.request_airdrop(payer.pubkey(), 2_000_000_000)
            sig = getattr(resp, "value", None)
            if sig is None:
                raise RuntimeError(f"RPC returned an error instead of a signature: {resp}")
            for _ in range(30):
                time.sleep(2)
                statuses = client.get_signature_statuses([sig]).value
                if statuses[0] is not None and statuses[0].confirmation_status is not None:
                    print(f"Airdrop confirmed: {sig}")
                    break
            else:
                print("Airdrop not yet confirmed after 60s -- it may still land; re-run this script to check.")
        except Exception as e:
            print(f"Airdrop request failed ({e}). The public devnet faucet is commonly "
                  "rate-limited (HTTP 429), especially from shared/cloud IPs.")
            print("Fund manually instead at https://faucet.solana.com "
                  f"with address {payer.pubkey()}, then re-run this script.")
            if client.get_balance(payer.pubkey()).value == 0:
                sys.exit(1)

    if MINT_PATH.exists():
        mint_address = MINT_PATH.read_text().strip()
        print(f"DHOST Credits mint already exists: {mint_address}")
    else:
        print("Creating DHOST Credits SPL token mint (decimals=2)...")
        token = Token.create_mint(
            conn=client,
            payer=payer,
            mint_authority=payer.pubkey(),
            decimals=2,
            program_id=TOKEN_PROGRAM_ID,
        )
        mint_address = str(token.pubkey)
        MINT_PATH.write_text(mint_address)
        print(f"Created mint: {mint_address}")

    print("\nSetup complete. Add these to your .env:\n")
    print("  ENABLE_BLOCKCHAIN=true")
    print(f"  SOLANA_MINT_ADDRESS={mint_address}")
    print(f"  SOLANA_RPC_URL={RPC_URL}")
    print(f"\nPayer/mint-authority pubkey: {payer.pubkey()}")
    print(f"Explorer: https://explorer.solana.com/address/{mint_address}?cluster=devnet")


if __name__ == "__main__":
    main()
