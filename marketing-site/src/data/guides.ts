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
  }
];
