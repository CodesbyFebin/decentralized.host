# Deploying to a real domain

This walks through putting the mesh on the actual public internet, at a
real domain you own (e.g. `decentralized.host`), with real Let's Encrypt
TLS. Everything up to "you now have a server" is on you — provisioning
and paying for a VPS, and pointing your domain's DNS at it, aren't things
this repo (or an AI assistant) can do on your behalf.

## 1. Get a server

Any VPS with a public IPv4 address works — DigitalOcean, Hetzner, Linode,
a spare box, whatever. Minimum realistic size: 2 vCPU / 4GB RAM (this runs
Postgres, Traefik, the control plane, a node agent, a registry, and
whatever apps you deploy, all on one box for Phase 1). Ubuntu 22.04/24.04
assumed below.

Install Docker (with the Compose plugin) on it:

```bash
curl -fsSL https://get.docker.com | sh
```

## 2. Point DNS at it

At your domain registrar / DNS provider, create:

```
A     decentralized.host          -> <server IP>
A     *.decentralized.host        -> <server IP>
```

The wildcard record means every future `dhost ship <name>` gets a working
`name.decentralized.host` automatically — no per-app DNS work, and no DNS
provider API key needed, because we use per-hostname Let's Encrypt
certificates (HTTP-01 challenge) rather than a wildcard certificate.

DNS propagation can take a few minutes to a few hours depending on your
provider/TTL. Don't proceed to cert issuance until `dig decentralized.host`
(or similar) actually resolves to your server.

## 3. Clone and configure

On the server:

```bash
git clone https://github.com/CodesbyFebin/decentralized.host.git
cd decentralized.host
cp .env.example .env
```

Edit `.env`:

```bash
BASE_DOMAIN=decentralized.host
ACME_EMAIL=you@example.com          # Let's Encrypt will email this about cert issues

# Generate real random secrets -- do NOT keep the dev-* defaults in production:
SECRET_KEY=$(openssl rand -hex 32)
NODE_JOIN_SECRET=$(openssl rand -hex 24)
DEPLOY_API_KEY=$(openssl rand -hex 24)
```

(Run `openssl rand -hex 32` etc. yourself and paste the results in — the
snippet above is illustrative, not something `.env` executes.)

## 4. Bring up the mesh

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

This starts everything with real TLS: `api.decentralized.host` (control
plane), `console.decentralized.host` (OpenGit Console), and Traefik
issuing a real Let's Encrypt cert for each hostname the first time it's
requested. The registry is no longer exposed to the internet — only the
node agent needs it.

Check it came up clean:

```bash
docker compose logs traefik --tail 30       # look for successful ACME cert issuance
curl -I https://api.decentralized.host/healthz
```

## 5. Ship the landing page to the bare domain

From your own machine (with the CLI installed and pointed at the real
API):

```bash
export DHOST_API_URL=https://api.decentralized.host
export DHOST_DEPLOY_KEY=<your real DEPLOY_API_KEY from .env>
cd web
dhost ship decentralized-host-site --port 80 --domain decentralized.host
```

`--domain` overrides the default `<name>.<BASE_DOMAIN>` scheme so this
one deployment sits at the bare apex instead of a subdomain. Everything
else you ship works the normal way: `dhost ship myapp` →
`myapp.decentralized.host`, real cert issued automatically.

## 6. Add a second (real) node, if you have one

Same as local dev, just point it at the real control plane:

```bash
dhost node join --control-plane-url https://api.decentralized.host --node-name node-2
```

## What's still not production-grade

Being upfront, same spirit as the main README:

- **Single point of failure**: one Postgres instance, one Traefik, no
  backups configured here. Add your own backup/HA story before trusting
  this with anything you can't afford to lose.
- **No per-user auth**: one shared `DEPLOY_API_KEY` and `NODE_JOIN_SECRET`
  for the whole mesh, same as local dev — appropriate for one operator,
  not a multi-tenant service.
- **No firewall guidance here**: at minimum, make sure only 80/443 (and
  SSH) are open to the internet — Postgres, the registry, and the node
  agent's ports should not be publicly reachable. `docker-compose.prod.yml`
  stops publishing the registry port, but double-check your cloud
  provider's firewall/security group too.
- **Blockchain credits are still devnet-only**, wherever you deploy —
  that's a deliberate design choice (see blockchain/README.md), not
  something this deploy path changes.
