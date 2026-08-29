# Node Operator Credits (Solana devnet)

decentralized.host rewards node operators for contributing hardware to the
mesh with **DHOST Credits** — an SPL token minted on Solana's public
**devnet** cluster.

## Why Solana devnet, and why "free"

- **Devnet** is Solana's public test cluster. SOL and tokens on devnet have
  **no monetary value** — they exist purely for building and testing. This
  keeps the reward system real and on-chain (real transactions, a real
  explorer, a real token mint) without touching real money or requiring
  users to buy anything.
- Devnet SOL for transaction fees comes from a **free faucet**
  (`request_airdrop` / https://faucet.solana.com), so running this costs
  nothing.
- The economics page on the landing site frames this as the "Node Operator"
  tier: contribute a node, earn credits per healthy heartbeat interval. A
  future mainnet migration (real token, real governance) is a Phase 4+
  decision the roadmap already flags as "Year 2" — this repo intentionally
  stays on devnet.

## How it fits into the protocol

```
Node Agent --heartbeat--> Control Plane --(every N heartbeats)--> mint_credits()
                                                                      |
                                                                      v
                                                    Solana devnet SPL Token Program
                                                    (DHOST Credits, mint authority
                                                     held by the control plane's
                                                     payer keypair)
```

- `creditor.py` — shared client used by both the control-plane service and
  the standalone scripts below (mint, balance check, associated-token-account
  creation).
- `scripts/setup_devnet.py` — one-time: generates a payer keypair, airdrops
  devnet SOL, creates the DHOST Credits mint.
- `scripts/mint_credits.py` — mint credits to a node operator's wallet.
- `scripts/check_balance.py` — check a wallet's credit balance.

## Setup

```bash
pip install -r blockchain/requirements.txt
python blockchain/scripts/setup_devnet.py
```

This prints a mint address. Add it to your `.env`:

```
ENABLE_BLOCKCHAIN=true
SOLANA_MINT_ADDRESS=<printed mint address>
```

Restart the control plane (`docker compose restart control-plane`) and it
will mint credits automatically every `HEARTBEATS_PER_REWARD` heartbeats
from each node, or on-demand via:

```bash
dhost credits <node_id>          # view a node's credit ledger
```

`blockchain/.keys/` (payer keypair + mint address) is gitignored — it's a
local devnet identity, not a secret worth protecting like a real wallet,
but keeping it out of git avoids every clone sharing the same mint
authority.
