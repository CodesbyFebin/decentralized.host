# dhost MCP server

An MCP (Model Context Protocol) server that exposes a running
decentralized.host control plane as real tools -- for Claude (or any MCP
client) to inspect and operate a dhost mesh conversationally.

Every tool is a thin wrapper over a real HTTP call to the control plane.
Nothing here is simulated: if the control plane is unreachable or a call
fails, the tool returns a plain error instead of inventing a result. The
read-only tools mirror the ones already used by the console's own AI
assistant (`control-plane/app/routers/assistant.py`).

## Tools

| Tool | Kind | What it does |
|---|---|---|
| `list_deployments` | read-only | Every deployment: name, status, URL, error |
| `get_deployment` | read-only | Full detail for one deployment |
| `get_deployment_logs` | read-only | Real container logs |
| `list_releases` | read-only | Release history, including the [dhost engine](../control-plane/app/engine.py)'s per-release agent report (security scan, AI Dockerfile review, release notes, post-deploy health) |
| `list_nodes` | read-only | Mesh node health, CPU/RAM |
| `blockchain_status` | read-only | Whether Solana devnet credits are enabled |
| `get_credits` | read-only | A node's devnet credit ledger |
| `ship` | **mutating** | Detects the stack in a local directory and builds+deploys it on the mesh -- a real build, same pipeline as `dhost ship` |
| `delete_deployment` | **mutating, destructive** | Stops and removes a deployment |

## Setup

```bash
cd mcp-server
python3 -m venv .venv
.venv/bin/pip install -e .
```

Config is env vars, same names and defaults the CLI uses:

```bash
export DHOST_API_URL=http://localhost:8000       # or the real public URL
export DHOST_DEPLOY_KEY=<your real DEPLOY_API_KEY from .env>
```

## Register with Claude Code

```bash
claude mcp add dhost -- /absolute/path/to/mcp-server/.venv/bin/python3 -m dhost_mcp.server
```

(Set `DHOST_API_URL`/`DHOST_DEPLOY_KEY` in your shell environment first, or
add `--env` flags to the command above.)

## Verifying it actually works

Two scripts here launch the real server over stdio and call real tools
through the real MCP protocol -- not just the underlying Python functions:

```bash
.venv/bin/python3 test_client.py   # read-only tools
.venv/bin/python3 test_ship.py     # ships a real example app, then deletes it
```
