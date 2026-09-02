# Security Policy

decentralized.host is a self-hosted platform: you run your own control plane, node agents, and git server, on your own infrastructure. There is no hosted multi-tenant service operated by this project, so most security issues are found and fixed directly in the source.

## Reporting a vulnerability

Please report security issues privately via [GitHub Security Advisories](https://github.com/CodesbyFebin/decentralized.hosting/security/advisories/new) rather than opening a public issue. Include:

- The affected component (`control-plane`, `node-agent`, `cli`, `git-server`, or `blockchain`)
- Steps to reproduce
- The potential impact

There is no bug bounty program and no guaranteed response-time SLA — this is a small open-source project, not a funded security team. Reports will be acknowledged and addressed on a best-effort basis.

## Scope notes

This is a single-operator trust model by design: one shared deploy key, one shared node-join secret, and any registered SSH key can push to any repo on a given git server instance. That is documented, intentional scope (see the README's "What's not real yet" section and the [security architecture page](https://decentralized.host/security/)), not something to report as a novel finding on its own — but a way to *bypass* those boundaries (e.g. an unauthenticated request reaching a protected endpoint, a container escaping its Docker isolation, a path-traversal in the git server's repo-name handling) is exactly what this policy covers.

## TLS and certificate pinning

**Current transport security, as actually implemented today:**

- `control-plane` and `dashboard` terminate TLS via Traefik, using automated [Let's Encrypt](https://letsencrypt.org/) certificates provisioned through the ACME HTTP-01 challenge (`docker-compose.prod.yml`, `certresolver=letsencrypt`). Certificates auto-renew and rotate on Let's Encrypt's normal ~90-day cadence.
- The `dhost` CLI (`cli/dhost/client.py`) talks to the control plane over `httpx.Client`, which verifies the server certificate against the system CA trust store by default (`verify=True`, the httpx default — nothing in this codebase disables it). There is no certificate or public-key pinning in the CLI today.
- Traffic to the public mesh hostnames (`api.`, `console.`, `dashboard.`, etc.) additionally passes through a Cloudflare Tunnel, so the client-visible certificate is Cloudflare's edge certificate, not Traefik's Let's Encrypt leaf — the tunnel itself (not TLS pinning) is what authenticates that hop, via the tunnel's own credentials file.

**Why this project does not ship classic certificate/public-key pinning (e.g. HPKP-style leaf pinning) by default:** with certificates that rotate automatically every ~90 days, pinning a specific leaf certificate or key in a CLI that may not be updated in lockstep would cause hard client-side outages on every renewal — a worse failure mode than the attack it defends against for a project with no CA compromise incidents to date. This is a deliberate scope decision, not an oversight.

**If you want stronger transport trust guarantees, in order of practicality:**

1. **CAA DNS record** — restrict which Certificate Authorities may issue certificates for your domain. This zone's own explicit record is narrowed to `decentralized.host. CAA 0 issue "letsencrypt.org"` / `0 issuewild "letsencrypt.org"`. In practice this only constrains Traefik's own origin certificate: `dig decentralized.host CAA` still returns a broader set (DigiCert, Sectigo, Comodo, Google Trust Services, SSL.com) because [Cloudflare automatically re-adds its Universal SSL partner CAs to the live DNS answer](https://developers.cloudflare.com/ssl/edge-certificates/caa-records/) whenever any CAA record exists on a zone with Universal SSL enabled — those extra records aren't even visible in the Cloudflare dashboard, only in the actual DNS response, and there's no way to suppress them on this plan (only [Advanced Certificate Manager](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/), a paid add-on, lets you pin the edge certificate's CA). Worth knowing: the certificate a browser actually sees for the proxied `*.decentralized.host` hostnames is Cloudflare's own edge certificate, not Traefik's — Cloudflare's Universal SSL is free-tier and doesn't let you choose which of its partner CAs issues that edge cert, so "only Let's Encrypt" isn't achievable end-to-end here regardless of CAA.
2. **Pin the issuing CA, not the leaf** — if you fork the CLI, `httpx.Client(verify=<path-to-a-CA-bundle>)` can be pointed at a bundle containing only Let's Encrypt's root (ISRG Root X1) instead of the full system trust store. This survives leaf rotation but still breaks if Let's Encrypt ever rotates its root, which is rare but has happened industry-wide before.
3. **Leaf/key pinning** — technically possible by wrapping `httpx`'s transport with a custom `ssl.SSLContext` that checks the peer certificate's public key against a pinned value, but not implemented or recommended here for the rotation-breakage reason above.

None of this changes the underlying single-operator trust model described above — it only hardens the transport layer between a client and the certificate it should be talking to.
