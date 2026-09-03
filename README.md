# decentralized.hosting
<img width="864" height="1821" alt="image" src="https://github.com/user-attachments/assets/cbc2254d-426f-4b20-b1e7-9a8a47de1e74" />


[![CI](https://github.com/CodesbyFebin/decentralized.hosting/actions/workflows/ci.yml/badge.svg)](https://github.com/CodesbyFebin/decentralized.hosting/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-025E8C?logo=dependabot)](https://github.com/CodesbyFebin/decentralized.hosting/network/updates)
[![Contributors](https://img.shields.io/github/contributors/CodesbyFebin/decentralized.hosting)](https://github.com/CodesbyFebin/decentralized.hosting/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/CodesbyFebin/decentralized.hosting)](https://github.com/CodesbyFebin/decentralized.hosting/stargazers)

A working local MVP of an open-source, decentralized hosting mesh: a
FastAPI control plane, a Docker-based node agent, a Traefik edge proxy, a
local container registry, a `dhost` CLI, and an optional Solana-devnet
node-operator credit system.

This is **Phase 1 and 2** of the [live roadmap](https://decentralized.host/roadmap/)
— a real, runnable mesh, not a mockup. Confidential-computing enclaves and
an optional mainnet credit migration are later phases.

### Why decentralized.host?

- **No vendor lock-in** — standard Docker containers, your own server, no proprietary APIs to migrate off of later.
- **No platform markup** — the software is free (MIT); you pay only your own VPS/hardware provider, same as running anything else yourself.
- **Multi-node scheduling** — deploy across whatever machines you register to your own mesh, scheduled by live CPU/RAM load.
- **Open source, no open-core trap** — every capability described here is in this repository, not gated behind a paid tier.

### Project facts (machine-readable)

```yaml
project:
  name: decentralized.host
  category:
    - decentralized hosting
    - self-hosted PaaS
    - distributed compute
  license: MIT
  status: Phase 1 and 2 complete (see roadmap)

interfaces:
  - CLI (dhost)
  - REST API
  - Git SSH
  - Web console (dashboard/)

core:
  control_plane: FastAPI
  database: PostgreSQL
  runtime: Docker
  edge_router: Traefik
  language: Python

capabilities:
  - application deployment (git push or CLI)
  - resource-aware multi-node scheduling
  - server-side container builds (no local Docker needed)
  - deployment history and rollback
  - automatic Let's Encrypt TLS in production

blockchain:
  network: Solana
  status: optional, off by default
  environment: devnet only (no real funds)
```

## Architecture

```
dhost CLI --snapshot+upload--> Control Plane --forward--> Node Agent --build/run--> App Container
   |         (no Git, no                                        |                        |
   |          local Docker)                                     +----heartbeat-----> Control Plane
   |                                                                                       |
   +----ship/update/history/rollback/status/logs----------------------------------------> |
                                                                                            |
                                                                    +--(N heartbeats)--> Solana devnet (credits)

Traefik routes app.127.0.0.1.nip.io -> the container the node agent just started
```

- **control-plane/** — FastAPI + PostgreSQL. Issues JWTs to nodes, schedules
  deployments onto the least-loaded healthy node, tracks state, proxies
  source uploads to the right node agent to build.
- **node-agent/** — Runs on the host Docker daemon (via the mounted
  socket). Registers, sends heartbeats, **builds images from uploaded
  source** (`/build`), runs containers, writes Traefik's routing config.
- **cli/** — The `dhost` command: `ship`, `update`, `history`, `rollback`,
  `status`, `logs`, `node join`, `node list`, `wallet`, `credits`,
  `keys add`/`keys list`, `clone-url` (plus the older `init`/`deploy`, kept
  for anyone who wants to build locally — see below).
- **git-server/** — A real SSH git server: `git push` to auto-create a repo
  and deploy it, no separate CI config. See "Real git push deploys" below.
- **blockchain/** — Solana devnet integration for node-operator credits.
  Optional, feature-flagged, fully documented in [blockchain/README.md](blockchain/README.md).
- **mcp-server/** — An MCP server exposing the control plane's real API as
  tools (list/inspect deployments, logs, nodes, release/engine history,
  ship, delete) for Claude or any MCP client. Fully documented in
  [mcp-server/README.md](mcp-server/README.md).
- **web/** — The original single-page landing page. Still shippable through
  the mesh (`cd web && dhost ship opengit-site --port 80`) as a live
  example of self-hosting, but no longer the canonical public site.
- **marketing-site/** — The real public site: a React/Vite/TypeScript SEO
  content site (docs, guides, architecture explainer, honest competitor
  comparisons with evidence sources, an interactive deployment simulator).
  Meant for **www.decentralized.host** via Vercel — a legitimate static-hosting
  use case, distinct from the mesh itself. `npm install && npm run dev`
  inside the directory; `npm run build` for a static `dist/`. Every
  `claimStatus`/`codeSource` field in its content data cites real files in
  this repo. It shipped with fabricated testimonials, fake case studies,
  and several fictional CLI commands/config formats (`dhost login`,
  `dhost.yml`, `--repo`/`--node` flags, an `install.sh`) — all removed or
  corrected to match what's actually built; see the commit history for
  specifics if you're curious what changed.
- **dashboard/** — **OpenGit Console**: a single-page web dashboard (vanilla
  JS, no build step) at http://localhost:4001. Dashboard, Deployments (with
  live logs and teardown), **Git Manager** (real release history — every
  `dhost ship`/`update`/Launchpad ship records a `Release` row in Postgres
  with its message, snapshot id, and status), Mesh Nodes, Credits, Settings,
  and a **Launchpad** — drag a project folder into the browser and it's
  detected, previewed (with an optional real Gemini note if
  `GOOGLE_API_KEY` is set on the control plane), and shipped through the
  exact same `/deployments/ship` pipeline as the CLI. No Dockerfile written
  to your repo, no local Docker or Git involved either way. A **Sandbox**
  tab lists 100 well-known open-source self-hosting tools
  (`dashboard/public/sandbox-catalog.js`) — 17 of them genuinely deploy with
  one click through the real `POST /deployments` endpoint (an existing
  pre-built image, no build step, same pipeline any deployment here uses),
  each individually verified to actually boot; the other 83 are reference
  entries with the specific real reason they don't fit a single-click
  container (needs a cluster, needs launch arguments this mesh's deploy
  pipeline can't pass through, exceeds the mesh's fixed 256MB
  per-container memory limit, etc.) — never a vague "coming soon." No
  Analytics or
  chat-based AI Assistant pages — those would need fabricated data or a
  much bigger feature (a tool-using conversational agent) than "dashboard,"
  so they were left out rather than faked. Protected by HTTP Basic Auth
  (`dashboard/nginx.conf`) when exposed beyond localhost — generate your own
  `dashboard/.htpasswd` with `htpasswd -c dashboard/.htpasswd admin`
  (from the `apache2-utils`/`httpd-tools` package); it's gitignored, not
  shipped in the repo.

## Quick start

Requires Docker (with Compose) running locally — on the machine running
the mesh. **The developer's own machine does not need Docker or Git
installed** to use `dhost ship`.

```bash
# 1. Bring up the mesh (postgres, registry, traefik, control-plane, one node-agent)
docker compose up -d --build

# 2. Install the CLI
pip install -e ./cli

# 3. Confirm the mesh is healthy
dhost node list

# 4. Ship a sample app -- no Dockerfile written to disk, no git repo, no local docker build
cd examples/hello-world
dhost ship hello-world
```

Once it reports "Live", visit the printed URL
(`http://hello-world.127.0.0.1.nip.io`) — this is a real public DNS name
that resolves to `127.0.0.1` (via the free [nip.io](https://nip.io)
wildcard DNS service), routed by Traefik to the container the node agent
just built and started.

Made a change? `dhost update "what changed"` snapshots and redeploys.
`dhost history` lists every snapshot; `dhost rollback <snapshot-id>`
restores and redeploys an older one. None of this touches `git` — see
[cli/dhost/ledger.py](cli/dhost/ledger.py) for the real (SHA-256
content-addressed) versioning underneath, and
[node-agent/agent.py](node-agent/agent.py)'s `build_and_run` for the
server-side build that means your machine never runs `docker build`.

Check `dhost status hello-world` and `dhost logs hello-world` to see it
end-to-end.

### The older `init` / `deploy` path

Still there, still works, for anyone who'd rather build locally: `dhost
init` writes a real `Dockerfile` into your project and `dhost deploy
<name>` runs `docker build`/`docker push` on your own machine before
scheduling it. `ship`/`update` don't use either of those — the Dockerfile
is generated in memory and shipped over the wire, never written to your
repo unless you ask for it via `init`.

The landing page itself is hosted the same way: `cd web && dhost ship
opengit-site --port 80`, then visit `http://opengit-site.<BASE_DOMAIN>`.
This project dogfoods itself rather than running its own site on a
special-cased container.

## AI assistant (optional)

A real chat assistant in the console's Assistant tab -- one model
(Gemini, same `GOOGLE_API_KEY` as the Launchpad's stack notes), not a
router across "100 free models." It has **read-only** tool access to
actual deployment status, logs, node health, and release history
(`control-plane/app/routers/assistant.py`) -- it cannot deploy, delete,
or change anything, and it's instructed to say so and point at the right
CLI command instead if asked to. Off by default; the console shows "not
configured" honestly rather than a fake response when no key is set.

```bash
# in .env
GOOGLE_API_KEY=your-real-key
docker compose restart control-plane
```

## SEO files for static sites

Any deployment the build detects as a static site (an `index.html` at the
root) gets a real `sitemap.xml` (every `.html` file it actually finds,
correct scheme/domain for the environment) and `robots.txt` generated
automatically on build, unless the project already has its own — see
`_maybe_generate_seo_files` in [node-agent/agent.py](node-agent/agent.py).
Nothing is fabricated or auto-applied to non-static apps: there's no way
to know a Python/Node backend's real routes without introspecting it, so
this deliberately doesn't try.

## Real git push deploys

A real SSH git server, not the Git-free ledger path above — the two are
independent front doors into the same build pipeline. First register a
key, then push:

```bash
dhost keys add my-laptop ~/.ssh/id_ed25519.pub   # takes up to 30s to sync
dhost clone-url my-app                            # prints the remote URL + setup commands

cd my-app
git remote add opengit ssh://git@localhost:2222/repos/my-app.git
git push opengit main
```

First push auto-creates the repo and deploys it; every push after that
redeploys. No `.opengit.yml` needed for the common case (port 8080,
`<name>.<BASE_DOMAIN>`) — add one at the repo root only to override:

```yaml
port: 3000
domain: custom.example.com   # optional, same override dhost ship --domain provides
```

Deploys whatever branch you push, single-branch-is-live (like a classic
Heroku git remote) — there's no multi-branch preview-environment support
in this version. Auth is the same single-shared-secret model as the rest
of the mesh: any registered key can push to any repo, no per-repo ACLs.

## Node-operator credits (optional)

Off by default. To turn on real Solana-devnet credit minting, see
[blockchain/README.md](blockchain/README.md) — short version:

```bash
pip install -r blockchain/requirements.txt
python blockchain/scripts/setup_devnet.py
# copy the printed mint address into .env, set ENABLE_BLOCKCHAIN=true
docker compose restart control-plane
dhost wallet <node_id> <your-devnet-wallet-pubkey>
```

## Adding a second node

For another container on this same Docker daemon (quick local testing):

```bash
dhost node join --node-name node-2
dhost node list   # should now show two healthy nodes
```

For a genuinely separate machine, the control plane now tracks each
node's own reachable address (`Node.advertise_address`) and always talks
to the specific node a deployment landed on — earlier versions of this
project hardcoded one global node-agent URL, which would have silently
misrouted builds/logs/teardown to the wrong machine the moment a second
*real* node existed. Run the agent directly on the remote machine:

```bash
docker run -d --name dhost-node-agent \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e CONTROL_PLANE_URL=https://api.<your-domain> \
  -e NODE_JOIN_SECRET=<your real NODE_JOIN_SECRET> \
  -e NODE_NAME=node-2 \
  -e ADVERTISE_ADDRESS=<this machine's reachable host>:8100 \
  -p 8100:8100 \
  dhost/node-agent:latest
```

`ADVERTISE_ADDRESS` must be reachable *from the control plane*, not from
you — a public IP/hostname for a real remote box, or the Docker network
hostname for same-compose testing (the default). The scheduler picks
whichever healthy node has the lowest combined CPU+RAM load.

## Keeping the mesh up

Two independent checks, for two different failure modes:

- **`.github/workflows/mesh-health-check.yml`** — a scheduled GitHub Actions
  job (daily, plus manual `workflow_dispatch`) that curls the public mesh
  hostnames from outside and fails loudly if any of them are down. External
  and read-only — it can observe the mesh but can't fix anything on the
  machine it runs on.
- **`scripts/mesh-watchdog.sh`** — a local script that checks Colima and
  every `dhost-*` container on this machine and restarts what it finds
  stopped. Exists because Colima was found stopping unpredictably (silently,
  twice within an hour) while the Cloudflare Tunnel in front of it stayed
  up — every request just 502'd until someone checked by hand. Install it
  as a per-user LaunchAgent (runs every 15 minutes, no sudo) with:

  ```bash
  bash scripts/install-mesh-watchdog.sh
  ```

  Logs to `~/Library/Logs/dhost-mesh-watchdog.log`. Re-run the installer
  after editing `scripts/mesh-watchdog.sh` — it runs from an installed copy
  under `~/Library/Application Support`, not from this checkout, since
  launchd can't read files under `~/Desktop` on this Mac.

## Configuration

All runtime config lives in `.env` (copy `.env.example` if you don't have
one). Notable knobs:

| Variable | Default | Purpose |
|---|---|---|
| `NODE_JOIN_SECRET` | `dev-join-secret` | Shared secret nodes present to join the mesh |
| `DEPLOY_API_KEY` | `dev-deploy-key` | Bearer key the CLI uses to call `/deployments` |
| `BASE_DOMAIN` | `127.0.0.1.nip.io` | Wildcard domain deployments are scheduled under |
| `ENABLE_BLOCKCHAIN` | `false` | Turn on Solana devnet credit minting |
| `CREDITS_PER_REWARD` / `HEARTBEATS_PER_REWARD` | `10` / `6` | Reward size and cadence |

These are dev-friendly defaults, not production secrets — rotate
`SECRET_KEY`, `NODE_JOIN_SECRET`, and `DEPLOY_API_KEY` before exposing this
beyond your own machine.

## What's not real yet

Being upfront about scope, matching the roadmap on the landing page:

- **Docker is still the container runtime** — `ship`/`update` remove Docker
  from the *developer's* machine, but the mesh itself (the node agent) still
  uses Docker internally to build and run containers, the same way most
  "no Docker" PaaS products work under the hood. This project does not
  reimplement a container runtime from scratch — doing that safely
  (namespaces, cgroups, image layering, sandboxing) is a much bigger
  undertaking than is reasonable here, and a half-built version of it would
  be a real security downgrade from what Docker already gives us.
- Single-machine **by default** — `dhost node join` still runs another
  agent container on the same Docker daemon for quick local testing. Real
  multi-machine now works (each node reports its own reachable address
  and the control plane addresses that node specifically — see "Adding a
  second node"), but it hasn't been tested against an actual second
  physical/cloud machine, only reasoned through and code-reviewed.
- No real TLS/Let's Encrypt for **local dev** — `nip.io` + Traefik gets you
  real routing, not HTTPS. Production deploys (`docker-compose.prod.yml`,
  see DEPLOY.md) do get real Let's Encrypt certs.
- No per-user accounts/RBAC — one shared deploy key, one shared node join
  secret, and (new) any registered SSH key can push to any repo. Fine for
  a single operator running their own mesh, not for a multi-tenant service.
- The git server has no multi-branch preview environments, no per-repo
  access control, and deploys whatever branch you last pushed — a single
  shared "production" per repo, not a full CI/CD system.
- Credits run on Solana **devnet** only, by design (see
  [blockchain/README.md](blockchain/README.md) for why).

## Documentation

- [DEPLOY.md](DEPLOY.md) — production deployment (real TLS, custom domains)
- [blockchain/README.md](blockchain/README.md) — Solana devnet node-operator credits
- [SECURITY.md](SECURITY.md) — reporting a vulnerability
- [CONTRIBUTING.md](CONTRIBUTING.md) — running this locally to make a change
- Full docs, guides, and API reference: [decentralized.host/docs/](https://decentralized.host/docs/)
- Live roadmap: [decentralized.host/roadmap/](https://decentralized.host/roadmap/)

## License

MIT. See [LICENSE](LICENSE).
