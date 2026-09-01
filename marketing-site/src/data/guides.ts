import { GuideItem } from '../types';

export const GUIDES_DATA: GuideItem[] = [
  {
    id: 'guide-git-push',
    title: 'Deploy via Git Push over SSH (Zero CLI Setup on Client)',
    slug: 'deploy-with-git',
    difficulty: 'Beginner',
    timeMinutes: 5,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'Git installed on developer workstation',
      'SSH key generated (`~/.ssh/id_ed25519.pub`)',
      'Target Decentralized.Host Git SSH server endpoint'
    ],
    architectureOverview: 'Client Git pushes commit tree directly to the customized Git SSH container on port 2222. An internal post-receive hook archives the tree and calls the control plane scheduler.',
    steps: [
      {
        title: 'Step 1: Register your SSH Public Key',
        description: 'Upload your developer SSH public key to the Decentralized.Host control plane so the Git server recognizes your signature.',
        command: 'dhost keys add ~/.ssh/id_ed25519.pub --name "laptop-macbook"'
      },
      {
        title: 'Step 2: Add the Git Remote to your Repository',
        description: 'Configure your existing local git repository with the Decentralized.Host remote URL.',
        command: 'git remote add dhost ssh://git@dhost.example.com:2222/my-service.git'
      },
      {
        title: 'Step 3: Push to Deploy',
        description: 'Push your main or master branch. The terminal will display streaming remote build output directly from the post-receive hook.',
        command: 'git push dhost main',
        output: `Counting objects: 14, done.
Compressing objects: 100% (12/12), done.
Writing objects: 100% (14/14), 4.21 KiB, done.
remote: ===> Decentralized.Host Git Hook Activated
remote: ===> Archiving commit 8f31b0a...
remote: ===> Dispatching to scheduler... Assigned to node-fsn-01
remote: ===> Step 1/5: Building Docker container...
remote: ===> Step 5/5: Container active. Traefik route ready.
remote: ===> Live URL: https://my-service.dhost.example.com
To ssh://git@dhost.example.com:2222/my-service.git
 * [new branch]      main -> main`
      }
    ],
    troubleshooting: [
      {
        issue: 'Permission denied (publickey)',
        resolution: 'Ensure you ran `dhost keys add` with the exact public key matching your active SSH agent (`ssh-add -l`).'
      },
      {
        issue: 'Port 2222 connection refused',
        resolution: 'Check your server firewall (UFW/Security Groups) to verify port 2222 is open for inbound TCP.'
      }
    ],
    securityConsiderations: [
      'The Git SSH server uses `opengit-shell.sh` to prevent arbitrary interactive shell execution.',
      'Only repository push actions are allowed; interactive shell access is strictly forbidden.'
    ]
  },
  {
    id: 'guide-multi-node',
    title: 'Operating a Multi-Server Heterogeneous Compute Mesh',
    slug: 'multi-node-app-deployment',
    difficulty: 'Intermediate',
    timeMinutes: 10,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'One Primary VPS running Control Plane + Traefik',
      'One or more Worker VPS instances with Docker installed',
      'Shared Cluster Secret Key'
    ],
    architectureOverview: 'Workloads are scheduled across worker nodes by telemetry score. Traefik coordinates ingress traffic to the correct container host.',
    steps: [
      {
        title: 'Step 1: Obtain Cluster Secret from Primary Node',
        description: 'Inspect your `.env` on the control plane host to copy `API_SECRET_KEY` and `CONTROL_PLANE_URL`.',
        command: 'cat /etc/dhost/.env | grep API_SECRET_KEY'
      },
      {
        title: 'Step 2: Start Node Agent on Worker VPS',
        description: 'Launch the background agent daemon on your second server (e.g. Hetzner, Vultr, or home lab server).',
        command: `docker run -d --name dhost-agent \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -e CONTROL_PLANE_URL=https://api.dhost.example.com \\
  -e NODE_SECRET_KEY=my_secure_cluster_key \\
  -e NODE_NAME=worker-vps-helsinki \\
  codesbyfebin/dhost-node-agent:latest`
      },
      {
        title: 'Step 3: Verify Mesh Telemetry',
        description: 'Confirm the second node is actively reporting heartbeats and capacity to the scheduler.',
        command: 'dhost nodes list',
        output: `NODE ID               NAME                 STATUS   CPU FREE   RAM FREE   CONTAINERS
node-01 (master)      control-node-fsn     ONLINE   84%        3.1 GB     4
node-02 (worker)      worker-vps-helsinki  ONLINE   95%        7.4 GB     0`
      }
    ],
    troubleshooting: [
      {
        issue: 'Worker node remains in OFFLINE state',
        resolution: 'Ensure the worker node can establish outbound HTTPS requests to the Control Plane URL and verify the `NODE_SECRET_KEY` matches.'
      }
    ],
    securityConsiderations: [
      'Worker node agents do not need inbound firewall ports opened.',
      'All agent-to-coordinator communication occurs over outbound HTTPS TLS.'
    ]
  },
  {
    id: 'guide-rollback',
    title: 'Zero-Downtime Deployment Rollback Management',
    slug: 'deployment-rollbacks',
    difficulty: 'Beginner',
    timeMinutes: 3,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'Application with at least two deployments logged in Decentralized.Host'
    ],
    architectureOverview: 'Rollbacks repoint Traefik proxy labels and reactivate previous tagged container images without rebuilding from source.',
    steps: [
      {
        title: 'Step 1: Inspect Deployment History',
        description: 'List historical releases with their associated commit hashes, tags, and timestamps.',
        command: 'dhost history api-backend',
        output: `VERSION   STATUS     COMMIT     IMAGE TAG           DEPLOYED AT
v3        ACTIVE     3f9a12c    api-backend:v3      2025-08-30 14:20:00 (Error 500 spike)
v2        SUPERSEDED 8b7d91e    api-backend:v2      2025-08-30 11:05:00 (Healthy)
v1        SUPERSEDED 1a2c3d4    api-backend:v1      2025-08-29 09:12:00`
      },
      {
        title: 'Step 2: Execute Instant Rollback',
        description: 'Instruct the control plane to restore traffic to version v2.',
        command: 'dhost rollback api-backend --version v2',
        output: `[+] Reverting api-backend to release v2 (commit 8b7d91e)...
[+] Reactivating container api-backend:v2 on node-01...
[+] Updating Traefik dynamic router rule...
[+] Health check passed. Traffic routed to v2.
[✓] Rollback completed in 820ms.`
      }
    ],
    troubleshooting: [
      {
        issue: 'Image tag not found on worker node',
        resolution: 'If the target node was purged, the control plane will automatically rebuild the container from the stored git snapshot.'
      }
    ],
    securityConsiderations: [
      'Rollback operations are logged in the audit trail with the invoking user API key ID.'
    ]
  }
];
