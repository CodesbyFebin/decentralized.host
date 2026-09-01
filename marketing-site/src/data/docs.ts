export interface DocSection {
  id: string;
  title: string;
  slug: string;
  category: 'getting-started' | 'cli-reference' | 'self-hosting' | 'node-agent' | 'rest-api' | 'configuration' | 'git-server' | 'console' | 'blockchain' | 'ai-assistant' | 'database' | 'security';
  description: string;
  content: string;
  codeBlocks?: { label: string; language: string; code: string }[];
}

export const DOCS_DATA: DocSection[] = [
  {
    id: 'doc-quickstart',
    title: 'Quick Start: Deploy in 60 Seconds',
    slug: 'quickstart',
    category: 'getting-started',
    description: 'Install the dhost CLI, authenticate with your control plane, and ship your first application from your terminal.',
    content: `Decentralized.Host deploys any web application, API, or background container with one command, from your own machine or from a self-hosted control plane. Follow this guide to ship your first project against a mesh you're running (see the self-hosting guide to stand one up).

### 1. Install the CLI
The CLI isn't published to PyPI yet -- install it in editable mode from the repo:

\`\`\`bash
git clone https://github.com/CodesbyFebin/decentralized.host.git
cd decentralized.host
pip install -e ./cli
\`\`\`

### 2. Point it at your control plane
Set the URL and deploy key for the mesh you're targeting (defaults match a local \`docker compose up\` mesh):

\`\`\`bash
export DHOST_API_URL=http://localhost:8000
export DHOST_DEPLOY_KEY=your_deploy_api_key
\`\`\`

### 3. Ship your application
Navigate to your application directory (FastAPI, Next.js, Express, static, or anything with a custom Dockerfile) and run:

\`\`\`bash
cd my-app
dhost ship my-app
\`\`\`
The CLI detects your stack, snapshots the project locally (a real SHA-256 content-addressed ledger under \`.dhost/\` -- no Git required), uploads the snapshot, and the control plane builds and runs it on the mesh -- no Dockerfile needed in your repo, no local Docker required either. It prints your live URL when done.

### 4. Update it
\`\`\`bash
dhost update "what changed"
\`\`\`
Snapshots your current changes and redeploys. \`dhost history\` lists past snapshots; \`dhost rollback <snapshot-id>\` restores and redeploys an earlier one.`,
    codeBlocks: [
      {
        label: 'Bash Installation',
        language: 'bash',
        code: `pip install -e ./cli
dhost ship my-app
dhost update "fix"`
      }
    ]
  },
  {
    id: 'doc-cli-reference',
    title: 'CLI Command Reference',
    slug: 'cli-reference',
    category: 'cli-reference',
    description: 'Every real subcommand in the dhost CLI, matched against cli/dhost/main.py -- no aliases or flags that don\'t exist.',
    content: `The \`dhost\` CLI talks to whatever control plane you point it at via two environment variables (or the \`.dhost/config.yml\` that \`dhost ship\`/\`init\` write automatically):

\`\`\`bash
export DHOST_API_URL=http://localhost:8000      # default if unset
export DHOST_DEPLOY_KEY=dev-deploy-key           # default if unset
\`\`\`

There is no global \`--url\`/\`--token\`/\`--json\` flag set -- auth is env-var or config-file based, not per-invocation flags.

### The Git-free path (recommended)
- \`dhost ship [name] [--port 8080] [--message/-m "ship"] [--domain <bare-domain>]\`: Detects your stack, snapshots the project into \`.dhost/ledger/\` (SHA-256 content-addressed, no Git), uploads it, and the control plane builds + runs it server-side. No Dockerfile needed in your repo. \`--domain\` binds a bare apex domain instead of \`<name>.<BASE_DOMAIN>\` (used for this project's own landing page, for example).
- \`dhost update "<message>"\`: Snapshots current changes and redeploys, reusing the name/port/domain from the last \`dhost ship\` in this directory.
- \`dhost history\`: Lists local snapshots for the current project (id, message, timestamp, file count) -- reads \`.dhost/ledger/\` on this machine only.
- \`dhost rollback <snapshot-id>\`: Restores a local snapshot to a temp sandbox and reships it.

### The older, local-build path
- \`dhost init\`: Writes a real \`Dockerfile\` to the project root (only if one doesn't exist) and creates \`.dhost/config.yml\`.
- \`dhost deploy [name] [--port 8080] [--registry localhost:5000]\`: Runs \`docker build\`/\`docker push\` on **your own machine** (needs local Docker), then schedules it -- distinct from \`dhost ship\`, not an alias.

### Status & logs
- \`dhost status <name>\`: Prints a deployment's status, image, node id, URL, and error (if any).
- \`dhost logs <name>\`: Prints the last ~200 lines of container logs.

### Mesh nodes
- \`dhost node join [--node-name <name>] [--control-plane-url <url>]\`: Builds and runs another node-agent container on this same Docker daemon -- for a genuinely separate machine, see the Self-Hosting / multi-node guide instead.
- \`dhost node list\`: Table of all nodes -- name, status, region, CPU%, RAM used, wallet.

### Git server & keys
- \`dhost keys add <label> <path-to-pubkey>\`: Registers an SSH public key allowed to \`git push\` to this mesh.
- \`dhost keys list\`: Lists registered keys with fingerprints.
- \`dhost clone-url <name> [--ssh-host localhost] [--ssh-port 2222]\`: Prints the git remote URL and setup commands for a repo.

### Node-operator credits (Solana devnet)
- \`dhost wallet <node_id> <solana_pubkey>\`: Links a devnet wallet to a node so it can receive credits.
- \`dhost credits <node_id>\`: Shows a node's credit balance and mint history.

There is no \`dhost list\` (all-deployments), \`dhost restart\`, \`dhost stop\`, or \`dhost destroy\` command -- tear down a deployment via the console's Delete button or \`DELETE /deployments/{name}\`.`,
    codeBlocks: [
      {
        label: 'CLI Examples',
        language: 'bash',
        code: `# Ship the current directory
dhost ship my-app --port 8080

# Tail logs
dhost logs my-app

# See what's on the mesh
dhost node list`
      }
    ]
  },
  {
    id: 'doc-self-hosting',
    title: 'Self-Hosting: Local Dev vs. Real Production',
    slug: 'self-hosting',
    category: 'self-hosting',
    description: 'Two real paths: docker compose up for local dev in minutes, or the full DEPLOY.md walkthrough for a real domain with real Let\'s Encrypt TLS.',
    content: `There are two genuinely different setups here -- don't mix their env vars.

### Local development (no real domain needed)
\`\`\`bash
git clone https://github.com/CodesbyFebin/decentralized.host.git
cd decentralized.host
docker compose up -d --build
pip install -e ./cli
\`\`\`
This brings up Postgres, the registry, Traefik, the control plane, one node agent, the console, and the git server, all using \`.env.example\`'s dev defaults (\`BASE_DOMAIN=127.0.0.1.nip.io\` -- a free wildcard DNS service that resolves any \`*.127.0.0.1.nip.io\` to localhost, so you get real DNS + real Traefik routing with zero setup, just no real TLS).

### Real production (a real domain, real Let's Encrypt certs)
This needs a real server and real DNS -- see [DEPLOY.md](https://github.com/CodesbyFebin/decentralized.host/blob/main/DEPLOY.md) in the repo for the full walkthrough. Short version:

\`\`\`bash
# On a real VPS with Docker installed, DNS already pointed at it:
git clone https://github.com/CodesbyFebin/decentralized.host.git
cd decentralized.host
cp .env.example .env
# edit .env: real BASE_DOMAIN, real random SECRET_KEY/NODE_JOIN_SECRET/DEPLOY_API_KEY, real ACME_EMAIL
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
\`\`\`
Note both compose files are required together -- the prod one is an overlay, not a replacement. This gets you \`api.<domain>\` (control plane) and \`app.<domain>\` (console) with real per-hostname Let's Encrypt certs (HTTP-01, no DNS-provider API key needed -- just a wildcard \`*.<domain>\` A record), and every future \`dhost ship\` also gets a real cert automatically.

### What's running either way
1. **Traefik** -- edge proxy, routes by hostname, TLS in production
2. **FastAPI control plane** -- scheduling, auth, the REST API
3. **Node agent** -- builds and runs containers on the Docker daemon it has access to
4. **git-server** -- the SSH git daemon (see the Git Server guide)
5. **Postgres** -- all state (nodes, deployments, releases, SSH keys)
6. **Console (dashboard)** -- the web UI, static nginx serving vanilla JS/HTML`,
    codeBlocks: [
      {
        label: 'Local dev',
        language: 'bash',
        code: `git clone https://github.com/CodesbyFebin/decentralized.host.git
cd decentralized.host
docker compose up -d --build
pip install -e ./cli
dhost node list`
      }
    ]
  },
  {
    id: 'doc-node-agent',
    title: 'Node Agent Reference',
    slug: 'node-agent-setup',
    category: 'node-agent',
    description: 'What the node agent actually does and every real environment variable it reads (node-agent/agent.py).',
    content: `The node agent is a single Python process: it registers with the control plane, sends heartbeats every 10s, polls for pending deployments, and builds/runs containers via the Docker socket it has access to. There's no published Docker Hub image -- build it from the repo's node-agent/Dockerfile.

### Real environment variables
- \`CONTROL_PLANE_URL\` (default \`http://control-plane:8000\`): where to register and send heartbeats
- \`NODE_JOIN_SECRET\` (default \`dev-join-secret\`): must match the control plane's -- this is the actual variable name, not \`NODE_SECRET_KEY\`
- \`NODE_NAME\` (default: the container's hostname): shown in \`dhost node list\`
- \`NODE_REGION\` (default \`local\`): free-text label, not used for scheduling logic today
- \`ADVERTISE_ADDRESS\` (default \`node-agent:<LOG_API_PORT>\`): **the one that matters for a real remote node** -- must be reachable from the control plane specifically, e.g. \`203.0.113.5:8100\`
- \`REGISTRY_HOST\` (default \`registry:5000\`): where built images get pushed
- \`PUBLIC_SCHEME\` (default \`http\`): set to \`https\` in production so generated Traefik routes and sitemap.xml/robots.txt use the right scheme
- \`HEARTBEAT_INTERVAL\` / \`POLL_INTERVAL\` (default \`10\`/\`3\` seconds)

### Building and running it on a remote machine
\`\`\`bash
git clone https://github.com/CodesbyFebin/decentralized.host.git
cd decentralized.host
docker build -t dhost/node-agent -f node-agent/Dockerfile .
docker run -d --name dhost-node-agent \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -e CONTROL_PLANE_URL=https://api.your-domain.com \\
  -e NODE_JOIN_SECRET=<real secret from the control plane's .env> \\
  -e NODE_NAME=worker-2 \\
  -e ADVERTISE_ADDRESS=<this machine's IP>:8100 \\
  -p 8100:8100 \\
  dhost/node-agent
\`\`\`

### Verifying it joined
\`\`\`bash
dhost node list
\`\`\`
Look for the node's status as \`healthy\` (a node with no heartbeat in the last 30s shows \`stale\`). New deployments schedule onto whichever healthy node has the lowest combined CPU+RAM load.`,
    codeBlocks: [
      {
        label: 'Real node-agent env vars',
        language: 'bash',
        code: `CONTROL_PLANE_URL=https://api.your-domain.com
NODE_JOIN_SECRET=<match the control plane>
NODE_NAME=worker-2
ADVERTISE_ADDRESS=203.0.113.5:8100
PUBLIC_SCHEME=https`
      }
    ]
  },
  {
    id: 'doc-rest-api',
    title: 'REST API Reference',
    slug: 'rest-api',
    category: 'rest-api',
    description: 'The actual FastAPI routes (control-plane/app/routers/), matched one-to-one against the source. No /api/v1 prefix -- paths are at the root.',
    content: `### Base URL
\`http://localhost:8000\` locally, or \`https://api.<your-domain>\` in production. **No \`/api/v1\` prefix** -- every path below is relative to the base URL directly.

### Authentication
Most endpoints take \`Authorization: Bearer <DEPLOY_API_KEY>\`. Node-to-control-plane endpoints (heartbeat, pending-deployments) instead take a short-lived JWT issued at \`/auth/node-join\` -- that's a separate trust boundary from the deploy key.

### Deployments (deploy-key auth)
- \`POST /deployments\` -- old flow: create from an already-built image reference
- \`POST /deployments/detect\` -- upload files, get back detected stack + generated Dockerfile + a reusable upload_id
- \`POST /deployments/ship\` -- upload (or reference an upload_id) + a Dockerfile, build and deploy
- \`POST /deployments/push\` -- single-call detect+build+deploy from one tarball; what the git server's post-receive hook calls
- \`GET /deployments\` -- list all
- \`GET /deployments/{name}\` -- one deployment's status
- \`GET /deployments/{name}/logs\` -- last ~200 lines
- \`GET /deployments/{name}/releases\` -- release/deploy history
- \`DELETE /deployments/{name}\` -- tear down the container and delete the record

### Nodes
- \`GET /nodes\` -- list (deploy-key auth)
- \`POST /auth/node-join\` -- a node registers with \`join_secret\`, gets back a JWT (node auth, not deploy-key)
- \`POST /nodes/heartbeat\`, \`GET /nodes/{id}/pending-deployments\`, \`POST /nodes/{id}/deployment-status/{deployment_id}\` -- all node-JWT auth, called by the node agent itself, not something you'd call directly

### Git server keys
- \`POST /git/keys\`, \`GET /git/keys\`, \`DELETE /git/keys/{id}\` -- manage SSH keys (deploy-key auth)
- \`GET /git/keys/authorized_keys\` -- plain-text authorized_keys format, polled by the git-server container itself

### Blockchain (node-operator credits)
- \`GET /blockchain/status\` -- whether credits are enabled, mint address, reward config
- \`POST /blockchain/nodes/{node_id}/wallet\` -- link a devnet wallet to a node
- \`GET /blockchain/credits/{node_id}\` -- balance + mint ledger for a node

### AI Assistant
- \`GET /assistant/status\` -- whether GOOGLE_API_KEY is configured
- \`POST /assistant/chat\` -- \`{message, history}\` in, \`{reply, tool_calls}\` out; read-only, cannot deploy or delete anything`,
    codeBlocks: [
      {
        label: 'cURL example',
        language: 'bash',
        code: `curl "http://localhost:8000/deployments" \\
  -H "Authorization: Bearer dev-deploy-key"`
      }
    ]
  },
  {
    id: 'doc-git-server',
    title: 'Git Server Deep Dive',
    slug: 'git-server-internals',
    category: 'git-server',
    description: 'How the SSH daemon, the restricted shell, and the post-receive hook actually work -- for when you want to know exactly what you\'re trusting.',
    content: `### The restricted login shell
The \`git\` user's login shell is not \`/bin/bash\` or plain \`git-shell\` -- it's a small wrapper (git-server/opengit-shell.sh) that:
1. Reads the requested command (via \`-c\` argument when invoked as a login shell, or \`$SSH_ORIGINAL_COMMAND\` for a ForceCommand-style setup -- it handles both)
2. Pattern-matches it against exactly three allowed forms: \`git-upload-pack\`, \`git-receive-pack\`, \`git-upload-archive\`. Anything else is rejected before any real shell runs.
3. Extracts the repo name via \`basename()\` (so \`../../etc/passwd\` becomes just \`passwd\` -- no path traversal possible)
4. On \`git-receive-pack\` to a repo that doesn't exist yet, runs \`git init --bare\` and installs the post-receive hook, then execs the real \`git-shell -c\`

### The post-receive hook
Copied from git-server/post-receive.template into every repo's \`hooks/\` at creation time, with \`CONTROL_PLANE_URL\`/\`DEPLOY_API_KEY\` substituted in at container startup:
1. Reads which ref was just pushed and points the bare repo's \`HEAD\` at it (deploys whatever you last pushed -- there's no fixed "main branch" assumption, which also means a fresh repo has no ambiguity about what "the default branch" is)
2. \`git archive HEAD\` into a tarball (already respects \`.gitignore\`/export-ignore, so no separate ignore-list logic needed)
3. Reads an optional \`.opengit.yml\` at the repo root for \`port:\`/\`domain:\` overrides
4. POSTs the tarball to \`/deployments/push\` and prints the result back to your \`git push\` output

### SSH key sync
Registered keys live in Postgres (the \`SSHKey\` model), not directly in the container. The git-server container fetches \`GET /git/keys/authorized_keys\` once at startup and then every 30s in a background loop, so a newly-added key becomes usable within half a minute without a restart.

### What this does NOT have
No per-user accounts, no per-repo access control (any registered key can push to any repo), no branch protection, no PR/code-review workflow, no webhooks besides the deploy trigger itself.`,
    codeBlocks: [
      {
        label: 'Optional .opengit.yml',
        language: 'yaml',
        code: `port: 3000
domain: custom.example.com`
      }
    ]
  },
  {
    id: 'doc-console',
    title: 'OpenGit Console Reference',
    slug: 'console-reference',
    category: 'console',
    description: 'What each tab in the web console actually does -- it\'s a thin client over the same REST API, nothing it shows is exclusive to the UI.',
    content: `The console (dashboard/index.html) is a single static HTML file with vanilla JS -- no build step, no framework. It stores your API URL and deploy key in this browser's localStorage and polls the REST API every 5 seconds.

### Dashboard
Live counts (nodes healthy, deployments running, releases shipped), blockchain status, and a recent-deployments list.

### Launchpad
Drag a project folder in; it uploads to \`/deployments/detect\`, shows the detected stack and an editable generated Dockerfile (plus a real Gemini note if \`GOOGLE_API_KEY\` is set on the control plane, otherwise it says so honestly), then Ship calls \`/deployments/ship\`. Exactly the same pipeline as \`dhost ship\` and \`git push\`.

### Deployments
Table of everything on the mesh; click one for status, the assigned node, and its last ~200 log lines, plus a real Delete button (\`DELETE /deployments/{name}\`).

### Git Manager
Real release history per deployment (message, snapshot id if it came from \`dhost ship\`, status, timestamp) via \`GET /deployments/{name}/releases\` -- plus a quick-command reference for the actual CLI/git-push workflows. This does not let you roll back from the browser; that still needs the local snapshot on whichever machine shipped it.

### Mesh Nodes
Live table from \`GET /nodes\` -- status, region, CPU%, RAM used, linked wallet.

### Credits
Per-node Solana devnet credit ledger, and an honest "off (ENABLE_BLOCKCHAIN=false)" state when it isn't configured.

### Assistant
The AI chat tab -- see the AI Assistant doc.

### Settings
Just two fields: the control plane API URL and the deploy key, stored in this browser only. No user accounts exist in this version.`,
    codeBlocks: []
  },
  {
    id: 'doc-blockchain-credits',
    title: 'Node-Operator Credits (Solana Devnet)',
    slug: 'node-operator-credits',
    category: 'blockchain',
    description: 'A real SPL token minted on Solana devnet -- not mainnet, and that\'s deliberate. See blockchain/README.md for the full reasoning.',
    content: `Off by default (\`ENABLE_BLOCKCHAIN=false\`). When enabled, the control plane mints a real SPL token ("DHOST Credits") to a node operator's linked devnet wallet every \`HEARTBEATS_PER_REWARD\` (default 6) healthy heartbeats.

### Why devnet, not mainnet
Devnet SOL and tokens have no monetary value -- funded by a free public faucet, not a purchase. That keeps this a genuine on-chain demonstration (real transactions, a real token mint, a real Explorer link) without touching real money or requiring anyone to buy anything. A mainnet path is an explicit future decision, not something this version does quietly.

### Setting it up
\`\`\`bash
pip install -r blockchain/requirements.txt
python blockchain/scripts/setup_devnet.py
\`\`\`
This generates a payer keypair, requests a free devnet airdrop (the public faucet is often rate-limited -- the script tells you if it fails and how to retry or fund manually), and creates the token mint. Copy the printed mint address into \`.env\`:
\`\`\`env
ENABLE_BLOCKCHAIN=true
SOLANA_MINT_ADDRESS=<printed mint address>
\`\`\`
Restart the control plane, then link a node's wallet:
\`\`\`bash
dhost wallet <node_id> <your-devnet-wallet-pubkey>
dhost credits <node_id>
\`\`\`

### What actually happens on-chain
Real \`solana-py\`/\`solders\` calls: associated-token-account creation if needed, then a real \`mint_to\` instruction. Every mint is recorded with its transaction signature and a working \`explorer.solana.com/...?cluster=devnet\` link, visible in the console's Credits tab or \`GET /blockchain/credits/{node_id}\`.`,
    codeBlocks: [
      {
        label: 'Enable it',
        language: 'bash',
        code: `python blockchain/scripts/setup_devnet.py
# .env: ENABLE_BLOCKCHAIN=true, SOLANA_MINT_ADDRESS=<printed>
docker compose restart control-plane`
      }
    ]
  },
  {
    id: 'doc-ai-assistant',
    title: 'AI Assistant Reference',
    slug: 'ai-assistant',
    category: 'ai-assistant',
    description: 'One model, four read-only tools, no write access. Not a "God Router" across 100 providers.',
    content: `The console's Assistant tab is backed by a single Gemini model (\`gemini-1.5-flash\`), using the same \`GOOGLE_API_KEY\` as the Launchpad's stack notes. Off by default -- both \`GET /assistant/status\` and the console show an honest "not configured" state rather than a fake response when no key is set.

### The four tools it actually has (all read-only)
- \`list_deployments()\` -- name, status, URL, error for every deployment
- \`get_deployment_logs(name)\` -- last ~200 lines for one deployment
- \`list_nodes()\` -- name, status, CPU%, RAM for every node
- \`get_release_history(name)\` -- last 10 releases for one deployment

It has no tool to deploy, delete, or modify anything. Its system instruction explicitly tells it to decline requests to change state and point at the right CLI command or console button instead.

### Enabling it
\`\`\`env
GOOGLE_API_KEY=your-real-key
\`\`\`
\`docker compose restart control-plane\`, then the Assistant tab's input unlocks automatically once \`/assistant/status\` reports \`enabled: true\`.`,
    codeBlocks: [
      {
        label: 'Enable it',
        language: 'bash',
        code: `# .env
GOOGLE_API_KEY=your-real-key
docker compose restart control-plane`
      }
    ]
  },
  {
    id: 'doc-database',
    title: 'Database & State Management',
    slug: 'database',
    category: 'database',
    description: 'What the control plane actually stores, and how schema changes are applied -- there is no Alembic here, on purpose, for now.',
    content: `The control plane has exactly one stateful dependency: PostgreSQL, via SQLAlchemy. No Redis, no message queue, no separate cache layer.

### The real schema (control-plane/app/models.py)
Five tables, nothing more:
- **Node** -- name, status, region, live CPU/RAM telemetry, and \`advertise_address\` (the reachable host:port the control plane uses to talk back to this specific node -- critical once you have more than one)
- **Deployment** -- name, image reference, assigned node, status, custom domain, container port
- **Release** -- one row per \`ship\`/\`update\`/git-push, message, snapshot id, status, timestamp -- this is what the console's Git Manager tab and \`GET /deployments/{name}/releases\` read
- **CreditLedger** -- one row per Solana devnet mint event, with the real transaction signature
- **SSHKey** -- registered public keys for the git server, label, and the pubkey itself

### Schema changes: no migration framework
There's no Alembic, no versioned migration files. On startup, \`Base.metadata.create_all()\` creates any tables that don't exist yet, then a short \`STARTUP_MIGRATIONS\` list of raw, idempotent \`ALTER TABLE ... ADD COLUMN IF NOT EXISTS\` statements in \`control-plane/app/main.py\` applies any additive changes to tables that already exist. It's intentionally minimal -- fine for a single-operator self-hosted mesh where you control both the code and the database, not something that would scale to a team needing rollback-able migrations or a review process on schema changes.

### Startup sequence
On boot, the control plane retries the database connection for up to 30 attempts (2s apart) before giving up -- this is what lets \`docker compose up\` bring up Postgres and the control plane in either order without a crash loop. \`GET /healthz\` returns \`{"status": "ok"}\` once the app is actually serving, useful for a real load balancer or orchestrator health check in front of it.`,
    codeBlocks: [
      {
        label: 'The full STARTUP_MIGRATIONS list (as of this writing)',
        language: 'python',
        code: `STARTUP_MIGRATIONS = [
    "ALTER TABLE nodes ADD COLUMN IF NOT EXISTS advertise_address VARCHAR",
]`
      }
    ]
  },
  {
    id: 'doc-container-isolation',
    title: 'Container Isolation & Resource Limits',
    slug: 'container-isolation',
    category: 'security',
    description: 'What actually isolates one deployment from another -- standard Docker boundaries, plus one hardcoded resource cap you should know about.',
    content: `Isolation between deployments comes from standard Docker container boundaries -- Linux namespaces (PID, network, mount) and cgroups -- the same isolation any Docker container gets, nothing added and nothing removed. There's no seccomp profile customization, no dropped Linux capabilities, and no read-only root filesystem enforcement beyond Docker's own defaults. If your threat model requires stronger isolation than stock Docker (e.g. gVisor, Kata Containers, or gVisor-style sandboxing), that's not present in this version -- see the roadmap's Phase 3 (confidential computing) for where stronger isolation is planned, not yet built.

### The resource limit every container gets, hardcoded
Every container the node agent starts is capped at:
- **256MB memory** (\`mem_limit="256m"\`)
- **1 vCPU** (\`nano_cpus=1_000_000_000\`)

This is currently the same fixed limit for every deployment regardless of what the app actually needs -- there's no per-app override yet. A memory-hungry app will get OOM-killed at 256MB just like a tiny one; know this before shipping something that needs more headroom. Restart policy is \`unless-stopped\`, so a crashed container restarts automatically, but a container that's OOM-killed repeatedly will just keep restarting and dying rather than surfacing a clear "needs more memory" signal today.

### Networking
Every deployment container joins the same Docker network (the compose-defined mesh network) so Traefik can reach it by container IP; it is not exposed on a host port directly. Only Traefik's own ports (80/443, or the local dev port) are exposed to the outside world.`,
    codeBlocks: [
      {
        label: 'The actual container creation call (node-agent/agent.py)',
        language: 'python',
        code: `container = docker_client.containers.run(
    image,
    name=container_name,
    detach=True,
    network=MESH_NETWORK,
    restart_policy={"Name": "unless-stopped"},
    mem_limit="256m",
    nano_cpus=1_000_000_000,  # 1 vCPU cap
)`
      }
    ]
  }
];
