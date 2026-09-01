import { FeatureItem } from '../types';

export const FEATURES_DATA: FeatureItem[] = [
  {
    id: 'feat-git-push',
    title: 'Git Push Deployment via SSH',
    slug: 'git-deployments',
    category: 'deployment',
    claimStatus: 'IMPLEMENTED',
    summary: 'Push code directly from local Git repositories to trigger automated builds and deployment across node agents.',
    codeSource: 'git-server/post-receive.template & git-server/opengit-shell.sh',
    description: 'A customized OpenSSH container executes a hardened post-receive hook on push. The hook extracts commit metadata, archives source snapshots, and posts them directly to the control plane deployment API with zero client-side dependencies beyond standard git.',
    technicalCapabilities: [
      'Standard `git push dhost main` workflow',
      'SSH public key authentication per user',
      'Automated workspace archiving into build context',
      'Webhook notification to FastAPI control plane'
    ],
    cliCommand: 'git remote add dhost ssh://git@<your-host>:2222/app-name.git && git push dhost main'
  },
  {
    id: 'feat-cli-ship',
    title: 'Interactive CLI (dhost ship)',
    slug: 'cli-deployments',
    category: 'deployment',
    claimStatus: 'IMPLEMENTED',
    summary: 'Full-featured Python CLI with framework auto-detection, interactive init, live log streaming, and node management.',
    codeSource: 'cli/dhost/main.py, cli/dhost/client.py, cli/dhost/detect.py',
    description: 'The dhost CLI inspects the local directory for project files (Dockerfile, requirements.txt, package.json), packages the codebase into a gzip archive, uploads it to the control plane, monitors the build process, and returns the live URL.',
    technicalCapabilities: [
      '`dhost ship <name>` detects your stack, snapshots the project (no Git), and deploys -- no Dockerfile needed',
      '`dhost update "message"` snapshots changes and redeploys',
      '`dhost logs <name>` streams the last ~200 lines of container output',
      '`dhost status <name>` inspects a deployment; `dhost node list` inspects mesh nodes'
    ],
    cliCommand: 'dhost ship'
  },
  {
    id: 'feat-smart-scheduler',
    title: 'Resource-Aware Node Scheduler',
    slug: 'distributed-scheduling',
    category: 'compute-mesh',
    claimStatus: 'IMPLEMENTED',
    summary: 'Control plane scheduler evaluates memory availability, CPU load, and healthy heartbeats before assigning workloads.',
    codeSource: 'control-plane/app/scheduler.py & control-plane/app/routers/nodes.py',
    description: 'When a new deployment is queued, the scheduler queries the active nodes database, filters out any nodes with stale heartbeats (>60s), ranks candidate nodes by lowest memory/CPU utilization ratio, and dispatches the build/run task.',
    technicalCapabilities: [
      'Dynamic node capacity scoring based on psutil metrics',
      'Automatic failover exclusion for unhealthy nodes',
      'Multi-node load distribution across heterogeneous VPS instances',
      'Heartbeat tracking with configurable timeout windows'
    ],
    cliCommand: 'dhost nodes list'
  },
  {
    id: 'feat-docker-node-agent',
    title: 'Decoupled Node Agent & Docker Engine',
    slug: 'node-network',
    category: 'compute-mesh',
    claimStatus: 'IMPLEMENTED',
    summary: 'Lightweight Python background daemon running on worker nodes to execute and monitor Docker containers.',
    codeSource: 'node-agent/agent.py & node-agent/Dockerfile',
    description: 'Each compute node runs a self-contained node-agent container connected to the local Docker daemon (/var/run/docker.sock). It periodically reports system health metrics and executes container build/run/stop instructions from the control plane.',
    technicalCapabilities: [
      'Docker-in-Docker / Host Docker socket execution',
      'Periodic psutil telemetry (CPU, RAM, Disk, IO)',
      'Graceful container shutdown and restart policies',
      'Isolated environment variable injection'
    ],
    cliCommand: 'docker run -d --name dhost-agent -v /var/run/docker.sock:/var/run/docker.sock dhost/node-agent'
  },
  {
    id: 'feat-traefik-routing',
    title: 'Automated Traefik Reverse Proxy & TLS',
    slug: 'automatic-routing',
    category: 'routing',
    claimStatus: 'IMPLEMENTED',
    summary: 'Dynamic HTTP/HTTPS routing with automatic Let’s Encrypt SSL certificate issuance per deployed subdomain.',
    codeSource: 'docker-compose.yml & control-plane/app/routers/deployments.py',
    description: 'Traefik watches Docker container labels dynamically. When a new application container boots on a node, Traefik detects labels such as `traefik.http.routers.<app>.rule=Host(...)` and immediately configures routing and ACME TLS.',
    technicalCapabilities: [
      'Automatic SSL/TLS provisioning via ACME Let’s Encrypt',
      'Custom domain & subdomain mapping (<app>.<cluster-domain>)',
      'Zero-restart dynamic router reloading',
      'HTTP-to-HTTPS automated redirection'
    ],
    cliCommand: 'dhost domains add myapp.example.com'
  },
  {
    id: 'feat-auto-detection',
    title: 'Zero-Config Framework Auto-Detection',
    slug: 'framework-detection',
    category: 'developer-tools',
    claimStatus: 'IMPLEMENTED',
    summary: 'Intelligent project heuristics detect FastAPI, Flask, Django, Express, Next.js, and static sites with automated fallback generation.',
    codeSource: 'control-plane/app/detect.py & cli/dhost/detect.py',
    description: 'Both the CLI and control plane run heuristic file inspections. If a user repo lacks a Dockerfile, Decentralized.Host detects package.json (Next.js/Express) or requirements.txt (FastAPI/Django) and generates a standardized, secure multi-stage Docker build pipeline.',
    technicalCapabilities: [
      'FastAPI & Flask detection via requirements.txt/pyproject.toml',
      'Node.js & Next.js detection via package.json dependencies',
      'Static HTML detection via index.html',
      'Custom Dockerfile override support'
    ],
    cliCommand: 'dhost detect'
  },
  {
    id: 'feat-rollback-history',
    title: 'Versioned Deployment History & Rollbacks',
    slug: 'deployment-history',
    category: 'deployment',
    claimStatus: 'IMPLEMENTED',
    summary: 'Track every deployment commit, build artifact, and container state with instant rollback to previous healthy tags.',
    codeSource: 'control-plane/app/routers/deployments.py & control-plane/app/models.py',
    description: 'Every deployment is recorded with immutable metadata, git commit hash, Docker image tag, and scheduling decisions in PostgreSQL/SQLite. Reverting to a previous version repoints the router with sub-second execution.',
    technicalCapabilities: [
      'Immutable deployment logs and metadata audits',
      'Single-command rollback to target version',
      'Container tag retention policy',
      'Zero-downtime traffic switching'
    ],
    cliCommand: 'dhost rollback <app-name> --version v1'
  },
  {
    id: 'feat-solana-ledger',
    title: 'Solana SPL Credit Ledger (Optional Node Incentives)',
    slug: 'node-operator-credits',
    category: 'economics',
    claimStatus: 'EXPERIMENTAL',
    summary: 'Experimental SPL token credit minting and balance verification on Solana Devnet/Mainnet for node compute credits.',
    codeSource: 'blockchain/creditor.py, blockchain/scripts/setup_devnet.py, control-plane/app/routers/blockchain.py',
    description: 'Provides optional smart contract / token balance checking where node operators earn verifiable compute credits for hours of container execution and bandwidth served. Completely optional; core platform runs 100% self-hosted without crypto.',
    technicalCapabilities: [
      'Solana RPC balance verification via solana-py',
      'Devnet automated token faucet and mint script',
      'Compute credit accounting per deployment runtime',
      'Decoupled from core Docker execution (zero crypto dependencies required)'
    ],
    cliCommand: 'dhost credits balance'
  },
  {
    id: 'feat-ai-assistant',
    title: 'AI Deployment Assistant & Diagnosis',
    slug: 'ai-diagnosis',
    category: 'developer-tools',
    claimStatus: 'EXPERIMENTAL',
    summary: 'Server-side AI router analyzing failed build logs and generating automatic configuration fixes.',
    codeSource: 'control-plane/app/ai.py & control-plane/app/routers/assistant.py',
    description: 'When a Docker build fails on a node agent, the AI assistant router inspects the stderr output, parses stack traces, and suggests syntax fixes for Dockerfiles or missing system dependencies.',
    technicalCapabilities: [
      'Container build error diagnosis',
      'Dockerfile optimization suggestions',
      'Environment variable validation',
      'Automated health check remediation advice'
    ],
    cliCommand: 'dhost diagnose <app-name>'
  },
  {
    id: 'feat-proof-of-compute',
    title: 'Cryptographic Proof-of-Compute & Hardware Attestation',
    slug: 'proof-of-compute',
    category: 'security',
    claimStatus: 'PLANNED',
    summary: 'Hardware enclave (SGX/SEV) attestation and cryptographic proof of execution receipts for fully trustless nodes.',
    codeSource: 'Roadmap Milestone Phase 3',
    description: 'Future capability designed to allow untrusted third-party bare-metal servers to join the network with hardware-level memory encryption and zk-STARK receipts confirming application execution.',
    technicalCapabilities: [
      'Confidential computing inside AMD SEV / Intel SGX enclaves',
      'Zero-knowledge verification of container state',
      'Cryptographic execution receipts signed by node keys',
      'Trustless compute settlement on-chain'
    ]
  },
  {
    id: 'feat-p2p-mesh',
    title: 'Autonomous Libp2p Gossip Mesh',
    slug: 'p2p-mesh',
    category: 'compute-mesh',
    claimStatus: 'PLANNED',
    summary: 'Fully coordinator-free peer-to-peer control mesh using libp2p and decentralized consensus.',
    codeSource: 'Roadmap Milestone Phase 4',
    description: 'Eliminates the centralized coordinator control-plane in favor of a distributed hash table (Kademlia DHT) where node discovery and scheduling occur over gossip protocols.',
    technicalCapabilities: [
      'Coordinator-free decentralized consensus',
      'NAT traversal via libp2p relay nodes',
      'Distributed storage replication with IPFS/Bittorrent',
      'Byzantine fault tolerant workload scheduling'
    ]
  }
];
