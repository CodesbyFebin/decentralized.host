export interface ArchitectureComponent {
  id: string;
  name: string;
  slug?: string;
  role: string;
  techStack: string;
  repoPath: string;
  responsibilities: string[];
  interfaces: string[];
  claimStatus: 'IMPLEMENTED' | 'EXPERIMENTAL' | 'PLANNED';
}

export const ARCHITECTURE_COMPONENTS: ArchitectureComponent[] = [
  {
    id: 'comp-control-plane',
    name: 'Control Plane Coordinator',
    role: 'Central state orchestration, authentication, REST API, and workload scheduling',
    techStack: 'Python 3.11, FastAPI, SQLAlchemy, Pydantic, SQLite / PostgreSQL',
    repoPath: 'control-plane/app/',
    responsibilities: [
      'Authenticates CLI requests via Bearer API Tokens',
      'Receives and parses deployment archives (zip/tar.gz)',
      'Executes framework auto-detection heuristics (detect.py)',
      'Maintains node agent heartbeat registry and health status',
      'Calculates node placement weights and schedules builds',
      'Stores immutable release history and version tags in SQL database'
    ],
    interfaces: [
      'REST API at `:8000/api/v1/` (deployments, nodes, auth, git-keys, blockchain)',
      'Internal Node Agent WebSocket / HTTP polling channels',
      'OpenAPI 3.1 Schema at `/openapi.json`'
    ],
    claimStatus: 'IMPLEMENTED'
  },
  {
    id: 'comp-node-agent',
    name: 'Distributed Node Agent',
    role: 'Worker daemon executing container runtimes on independent compute nodes',
    techStack: 'Python, Docker Engine API (`docker-py`), psutil, Linux cgroups',
    repoPath: 'node-agent/agent.py',
    responsibilities: [
      'Connects to local `/var/run/docker.sock` to manage containers',
      'Periodically queries local CPU, RAM, Disk, and Network IO telemetry via psutil',
      'Sends 15-second heartbeats to the control plane API',
      'Pulls or builds Docker images locally on the target node',
      'Applies CPU and memory limits (`mem_limit`, `nano_cpus`) to running containers',
      'Streams container stdout/stderr logs back to control plane on demand'
    ],
    interfaces: [
      'Docker Socket API (/var/run/docker.sock)',
      'HTTP outbound telemetry channel to Control Plane'
    ],
    claimStatus: 'IMPLEMENTED'
  },
  {
    id: 'comp-scheduler',
    name: 'Resource-Aware Scheduler',
    role: 'Optimal node selection based on real-time hardware telemetry and availability',
    techStack: 'Python scheduling algorithm',
    repoPath: 'control-plane/app/scheduler.py',
    responsibilities: [
      'Filters candidate nodes against minimum memory and CPU thresholds',
      'Eliminates nodes with heartbeat lag > 60 seconds',
      'Calculates composite node score: `Score = (Free_RAM_MB * 0.7) + (Free_CPU_Percent * 0.3)`',
      'Assigns deployment to the highest-scoring candidate node',
      'Supports single-node fallback if only local agent is registered'
    ],
    interfaces: [
      'Invoked internally by `/api/v1/deployments` during dispatch'
    ],
    claimStatus: 'IMPLEMENTED'
  },
  {
    id: 'comp-traefik-edge',
    name: 'Traefik Edge Routing & TLS',
    role: 'Ingress proxy, dynamic subdomain routing, and automated ACME SSL',
    techStack: 'Traefik v3 Proxy, Let’s Encrypt ACME provider, Docker provider',
    repoPath: 'docker-compose.yml & docker-compose.prod.yml',
    responsibilities: [
      'Inspects dynamic Docker container labels without restarting proxy process',
      'Binds port 80 and 443 on public host interface',
      'Issues and renews wildcard / subdomain TLS certificates via Let’s Encrypt',
      'Enforces HTTPS redirection and security headers (HSTS, CSP)',
      'Routes traffic directly to container internal network ports'
    ],
    interfaces: [
      'Public HTTP (80) & HTTPS (443)',
      'Docker Socket label listener'
    ],
    claimStatus: 'IMPLEMENTED'
  },
  {
    id: 'comp-git-server',
    name: 'Git SSH Server & Post-Receive Hook',
    role: 'SSH authentication and Git push triggered deployment receiver',
    techStack: 'Alpine Linux, OpenSSH Server, Bash script hooks, Git core',
    repoPath: 'git-server/entrypoint.sh & git-server/post-receive.template',
    responsibilities: [
      'Binds custom SSH port (e.g., 2222) for git operations',
      'Restricts incoming SSH sessions to `git-receive-pack` via opengit-shell.sh',
      'Verifies developer SSH public keys against authorized_keys pool',
      'Extracts pushed git tree and creates clean tar.gz build snapshot',
      'Issues internal HTTP POST to control plane to trigger build'
    ],
    interfaces: [
      'SSH port 2222 (`ssh://git@host:2222/app.git`)',
      'Local loopback API call to Control Plane'
    ],
    claimStatus: 'IMPLEMENTED'
  },
  {
    id: 'comp-cli-tool',
    name: 'dhost Developer CLI',
    slug: 'cli',
    techStack: 'Python, Click / Typer, Requests, Rich Terminal UI',
    repoPath: 'cli/dhost/main.py',
    role: 'Local developer terminal interface for shipping apps, viewing logs, and managing nodes',
    responsibilities: [
      'Discovers local project framework and generates a Dockerfile server-side (none committed to your repo)',
      'Gzips working directory (respecting `.dhostignore`)',
      'Uploads build payload directly to Control Plane API with streaming progress',
      'Polls and prints colored deployment logs and final live URL',
      'Provides management subcommands (`dhost nodes`, `dhost rollback`, `dhost logs`)'
    ],
    interfaces: [
      'Terminal CLI (`dhost ship`, `dhost init`, `dhost status`, `dhost logs`)',
      'HTTP REST requests to Control Plane'
    ],
    claimStatus: 'IMPLEMENTED'
  }
];

export const DEPLOYMENT_LIFECYCLE_STEPS = [
  {
    stepNumber: 1,
    title: 'Code Ingestion',
    source: 'Developer Machine',
    action: 'Developer runs `dhost ship` or executes `git push dhost main`. Local files are packaged into a compressed archive excluding .git and node_modules.',
    component: 'dhost CLI / Git SSH Server'
  },
  {
    stepNumber: 2,
    title: 'Payload Analysis & Verification',
    source: 'Control Plane API',
    action: 'API authenticates API key / SSH signature, runs `detect.py` to identify framework type, and allocates an immutable deployment record in database.',
    component: 'FastAPI Control Plane'
  },
  {
    stepNumber: 3,
    title: 'Smart Scheduling',
    source: 'Scheduler Engine',
    action: 'Scheduler inspects live telemetry from all registered node agents. Filters out unhealthy nodes and picks the node with optimal free memory & CPU.',
    component: 'Scheduler'
  },
  {
    stepNumber: 4,
    title: 'Remote Container Build & Execution',
    source: 'Target Node Agent',
    action: 'Selected Node Agent downloads the payload archive, invokes Docker Engine to build the container image, assigns resource limits, and starts container.',
    component: 'Node Agent (Docker Engine)'
  },
  {
    stepNumber: 5,
    title: 'Dynamic Ingress & TLS Attachment',
    source: 'Traefik Proxy',
    action: 'Traefik discovers the new container via Docker labels, registers HTTP/HTTPS routes, provisions Let’s Encrypt SSL, and opens traffic.',
    component: 'Traefik Edge Proxy'
  },
  {
    stepNumber: 6,
    title: 'Health Check & Terminal Feedback',
    source: 'Control Plane & CLI',
    action: 'Node agent verifies container HTTP status code. Deployment status switches to ACTIVE and CLI outputs live application URL.',
    component: 'Developer Terminal'
  }
];
