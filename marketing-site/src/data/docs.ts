export interface DocSection {
  id: string;
  title: string;
  slug: string;
  category: 'getting-started' | 'cli-reference' | 'self-hosting' | 'node-agent' | 'rest-api' | 'configuration';
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
    description: 'Full reference manual for all subcommands and flags in the dhost developer CLI.',
    content: `The \`dhost\` CLI provides complete control over deployments, applications, logs, and compute nodes directly from your local terminal.

### Global Options
- \`--url <endpoint>\`: Target control plane API URL (default: \`$DHOST_API_URL\` or \`http://localhost:8000\`)
- \`--token <api_key>\`: Control plane authentication token (default: \`$DHOST_API_KEY\`)
- \`--json\`: Output raw JSON response for scripting and CI/CD pipelines
- \`--help\`: Display command options

### Deployment Commands
- \`dhost ship [path]\`: Archive current directory, schedule to an optimal node, and execute build.
- \`dhost deploy [path]\`: Alias for \`dhost ship\`.
- \`dhost list\`: List all deployed applications, active status, memory usage, and assigned nodes.
- \`dhost logs <app-name> [--tail 100] [--follow]\`: Stream real-time stdout and stderr logs from the running container.
- \`dhost restart <app-name>\`: Trigger zero-downtime container restart on the assigned node.
- \`dhost stop <app-name>\`: Gracefully stop a running application container.
- \`dhost destroy <app-name>\`: Terminate container, remove Traefik router, and delete deployment record.

### Versioning & Rollbacks
- \`dhost history <app-name>\`: Inspect release history, git commits, build timestamps, and image tags.
- \`dhost rollback <app-name> --version <tag>\`: Instantly repoint router traffic to a prior healthy release tag.

### Compute Node Management
- \`dhost nodes list\`: View all connected compute nodes, CPU load, available RAM, and heartbeat health.
- \`dhost nodes inspect <node-id>\`: Detailed telemetry inspection for a specific node agent.`,
    codeBlocks: [
      {
        label: 'CLI Examples',
        language: 'bash',
        code: `# Inspect active applications
dhost list

# Stream logs in real-time
dhost logs my-fastapi-app --tail 50 -f

# Inspect connected compute nodes
dhost nodes list`
      }
    ]
  },
  {
    id: 'doc-self-hosting',
    title: 'Self-Hosting the Control Plane',
    slug: 'self-hosting',
    category: 'self-hosting',
    description: 'Step-by-step instructions to run your own private Decentralized.Host cluster using Docker Compose.',
    content: `You can run a complete, self-contained Decentralized.Host cluster on a single Linux VPS (Ubuntu 22.04 / Debian 12 / AlmaLinux) in under 3 minutes.

### System Requirements
- OS: Linux (x86_64 or ARM64)
- Hardware: 1 vCPU, 1 GB RAM minimum (2 vCPU, 4 GB RAM recommended)
- Software: Docker Engine 24.0+ and Docker Compose v2+ installed
- DNS: Wildcard or subdomain A record pointing to your server IP (e.g. \`*.dhost.example.com\`)

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/CodesbyFebin/decentralized.host.git
cd decentralized.host
\`\`\`

### 2. Configure Environment Variables
Copy the template configuration:
\`\`\`bash
cp .env.example .env
\`\`\`
Edit \`.env\` and set your primary domain, secret API key, and ACME Let’s Encrypt email:
\`\`\`env
DOMAIN=dhost.example.com
API_SECRET_KEY=change_this_to_a_secure_random_string
LETSENCRYPT_EMAIL=admin@example.com
\`\`\`

### 3. Launch the Cluster
Run Docker Compose in detached mode:
\`\`\`bash
docker compose -f docker-compose.prod.yml up -d
\`\`\`

This launches:
1. **Traefik Edge Proxy** (ports 80, 443 with automated SSL)
2. **FastAPI Control Plane** (port 8000)
3. **Git SSH Server** (port 2222)
4. **Local Node Agent** (connected to local Docker engine)
5. **PostgreSQL Database** (persisting state and deployment metadata)`,
    codeBlocks: [
      {
        label: 'Docker Compose Start',
        language: 'bash',
        code: `git clone https://github.com/CodesbyFebin/decentralized.host.git
cd decentralized.host
cp .env.example .env
docker compose -f docker-compose.prod.yml up -d`
      }
    ]
  },
  {
    id: 'doc-node-agent',
    title: 'Connecting Independent Node Agents',
    slug: 'node-agent-setup',
    category: 'node-agent',
    description: 'Add external VPS or bare-metal servers to your compute mesh to distribute workloads across multiple machines.',
    content: `Decentralized.Host allows you to connect any number of secondary compute nodes across disparate cloud providers (Hetzner, OVH, DigitalOcean, AWS, or home lab servers) to form a unified compute mesh.

### How Worker Nodes Work
The Node Agent is a lightweight daemon that connects outbound to your Control Plane API. It does not require any inbound public ports open, as it registers itself and polls for assignments over encrypted HTTP/WebSocket.

### Launching an Agent on a Worker Machine
On your remote worker server with Docker installed, run:

\`\`\`bash
docker run -d \\
  --name dhost-node-agent \\
  --restart always \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -e CONTROL_PLANE_URL=https://api.dhost.example.com \\
  -e NODE_SECRET_KEY=your_shared_cluster_secret \\
  -e NODE_NAME=hetzner-fsn1-worker01 \\
  -e NODE_REGION=eu-central \\
  codesbyfebin/dhost-node-agent:latest
\`\`\`

### Verifying Connection
On your admin machine, run:
\`\`\`bash
dhost nodes list
\`\`\`
You will immediately see \`hetzner-fsn1-worker01\` report healthy with live CPU, RAM, and Disk capacity. New deployments will automatically be scheduled onto this node when appropriate.`,
    codeBlocks: [
      {
        label: 'Worker Node Docker Command',
        language: 'bash',
        code: `docker run -d \\
  --name dhost-node-agent \\
  --restart always \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -e CONTROL_PLANE_URL=https://api.dhost.example.com \\
  -e NODE_SECRET_KEY=your_shared_cluster_secret \\
  codesbyfebin/dhost-node-agent:latest`
      }
    ]
  },
  {
    id: 'doc-rest-api',
    title: 'REST API & OpenAPI Specification',
    slug: 'rest-api',
    category: 'rest-api',
    description: 'Programmatic interface for integrating Decentralized.Host into CI/CD pipelines, GitHub Actions, and custom dashboards.',
    content: `The Decentralized.Host control plane provides a complete, modern REST API built with FastAPI, compliant with OpenAPI 3.1.

### Base URL
\`https://<your-control-plane-domain>/api/v1\`

### Authentication
All requests must include the API key in the HTTP header:
\`Authorization: Bearer <YOUR_API_KEY>\`

### Core Endpoints
- \`POST /deployments\`: Create a new deployment from an uploaded archive or git payload.
- \`GET /deployments\`: List all deployments with filtering by app name and status.
- \`GET /deployments/{id}\`: Get real-time status, assigned node, and container ID.
- \`GET /deployments/{id}/logs\`: Retrieve stdout/stderr build and execution logs.
- \`DELETE /deployments/{id}\`: Stop and remove an active deployment.
- \`GET /nodes\`: List all registered nodes and their live capacity telemetry.
- \`POST /nodes/heartbeat\`: Node agent telemetry ingest endpoint.
- \`GET /auth/keys\`: Manage developer SSH keys for Git deployment.
- \`GET /blockchain/balance\`: (Experimental) Query Solana SPL token compute credit balance.`,
    codeBlocks: [
      {
        label: 'cURL API Example',
        language: 'bash',
        code: `# List active deployments via curl
curl -X GET "https://api.dhost.example.com/api/v1/deployments" \\
  -H "Authorization: Bearer dhost_sec_89f3a1..." \\
  -H "Content-Type: application/json"`
      }
    ]
  }
];
