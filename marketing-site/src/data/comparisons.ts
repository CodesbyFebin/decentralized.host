import { CompetitorComparison } from '../types';

export const COMPARISONS_DATA: CompetitorComparison[] = [
  {
    id: 'comp-coolify',
    name: 'Coolify',
    slug: 'coolify',
    officialUrl: 'https://coolify.io',
    license: 'AGPLv3 / Apache 2.0 dual',
    deploymentModel: 'Self-hosted single/multi-server coordinator',
    runtime: 'Docker Engine on host',
    multiServerSupport: 'Supported via SSH tunnel agent to remote servers',
    gitDeployment: 'GitHub App / Webhooks / Git push via proxy',
    cliTool: 'Community / API wrappers',
    dashboard: 'Rich Laravel/PHP web dashboard with extensive UI',
    dockerSupport: 'Native Docker Compose & Dockerfile',
    composeSupport: 'Extensive multi-service compose stacks',
    automaticTls: 'Traefik / Caddy automatic Let’s Encrypt',
    databaseTemplates: 'One-click PostgreSQL, MySQL, Redis, MongoDB',
    rollbackSupport: 'Yes, versioned container tags and history',
    observability: 'Integrated Docker container logs & metrics',
    decentralizedOrMesh: 'Centralized master orchestrator controlling worker nodes via SSH keys',
    lastVerifiedAt: '2025-08-25',
    evidenceSource: 'https://coolify.io/docs, Coolify GitHub repo (v4.0)',
    summaryComparison: 'Coolify is an excellent feature-rich self-hosted UI with deep catalog templates. Decentralized.Host differs by emphasizing a dedicated lightweight decoupled Python node agent daemon, native CLI-first developer workflows (`dhost ship`), decentralized compute topology, and optional verifiable compute ledgers.'
  },
  {
    id: 'comp-dokploy',
    name: 'Dokploy',
    slug: 'dokploy',
    officialUrl: 'https://dokploy.com',
    license: 'Apache 2.0',
    deploymentModel: 'Self-hosted single server (multi-server in Docker Swarm mode)',
    runtime: 'Docker & Docker Swarm',
    multiServerSupport: 'Supported via Docker Swarm clustering',
    gitDeployment: 'GitHub / GitLab / Bitbucket webhooks',
    cliTool: 'CLI utility for setup and management',
    dashboard: 'Modern Next.js / TypeScript Web UI',
    dockerSupport: 'Full Dockerfile & Compose support',
    composeSupport: 'Native Compose deployments',
    automaticTls: 'Traefik automated SSL certificates',
    databaseTemplates: 'One-click databases & services',
    rollbackSupport: 'Yes, container recreation from past builds',
    observability: 'Realtime container stats & log viewer',
    decentralizedOrMesh: 'Swarm-based master/worker clustering without independent compute receipts',
    lastVerifiedAt: '2025-08-20',
    evidenceSource: 'https://dokploy.com/docs, Dokploy GitHub repo',
    summaryComparison: 'Dokploy delivers a polished Next.js dashboard and Docker Swarm clustering. Decentralized.Host focuses on multi-node scheduling across disparate VPS networks without requiring full Swarm cluster overlay networks, featuring native Git SSH hooks and CLI auto-detection.'
  },
  {
    id: 'comp-caprover',
    name: 'CapRover',
    slug: 'caprover',
    officialUrl: 'https://caprover.com',
    license: 'Apache 2.0',
    deploymentModel: 'Self-hosted single/multi-node cluster (Docker Swarm)',
    runtime: 'Docker Engine',
    multiServerSupport: 'Yes, leader and worker nodes in Docker Swarm',
    gitDeployment: 'Captain definition files & git webhooks',
    cliTool: 'Official Node.js CLI (`caprover deploy`)',
    dashboard: 'React web interface',
    dockerSupport: 'CaptainDefinition JSON or Dockerfile',
    composeSupport: 'Docker Swarm compose files',
    automaticTls: 'Nginx reverse proxy with Certbot Let’s Encrypt',
    databaseTemplates: 'One-click one-app templates',
    rollbackSupport: 'Manual version revert in web UI',
    observability: 'Docker container log viewer and NetData integration',
    decentralizedOrMesh: 'Swarm coordinator architecture',
    lastVerifiedAt: '2025-08-15',
    evidenceSource: 'https://caprover.com/docs, CapRover GitHub repository',
    summaryComparison: 'CapRover is a mature Node.js based PaaS running over Nginx and Docker Swarm. Decentralized.Host modernizes this with modern Traefik v3 edge routing, lightweight FastAPI control planes, and decentralized compute node metrics.'
  },
  {
    id: 'comp-dokku',
    name: 'Dokku',
    slug: 'dokku',
    officialUrl: 'https://dokku.com',
    license: 'MIT License',
    deploymentModel: 'Single server self-hosted mini-Heroku',
    runtime: 'Docker via bash plugins',
    multiServerSupport: 'Experimental via Nomad/Kubernetes scheduler plugins (primarily single-server)',
    gitDeployment: 'Native `git push dokku main` over SSH',
    cliTool: 'Server-side bash CLI and client plugins',
    dashboard: 'CLI-centric (third-party web UIs available)',
    dockerSupport: 'Heroku buildpacks or Dockerfile',
    composeSupport: 'Docker compose plugin available',
    automaticTls: 'Let’s Encrypt plugin for Nginx',
    databaseTemplates: 'Plugin-based datastores (PostgreSQL, Redis)',
    rollbackSupport: 'Built-in `dokku tags` and `dokku deploy` versioning',
    observability: '`dokku logs -t` streaming',
    decentralizedOrMesh: 'Single-host focused; does not distribute across an independent node mesh',
    lastVerifiedAt: '2025-08-10',
    evidenceSource: 'https://dokku.com/docs, Dokku GitHub repository',
    summaryComparison: 'Dokku popularized the `git push` workflow on single Linux VPS servers. Decentralized.Host brings that same intuitive Git push workflow to a distributed multi-node architecture where builds are scheduled across multiple independent server instances.'
  },
  {
    id: 'comp-heroku',
    name: 'Heroku',
    slug: 'heroku',
    officialUrl: 'https://heroku.com',
    license: 'Proprietary Cloud Service',
    deploymentModel: 'Managed Multi-tenant Cloud (AWS)',
    runtime: 'Dyno container sandboxes (Cgroups/LXC)',
    multiServerSupport: 'Managed automatically by Heroku platform',
    gitDeployment: 'Pioneer of `git push heroku main`',
    cliTool: 'Comprehensive Heroku Toolbelt CLI',
    dashboard: 'Enterprise web console',
    dockerSupport: 'Container registry push & Procfile',
    composeSupport: 'Review apps via app.json',
    automaticTls: 'Automated certificate management (ACM)',
    databaseTemplates: 'Managed Heroku Postgres / Redis add-ons',
    rollbackSupport: 'Instant release rollback (`heroku rollback`)',
    observability: 'Heroku logplex and metrics dashboard',
    decentralizedOrMesh: 'Centralized proprietary multi-tenant cloud with high recurring markup',
    lastVerifiedAt: '2025-08-01',
    evidenceSource: 'https://devcenter.heroku.com',
    summaryComparison: 'Heroku pioneered frictionless cloud deployments but locks developers into expensive, proprietary tiers. Decentralized.Host delivers the identical Git push and instant rollback experience on your own private infrastructure or independent compute nodes at fraction of the cost.'
  },
  {
    id: 'comp-vercel',
    name: 'Vercel',
    slug: 'vercel',
    officialUrl: 'https://vercel.com',
    license: 'Proprietary Cloud Platform',
    deploymentModel: 'Managed Global Serverless & Edge Network',
    runtime: 'Serverless Functions (AWS Lambda) & Edge Workers',
    multiServerSupport: 'Global anycast edge routing managed by Vercel',
    gitDeployment: 'Automatic Git branch preview deployments via GitHub/GitLab',
    cliTool: 'Modern `vercel` CLI',
    dashboard: 'Industry-standard analytics and preview console',
    dockerSupport: 'Limited (optimized for frontend frameworks and serverless)',
    composeSupport: 'Not supported (micro-service containers require third-party backend)',
    automaticTls: 'Instant edge wildcard SSL',
    databaseTemplates: 'Vercel Postgres/KV integrations',
    rollbackSupport: 'Instant domain alias switching across immutable deployments',
    observability: 'Real-time edge logs and Web Vitals analytics',
    decentralizedOrMesh: 'Proprietary serverless network with compute duration and vendor boundaries',
    lastVerifiedAt: '2025-08-05',
    evidenceSource: 'https://vercel.com/docs',
    summaryComparison: 'Vercel is the premier frontend cloud platform for Next.js. Decentralized.Host gives developers self-hosted sovereignty to run stateful long-running background workers, WebSockets, Python APIs, and full Docker workloads that exceed serverless constraints.'
  },
  {
    id: 'comp-aws',
    name: 'AWS (EC2 / ECS / Elastic Beanstalk)',
    slug: 'aws',
    officialUrl: 'https://aws.amazon.com',
    license: 'Proprietary Cloud Service',
    deploymentModel: 'Managed multi-tenant cloud; you assemble EC2/ECS/ALB/Route53 yourself, or use Elastic Beanstalk\'s opinionated wrapper around them',
    runtime: 'EC2 VMs, ECS/Fargate containers, or Elastic Beanstalk-managed instances',
    multiServerSupport: 'Yes, via ECS clusters, Auto Scaling Groups, or multi-AZ Elastic Beanstalk environments -- powerful, but real infrastructure-as-code work to configure',
    gitDeployment: 'Not native -- typically wired up via CodePipeline/CodeDeploy or a third-party CI, not a plain `git push`',
    cliTool: 'AWS CLI / SAM CLI / EB CLI -- broad and powerful, but AWS-specific and with a real learning curve',
    dashboard: 'AWS Console -- comprehensive but famously dense, spanning dozens of separate services',
    dockerSupport: 'Yes, via ECR + ECS/Fargate',
    composeSupport: 'Not native (ECS uses its own task-definition JSON format, not docker-compose.yml directly)',
    automaticTls: 'ACM (Certificate Manager) issues certs, but wiring them to an ALB/CloudFront is manual setup, not automatic per-deploy',
    databaseTemplates: 'RDS/DynamoDB -- managed, mature, and billed separately per instance-hour',
    rollbackSupport: 'Yes, via ECS task-definition revisions or Elastic Beanstalk application versions -- both require deliberate configuration',
    observability: 'CloudWatch Logs/Metrics -- powerful, but a separate billed service you configure explicitly',
    decentralizedOrMesh: 'Fully centralized, single-vendor cloud -- the opposite of a self-hosted node mesh',
    lastVerifiedAt: '2026-08-30',
    evidenceSource: 'https://docs.aws.amazon.com/AmazonECS/, https://docs.aws.amazon.com/elasticbeanstalk/',
    summaryComparison: 'AWS is the deepest, most capable cloud platform that exists, but that depth is also the cost: real infrastructure-as-code, IAM policies, and per-service billing to assemble something as simple as "git push, get a URL." Decentralized.Host does not compete with AWS\'s breadth (no managed databases, no global CDN, no serverless functions) -- it competes with the specific job of running your own containers on your own or rented VPS/bare-metal hardware without needing to learn ECS task definitions or pay per-service markup. Nothing here is a drop-in AWS replacement for teams that need RDS, Lambda, or S3 specifically; it is a much simpler alternative for teams that just need to run Docker containers with Git-push deploys and automatic TLS.'
  },
  {
    id: 'comp-upcloud',
    name: 'UpCloud',
    slug: 'upcloud',
    officialUrl: 'https://upcloud.com',
    license: 'Proprietary Cloud Service',
    deploymentModel: 'Managed European IaaS cloud -- you provision Cloud Servers/Kubernetes/databases yourself; there is no app-level "push and deploy" product',
    runtime: 'KVM-based Cloud Server VMs, or Managed Kubernetes for containers',
    multiServerSupport: 'Yes, via Managed Kubernetes clusters or manually-networked Cloud Servers -- infrastructure you assemble, not a built-in app scheduler',
    gitDeployment: 'Not offered -- upctl and the API manage infrastructure (servers, storage, networking), not application source or git pushes',
    cliTool: '`upctl` -- a real, official CLI, but for provisioning/managing cloud resources, not for shipping an app\'s code',
    dashboard: 'Web control panel for infrastructure management (servers, storage, networking, billing)',
    dockerSupport: 'Only indirectly, via Managed Kubernetes or by installing Docker yourself on a Cloud Server -- no built-in Dockerfile build/deploy pipeline',
    composeSupport: 'Not native (Kubernetes manifests for their Managed Kubernetes product, not docker-compose.yml)',
    automaticTls: 'Not automatic for arbitrary apps -- TLS is your responsibility to configure on whatever you run on their servers/load balancer',
    databaseTemplates: 'Managed Databases (PostgreSQL, MySQL, Redis, Valkey, OpenSearch) -- real managed offerings, billed as separate resources',
    rollbackSupport: 'Not applicable at the app level -- no deployment/release concept exists in the product; you would build that yourself',
    observability: 'Infrastructure-level metrics (server/network/storage) in the control panel; no application-level log aggregation product',
    decentralizedOrMesh: 'Centralized, single-vendor commercial cloud (Finland-headquartered, 15 data centers) -- the opposite of a self-hosted node mesh',
    lastVerifiedAt: '2026-09-02',
    evidenceSource: 'https://upcloud.com/products, https://upcloud.com/docs/tooling/cli/',
    summaryComparison: 'UpCloud is a real European cloud IaaS provider -- Cloud Servers, GPU Servers, Managed Kubernetes, Managed Databases, load balancing and networking, backed by a genuine 99.999% uptime SLA across 15 data centers. It is not a competitor on deployment workflow: there is no git-push, no CLI-driven app ship, no automatic per-app TLS, because UpCloud sells the infrastructure layer, not a PaaS on top of it. The honest comparison is the same shape as AWS above: you could run Decentralized.Host\'s own mesh (control plane, node agent, Traefik) on UpCloud Cloud Servers exactly like any other VPS in DEPLOY.md\'s guide -- the two are complementary, not substitutes.'
  }
];

export const FEATURE_COMPARISON_MATRIX: import('../types').FeatureComparisonRow[] = [
  {
    featureName: 'Deployment Model',
    category: 'Core Architecture',
    description: 'Topology used to coordinate and execute application workloads across servers.',
    decentralizedHost: {
      status: 'Supported',
      detail: 'Decentralized Peer-to-Peer Node Mesh with decoupled Python worker daemons and dynamic scheduler',
      claimStatus: 'IMPLEMENTED'
    },
    coolify: {
      status: 'Supported',
      detail: 'Centralized Master server controlling remote servers via SSH connections and Docker socket'
    },
    dokploy: {
      status: 'Supported',
      detail: 'Single-server standalone or Docker Swarm master/worker cluster overlay'
    },
    lastVerifiedAt: '2026-08-25',
    evidenceSource: 'Repository source (this repo, main branch), Coolify GitHub repo (v4.0), Dokploy GitHub repo (v0.9)'
  },
  {
    featureName: 'Runtime Support',
    category: 'Execution Engine',
    description: 'Supported container engines, buildpacks, Dockerfile specs, and custom runtimes.',
    decentralizedHost: {
      status: 'Supported',
      detail: 'Universal OCI Dockerfile, Nixpacks/Cloud Native Buildpacks, Python/Node/Go/Rust auto-detect',
      claimStatus: 'IMPLEMENTED'
    },
    coolify: {
      status: 'Supported',
      detail: 'Dockerfile, Nixpacks, Heroku Buildpacks, and Docker Compose definitions'
    },
    dokploy: {
      status: 'Supported',
      detail: 'Dockerfile, Buildpacks, and Native Docker Compose multi-service stacks'
    },
    lastVerifiedAt: '2026-08-25',
    evidenceSource: 'Buildpack & Runtime Source Repositories'
  },
  {
    featureName: 'Multi-Server Capability',
    category: 'Clustering & Mesh',
    description: 'Capability to schedule workloads across heterogeneous VPS and bare-metal nodes.',
    decentralizedHost: {
      status: 'Supported',
      detail: 'Native distributed node mesh with autonomous lightweight agents (`dhost-agent`) and load-based placement',
      claimStatus: 'IMPLEMENTED'
    },
    coolify: {
      status: 'Supported',
      detail: 'Multi-server support through SSH tunneling from master server to remote workers'
    },
    dokploy: {
      status: 'Limited',
      detail: 'Multi-server requires configuring and maintaining Docker Swarm cluster nodes'
    },
    lastVerifiedAt: '2026-08-20',
    evidenceSource: 'Multi-Node Cluster Deployment Documentation'
  },
  {
    featureName: 'Git / CLI Integration',
    category: 'Developer Workflow',
    description: 'Automated Git push deployment workflows and native terminal CLI toolchains.',
    decentralizedHost: {
      status: 'Supported',
      detail: 'Native `dhost` CLI (`dhost ship`, `dhost nodes`, `dhost logs`) plus Git SSH post-receive hooks',
      claimStatus: 'IMPLEMENTED'
    },
    coolify: {
      status: 'Limited',
      detail: 'GitHub/GitLab App webhooks and web UI triggers (CLI is community-maintained/API wrappers)'
    },
    dokploy: {
      status: 'Supported',
      detail: 'Git webhooks integration and official setup CLI utility'
    },
    lastVerifiedAt: '2026-08-25',
    evidenceSource: 'CLI Tooling Specifications & Git Integration Documentation'
  },
  {
    featureName: 'TLS / SSL Management',
    category: 'Edge & Ingress',
    description: 'Automated SSL certificate provisioning, ACME Let’s Encrypt validation, and zero-downtime routing.',
    decentralizedHost: {
      status: 'Supported',
      detail: 'Dynamic Traefik v3 reverse proxy with automated ACME Let’s Encrypt TLS and multi-domain ingress',
      claimStatus: 'IMPLEMENTED'
    },
    coolify: {
      status: 'Supported',
      detail: 'Automated Let’s Encrypt via Traefik or Caddy reverse proxy integration'
    },
    dokploy: {
      status: 'Supported',
      detail: 'Automated Let’s Encrypt SSL issuance via Traefik reverse proxy'
    },
    lastVerifiedAt: '2026-08-22',
    evidenceSource: 'Ingress & TLS Verification Protocols'
  },
  {
    featureName: 'Rollback Functionality',
    category: 'Operational Reliability',
    description: 'Instant zero-downtime atomic rollback to previous container image versions.',
    decentralizedHost: {
      status: 'Supported',
      detail: 'Atomic OCI container hash rollback with instant Traefik label repointing (`dhost rollback <id>`)',
      claimStatus: 'IMPLEMENTED'
    },
    coolify: {
      status: 'Supported',
      detail: 'Versioned deployment history and rollback trigger via web console'
    },
    dokploy: {
      status: 'Supported',
      detail: 'Re-deploy previous commit/build tag from deployment history'
    },
    lastVerifiedAt: '2026-08-20',
    evidenceSource: 'Rollback Implementation & Container Tag History Records'
  },
  {
    featureName: 'Mesh Resource Placement',
    category: 'Advanced Scheduling',
    description: 'Autonomous scheduling based on real-time node telemetry (RAM, CPU load, latency).',
    decentralizedHost: {
      status: 'Supported',
      detail: 'Built-in scheduler algorithm evaluating live RAM headroom, CPU utilization, and geographical latency',
      claimStatus: 'IMPLEMENTED'
    },
    coolify: {
      status: 'Limited',
      detail: 'Manual server selection per application; lacks automated dynamic telemetry placement'
    },
    dokploy: {
      status: 'Limited',
      detail: 'Docker Swarm standard round-robin or manual node constraint placement'
    },
    lastVerifiedAt: '2026-08-25',
    evidenceSource: 'Placement Scheduler Algorithm / Source code: control-plane/app/scheduler.py'
  },
  {
    featureName: 'DePIN / Tokenized Compute',
    category: 'Decentralized Economy',
    description: 'Node-operator incentives for contributing compute capacity to the mesh.',
    decentralizedHost: {
      status: 'Supported',
      detail: 'Solana devnet SPL token credits minted per healthy heartbeat interval (off by default). Devnet only, no real monetary value -- see blockchain/README.md.',
      claimStatus: 'IMPLEMENTED'
    },
    coolify: {
      status: 'Not Supported',
      detail: 'Strictly traditional self-hosted infrastructure without tokenized/decentralized compute models'
    },
    dokploy: {
      status: 'Not Supported',
      detail: 'Standard self-hosted architecture without cryptographic compute verification'
    },
    lastVerifiedAt: '2026-09-01',
    evidenceSource: 'blockchain/README.md, blockchain/creditor.py'
  },
  {
    featureName: 'License & Sovereignty',
    category: 'Open Source Governance',
    description: 'Permissive open source licensing with zero commercial gating or telemetry traps.',
    decentralizedHost: {
      status: 'Supported',
      detail: '100% Permissive MIT Open Source License across CLI, node-agent, and control plane',
      claimStatus: 'IMPLEMENTED'
    },
    coolify: {
      status: 'Limited',
      detail: 'Dual-license AGPLv3 / Fair Source; commercial cloud hosting features differentiated'
    },
    dokploy: {
      status: 'Supported',
      detail: 'Apache 2.0 Open Source License'
    },
    lastVerifiedAt: '2026-08-25',
    evidenceSource: 'LICENSE files in official GitHub repositories'
  }
];

