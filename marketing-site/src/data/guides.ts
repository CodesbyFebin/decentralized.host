import { GuideItem } from '../types';

export const GUIDES_DATA: GuideItem[] = [
  {
    id: 'guide-git-push',
    title: 'Deploy via Git Push over SSH (No Local Docker or dhost CLI Needed)',
    slug: 'deploy-with-git',
    difficulty: 'Beginner',
    timeMinutes: 5,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'Git installed on your workstation',
      'An SSH key pair (e.g. `~/.ssh/id_ed25519.pub`)',
      'Access to a running mesh -- local: `docker compose up -d` from the repo; see the Self-Hosting guide for a real server'
    ],
    architectureOverview: 'The git-server container runs a hardened SSH daemon whose login shell only permits git-upload-pack/git-receive-pack (see git-server/opengit-shell.sh) -- no interactive shell access. Pushing to a repo name that does not exist yet auto-creates it. A post-receive hook archives the pushed tree with `git archive` (already .gitignore-clean) and POSTs it directly to the control plane\'s /deployments/push endpoint, which detects the stack, builds, and runs it -- the exact same pipeline `dhost ship` and the console\'s Launchpad use.',
    steps: [
      {
        title: 'Step 1: Register your SSH public key',
        description: 'Any registered key can push to any repo on this mesh -- there are no per-user accounts or per-repo permissions in this version, the same single-shared-secret trust model as the rest of the mesh.',
        command: 'dhost keys add "laptop-macbook" ~/.ssh/id_ed25519.pub'
      },
      {
        title: 'Step 2: Add the git remote',
        description: 'Repos live under /repos/<name>.git on the git-server container. For local dev the SSH port is published as 2222.',
        command: 'git remote add opengit ssh://git@localhost:2222/repos/my-service.git'
      },
      {
        title: 'Step 3: Push to deploy',
        description: 'Pushing deploys whichever branch you just pushed (single-branch-is-live, like a classic Heroku remote -- no multi-branch preview environments in this version). First push auto-creates the repo.',
        command: 'git push opengit main',
        output: `Enumerating objects: 14, done.
Writing objects: 100% (14/14), 4.21 KiB, done.
remote: opengit: created new repository 'my-service.git'
remote:
remote: ⟡ opengit: building 'my-service' from 8f31b0a (no CI config needed)...
remote: ✨ Live at http://my-service.127.0.0.1.nip.io
remote:
To ssh://localhost:2222/repos/my-service.git
 * [new branch]      main -> main`
      }
    ],
    troubleshooting: [
      {
        issue: 'Permission denied (publickey)',
        resolution: 'Confirm `dhost keys add` was run with the exact public key matching your active identity (`ssh-add -l`), and that the git-server container has synced it -- it polls the control plane for new keys every 30s, or restart the container to force an immediate sync.'
      },
      {
        issue: 'Port 2222 connection refused',
        resolution: 'Confirm the git-server container is running (`docker compose ps`) and, for a real remote server, that your firewall/security group allows inbound TCP on 2222.'
      },
      {
        issue: '"opengit: only \'git clone/fetch/push\' is allowed" on any other SSH command',
        resolution: 'Expected and correct -- the restricted login shell rejects everything except the three git service commands. There is no interactive shell access on this account by design.'
      }
    ],
    securityConsiderations: [
      'The git user\'s login shell (opengit-shell.sh) pattern-matches only git-upload-pack/git-receive-pack/git-upload-archive; anything else is rejected before it reaches a real shell.',
      'Repo names are passed through `basename()` before touching the filesystem, so path-traversal attempts (`../../etc/passwd`) cannot escape /repos/.',
      'No per-repo access control exists yet -- treat every registered key as fully trusted, same as the DEPLOY_API_KEY.'
    ]
  },
  {
    id: 'guide-multi-node',
    title: 'Adding a Second, Genuinely Remote Node',
    slug: 'multi-node-app-deployment',
    difficulty: 'Intermediate',
    timeMinutes: 10,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'A running control plane reachable from the new node (locally, or a real domain -- see Self-Hosting)',
      'A second machine with Docker installed',
      'The real NODE_JOIN_SECRET from the control plane\'s .env'
    ],
    architectureOverview: 'Each node reports its own reachable address (advertise_address) when it registers, and the control plane always talks to the specific node a deployment actually landed on -- not a single hardcoded address. This is what makes a genuinely separate machine work correctly: earlier versions of this project had one global node-agent URL, which would have silently misrouted builds/logs/teardown the moment a second real node joined.',
    steps: [
      {
        title: 'Step 1: Get the join secret',
        description: 'On the control plane host, read the real secret from .env (not a placeholder -- the join will fail otherwise).',
        command: 'grep NODE_JOIN_SECRET .env'
      },
      {
        title: 'Step 2: Build and run the node agent on the new machine',
        description: 'There is no published Docker Hub image -- clone the repo (or just copy node-agent/ and blockchain/) and build locally. ADVERTISE_ADDRESS must be reachable FROM the control plane, not from you.',
        command: `git clone https://github.com/CodesbyFebin/decentralized.host.git
cd decentralized.host
docker build -t dhost/node-agent -f node-agent/Dockerfile .
docker run -d --name dhost-node-agent \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -e CONTROL_PLANE_URL=https://api.your-domain.com \\
  -e NODE_JOIN_SECRET=<the real secret from step 1> \\
  -e NODE_NAME=worker-2 \\
  -e ADVERTISE_ADDRESS=<this machine's public IP>:8100 \\
  -p 8100:8100 \\
  dhost/node-agent`
      },
      {
        title: 'Step 3: Verify it joined',
        description: 'From any machine with the CLI installed and pointed at the same control plane.',
        command: 'dhost node list',
        output: `                    Mesh Nodes
┏━━━━━━━━━━━┓┏━━━━━━━━┓┏━━━━━━━━┓┏━━━━━━━━┓
┃ name       ┃┃ status  ┃┃ cpu    ┃┃ ram    ┃
┡━━━━━━━━━━━┩┡━━━━━━━━┩┡━━━━━━━━┩┡━━━━━━━━┩
│ local-node-1 ││ healthy ││ 2.1%   ││ 480MB  │
│ worker-2     ││ healthy ││ 0.8%   ││ 210MB  │
└───────────┘└────────┘└────────┘└────────┘`
      }
    ],
    troubleshooting: [
      {
        issue: 'Node registers but every build/log request to it fails',
        resolution: 'ADVERTISE_ADDRESS is almost certainly wrong or unreachable from the control plane specifically -- test with `curl http://<advertise-address>/health` from the control plane\'s machine, not from the new node itself.'
      },
      {
        issue: 'Node never appears at all',
        resolution: 'Check the node agent\'s own logs (`docker logs dhost-node-agent`) for the registration request -- a wrong NODE_JOIN_SECRET or an unreachable CONTROL_PLANE_URL both fail silently on the node side and just retry every 5s.'
      }
    ],
    securityConsiderations: [
      'NODE_JOIN_SECRET is a single shared secret for the whole mesh -- rotate it (and update every node) if you suspect it leaked, same caveat as DEPLOY_API_KEY.',
      'The node agent needs Docker socket access on its own machine to build/run containers -- that machine should be one you trust the same way you\'d trust any Docker host.'
    ]
  },
  {
    id: 'guide-rollback',
    title: 'Rolling Back a Deployment (Local Snapshot, Not a Server-Side Version Store)',
    slug: 'deployment-rollbacks',
    difficulty: 'Beginner',
    timeMinutes: 3,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'A project previously shipped at least twice with `dhost ship`/`dhost update` from this machine'
    ],
    architectureOverview: 'This is important to understand correctly: rollback is local-ledger-based, not a centralized "roll back app X to version Y from anywhere" API. Every `dhost ship`/`dhost update` snapshots the project into a SHA-256 content-addressed blob store under .dhost/ledger/ on whichever machine ran it (see cli/dhost/ledger.py) -- that is the real "no Git" replacement this project is built around. `dhost rollback` restores one of those local snapshots to a temp directory and reships it. The control plane separately keeps a read-only Release history (message, snapshot id, status, timestamp) per deployment, visible in the console\'s Git Manager tab or via GET /deployments/{name}/releases -- useful for seeing what happened, but it does not itself let you roll back; the actual snapshot files have to exist locally.',
    steps: [
      {
        title: 'Step 1: List local snapshots',
        description: 'Run from inside the project directory whose history you want -- this reads .dhost/ledger/ on this machine, not a server-side store.',
        command: 'dhost history',
        output: `                  Snapshot History (.dhost/ledger)
┏━━━━━━━━━━━━━┓┏━━━━━━━━━━━━━━━━━┓┏━━━━━━━━━━━━━━━━━━┓┏━━━━━┓
┃ id           ┃┃ message              ┃┃ when                ┃┃ files ┃
┡━━━━━━━━━━━━━┩┡━━━━━━━━━━━━━━━━━┩┡━━━━━━━━━━━━━━━━━━┩┡━━━━━┩
│ 34a1a03      ││ fixed the null check ││ 2025-08-30 14:20:00 ││ 3     │
│ 7c0d3c9      ││ ship                 ││ 2025-08-30 11:05:00 ││ 3     │
└─────────────┘└─────────────────┘└──────────────────┘└─────┘`
      },
      {
        title: 'Step 2: Restore and redeploy a snapshot',
        description: 'Takes a snapshot id (not a version number or app name) -- restores it to a temp build sandbox, rebuilds, and reships it.',
        command: 'dhost rollback 7c0d3c9',
        output: `⟡ Restored snapshot 7c0d3c9 (ship) to a build sandbox
⟡ Detected: Python (FastAPI)
⟡ Rebuilding and redeploying on the mesh...

✔ Rolled back to 7c0d3c9! http://my-service.127.0.0.1.nip.io`
      }
    ],
    troubleshooting: [
      {
        issue: '`dhost history` shows nothing',
        resolution: 'You\'re either not in the project directory, or this machine never ran `dhost ship`/`update` for it -- the ledger is local, it does not sync from the server. If you shipped from a different machine, its snapshots aren\'t here.'
      },
      {
        issue: 'I want to see what was deployed without having the local snapshot',
        resolution: 'Use the console\'s Git Manager tab (or `GET /deployments/{name}/releases`) for the read-only server-side history -- messages, timestamps, status -- even without local files. You just can\'t roll back from that alone.'
      }
    ],
    securityConsiderations: [
      'Snapshot content lives unencrypted under .dhost/ledger/ on whichever machine shipped it -- treat that directory with the same care as the source code itself.'
    ]
  },
  {
    id: 'guide-custom-domain',
    title: 'Binding a Custom Domain to a Deployment',
    slug: 'custom-domain',
    difficulty: 'Beginner',
    timeMinutes: 5,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'A domain you control and can add a DNS record for',
      'A running mesh with production TLS configured (see the Production Deployment guide) -- a custom bare domain needs real Let\'s Encrypt, not the local nip.io path'
    ],
    architectureOverview: 'The `--domain` flag on `dhost ship`/`dhost update` (and the equivalent `domain:` key in an .opengit.yml for git-push deploys) is stored on the deployment and passed straight through to the node agent\'s `write_traefik_config()`, which adds a second Traefik router for that exact host alongside the default `<name>.<BASE_DOMAIN>` one -- both stay live at once. In production mode (PUBLIC_SCHEME=https) that router gets its own Let\'s Encrypt HTTP-01 certificate the same way the default subdomain does.',
    steps: [
      {
        title: 'Step 1: Point DNS at your server',
        description: 'A plain A record to your control-plane host\'s public IP. No CNAME/ALIAS tricks needed since Traefik terminates on standard ports 80/443.',
        command: '# In your DNS provider: A record\n# app.yourdomain.com -> <your server\'s public IP>'
      },
      {
        title: 'Step 2: Ship with --domain',
        description: 'Works on first ship or any later update -- the domain binding updates in place.',
        command: 'dhost ship my-service --domain app.yourdomain.com',
        output: `⟡ Detected: Node.js (Express)
⟡ Building and deploying...
✔ Live at http://my-service.127.0.0.1.nip.io
✔ Custom domain bound: https://app.yourdomain.com`
      }
    ],
    troubleshooting: [
      {
        issue: 'Custom domain loads but shows a certificate warning',
        resolution: 'Let\'s Encrypt\'s HTTP-01 challenge needs port 80 reachable from the public internet at the moment the cert is first requested -- confirm your DNS record has actually propagated (`dig app.yourdomain.com`) and nothing upstream is blocking port 80.'
      },
      {
        issue: 'Works on the default <name>.<BASE_DOMAIN> URL but not the custom domain',
        resolution: 'Re-run `dhost ship` with `--domain` again -- the router is only created once the flag is passed on an actual ship/update, not retroactively for existing deployments.'
      }
    ],
    securityConsiderations: [
      'The custom domain shares the same deploy-key trust model as everything else -- anyone with the deploy key can rebind any deployment to any domain you control DNS for.'
    ]
  },
  {
    id: 'guide-production-tls',
    title: 'Going to Production: Real Domain, Real Let\'s Encrypt TLS',
    slug: 'production-deployment',
    difficulty: 'Intermediate',
    timeMinutes: 20,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'A real server (VPS or bare metal) with a public IP and ports 80/443 open',
      'A domain with an A record (or wildcard *.yourdomain.com) pointing at that server',
      'Docker + Compose installed on that server'
    ],
    architectureOverview: 'Local dev uses nip.io + plain HTTP -- fine for testing, not for the internet. Production uses a second compose file (docker-compose.prod.yml, layered on top of the base one) that sets PUBLIC_SCHEME=https and a real BASE_DOMAIN, which flips the node agent\'s `write_traefik_config()` over to requesting real Let\'s Encrypt certificates via Traefik\'s HTTP-01 challenge for every router it creates -- the control plane, the dashboard, and every app deployed after that, automatically, with no DNS-provider API key required. See DEPLOY.md in the repo for the complete checklist this guide summarizes.',
    steps: [
      {
        title: 'Step 1: Point DNS at the server',
        description: 'A wildcard record is the least friction, since every deployment gets its own subdomain.',
        command: '# A records:\n# yourdomain.com          -> <server IP>\n# *.yourdomain.com        -> <server IP>'
      },
      {
        title: 'Step 2: Set real secrets in .env',
        description: 'Rotate every default -- these ship with dev-friendly placeholders that are not safe on a public server.',
        command: `BASE_DOMAIN=yourdomain.com
PUBLIC_SCHEME=https
SECRET_KEY=<generate a real random secret>
NODE_JOIN_SECRET=<generate a real random secret>
DEPLOY_API_KEY=<generate a real random secret>
LETSENCRYPT_EMAIL=you@yourdomain.com`
      },
      {
        title: 'Step 3: Bring up the production stack',
        description: 'Layers docker-compose.prod.yml over the base compose file -- this is what actually switches Traefik to request real certificates instead of running on plain HTTP.',
        command: 'docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build'
      },
      {
        title: 'Step 4: Verify',
        description: 'Confirm the control plane itself is served over real HTTPS before shipping anything to it.',
        command: 'curl -I https://api.yourdomain.com/health',
        output: `HTTP/2 200
content-type: application/json`
      }
    ],
    troubleshooting: [
      {
        issue: 'Traefik logs show ACME/Let\'s Encrypt errors on startup',
        resolution: 'Almost always DNS not propagated yet or port 80 not actually reachable from the public internet (check any cloud firewall/security group, not just the host\'s own iptables) -- the HTTP-01 challenge needs a real inbound connection to succeed.'
      },
      {
        issue: 'Rate limited by Let\'s Encrypt',
        resolution: 'Their production rate limits are generous but real -- if you\'re iterating on the compose config repeatedly, use their staging CA endpoint while testing, per DEPLOY.md, and switch to production once the config is confirmed working.'
      }
    ],
    securityConsiderations: [
      'Every default secret in .env.example is a known, public placeholder -- treat leaving one of them unrotated on a public server as an active vulnerability, not a hardening nice-to-have.',
      'This is still a single-operator trust model even in production: one deploy key, one node-join secret. Do not point it at untrusted collaborators without understanding that any of them can deploy, delete, or push to any repo.'
    ]
  },
  {
    id: 'guide-seo-generation',
    title: 'Automatic sitemap.xml and robots.txt for Static Sites',
    slug: 'auto-seo-files',
    difficulty: 'Beginner',
    timeMinutes: 2,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'A static site deployment (an index.html at the project root -- no backend framework detected)'
    ],
    architectureOverview: 'On every build, the node agent runs `_maybe_generate_seo_files()` (node-agent/agent.py) after detecting a static-site stack. It walks the uploaded source for every real .html file it finds, builds a sitemap.xml with actual URLs for that deployment\'s real domain (respecting PUBLIC_SCHEME so it emits https:// in production), and writes a robots.txt pointing at it -- but only if the project doesn\'t already ship its own sitemap.xml/robots.txt, which take priority untouched. This deliberately only applies to static sites: a Python/Node backend\'s real routes can\'t be known without introspecting the app, so nothing is fabricated or guessed for those.',
    steps: [
      {
        title: 'Step 1: Ship a static site normally',
        description: 'No extra flag needed -- generation is automatic once the static stack is detected.',
        command: 'cd my-static-site && dhost ship my-site'
      },
      {
        title: 'Step 2: Check the generated files',
        description: 'Both are served at the deployment\'s real domain, generated fresh from what was actually found in the upload.',
        command: 'curl http://my-site.127.0.0.1.nip.io/sitemap.xml',
        output: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://my-site.127.0.0.1.nip.io/</loc></url>
  <url><loc>http://my-site.127.0.0.1.nip.io/about.html</loc></url>
</urlset>`
      }
    ],
    troubleshooting: [
      {
        issue: 'sitemap.xml wasn\'t generated',
        resolution: 'Check the deployment was actually detected as a static site (`dhost status my-site` or the build log) -- and confirm the project doesn\'t already have its own sitemap.xml/robots.txt at the root, which take priority and skip generation entirely.'
      }
    ],
    securityConsiderations: []
  },
  {
    id: 'guide-solana-credits',
    title: 'Setting Up Solana Devnet Node-Operator Credits',
    slug: 'solana-devnet-credits',
    difficulty: 'Intermediate',
    timeMinutes: 10,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'Python 3.10+ available on the control-plane host to run the one-time setup script',
      'A Solana devnet-compatible wallet (e.g. Phantom or Solflare, switched to Devnet) to receive credits -- no real funds needed anywhere in this flow'
    ],
    architectureOverview: 'This is entirely opt-in and off by default (ENABLE_BLOCKCHAIN=false). When enabled, the control plane mints a real SPL token ("DHOST Credits") on Solana\'s public devnet cluster to a node operator\'s linked wallet every HEARTBEATS_PER_REWARD healthy heartbeats. Devnet SOL and tokens have no monetary value -- funded by a free public faucet -- so this is a genuine on-chain demonstration (real transactions, a real mint, a real Explorer link) without touching real money. See control-plane/app/blockchain_client.py and blockchain/creditor.py for the actual mint logic.',
    steps: [
      {
        title: 'Step 1: Generate the payer keypair and mint',
        description: 'Run once, on the control-plane host. This creates a payer keypair, requests a free devnet SOL airdrop for transaction fees, and creates the DHOST Credits token mint.',
        command: 'pip install -r blockchain/requirements.txt\npython blockchain/scripts/setup_devnet.py',
        output: `⟡ Generated payer keypair: 7xKX...gA9f
⟡ Requesting devnet airdrop (2 SOL)...
✔ Airdrop confirmed
⟡ Creating DHOST Credits SPL token mint...
✔ Mint created: 4pT9...mQ2k

Add to your .env:
ENABLE_BLOCKCHAIN=true
SOLANA_MINT_ADDRESS=4pT9...mQ2k`
      },
      {
        title: 'Step 2: Enable it and restart',
        description: 'Copy the printed mint address into .env, then restart just the control plane -- no need to rebuild node agents.',
        command: '# .env\nENABLE_BLOCKCHAIN=true\nSOLANA_MINT_ADDRESS=<printed mint address>\n\ndocker compose restart control-plane'
      },
      {
        title: 'Step 3: Link a node\'s wallet',
        description: 'Any devnet-compatible wallet public key works -- this just tells the control plane where to mint that node\'s earned credits.',
        command: 'dhost wallet <node_id> <your-devnet-wallet-pubkey>'
      },
      {
        title: 'Step 4: Watch credits accrue',
        description: 'Every HEARTBEATS_PER_REWARD (default 6) healthy heartbeats from that node mints CREDITS_PER_REWARD (default 10) tokens, with a real transaction signature.',
        command: 'dhost credits <node_id>',
        output: `                  Node Credits (devnet)
┏━━━━━━━━━━━━━━┓┏━━━━━━━━┓┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ balance       ┃┃ mints   ┃┃ last tx                    ┃
┡━━━━━━━━━━━━━━┩┡━━━━━━━━┩┡━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ 40 DHOST      ││ 4       ││ 5h3k...explorer.solana.com │
└──────────────┘└────────┘└───────────────────────────┘`
      }
    ],
    troubleshooting: [
      {
        issue: 'setup_devnet.py fails on the airdrop step',
        resolution: 'The public devnet faucet is often rate-limited -- the script tells you when this happens. Retry after a few minutes, or fund the printed payer address manually via https://faucet.solana.com.'
      },
      {
        issue: '`dhost credits` shows zero after enabling',
        resolution: 'Confirm the node has actually sent HEARTBEATS_PER_REWARD heartbeats since you linked the wallet (default 6, roughly HEARTBEAT_INTERVAL x 6 seconds) -- credits mint on a cadence, not instantly on wallet link.'
      },
      {
        issue: 'Wrong network in my wallet app',
        resolution: 'Make sure your wallet is switched to Devnet, not Mainnet -- a devnet mint address and devnet tokens are invisible for a wallet still pointed at mainnet.'
      }
    ],
    securityConsiderations: [
      'The control plane holds the mint authority keypair generated by setup_devnet.py -- treat that file with the same care as any other secret on the host; anyone with it can mint unlimited devnet tokens (which, again, have no monetary value, but could still be used to spam a wallet).',
      'This is devnet-only by design -- there is no path in this version that touches mainnet or real funds.'
    ]
  },
  {
    id: 'guide-ai-debug',
    title: 'Debugging a Failed Deployment with the AI Assistant',
    slug: 'ai-assistant-debugging',
    difficulty: 'Beginner',
    timeMinutes: 5,
    claimStatus: 'IMPLEMENTED',
    prerequisites: [
      'GOOGLE_API_KEY set on the control plane (see the AI Assistant reference doc)',
      'At least one deployment that failed or is behaving unexpectedly'
    ],
    architectureOverview: 'The Assistant tab is a single Gemini model with exactly four read-only tools -- list_deployments, get_deployment_logs, list_nodes, get_release_history (control-plane/app/routers/assistant.py). It cannot deploy, delete, restart, or change anything; its system instruction explicitly tells it to decline and point you at the right CLI command or console button instead. That makes it genuinely safe to ask broad, exploratory questions about a broken deployment without worrying it will "fix" something on its own.',
    steps: [
      {
        title: 'Step 1: Open the Assistant tab',
        description: 'In the console, with a failed or misbehaving deployment already showing in the Deployments tab.',
        command: '# console -> Assistant tab'
      },
      {
        title: 'Step 2: Ask a direct question',
        description: 'The model calls get_deployment_logs and/or get_release_history itself -- you don\'t need to paste logs in manually.',
        command: '"Why is my-service failing to start? Check its logs and recent releases."'
      },
      {
        title: 'Step 3: Read the tool-backed answer',
        description: 'A real answer references what the tools actually returned, not a generic guess -- e.g. quoting the specific error line from the last ~200 log lines, or noting the last release\'s status.',
        output: `Looking at my-service's logs, the container is exiting immediately with:
  "ModuleNotFoundError: No module named 'fastapi'"

This means requirements.txt wasn't picked up correctly during the build.
The last release (rel_8f3a1) shows status "deployed" but the container
has since crashed -- check that requirements.txt is at your project root,
then redeploy with \`dhost ship my-service\`.`
      },
      {
        title: 'Step 4: Act on it yourself',
        description: 'The assistant never runs the fix -- you redeploy, roll back, or restart via the CLI or console as normal.',
        command: 'dhost ship my-service'
      }
    ],
    troubleshooting: [
      {
        issue: 'The input box is disabled / greyed out',
        resolution: 'GOOGLE_API_KEY isn\'t set on the control plane -- GET /assistant/status is reporting enabled: false. This is by design: no fake response when it\'s not configured.'
      },
      {
        issue: 'The assistant says it can\'t help with something',
        resolution: 'If you asked it to deploy, delete, or change state, that\'s expected -- it has no tools for that. Use the CLI or console for the actual action; ask the assistant for diagnosis, not execution.'
      }
    ],
    securityConsiderations: [
      'The assistant only reads deployment/node/release data already visible in your own console -- it has no broader system access, and nothing you ask it can mutate state.'
    ]
  }
];
