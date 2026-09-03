// The 69-pillar topic directory. A deliberate broad-SEO content play, not a
// feature map: most of these topics (DAO governance, yield farming, NFT
// metadata...) have no connection to what Decentralized.Host actually does
// (a self-hosted Docker deployment mesh). Each page says so plainly where
// it's true, rather than implying a product capability that doesn't exist --
// see relatesToProduct/productNote below. This mirrors how CodesbyFebin's
// other project (rust-stark-zkvm's homepage-app) built its own docs site:
// real content added in batches over many commits, not all 69 written at
// once. `written: true` pillars have real, substantive body content below;
// the rest have an honest short summary and are flagged for a future batch
// rather than padded out or left broken.

export type PillarGroup = 'Decentralized Infrastructure' | 'Decentralized Hosting' | 'Web3 & Blockchain' | 'Platform';

export interface PillarSection {
  heading: string;
  body: string; // one or more paragraphs, \n\n separated
}

export interface Pillar {
  slug: string; // no leading/trailing slash
  title: string;
  group: PillarGroup;
  oneLine: string;
  written: boolean;
  /** Does Decentralized.Host's real, shipped product actually touch this topic? */
  relatesToProduct: boolean;
  /** If relatesToProduct, the specific honest connection. If not, an honest "this doesn't connect" note. */
  productNote: string;
  sections?: PillarSection[];
  externalHref?: string; // for Platform-group entries that point elsewhere (e.g. GitHub, existing site pages)
}

export const PILLARS: Pillar[] = [
  // ---------- Decentralized Infrastructure ----------
  {
    slug: 'decentralized-storage-tools', title: 'Decentralized Storage Tools', group: 'Decentralized Infrastructure',
    oneLine: 'Content-addressed and peer-distributed storage systems that replace a single provider\'s disks.',
    written: true, relatesToProduct: false,
    productNote: "Decentralized.Host stores your deployed app's data on whichever node it runs on -- normal disk, not content-addressed storage. See the roadmap's exploratory note on a possible future peer-to-peer storage direction.",
    sections: [
      { heading: 'What decentralized storage actually means', body: 'Traditional cloud storage (S3, a VPS\'s disk) puts your data on one provider\'s infrastructure, addressed by a path you choose ("my-bucket/file.jpg"). Decentralized storage systems instead address data by its content -- a cryptographic hash of the bytes themselves -- and spread copies across a network of independent peers, so no single operator can unilaterally delete, censor, or lose the only copy.\n\nThe best-known example is IPFS (InterPlanetary File System): you add a file, get back a CID (content identifier) derived from its hash, and anyone who has that CID can fetch the file from any peer that\'s pinned it -- not from a fixed URL you control. Filecoin and Arweave build economic incentive layers on top of similar ideas: Filecoin pays storage providers to keep your data pinned over time; Arweave charges once for storage it claims to keep permanently, funded by an up-front endowment.' },
      { heading: 'The real tradeoffs', body: 'Content addressing solves integrity (you can verify you got the exact bytes you asked for) and censorship-resistance (no single node can quietly swap or remove the file if others still pin it), but it doesn\'t solve availability by itself -- a file only stays retrievable as long as at least one peer keeps pinning it, which is why Filecoin\'s and Arweave\'s economic layers exist. Mutable data (a file that changes over time, like a database) is also awkward: IPFS itself is immutable per-CID, so mutability needs an additional layer (IPNS, or just re-pinning under a new CID and updating a pointer somewhere).' }
    ]
  },
  {
    slug: 'decentralized-identity-tools', title: 'Decentralized Identity Tools', group: 'Decentralized Infrastructure',
    oneLine: 'Self-sovereign identity and credentials that don\'t depend on a single issuing authority.',
    written: true, relatesToProduct: false,
    productNote: "Decentralized.Host has no user-identity system at all -- it's single-operator, one shared deploy key. No connection to this topic.",
    sections: [
      { heading: 'What this covers', body: 'Decentralized identity (DID) systems let a person or organization hold and control their own identifiers and credentials -- a public/private keypair, plus signed claims about them ("this university issued this degree to this key") -- without a central authority like a government database or a single company\'s login system being the sole source of truth. W3C\'s DID and Verifiable Credentials specs are the standardized core most implementations build on; Ethereum\'s ENS (Ethereum Name Service) is a narrower, widely-used example that maps human-readable names to addresses and other records on-chain.' },
      { heading: 'Why it\'s hard in practice', body: 'The technical part (public-key cryptography, signed claims) is well-understood. The hard part is social and practical: who verifies that a credential issuer is legitimate, what happens when you lose your private key (there\'s no "forgot password" flow for a self-custodied identity), and getting enough real-world issuers (universities, governments, employers) to actually issue verifiable credentials instead of PDFs. Most decentralized identity today is used within crypto-native contexts (wallet-based logins, ENS names as profile identifiers) rather than as a replacement for government ID or enterprise SSO.' }
    ]
  },
  {
    slug: 'decentralized-compute-tools', title: 'Decentralized Compute Tools', group: 'Decentralized Infrastructure',
    oneLine: 'Running workloads across independently operated machines instead of one cloud provider\'s datacenters.',
    written: true, relatesToProduct: true,
    productNote: 'This is the closest topic to what Decentralized.Host actually is: a mesh of independently operated node agents (Docker hosts) that a control plane schedules containerized workloads onto. See /depin/ for the real, current mechanics -- node-operator devnet credits, not a public marketplace yet.',
    sections: [
      { heading: 'The core idea', body: 'Decentralized compute networks let anyone with spare hardware -- a home server, an idle VPS, a rack in a colo -- register that capacity with a scheduler, and let workloads (containers, VMs, batch jobs) run on whichever registered machine has room, instead of all running on one company\'s owned datacenters. This is sometimes called DePIN (Decentralized Physical Infrastructure Network) when there\'s a token-incentive layer paying operators for verified uptime or work done.' },
      { heading: 'What Decentralized.Host actually does here', body: 'Decentralized.Host implements the orchestration half of this directly: a FastAPI control plane tracks registered node agents\' heartbeats and CPU/RAM, and a weighted scheduler places new deployments (and, since Phase 2, automatically reschedules existing ones off a node that goes offline) onto whichever healthy node has the most headroom. What it does not have yet is a public node marketplace -- joining a mesh as a node operator today requires that specific mesh\'s shared join secret, and the optional Solana devnet credit system pays operators for verified heartbeats, not real money. The roadmap\'s Phase 4 is where a public discovery registry is planned, not built.' }
    ]
  },
  {
    slug: 'decentralized-dns-tools', title: 'Decentralized DNS Tools', group: 'Decentralized Infrastructure',
    oneLine: 'Name resolution systems (like ENS or Handshake) not controlled by ICANN-accredited registrars.',
    written: true, relatesToProduct: false,
    productNote: "Decentralized.Host uses ordinary DNS (Cloudflare) for its own domain and Traefik's Host-header routing for deployed apps -- no blockchain-based naming involved.",
    sections: [
      { heading: 'How this differs from ordinary DNS', body: 'Regular DNS is a hierarchy of authorities: ICANN accredits registrars, registrars sell you a name, and your nameservers (often the registrar\'s, or a third party like Cloudflare) answer queries for it -- ultimate control sits with whoever holds the registrar account and, one level up, whoever runs the relevant top-level domain\'s registry. Decentralized alternatives remove that hierarchy: ENS (Ethereum Name Service) maps names like "alice.eth" to addresses and records via an Ethereum smart contract, so ownership is whatever address holds the corresponding NFT-like token -- no registrar can suspend it. Handshake goes further and decentralizes the root zone itself (the layer above .com/.eth/etc.), auctioning top-level names on its own blockchain instead of ICANN allocating them.' },
      { heading: 'The practical tradeoff', body: 'Ordinary DNS resolvers (browsers, OSes, ISPs) understand ENS and Handshake names only through a bridge -- either a browser extension, a gateway service that translates alice.eth into a normal HTTPS URL, or ENS names being made resolvable via a .limo/.eth.link gateway. That bridge is itself a centralization point in practice, even though the underlying name registry isn\'t. This project\'s own domain resolution story is much simpler and worth being honest about: decentralized.host is a normal ICANN domain (registered via Hostinger), with Cloudflare as the authoritative nameserver -- chosen for reliability and because Traefik\'s routing (matching real HTTP Host headers) doesn\'t need or benefit from a decentralized naming layer.' }
    ]
  },
  { slug: 'decentralized-messaging-tools', title: 'Decentralized Messaging Tools', group: 'Decentralized Infrastructure', oneLine: 'Peer-to-peer or federated messaging protocols without one company owning the whole network.', written: false, relatesToProduct: false, productNote: 'No messaging feature exists in Decentralized.Host.' },
  {
    slug: 'decentralized-database-tools', title: 'Decentralized Database Tools', group: 'Decentralized Infrastructure',
    oneLine: 'Distributed, multi-writer databases without one operator holding the only copy.',
    written: true, relatesToProduct: false,
    productNote: 'Decentralized.Host itself runs on a single ordinary PostgreSQL instance for control-plane state -- not distributed.',
    sections: [
      { heading: 'What makes a database "decentralized"', body: 'Most distributed databases (CockroachDB, YugabyteDB, Cassandra) are decentralized in an operational sense -- data is sharded and replicated across multiple nodes so no single machine holds the only copy -- but still trust-centralized: one organization runs and owns all the nodes. A smaller set of blockchain-adjacent databases (OrbitDB over IPFS, or ledger-style databases like those behind some DeFi protocols) go further, distributing both the data AND control across mutually untrusting parties, using consensus rather than a trusted operator to agree on writes.' },
      { heading: 'Why this distinction matters in practice', body: "Operational distribution (multiple nodes, no single point of failure) solves availability and scale; it doesn't require giving up control of who can write. Trust distribution (no single party controls the data) solves a different problem -- collusion-resistance and censorship-resistance -- at a real cost in write latency and complexity (consensus rounds are slower than a single node committing a transaction). Decentralized.Host's own control-plane database is deliberately the simple end of this spectrum: one PostgreSQL instance, no replication, no distributed consensus -- correct for a single-operator mesh where the control plane itself isn't meant to be trust-distributed, and a real gap (no automated backup exists yet) that's tracked honestly rather than hidden." }
    ]
  },
  { slug: 'decentralized-file-sharing-tools', title: 'Decentralized File Sharing Tools', group: 'Decentralized Infrastructure', oneLine: 'Peer-to-peer file transfer and sync without a central file host.', written: false, relatesToProduct: false, productNote: 'No file-sharing feature exists in Decentralized.Host.' },
  { slug: 'decentralized-authentication-tools', title: 'Decentralized Authentication Tools', group: 'Decentralized Infrastructure', oneLine: 'Wallet-based and cryptographic login flows instead of a central account database.', written: false, relatesToProduct: false, productNote: 'Decentralized.Host uses a single shared deploy key and SSH keys for git push -- no per-user accounts, decentralized or otherwise.' },
  {
    slug: 'decentralized-payment-tools', title: 'Decentralized Payment Tools', group: 'Decentralized Infrastructure',
    oneLine: 'Peer-to-peer value transfer without a payment processor in the middle.',
    written: true, relatesToProduct: true,
    productNote: 'The one real overlap: node operators can earn Solana devnet SPL token credits for verified uptime -- devnet only, no real monetary value. See /depin/.',
    sections: [
      { heading: 'How this differs from Stripe/PayPal-style payments', body: "A traditional payment processor sits between payer and payee, holding the actual settlement authority: it debits one account and credits another in its own ledger, and the money only really moves when the processor's own bank rails clear. Blockchain-based payments settle directly between the two parties' addresses on a shared public ledger -- no intermediary custodies the funds mid-transfer, and settlement finality is defined by the chain's own consensus rules (Solana's is sub-second; Bitcoin's classically wants several confirmations) rather than a company's internal database commit." },
      { heading: "What Decentralized.Host actually does here, and doesn't", body: 'The only payment-shaped thing in this project is real but narrow: when ENABLE_BLOCKCHAIN is on, the control plane mints a real SPL token ("DHOST Credits") to a node operator\'s linked wallet every few healthy heartbeats, via a genuine on-chain mint transaction on Solana\'s public devnet. That\'s a reward mechanism, not a payment system -- there\'s no invoicing, no developer paying for compute, no mainnet path today, and devnet SOL/tokens are funded by a free faucet with no real monetary value. The roadmap\'s Phase 4 mentions an eventual, optional mainnet migration as planned, not built.' }
    ]
  },
  { slug: 'decentralized-governance-tools', title: 'Decentralized Governance Tools', group: 'Decentralized Infrastructure', oneLine: 'On-chain voting and proposal systems for collective decision-making.', written: false, relatesToProduct: false, productNote: 'No governance system of any kind exists in Decentralized.Host -- it has a single operator.' },
  { slug: 'decentralized-oracle-tools', title: 'Decentralized Oracle Tools', group: 'Decentralized Infrastructure', oneLine: 'Getting real-world data onto a blockchain via multiple independent reporters instead of one trusted feed.', written: false, relatesToProduct: false, productNote: 'No oracle functionality exists in Decentralized.Host.' },
  { slug: 'decentralized-registry-tools', title: 'Decentralized Registry Tools', group: 'Decentralized Infrastructure', oneLine: 'On-chain or peer-verified name/asset registries.', written: false, relatesToProduct: true, productNote: "Decentralized.Host runs its own private Docker image registry as part of the mesh (so nodes can pull built images) -- but it's a plain, centrally-run registry:2 instance, not a decentralized one." },
  { slug: 'decentralized-marketplace-tools', title: 'Decentralized Marketplace Tools', group: 'Decentralized Infrastructure', oneLine: 'Peer-to-peer buying and selling without a platform taking a cut in the middle.', written: false, relatesToProduct: false, productNote: 'No marketplace exists in Decentralized.Host -- the roadmap\'s Phase 4 mentions a future public compute marketplace as planned, not built.' },
  { slug: 'decentralized-reputation-tools', title: 'Decentralized Reputation Tools', group: 'Decentralized Infrastructure', oneLine: 'Portable, verifiable track records not owned by one platform.', written: false, relatesToProduct: false, productNote: 'No reputation system exists in Decentralized.Host.' },
  {
    slug: 'decentralized-access-control-tools', title: 'Decentralized Access Control Tools', group: 'Decentralized Infrastructure',
    oneLine: 'Token- or credential-gated permissions without a central admin panel.',
    written: true, relatesToProduct: true,
    productNote: 'Decentralized.Host uses one shared Bearer deploy key and a flat SSH-key allowlist -- any registered key can push to any repo. No per-resource access control -- a documented, intentional gap, not an oversight.',
    sections: [
      { heading: 'What this covers', body: 'A central admin panel model has one party (a company\'s backend) deciding who can do what, checked against its own database on every request. Decentralized access control instead encodes permission into something the requester can prove cryptographically -- holding a specific NFT unlocks a Discord role, holding a DAO governance token unlocks a voting right, a signed credential proves you\'re a verified member of some group -- without any central party approving the check at request time. The permission logic itself usually still lives somewhere centralized (a smart contract, which IS a form of centralization even if not corporate-owned), but no single company\'s database is the source of truth for who\'s allowed in.' },
      { heading: "Decentralized.Host's own access model, stated plainly", body: 'This project is explicit about not doing any of that: one shared DEPLOY_API_KEY authenticates every control-plane API call, and any SSH public key registered to the git server can push to (and thus deploy) any repository on it -- there\'s no per-user, per-repo, or per-resource permission system at all. This is documented as a deliberate single-operator trust-model choice for an MVP, not something dressed up as more sophisticated than it is: the real security boundary this project actually enforces is the dhost engine\'s pre-deploy secret scan, which can block a suspicious deployment regardless of who pushed it.' }
    ]
  },
  {
    slug: 'decentralized-encryption-tools', title: 'Decentralized Encryption Tools', group: 'Decentralized Infrastructure',
    oneLine: 'End-to-end and threshold encryption schemes with no single key holder.',
    written: true, relatesToProduct: false,
    productNote: 'No encryption feature beyond standard TLS exists in Decentralized.Host.',
    sections: [
      { heading: 'End-to-end vs. threshold encryption', body: "End-to-end encryption (E2EE) means the message is encrypted on the sender's device and only decryptable on the recipient's -- the transport in between, including any server that relays it, never sees plaintext. Threshold encryption is a different, additive idea: the DECRYPTION key itself is split into N shares distributed to different parties, and some threshold (e.g. 3 of 5) must cooperate to reconstruct it -- useful when you deliberately don't want any single party (including the sender) to unilaterally decrypt later, common in multi-party custody and some DAO treasury designs." },
      { heading: "Where Decentralized.Host stands on this", body: "This project doesn't implement application-level encryption of any kind -- what it has is ordinary transport security: TLS (via Traefik's Let's Encrypt automation, see SSL/TLS Certificate Tools) protects data in transit between a client and the server, the same as almost every real website, and that's it. There's no E2EE for logs, no threshold scheme for the Solana payer keypair (a single key, held by whoever runs the control plane), and no plan on the roadmap to add either -- worth stating plainly rather than implying more cryptographic sophistication than exists." }
    ]
  },
  { slug: 'decentralized-backup-tools', title: 'Decentralized Backup Tools', group: 'Decentralized Infrastructure', oneLine: 'Redundant backups spread across independent peers instead of one provider\'s snapshot system.', written: false, relatesToProduct: false, productNote: 'Decentralized.Host has no automated backup system for deployed apps\' data today.' },
  { slug: 'decentralized-sync-tools', title: 'Decentralized Sync Tools', group: 'Decentralized Infrastructure', oneLine: 'Multi-device or multi-peer data sync without a central sync server.', written: false, relatesToProduct: false, productNote: 'No sync feature exists in Decentralized.Host.' },
  { slug: 'decentralized-search-tools', title: 'Decentralized Search Tools', group: 'Decentralized Infrastructure', oneLine: 'Indexing and search over peer-distributed content.', written: false, relatesToProduct: false, productNote: 'No search feature exists in Decentralized.Host beyond the marketing site\'s own Cmd+K page search.' },
  { slug: 'decentralized-analytics-tools', title: 'Decentralized Analytics Tools', group: 'Decentralized Infrastructure', oneLine: 'Usage and telemetry analysis without one party owning all the data.', written: false, relatesToProduct: false, productNote: 'Decentralized.Host reports node CPU/RAM/heartbeat telemetry to its own control plane -- centrally, not decentralized analytics.' },

  // ---------- Decentralized Hosting ----------
  {
    slug: 'vps-management-tools', title: 'VPS Management Tools', group: 'Decentralized Hosting',
    oneLine: 'Provisioning, monitoring, and maintaining virtual private servers.',
    written: true, relatesToProduct: true,
    productNote: "A Decentralized.Host node agent is designed to run directly on a VPS you already manage -- it doesn't provision or manage the VPS itself (no server creation, no OS patching), only the Docker workloads scheduled onto it.",
    sections: [
      { heading: 'What VPS management covers', body: 'A VPS (virtual private server) gives you root access to an isolated slice of a physical machine -- your own IP, your own OS, your own processes -- without owning hardware. "Managing" one covers the full lifecycle: provisioning (choosing a region/size and booting it, via a provider\'s API or console), securing it (SSH key-only login, a firewall, unattended security updates), keeping services running (systemd units, process supervisors, restart policies), and monitoring (is it up, is disk filling, is memory exhausted).' },
      { heading: 'Where a tool like this fits with Decentralized.Host', body: 'Decentralized.Host deliberately doesn\'t try to manage the VPS itself -- you provision and secure the box the normal way (a cloud provider\'s console, or bare metal you already run), then install Docker and run a node-agent container on it. From that point, the node agent handles the workload layer: pulling and running the containers the control plane schedules to it, reporting its own CPU/RAM back, and getting rescheduled around automatically if it goes offline. The dividing line is intentional: server-level ops (patching, firewalling, provisioning) stay your responsibility; container-level ops (build, deploy, route, monitor the app) are what the mesh handles.' }
    ]
  },
  {
    slug: 'dedicated-server-tools', title: 'Dedicated Server Tools', group: 'Decentralized Hosting',
    oneLine: 'Managing bare-metal servers you fully own or lease exclusively.',
    written: true, relatesToProduct: true,
    productNote: 'Same relationship as VPS Management -- a node agent can run on a dedicated server just as well as a VPS; Decentralized.Host doesn\'t provision or manage the physical machine itself.',
    sections: [
      { heading: 'Dedicated vs. virtual', body: "A dedicated server gives you the entire physical machine -- every CPU core, all the RAM, no noisy-neighbor contention from other tenants -- either bought outright (colocation: you own the hardware, a datacenter provides power/cooling/network) or leased exclusively from a provider (Hetzner's and OVH's dedicated lines are common examples). This trades away a VPS's flexibility (resize in minutes, snapshot, migrate) for consistent, undiluted performance and, often, a meaningfully lower cost per core than an equivalent slice of a hyperscaler VM." },
      { heading: "Running Decentralized.Host on one", body: 'Nothing about a node agent cares whether it\'s running on a VPS or a dedicated box -- it just needs Docker and a reachable network address. On a genuinely separate dedicated server, the one thing that matters (documented in the README\'s "Adding a second node" section) is setting ADVERTISE_ADDRESS correctly: the control plane needs to reach that specific node\'s agent at a real, externally-routable host:port, not the Docker-network-internal hostname that works for same-machine testing. Earlier versions of this project hardcoded a single global node-agent URL, which would have silently misrouted builds/logs/teardown to the wrong machine the moment a second real node existed -- fixed by tracking each node\'s own advertise_address explicitly.' }
    ]
  },
  {
    slug: 'cdn-configuration-tools', title: 'CDN Configuration Tools', group: 'Decentralized Hosting',
    oneLine: 'Configuring content delivery networks to cache and serve assets close to users.',
    written: true, relatesToProduct: true,
    productNote: "The marketing site itself sits behind Cloudflare's CDN/proxy; deployed apps route through Traefik directly, with no CDN layer of their own today.",
    sections: [
      { heading: 'What a CDN actually does', body: "A CDN puts copies of your static content (images, JS/CSS bundles, whole HTML pages for cacheable routes) on servers physically closer to each visitor, so a user in Singapore fetches from a nearby edge node instead of round-tripping to wherever your origin server actually sits. Configuration mostly means deciding what's cacheable (immutable assets like a hashed JS bundle: cache aggressively; a logged-in dashboard: don't) and for how long (Cache-Control/TTL headers), plus purge rules for when you deploy new content that must invalidate old cached copies immediately." },
      { heading: "The two different things happening on this project's own infrastructure", body: 'The marketing site (decentralized.host itself) sits behind Cloudflare\'s proxy, which does real CDN-style edge caching and terminates TLS at the edge with Cloudflare\'s own certificate -- confirmed directly during this project\'s own SSL/TLS work, since the certificate a browser sees for the marketing site is Cloudflare\'s, not the origin\'s. Deployed apps on the mesh are different: Traefik routes traffic straight to whichever node a deployment landed on, with no CDN or edge caching layer in front -- every request to a shipped app\'s subdomain hits that node directly. This is a real, current limitation, not a hidden feature: static-heavy deployed apps get no edge-caching benefit today.' }
    ]
  },
  {
    slug: 'dns-management-tools', title: 'DNS Management Tools', group: 'Decentralized Hosting',
    oneLine: 'Creating and maintaining the DNS records that point domain names at real infrastructure.',
    written: true, relatesToProduct: true,
    productNote: "Decentralized.Host relies on real DNS in two concrete ways: Cloudflare CAA/A/CNAME records for the marketing domain, and each deployed app getting a subdomain (<name>.<BASE_DOMAIN>) that Traefik routes by Host header.",
    sections: [
      { heading: 'What DNS management actually involves day to day', body: 'Beyond the basics (A records pointing a name at an IP, CNAME records aliasing one name to another), real DNS management means keeping records correct as infrastructure changes: updating a record when a server\'s IP changes, adding CAA records to restrict which certificate authorities may issue certs for your domain, setting sensible TTLs (short while you\'re actively changing something, long once stable, to reduce query load), and verifying propagation -- a change isn\'t live everywhere the instant you save it, since resolvers along the path cache answers for up to the record\'s TTL.' },
      { heading: 'A real lesson from running Decentralized.Host\'s own DNS', body: 'This exact project hit a real, confusing bug: local machine\'s ISP resolver kept serving stale answers for the mesh\'s subdomains long after the authoritative records (checked directly against Cloudflare\'s own nameservers, and cross-checked via 1.1.1.1 and 8.8.8.8) were correct and stable. It looked like the DNS zone itself was flapping; it wasn\'t -- it was one resolver\'s cache lagging behind reality. The practical lesson: when a domain "isn\'t resolving right," check the authoritative source and at least one independent public resolver before assuming the zone is broken -- a local or ISP-level cache is a common, easy-to-miss culprit.' }
    ]
  },
  {
    slug: 'ssl-tls-certificate-tools', title: 'SSL/TLS Certificate Tools', group: 'Decentralized Hosting',
    oneLine: 'Issuing, renewing, and configuring the certificates that make HTTPS work.',
    written: true, relatesToProduct: true,
    productNote: "Traefik automates real Let's Encrypt certificate issuance for every deployed app in Decentralized.Host's production config -- see SECURITY.md for the actual TLS chain and its real limitations.",
    sections: [
      { heading: 'How automated certificate issuance actually works', body: "Let's Encrypt (and the ACME protocol it popularized) made TLS certificates free and automatable: a client proves it controls a domain -- usually by answering an HTTP challenge at a well-known path, or publishing a specific DNS TXT record -- and in exchange gets a short-lived certificate (Let's Encrypt's are valid ~90 days) that a tool like Traefik or Certbot renews automatically well before expiry. This replaced the older model of manually buying a certificate from a CA and installing it by hand." },
      { heading: 'What this looks like in Decentralized.Host, and its real limits', body: "In production, Traefik requests a certificate via ACME HTTP-01 for the control plane, dashboard, and every deployed app's own subdomain -- each app gets its own real, independently renewed certificate, not a shared wildcard. One thing worth knowing if you're deploying behind Cloudflare's proxy (as this project's own marketing site is): the certificate a browser actually sees is Cloudflare's own edge certificate, not Traefik's -- Cloudflare terminates TLS at its edge and re-encrypts to the origin. A CAA DNS record narrows which CA can issue for your domain, but Cloudflare's Universal SSL re-adds its own partner CAs to the live DNS answer regardless (confirmed by testing this on this project's own zone) -- narrowing CAA only constrains the origin certificate, not Cloudflare's edge one, unless you pay for Advanced Certificate Manager." }
    ]
  },
  {
    slug: 'load-balancer-tools', title: 'Load Balancer Tools', group: 'Decentralized Hosting',
    oneLine: 'Distributing incoming traffic across multiple backend instances.',
    written: true, relatesToProduct: true,
    productNote: "Traefik acts as the mesh's edge router, but today it routes each subdomain to exactly one node's container -- it doesn't load-balance one app across multiple replicas yet, a real, current limitation.",
    sections: [
      { heading: 'What load balancing solves', body: "Once an application needs more capacity than one instance can serve, or needs to survive one instance crashing without downtime, something has to sit in front and spread requests across multiple running copies -- round-robin (rotate evenly), least-connections (send to whichever backend is least busy right now), or IP-hash (same client always hits the same backend, useful for sticky sessions) are the common strategies. Health checks matter as much as the distribution algorithm: a load balancer that keeps sending traffic to a backend that's actually down isn't doing its job." },
      { heading: "Why Decentralized.Host doesn't do this yet, honestly stated", body: "Traefik, which this project already runs as its edge router, is fully capable of load-balancing across multiple backend targets -- that's a standard, well-supported feature of Traefik's own routing model. What's missing is on this project's side, not Traefik's: today, each deployment maps to exactly one container on exactly one node (control-plane/app/models.py's Deployment.node_id is a single foreign key, not a list), so there's genuinely only ever one backend to route to per app. Multiple replicas of one deployment, spread across nodes and load-balanced by Traefik, is a real architectural gap -- not built, not on this project's roadmap yet either, distinct from the automated failover feature (which reschedules a whole deployment to a different single node, not load-balances across several simultaneously)." }
    ]
  },
  {
    slug: 'reverse-proxy-tools', title: 'Reverse Proxy Tools', group: 'Decentralized Hosting',
    oneLine: 'Software that sits in front of backend services, routing and terminating traffic on their behalf.',
    written: true, relatesToProduct: true,
    productNote: 'Traefik is the real reverse proxy Decentralized.Host runs -- every deployed app and the control plane/dashboard route through it, configured dynamically per-deployment.',
    sections: [
      { heading: 'What a reverse proxy does', body: 'A reverse proxy sits between the public internet and your actual application servers: it receives every request first, then forwards it to the right backend based on rules (usually the requested hostname or URL path), and often also terminates TLS, adds compression, and handles routing changes without the backend needing to know anything changed. This is the opposite of a forward proxy (which sits in front of clients, not servers). Nginx, Caddy, HAProxy, and Traefik are the most common choices; each differs mainly in configuration style and how dynamically they can pick up new routes.' },
      { heading: "Why Traefik specifically, in this project", body: "Decentralized.Host uses Traefik's file provider: every time a node agent starts or restarts a deployed container, it writes a small YAML file describing that one route (Host(`app.decentralized.host`) → that container), and Traefik watches the directory and picks up the change live -- no reload, no restart, no central config file to hand-edit per deployment. The docker provider (Traefik reading labels directly off running containers) was considered and rejected for a real, specific reason: it failed Docker API version negotiation against this project's own Colima-based local dev daemon (\"client version 1.24 is too old\"), a known incompatibility unrelated to the project itself -- the file provider sidesteps it entirely, and also means Traefik never needs docker.sock access at all." }
    ]
  },
  { slug: 'container-orchestration-tools', title: 'Container Orchestration Tools', group: 'Decentralized Hosting', oneLine: 'Systems that decide where containers run, keep them running, and reschedule them on failure.', written: true, relatesToProduct: true,
    productNote: "Decentralized.Host is a container orchestrator in the functional sense -- a control plane schedules containers onto nodes and automatically reschedules them off a node that goes offline -- just a much smaller, single-purpose one than Kubernetes.",
    sections: [
      { heading: 'What orchestration actually decides', body: "At its core, a container orchestrator answers three questions continuously, not just at deploy time: which machine should this container run on right now (scheduling, usually based on available CPU/RAM and constraints), is it still running (health checking), and what happens if it isn't (rescheduling, restarting, or failing over). Kubernetes is the dominant general-purpose answer to all three, with an enormous surface area (deployments, services, ingress, operators, CRDs) built to handle arbitrary workloads at any scale." },
      { heading: "How Decentralized.Host answers the same three questions, much more narrowly", body: "Scheduling: a weighted picker chooses whichever healthy node currently has the lowest combined CPU+RAM load (control-plane/app/scheduler.py). Health checking: node agents heartbeat every few seconds; a node that's healthy, briefly stale, or has gone fully offline are three distinct, separately-tracked states. Rescheduling: since the automated-failover feature, a node that's been offline long enough (180s by default -- long enough that a Docker runtime restart doesn't false-trigger it) has its running deployments reassigned to a different healthy node, which pulls the already-built image straight from the mesh's shared registry, no rebuild required. What it doesn't do that Kubernetes does: multiple replicas of one app, rolling updates, arbitrary custom resources, or scheduling anything other than one container per deployment." }
    ]
  },
  {
    slug: 'kubernetes-tools', title: 'Kubernetes Tools', group: 'Decentralized Hosting',
    oneLine: 'The dominant open-source container orchestration platform and its surrounding ecosystem.',
    written: true, relatesToProduct: false,
    productNote: "Decentralized.Host doesn't use Kubernetes at all, and isn't a Kubernetes distribution -- it's a much smaller, single-purpose scheduler over plain Docker. See Container Orchestration Tools above for the honest comparison.",
    sections: [
      { heading: 'What Kubernetes actually is', body: 'Kubernetes (often "k8s") is a control plane for declaratively managing containerized workloads across a cluster of machines: you describe the desired state (run 3 replicas of this image, expose it on this port, mount this volume) in YAML, and Kubernetes\' controllers continuously reconcile the real cluster state toward that description -- restarting failed pods, rescheduling around a dead node, rolling out updates with configurable strategies. It originated at Google (based on their internal Borg system) and is now maintained by the CNCF.' },
      { heading: 'The real complexity tradeoff', body: 'Kubernetes\' generality is also its cost: a working cluster involves a control plane (API server, etcd, scheduler, controller manager), a networking model (CNI plugins, Services, Ingress controllers), and usually a whole ecosystem on top (Helm for packaging, cert-manager for TLS, an ingress controller, monitoring via Prometheus/Grafana) before it does anything a small team couldn\'t do more simply. Lighter distributions (K3s, K0s, MicroK8s) trim the packaging and footprint but keep the same conceptual model and most of the same operational surface. This is exactly the gap tools like Decentralized.Host, Coolify, or Dokploy exist in: for a team that just wants "git push, get a running container with a real URL and TLS," full Kubernetes is frequently more machinery than the problem needs.' }
    ]
  },
  { slug: 'docker-management-tools', title: 'Docker Management Tools', group: 'Decentralized Hosting', oneLine: 'Building, running, and operating Docker containers and images day to day.', written: true, relatesToProduct: true,
    productNote: 'Docker is the literal runtime Decentralized.Host is built on -- node agents talk to the Docker Engine directly via its API to build, run, and restart every deployed container.',
    sections: [
      { heading: 'The core Docker workflow', body: "Docker packages an application with its dependencies into an image (a layered, immutable filesystem snapshot built from a Dockerfile), which becomes a running container when started -- an isolated process tree with its own filesystem view, network namespace, and resource limits, sharing the host kernel rather than virtualizing a whole OS. Day-to-day management means building images (docker build), running and restarting containers (with restart policies so they survive a crash or host reboot), managing volumes for anything that needs to persist beyond a container's lifetime, and cleaning up unused images/layers before disk fills." },
      { heading: 'How Decentralized.Host actually drives Docker', body: 'Every node agent connects to its local Docker Engine (docker.from_env() in Python) and does three real things with it: builds an image from an uploaded source tarball plus a generated Dockerfile, pushes that image to the mesh\'s own shared registry (so any node can later pull and run it without rebuilding, including during automated failover), and runs it with a fixed resource cap (256MB RAM, 1 vCPU per deployment today) and restart_policy unless-stopped. A real bug this project found and fixed: Traefik\'s routing config used to bake in a container\'s IP at ship time, which goes stale the moment Docker reassigns IPs (e.g. after a host restart) -- fixed by routing to the container\'s name instead, resolved live via Docker\'s own embedded DNS.' }
    ]
  },
  {
    slug: 'database-hosting-tools', title: 'Database Hosting Tools', group: 'Decentralized Hosting',
    oneLine: 'Running and operating databases as a service, self-hosted or managed.',
    written: true, relatesToProduct: true,
    productNote: "Decentralized.Host's own control plane runs on a self-hosted PostgreSQL container -- it doesn't offer managed databases for deployed apps, but the dashboard's Sandbox tab can one-click-deploy real Postgres/MySQL/MariaDB instances through the same real pipeline.",
    sections: [
      { heading: 'Managed vs. self-hosted, the real tradeoff', body: "A managed database service (RDS, Neon, PlanetScale) handles provisioning, automated backups, patching, and failover for you, in exchange for a markup and less low-level control. Self-hosting means you run the database yourself (usually as a container or systemd service) -- cheaper, fully controllable, but every operational concern (backup schedule, disk monitoring, version upgrades, replication if you want it) becomes your responsibility rather than a vendor's SLA." },
      { heading: "What genuinely works today via Decentralized.Host", body: 'This is one of the more concrete, tested overlaps: the dashboard\'s Sandbox tab can deploy real postgres:16-alpine, mysql:8, and mariadb:11 images with one click, through the actual POST /deployments pipeline -- verified live by actually deploying Postgres this way and confirming its logs show "database system is ready to accept connections." This required adding real environment-variable passthrough to the deploy pipeline specifically because Postgres refuses to boot without POSTGRES_PASSWORD set -- a genuine gap that existed until this was built. What this still isn\'t: a managed database product. There\'s no automated backup, no replica, no migration tooling -- it\'s "run a real database container on the mesh," not "outsource your database operations."' }
    ]
  },
  { slug: 'email-server-tools', title: 'Email Server Tools', group: 'Decentralized Hosting', oneLine: 'Self-hosting SMTP/IMAP mail infrastructure.', written: false, relatesToProduct: false, productNote: 'No email hosting feature exists in Decentralized.Host.' },
  { slug: 'backup-recovery-tools', title: 'Backup & Recovery Tools', group: 'Decentralized Hosting', oneLine: 'Systems and practices for protecting data against loss and restoring it after failure.', written: false, relatesToProduct: false, productNote: 'Decentralized.Host has no automated backup/restore feature for deployed apps\' data today -- an accepted, honestly-documented gap.' },
  {
    slug: 'monitoring-logging-tools', title: 'Monitoring & Logging Tools', group: 'Decentralized Hosting',
    oneLine: 'Observing system health and capturing logs for debugging and alerting.',
    written: true, relatesToProduct: true,
    productNote: "The dashboard's Deployments view streams a container's last 200 log lines live, and node heartbeats report CPU/RAM -- real but basic; no long-term log retention, metrics history, or alerting exists yet.",
    sections: [
      { heading: 'Monitoring vs. logging, and why both matter', body: "Monitoring answers \"is the system healthy right now\" via numeric time-series (CPU%, request latency, error rate) that tools like Prometheus scrape and Grafana visualize, usually with alerting rules that page someone when a threshold is crossed. Logging answers \"what exactly happened\" -- discrete, timestamped events (a request came in, an exception was thrown) that you search after the fact to debug a specific incident. A mature setup has both: monitoring tells you something's wrong, logs tell you why." },
      { heading: "What this project actually has, and its real gaps", body: 'Node agents heartbeat their CPU/RAM every few seconds to the control plane (real, live telemetry the scheduler uses to place new deployments), and the dashboard\'s Deployments view fetches a container\'s last 200 log lines directly from its node agent on demand -- both genuinely working, verified throughout this project\'s own incident debugging (e.g. diagnosing the automated-failover feature\'s test runs by reading real container logs this exact way). What\'s honestly missing: no log retention beyond what Docker itself keeps for a running container, no historical metrics graphs, and no alerting -- when the mesh went down during this project\'s own development (a stopped Colima runtime), nothing paged anyone; it was found by manual checking, which is exactly why a local watchdog script and a separate scheduled external health check were added afterward.' }
    ]
  },
  { slug: 'performance-optimization-tools', title: 'Performance Optimization Tools', group: 'Decentralized Hosting', oneLine: 'Profiling and tuning infrastructure and application performance.', written: false, relatesToProduct: false, productNote: 'No performance-profiling feature exists in Decentralized.Host.' },
  {
    slug: 'security-hardening-tools', title: 'Security Hardening Tools', group: 'Decentralized Hosting',
    oneLine: 'Reducing attack surface and following secure-by-default configuration practices.',
    written: true, relatesToProduct: true,
    productNote: "The dhost engine's security-scan agent runs a real regex-based secret scan on every deploy and blocks anything it flags -- see /security/ for the full, honest scope of what is and isn't checked.",
    sections: [
      { heading: 'What hardening actually means in practice', body: 'It\'s rarely one big fix -- it\'s a long list of small defaults: SSH key-only login (no password auth), a firewall that denies by default and only opens needed ports, unattended security updates, containers running as non-root where possible, secrets kept out of source control and environment dumps, and dependencies kept patched. Automated scanners (Trivy for container images, git-secrets-style tools for source) catch some of this mechanically; the rest is discipline.' },
      { heading: "Decentralized.Host's own real security measures", body: 'The dhost engine runs a real, regex-based secret-scanning agent against every deployment\'s source before it ships -- if it flags a likely hardcoded credential, the deploy is refused outright, recorded as a failed release with the reason, not silently allowed through. This project also found and fixed a real secret-leak during its own development: a live deploy key was accidentally hardcoded in two MCP server test files, caught by grepping the working tree before a commit, not by any automated tool -- since fixed to read from the environment instead. Every container also runs with a fixed resource cap (256MB RAM, 1 vCPU) as a basic blast-radius limit. What\'s NOT built: no container-image vulnerability scanning, no non-root-by-default enforcement, no dependency-update automation for deployed apps -- real, current gaps, not hidden ones.' }
    ]
  },
  { slug: 'firewall-configuration-tools', title: 'Firewall Configuration Tools', group: 'Decentralized Hosting', oneLine: 'Controlling which network traffic is allowed to reach a server.', written: false, relatesToProduct: false, productNote: "Decentralized.Host doesn't configure host firewalls -- that's left to however you secure the machine a node agent runs on." },
  { slug: 'auto-scaling-tools', title: 'Auto-scaling Tools', group: 'Decentralized Hosting', oneLine: 'Automatically adding or removing capacity in response to load.', written: false, relatesToProduct: false, productNote: 'Decentralized.Host schedules onto whichever node has the most headroom at deploy time, but does not auto-scale a running app across multiple nodes in response to load.' },
  { slug: 'ci-cd-pipeline-tools', title: 'CI/CD Pipeline Tools', group: 'Decentralized Hosting', oneLine: 'Automating build, test, and deployment on every code change.', written: true, relatesToProduct: true,
    productNote: "Decentralized.Host's own git-push-to-deploy flow is a real, minimal CD pipeline; the project's own GitHub Actions workflows (marketing-site build/lint, Python compile checks, a daily live-mesh health check) are a separate, standard CI setup.",
    sections: [
      { heading: 'CI vs. CD, concretely', body: "Continuous Integration (CI) means every code change is automatically built and tested before it's trusted -- catching breakage the moment it's introduced rather than at release time. Continuous Deployment/Delivery (CD) means a change that passes CI is automatically pushed toward production (deployment) or made ready to release with one click (delivery). GitHub Actions, GitLab CI, Jenkins, and Buildkite are common engines for the CI half; how the CD half looks varies enormously by team." },
      { heading: "Decentralized.Host's own two, quite different pipelines", body: 'This project runs a standard CI setup on its own GitHub repo: a workflow lints and builds the marketing site, compile-checks every Python component (control-plane, node-agent, cli, blockchain) across a matrix, and -- since the mesh runs on the maintainer\'s own machine, not a cloud provider -- a separate daily scheduled workflow curls the live public mesh hostnames and fails loudly if any are down, since GitHub Actions has no way to reach into that machine and fix anything itself. The product\'s own CD story is what `dhost ship`/`git push` triggers: source gets built into a Docker image, pushed to the mesh\'s registry, and run -- with the caveat that this is single-environment (no staging/production split, no rollback beyond `dhost rollback <snapshot-id>` to redeploy an earlier local snapshot).' }
    ]
  },
  {
    slug: 'domain-management-tools', title: 'Domain Management Tools', group: 'Decentralized Hosting',
    oneLine: 'Registering, renewing, and configuring domain names.',
    written: true, relatesToProduct: true,
    productNote: 'decentralized.host itself is registered through Hostinger with Cloudflare as the authoritative nameserver -- ordinary domain management, no special tooling built for it.',
    sections: [
      { heading: 'The moving parts', body: "Owning a domain means three separable things: registration (paying a registrar to hold the name, renewed annually or it lapses), nameserver delegation (which DNS provider actually answers queries -- often different from the registrar, as with this project's own Hostinger-registered, Cloudflare-resolved setup), and the records themselves within that zone (A/CNAME for where traffic goes, CAA for which certificate authorities may issue TLS certs, MX for mail, TXT for verification/SPF/DKIM). Getting any one of these wrong independently breaks things in different ways -- a lapsed registration takes the domain down entirely; a wrong nameserver delegation makes your DNS provider's records irrelevant; a wrong record just breaks that one service." },
      { heading: 'A real lesson from operating this exact domain', body: 'This project hit a genuinely confusing incident worth documenting honestly: the mesh\'s subdomains appeared to be resolving inconsistently over a period of checks, looking like the Cloudflare zone itself was unstable. The actual cause, found by cross-checking Cloudflare\'s own authoritative nameservers directly alongside independent public resolvers (1.1.1.1, 8.8.8.8) rather than trusting a single local lookup: the authoritative records were correct and stable the whole time -- it was this specific machine\'s own ISP-level DNS cache serving stale answers. The practical lesson for anyone debugging "my DNS is broken": check the authoritative source and at least one independent resolver before concluding the zone itself is wrong.' }
    ]
  },

  // ---------- Web3 & Blockchain ----------
  {
    slug: 'smart-contract-tools', title: 'Smart Contract Tools', group: 'Web3 & Blockchain',
    oneLine: 'Writing, testing, deploying, and auditing on-chain contract code.',
    written: true, relatesToProduct: false,
    productNote: "Decentralized.Host's Solana integration mints existing SPL tokens via a Python client script -- it doesn't write or deploy custom smart contracts.",
    sections: [
      { heading: 'The real workflow', body: "Smart contracts (Solidity on EVM chains, Rust-based programs on Solana) are code that runs deterministically on-chain, where every node in the network executes it identically and agrees on the result. The real toolchain around this is substantial: a framework for compiling and testing locally against a simulated chain (Hardhat/Foundry for EVM, Anchor for Solana), a way to deploy to a real network, and -- because bugs here can directly mean stolen funds, unlike a normal app bug -- a real auditing discipline (static analysis tools, and for anything holding real value, a paid professional audit) before mainnet deployment." },
      { heading: "Where Decentralized.Host stands here, honestly", body: "This project does not write, compile, or deploy smart contracts at all. Its one blockchain feature -- minting SPL token credits for node operators -- calls Solana's existing, standard SPL Token program via a Python client library (solana-py/solders), the same well-audited program every SPL token uses; there's no custom on-chain logic written for this project. This distinction matters for anyone evaluating the security surface: minting via a standard, heavily-used program carries very different risk than deploying novel contract code would." }
    ]
  },
  {
    slug: 'wallet-management-tools', title: 'Wallet Management Tools', group: 'Web3 & Blockchain',
    oneLine: 'Generating, securing, and using cryptocurrency wallet keypairs.',
    written: true, relatesToProduct: true,
    productNote: "Node operators link a Solana devnet wallet address (dhost wallet <node_id> <pubkey>) to receive credits -- the control plane never holds a user's private key, only a payer keypair for minting on devnet.",
    sections: [
      { heading: 'The core security model', body: "A crypto wallet is fundamentally a keypair: a private key that can sign transactions (moving funds, approving actions) and a public key/address others can send to. \"Managing\" a wallet well means never exposing that private key -- hardware wallets keep it on a dedicated offline device, software wallets encrypt it at rest, and the cardinal rule (\"not your keys, not your coins\") is about custody: whoever holds the private key has full, unrecoverable control, with no password reset if it's lost." },
      { heading: "What this project actually holds, and doesn't", body: "Decentralized.Host's node-operator credit system is deliberately structured so the control plane never touches an operator's private key: an operator generates their own Solana keypair independently (standard solana-keygen or any wallet), then links only the public address to their node via dhost wallet <node_id> <pubkey>. The only private key the control plane itself holds is a separate payer keypair (SOLANA_PAYER_KEYPAIR_PATH), used purely to sign the minting transactions that send credits OUT to operators -- it never has custody of anyone else's funds. This is real devnet infrastructure with a genuine on-chain mint, not a simulation, but it's worth being precise about what \"wallet management\" means here: linking an address, not custodying a key." }
    ]
  },
  { slug: 'gas-estimation-tools', title: 'Gas Estimation Tools', group: 'Web3 & Blockchain', oneLine: 'Predicting transaction fees before submitting them on-chain.', written: false, relatesToProduct: false, productNote: 'No gas estimation feature exists in Decentralized.Host -- Solana devnet transactions it does send use devnet SOL from a free faucet.' },
  {
    slug: 'token-standards-tools', title: 'Token Standards Tools', group: 'Web3 & Blockchain',
    oneLine: 'Working with fungible/non-fungible token specifications (ERC-20, SPL, etc).',
    written: true, relatesToProduct: true,
    productNote: 'Decentralized.Host mints a real SPL token ("DHOST Credits") on Solana devnet -- a standard fungible-token mint, nothing custom.',
    sections: [
      { heading: 'What a token standard actually standardizes', body: 'A token standard is an interface contract: ERC-20 (Ethereum\'s fungible-token standard) guarantees any compliant token implements the same balanceOf/transfer/approve functions, so wallets and exchanges can support any ERC-20 token without custom integration work per token. ERC-721/1155 do the same for NFTs (unique, non-interchangeable tokens). Solana\'s SPL Token program plays the equivalent role on Solana -- one shared, audited program that any fungible or non-fungible token can be minted through, rather than every project deploying its own token logic from scratch.' },
      { heading: "Decentralized.Host's real usage", body: 'The project mints a real SPL fungible token ("DHOST Credits") using the standard SPL Token program -- not a custom contract, not a novel token design. Each mint is a genuine on-chain transaction with a real transaction signature and a working explorer.solana.com link (devnet cluster), recorded in a CreditLedger table so the dashboard\'s Credits tab shows an accurate history. This is real on-chain activity, worth being precise about the scope of: it\'s the simplest possible use of the token-standards ecosystem (mint-to-address via a standard program), not a demonstration of NFTs, custom tokenomics, or any of the more elaborate patterns this topic covers.' }
    ]
  },
  { slug: 'nft-metadata-tools', title: 'NFT Metadata Tools', group: 'Web3 & Blockchain', oneLine: 'Generating and pinning the JSON metadata standard NFTs point to.', written: false, relatesToProduct: false, productNote: 'No NFT feature exists in Decentralized.Host.' },
  { slug: 'defi-analytics-tools', title: 'DeFi Analytics Tools', group: 'Web3 & Blockchain', oneLine: 'Tracking yields, liquidity, and protocol activity across decentralized finance.', written: false, relatesToProduct: false, productNote: 'No DeFi feature exists in Decentralized.Host.' },
  { slug: 'bridge-monitoring-tools', title: 'Bridge Monitoring Tools', group: 'Web3 & Blockchain', oneLine: 'Watching cross-chain bridge activity and security.', written: false, relatesToProduct: false, productNote: 'No cross-chain bridge exists in Decentralized.Host -- it operates on Solana devnet only.' },
  { slug: 'node-management-tools', title: 'Node Management Tools', group: 'Web3 & Blockchain', oneLine: 'Running and maintaining blockchain full nodes or validators.', written: false, relatesToProduct: false, productNote: "Decentralized.Host's own \"nodes\" are Docker-hosting node agents, not blockchain nodes -- it connects to Solana's own public devnet RPC rather than running a validator." },
  {
    slug: 'blockchain-explorer-tools', title: 'Blockchain Explorer Tools', group: 'Web3 & Blockchain',
    oneLine: 'Browsing and searching on-chain transaction history.',
    written: true, relatesToProduct: true,
    productNote: "Every real credit mint links to a genuine explorer.solana.com transaction (devnet cluster) -- Decentralized.Host doesn't build its own explorer, it links to the real one.",
    sections: [
      { heading: 'What an explorer actually provides', body: "A blockchain explorer (Etherscan for Ethereum, Solscan/explorer.solana.com for Solana) indexes every transaction, block, and account on a chain into a searchable web UI -- since the raw chain data itself is just a sequence of encoded transactions, an explorer is what makes it human-readable: search a wallet address to see its balance and history, search a transaction signature to see exactly what it did and whether it succeeded, verify a contract's source code against its deployed bytecode. This is independent, third-party infrastructure -- no single project runs its own explorer for a whole chain; they index the public chain state." },
      { heading: 'How this project uses it, verifiably', body: 'Every real credit mint this project performs returns a genuine transaction signature from Solana\'s devnet cluster, and the control plane constructs a real, clickable explorer.solana.com link from it (with ?cluster=devnet, since devnet transactions don\'t appear on the mainnet explorer view by default) -- visible in the dashboard\'s Credits tab and returned by GET /blockchain/credits/{node_id}. This is a deliberate design choice worth noting: rather than building any kind of custom transaction-history UI, the project just links to the real, canonical, independently-verifiable record -- anyone can click through and confirm a mint actually happened, rather than trusting a number in this project\'s own database.' }
    ]
  },
  {
    slug: 'ipfs-tools', title: 'IPFS Tools', group: 'Web3 & Blockchain',
    oneLine: 'Working with the InterPlanetary File System -- adding, pinning, and retrieving content-addressed files.',
    written: true, relatesToProduct: false,
    productNote: "Decentralized.Host does not use IPFS -- explicitly, in its own FAQ: it's a Docker deployment mesh, not a blockchain storage network. See the /faq/ page's direct answer on this.",
    sections: [
      { heading: 'The basics', body: 'IPFS identifies content by the hash of its bytes (a CID), not by a location, so the same file added from two different machines produces the same identifier. Nodes running the IPFS daemon (kubo is the reference implementation) can fetch content from any peer that has it, and "pinning" a CID tells your own node (or a pinning service) to keep a copy so it doesn\'t disappear if the original uploader goes offline. Kubo\'s official Docker image (ipfs/kubo) is genuinely simple to run standalone -- it initializes its own repo and starts serving its gateway and RPC API with zero required configuration, which made it one of the few third-party tools that deployed cleanly, with no arguments or config file, when this project\'s dashboard Sandbox feature tested a batch of well-known Docker images against its own mesh.' },
      { heading: 'Where this fits (and doesn\'t) with Decentralized.Host', body: "This distinction matters enough that the project's own FAQ addresses it head-on: despite the name, \"Decentralized\" in Decentralized.Host refers to distributing container workloads across independently operated compute nodes, not to content-addressed storage -- there's no IPFS dependency anywhere in the control plane, node agent, or CLI. If you want to actually run an IPFS node, the dashboard's Sandbox tab can deploy the real ipfs/kubo image with one click (verified live) -- but that's IPFS running as one more deployed app on the mesh, not something the mesh itself is built on." }
    ]
  },
  { slug: 'ens-management-tools', title: 'ENS Management Tools', group: 'Web3 & Blockchain', oneLine: 'Registering and managing Ethereum Name Service domains and records.', written: false, relatesToProduct: false, productNote: 'No ENS integration exists in Decentralized.Host -- ordinary DNS is used for the real domain.' },
  { slug: 'dao-governance-tools', title: 'DAO Governance Tools', group: 'Web3 & Blockchain', oneLine: 'On-chain proposal and voting systems for decentralized organizations.', written: false, relatesToProduct: false, productNote: 'Decentralized.Host has a single operator, not a DAO -- no governance system exists.' },
  { slug: 'staking-calculator-tools', title: 'Staking Calculator Tools', group: 'Web3 & Blockchain', oneLine: 'Estimating returns from staking tokens to secure a network.', written: false, relatesToProduct: false, productNote: 'No staking feature exists in Decentralized.Host -- node-operator credits are earned via uptime heartbeats, not by staking anything.' },
  { slug: 'yield-farming-tools', title: 'Yield Farming Tools', group: 'Web3 & Blockchain', oneLine: 'Optimizing returns across DeFi lending and liquidity protocols.', written: false, relatesToProduct: false, productNote: 'No DeFi/yield feature exists in Decentralized.Host.' },
  { slug: 'multi-sig-wallet-tools', title: 'Multi-sig Wallet Tools', group: 'Web3 & Blockchain', oneLine: 'Requiring multiple signatures to authorize a transaction.', written: false, relatesToProduct: false, productNote: 'No multi-sig feature exists in Decentralized.Host -- the devnet payer keypair is a single key.' },
  {
    slug: 'signature-verification-tools', title: 'Signature Verification Tools', group: 'Web3 & Blockchain',
    oneLine: 'Confirming a message or transaction was really signed by a given key.',
    written: true, relatesToProduct: true,
    productNote: "SSH public-key signatures authenticate every git push to the mesh's git server -- standard SSH auth, not a custom crypto-signature scheme, but the same underlying cryptographic idea.",
    sections: [
      { heading: 'The underlying cryptography', body: 'Digital signatures all rest on the same asymmetric-cryptography foundation regardless of context: a private key signs a piece of data, producing a signature that anyone holding the corresponding public key can verify -- confirming both that the claimed signer really produced it (authenticity) and that the data hasn\'t been altered since (integrity), without the verifier ever needing the private key itself. Ethereum wallet signatures ("sign this message to prove you own this address"), Bitcoin transaction signatures, and SSH key authentication are all applications of this same core primitive, just with different key formats and signing algorithms (ECDSA/secp256k1 for most crypto wallets, Ed25519 increasingly common for SSH and Solana).' },
      { heading: "The real signature verification in this project", body: "Every git push to Decentralized.Host's git server is authenticated by exactly this mechanism: your SSH client signs the connection with your private key, and the server verifies it against a public key from its authorized-keys allowlist before granting access -- standard OpenSSH, not custom code. Solana transactions (the credit-minting mints) are similarly signature-verified by Solana's own runtime using Ed25519, using the payer keypair's signature -- again, existing, standard infrastructure this project calls into rather than reimplements. Worth being precise: no custom signature scheme exists anywhere in this project; it uses two different, well-established ones (SSH and Solana's native Ed25519) for their respective real purposes." }
    ]
  },
  { slug: 'abi-encoder-decoder-tools', title: 'ABI Encoder/Decoder Tools', group: 'Web3 & Blockchain', oneLine: 'Converting between human-readable contract calls and the binary format the EVM expects.', written: false, relatesToProduct: false, productNote: 'No EVM/ABI interaction exists in Decentralized.Host -- its one blockchain integration is Solana, which doesn\'t use ABI encoding.' },
  { slug: 'transaction-simulator-tools', title: 'Transaction Simulator Tools', group: 'Web3 & Blockchain', oneLine: 'Dry-running a transaction to predict its effects before submitting it.', written: false, relatesToProduct: false, productNote: 'No transaction simulation feature exists in Decentralized.Host.' },
  { slug: 'gas-optimization-tools', title: 'Gas Optimization Tools', group: 'Web3 & Blockchain', oneLine: 'Reducing the on-chain execution cost of contract code.', written: false, relatesToProduct: false, productNote: 'No smart-contract code exists in Decentralized.Host to optimize.' },
  { slug: 'web3-authentication-tools', title: 'Web3 Authentication Tools', group: 'Web3 & Blockchain', oneLine: '"Sign in with wallet" flows using a cryptographic signature instead of a password.', written: false, relatesToProduct: false, productNote: 'Decentralized.Host has no user login system, wallet-based or otherwise -- a single shared deploy key authenticates every API call.' },

  // ---------- Platform (meta pillars) ----------
  // Mapped to what actually exists, not the "app.decentralized.host" domain
  // from the original pasted mockup -- that subdomain doesn't exist for
  // this product. The real equivalent is dashboard.decentralized.host
  // (OpenGit Console) plus the dhost CLI, documented in /docs/.
  { slug: 'decentralized-studio', title: 'Decentralized Studio', group: 'Platform', oneLine: 'The real web console for running your own mesh -- OpenGit Console, at dashboard.decentralized.host.', written: false, relatesToProduct: true, productNote: 'Maps to the real, working dashboard (README calls it OpenGit Console): Deployments with live logs, Git Manager, Mesh Nodes, Credits, a Sandbox of one-click deployable open-source tools, and Settings. There is no separate "app.decentralized.host" -- that was invented in an earlier pasted mockup, not real.' },
  { slug: 'openhost', title: 'OpenHost', group: 'Platform', oneLine: 'Self-host your own mesh -- the actual getting-started path, not a separate product.', written: false, relatesToProduct: true, productNote: 'This is just Decentralized.Host itself -- "OpenHost" isn\'t a distinct product, it\'s this pillar directory\'s name for "go read the real getting-started docs and run docker compose up."' },
  { slug: 'downloads', title: 'Downloads', group: 'Platform', oneLine: 'Getting the dhost CLI and cloning the mesh itself.', written: false, relatesToProduct: true, productNote: 'There\'s no standalone binary to download -- the CLI installs via `pip install -e ./cli` from a git clone, documented in the README. Honest framing: this is a "clone and install" page, not a downloads page with release artifacts.' },
  { slug: 'how-it-works', title: 'How It Works', group: 'Platform', oneLine: 'The real deployment pipeline: ship → detect → build → schedule → route → monitor.', written: false, relatesToProduct: true, productNote: 'Maps to the real /architecture/ page -- control plane, node agents, scheduler, and Traefik routing, with real source file references.' },
  { slug: 'use-cases', title: 'Use Cases', group: 'Platform', oneLine: 'What Decentralized.Host is actually good for today.', written: false, relatesToProduct: true, productNote: 'Maps to the real /features/ page\'s verified capability matrix -- no separate use-cases page exists yet.' },
  { slug: 'documentation', title: 'Documentation', group: 'Platform', oneLine: 'Full CLI and API reference.', written: false, relatesToProduct: true, productNote: 'Maps directly to the real, existing /docs/ page.' },
  { slug: 'guides', title: 'Guides', group: 'Platform', oneLine: 'Step-by-step walkthroughs for real workflows.', written: false, relatesToProduct: true, productNote: 'Maps directly to the real, existing /guides/ page.' },
  { slug: 'blog', title: 'Blog', group: 'Platform', oneLine: 'Engineering updates and release notes.', written: false, relatesToProduct: false, productNote: 'Honestly: this doesn\'t exist yet. No blog has been built for Decentralized.Host -- listed here as a real gap, not linked to fabricated content.' },
  { slug: 'pillars', title: 'Pillar Directory', group: 'Platform', oneLine: 'Browse all 69 topic pillars in one place.', written: false, relatesToProduct: true, productNote: 'This is the real, working directory page you\'re looking at (or its index) -- see /pillars/.' },
];

export const PILLAR_GROUPS: PillarGroup[] = ['Decentralized Infrastructure', 'Decentralized Hosting', 'Web3 & Blockchain', 'Platform'];

export function getPillar(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slug === slug);
}
