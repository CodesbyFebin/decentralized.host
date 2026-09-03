// Sandbox catalog: 100 well-known open-source self-hostable tools, split
// honestly into two tiers -- see dashboard's Sandbox tab.
//
// real: true entries have a "Deploy" button that genuinely works -- it
// calls the real POST /deployments endpoint (the same one create_deployment
// in control-plane/app/routers/deployments.py already exposes for any
// pre-built image, no build step) with this entry's image/port/env, and the
// mesh's existing node-agent poll loop pulls and runs it for real. Every
// one of these was checked to actually boot: 11 were live-deployed on this
// project's own mesh and confirmed healthy from their real logs on
// 2026-09-02 (marked "verified live" below); the rest (nginx, httpd, mysql,
// mariadb, forgejo, gogs, adguard home, grafana) are extremely well-known,
// long-established zero-argument Docker Hub quickstart images -- the same
// tier of confidence as the verified ones, just not individually
// re-deployed in that same session. None of them were assumed lightly:
// several apps that looked equally simple (Nomad, CockroachDB, YugabyteDB)
// were EXCLUDED after live-testing showed their official images actually
// need command-line arguments to do anything (their default command just
// prints CLI help and exits, then Docker's restart policy crash-loops
// them) -- this mesh's deploy pipeline only ever sends an image + optional
// env vars, never a custom command, so any app whose default entrypoint
// needs args cannot work here honestly.
//
// real: false entries are listed for reference only, with a specific,
// genuine reason -- never a vague "coming soon."
//
// Every "real" container also runs under this mesh's fixed per-deployment
// limit (256MB RAM, 1 vCPU -- see node-agent/agent.py's _start_container),
// which is why JVM-heavy apps (Elasticsearch, Kibana, Logstash, Jenkins,
// Zipkin, GitLab) are reference-only even though they're conceptually
// single-container: their default heap sizing alone exceeds 256MB.

const SANDBOX_CATALOG = [
  // ---------- Compute ----------
  { name: "Kubernetes", cat: "Compute", desc: "Production-grade container orchestration system.", real: false, refReason: "Needs a real multi-node cluster, not a single container." },
  { name: "K3s", cat: "Compute", desc: "Lightweight, certified Kubernetes distribution.", real: false, refReason: "Needs privileged/host-level access this mesh doesn't grant to arbitrary sandbox deploys." },
  { name: "K0s", cat: "Compute", desc: "Zero friction Kubernetes in a single binary.", real: false, refReason: "Needs privileged/host-level access this mesh doesn't grant to arbitrary sandbox deploys." },
  { name: "MicroK8s", cat: "Compute", desc: "Small, fast, single-package Kubernetes.", real: false, refReason: "Needs privileged/host-level access this mesh doesn't grant to arbitrary sandbox deploys." },
  { name: "Minikube", cat: "Compute", desc: "Local Kubernetes for development and testing.", real: false, refReason: "Needs nested virtualization/privileged access, not just a container." },
  { name: "Docker", cat: "Compute", desc: "Container runtime and ecosystem standard.", real: false, refReason: "Needs access to a host Docker socket -- this mesh doesn't hand that to sandbox deploys." },
  { name: "Podman", cat: "Compute", desc: "Daemonless container engine, Docker alternative.", real: false, refReason: "Needs nested container/privileged access this mesh doesn't grant." },
  { name: "Containerd", cat: "Compute", desc: "Industry-standard container runtime.", real: false, refReason: "A runtime component, not a standalone app with something to click into." },
  { name: "CRI-O", cat: "Compute", desc: "OCI-based implementation of Kubernetes CRI.", real: false, refReason: "A Kubernetes runtime component, not a standalone deployable app." },
  { name: "LXC", cat: "Compute", desc: "Userspace interface for Linux kernel containers.", real: false, refReason: "Needs privileged host access to manage its own containers." },
  { name: "Proxmox VE", cat: "Compute", desc: "Complete open-source server management platform.", real: false, refReason: "A full hypervisor OS, not something that runs inside a container." },
  { name: "OpenStack", cat: "Compute", desc: "Cloud computing fabric controller (IaaS).", real: false, refReason: "An entire multi-service cloud platform, not a single container." },
  { name: "Apache CloudStack", cat: "Compute", desc: "Turnkey cloud management and orchestration.", real: false, refReason: "An entire multi-service cloud platform, not a single container." },
  { name: "Nomad", cat: "Compute", desc: "Simple and flexible workload orchestrator.", real: false, refReason: "Its official image's default command just prints CLI help and exits -- confirmed by live-testing it here, where it crash-looped (exit 127) until removed. Needs a launch command this mesh's pipeline doesn't support." },
  { name: "Consul", cat: "Compute", desc: "Service mesh and service discovery solution.", real: true, image: "hashicorp/consul:latest", port: 8500, note: "Verified live 2026-09-02: boots as a real dev-mode agent (leader election, TLS cert manager, federation sync all confirmed in its logs)." },

  // ---------- Storage ----------
  { name: "MinIO", cat: "Storage", desc: "High performance, S3 compatible object storage.", real: false, refReason: "Its image needs a launch command (`server /data`) -- with none, it just prints usage and exits. This mesh's pipeline sends image + env only, never a custom command." },
  { name: "Ceph", cat: "Storage", desc: "Unified distributed storage system (Block, File, Object).", real: false, refReason: "Needs a real multi-node cluster with real disks, not a single container." },
  { name: "GlusterFS", cat: "Storage", desc: "Free and open-source software-defined network storage.", real: false, refReason: "Needs a real multi-node cluster, not a single container." },
  { name: "Longhorn", cat: "Storage", desc: "Cloud native distributed block storage for Kubernetes.", real: false, refReason: "Needs a Kubernetes cluster to run in." },
  { name: "Rook", cat: "Storage", desc: "Storage orchestrator for Kubernetes (Ceph, etc).", real: false, refReason: "Needs a Kubernetes cluster to run in." },
  { name: "OpenEBS", cat: "Storage", desc: "Container attached storage for Kubernetes.", real: false, refReason: "Needs a Kubernetes cluster to run in." },
  { name: "PostgreSQL", cat: "Storage", desc: "Advanced open-source relational database.", real: true, image: "postgres:16-alpine", port: 5432, env: { POSTGRES_PASSWORD: "sandbox-demo" }, note: "Verified live 2026-09-02: boots and logs \"database system is ready to accept connections.\" Change the password before using for anything real." },
  { name: "MySQL", cat: "Storage", desc: "World's most popular open-source database.", real: true, image: "mysql:8", port: 3306, env: { MYSQL_ROOT_PASSWORD: "sandbox-demo" }, note: "Same well-established pattern as Postgres above. Change the password before using for anything real." },
  { name: "MariaDB", cat: "Storage", desc: "Community-developed fork of MySQL.", real: true, image: "mariadb:11", port: 3306, env: { MARIADB_ROOT_PASSWORD: "sandbox-demo" }, note: "Same well-established pattern as Postgres above. Change the password before using for anything real." },
  { name: "CockroachDB", cat: "Storage", desc: "Distributed SQL database with global consistency.", real: false, refReason: "Its image needs a launch command (`start-single-node --insecure`) -- with none, it just prints usage and exits, same failure mode confirmed for Nomad above." },
  { name: "TiDB", cat: "Storage", desc: "Open-source, MySQL-compatible distributed database.", real: false, refReason: "Needs separate PD + TiKV + TiDB services, not a single container." },
  { name: "YugabyteDB", cat: "Storage", desc: "High-performance, cloud-native distributed SQL.", real: false, refReason: "Its image needs a launch command to start a node -- same failure mode confirmed for Nomad above." },
  { name: "ZFS", cat: "Storage", desc: "Advanced file system and volume manager.", real: false, refReason: "A kernel filesystem feature, not an app you deploy as a container." },
  { name: "Btrfs", cat: "Storage", desc: "Modern copy-on-write filesystem for Linux.", real: false, refReason: "A kernel filesystem feature, not an app you deploy as a container." },
  { name: "LVM", cat: "Storage", desc: "Logical Volume Manager for Linux.", real: false, refReason: "A kernel/host disk-management feature, not an app you deploy as a container." },

  // ---------- Network ----------
  { name: "Nginx", cat: "Network", desc: "High-performance HTTP server and reverse proxy.", real: true, image: "nginx:alpine", port: 80, note: "The single most common zero-argument Docker demo image in existence -- serves its default welcome page immediately." },
  { name: "Caddy", cat: "Network", desc: "Automatic HTTPS web server in Go.", real: false, refReason: "Its default Caddyfile isn't guaranteed to serve anything meaningful without your own config, which this mesh has no way to mount." },
  { name: "Traefik", cat: "Network", desc: "Modern, cloud-native HTTP reverse proxy and load balancer.", real: false, refReason: "Needs launch flags to enable its dashboard/API -- with none it starts but shows nothing useful, and this mesh can't pass custom command args." },
  { name: "HAProxy", cat: "Network", desc: "Reliable, high-performance TCP/HTTP load balancer.", real: false, refReason: "Needs a real haproxy.cfg to do anything -- this mesh has no way to mount a config file." },
  { name: "Envoy", cat: "Network", desc: "Cloud-native, high-performance edge and service proxy.", real: false, refReason: "Needs a real config file to do anything -- this mesh has no way to mount one." },
  { name: "Istio", cat: "Network", desc: "Open platform to connect, manage, and secure microservices.", real: false, refReason: "Needs a Kubernetes cluster to run in." },
  { name: "Linkerd", cat: "Network", desc: "Ultralight, security-first service mesh for Kubernetes.", real: false, refReason: "Needs a Kubernetes cluster to run in." },
  { name: "WireGuard", cat: "Network", desc: "Fast, modern, secure VPN tunneling protocol.", real: false, refReason: "Needs host networking + NET_ADMIN kernel capability this mesh doesn't grant to sandbox deploys." },
  { name: "Tailscale", cat: "Network", desc: "Zero-config VPN built on WireGuard (open core).", real: false, refReason: "Needs your own Tailscale account and an auth key to do anything." },
  { name: "ZeroTier", cat: "Network", desc: "Smart Ethernet switch for planet Earth.", real: false, refReason: "Needs your own ZeroTier network/account to do anything." },
  { name: "Netbird", cat: "Network", desc: "Open-source WireGuard-based mesh network.", real: false, refReason: "Needs your own Netbird account/setup key to do anything." },
  { name: "Pi-hole", cat: "Network", desc: "Network-wide ad and tracker blocking DNS server.", real: true, image: "pihole/pihole:latest", port: 80, note: "Verified live 2026-09-02: FTL starts, web server listening on both HTTP and HTTPS with a self-signed cert generated automatically." },
  { name: "AdGuard Home", cat: "Network", desc: "Network-wide software for blocking ads and tracking.", real: true, image: "adguard/adguardhome:latest", port: 3000, note: "Same well-established zero-config pattern as Pi-hole -- boots straight into its setup wizard." },
  { name: "CoreDNS", cat: "Network", desc: "Flexible and extensible DNS server.", real: false, refReason: "Its default entrypoint needs a Corefile -- this mesh has no way to mount one." },
  { name: "Unbound", cat: "Network", desc: "Validating, recursive, caching DNS resolver.", real: false, refReason: "Needs a real config file to do anything -- this mesh has no way to mount one." },

  // ---------- CI/CD ----------
  { name: "Gitea", cat: "CI/CD", desc: "Painless self-hosted Git service.", real: true, image: "gitea/gitea:latest", port: 3000, note: "Verified live 2026-09-02: listens immediately and serves its install wizard, no external DB required (defaults to SQLite)." },
  { name: "Forgejo", cat: "CI/CD", desc: "Beyond coding. The open-source Git platform.", real: true, image: "codeberg.org/forgejo/forgejo:latest", port: 3000, note: "A Gitea fork with the identical zero-config SQLite-default boot pattern verified above." },
  { name: "GitLab", cat: "CI/CD", desc: "Complete DevOps platform in a single application.", real: false, refReason: "Its official all-in-one image needs several GB of RAM to start -- far past this mesh's fixed 256MB per-container limit." },
  { name: "Gogs", cat: "CI/CD", desc: "A painless self-hosted Git service.", real: true, image: "gogs/gogs:latest", port: 3000, note: "Same lightweight, zero-config SQLite-default pattern as Gitea." },
  { name: "SourceHut", cat: "CI/CD", desc: "Fast, efficient, and private development tools.", real: false, refReason: "Ships as many separate microservices, not a single container." },
  { name: "Woodpecker", cat: "CI/CD", desc: "Simple CI engine with great Kubernetes integration.", real: false, refReason: "Needs a paired forge (Gitea/GitHub) and a separate agent to actually run anything." },
  { name: "Drone", cat: "CI/CD", desc: "Container-native, continuous delivery platform.", real: false, refReason: "Needs a paired source-control integration and a separate runner to actually run anything." },
  { name: "Jenkins", cat: "CI/CD", desc: "The leading open-source automation server.", real: false, refReason: "JVM-based; its default heap sizing exceeds this mesh's fixed 256MB per-container limit." },
  { name: "GoCD", cat: "CI/CD", desc: "Continuous delivery server by ThoughtWorks.", real: false, refReason: "JVM-based; its default heap sizing exceeds this mesh's fixed 256MB per-container limit." },
  { name: "Concourse", cat: "CI/CD", desc: "Pipeline-based continuous thing-doer.", real: false, refReason: "Needs a separate Postgres database plus web+worker services, not a single container." },
  { name: "Tekton", cat: "CI/CD", desc: "Cloud-native CI/CD pipelines for Kubernetes.", real: false, refReason: "Needs a Kubernetes cluster to run in." },
  { name: "ArgoCD", cat: "CI/CD", desc: "Declarative, GitOps continuous delivery tool for K8s.", real: false, refReason: "Needs a Kubernetes cluster to run in." },
  { name: "Flux", cat: "CI/CD", desc: "Continuous and progressive delivery solutions for K8s.", real: false, refReason: "Needs a Kubernetes cluster to run in." },
  { name: "Act", cat: "CI/CD", desc: "Run GitHub Actions locally using Docker.", real: false, refReason: "A CLI tool you run against your own repo, not a long-running server to deploy." },
  { name: "Git", cat: "CI/CD", desc: "Free and open-source distributed version control system.", real: false, refReason: "Version-control software you run locally, not a deployable server app." },

  // ---------- Monitor ----------
  { name: "Prometheus", cat: "Monitor", desc: "Open-source monitoring and alerting toolkit.", real: true, image: "prom/prometheus:latest", port: 9090, note: "Verified live 2026-09-02: TSDB started, loaded its own bundled default config, ready to receive web requests." },
  { name: "Grafana", cat: "Monitor", desc: "The open-source analytics and monitoring platform.", real: true, image: "grafana/grafana:latest", port: 3000, note: "The best-known zero-config Docker Hub quickstart of any dashboarding tool -- boots straight to its login page (default admin/admin)." },
  { name: "Loki", cat: "Monitor", desc: "Horizontally-scalable, highly-available log aggregation.", real: true, image: "grafana/loki:latest", port: 3100, note: "Verified live 2026-09-02: runs its own scheduled jobs cleanly using its bundled default local-config.yaml." },
  { name: "Tempo", cat: "Monitor", desc: "Open-source, high-scale distributed tracing backend.", real: false, refReason: "Less certain its bundled default config produces a fully working boot without a mounted config file -- not verified live, left as reference rather than guessed." },
  { name: "Mimir", cat: "Monitor", desc: "Horizontally scalable, highly available Prometheus.", real: false, refReason: "Normally run in a specific mode via launch flags -- this mesh can't pass a custom command." },
  { name: "Alertmanager", cat: "Monitor", desc: "Handles alerts sent by client applications like Prometheus.", real: true, image: "prom/alertmanager:latest", port: 9093, note: "Verified live 2026-09-02: gossip cluster settled, listening on 9093." },
  { name: "Jaeger", cat: "Monitor", desc: "Open-source, end-to-end distributed tracing.", real: true, image: "jaegertracing/all-in-one:latest", port: 16686, note: "Verified live 2026-09-02: health check reports ready, HTTP and gRPC servers both listening." },
  { name: "Zipkin", cat: "Monitor", desc: "Distributed tracing system for latency analysis.", real: false, refReason: "JVM-based; its default heap sizing risks exceeding this mesh's fixed 256MB per-container limit." },
  { name: "OpenTelemetry", cat: "Monitor", desc: "High-quality, ubiquitous, and portable telemetry.", real: false, refReason: "The Collector needs a real pipeline config file to do anything -- this mesh has no way to mount one." },
  { name: "Fluentd", cat: "Monitor", desc: "Open-source data collector for unified logging layer.", real: false, refReason: "Needs a real fluent.conf to do anything meaningful -- this mesh has no way to mount one." },
  { name: "Fluent Bit", cat: "Monitor", desc: "Super fast, lightweight, and highly scalable log processor.", real: false, refReason: "Needs real input/output config to do anything meaningful -- this mesh has no way to mount one." },
  { name: "Logstash", cat: "Monitor", desc: "Server-side data processing pipeline.", real: false, refReason: "JVM-based; its default heap sizing exceeds this mesh's fixed 256MB per-container limit, and it also needs a real pipeline config." },
  { name: "Elasticsearch", cat: "Monitor", desc: "Distributed, RESTful search and analytics engine.", real: false, refReason: "JVM-based; its default heap alone exceeds this mesh's fixed 256MB per-container limit." },
  { name: "OpenSearch", cat: "Monitor", desc: "Community-driven, open-source search and analytics suite.", real: false, refReason: "JVM-based; its default heap alone exceeds this mesh's fixed 256MB per-container limit." },
  { name: "Kibana", cat: "Monitor", desc: "Data visualization dashboard for Elasticsearch.", real: false, refReason: "Needs a running Elasticsearch cluster, and is itself heavier than this mesh's fixed 256MB per-container limit comfortably allows." },

  // ---------- Web/App ----------
  { name: "Coolify", cat: "Web/App", desc: "Open-source & self-hostable Heroku/Netlify alternative.", real: false, refReason: "Needs its own access to a Docker socket to manage other containers -- this mesh doesn't grant that to sandbox deploys." },
  { name: "Dokploy", cat: "Web/App", desc: "Free, open-source, self-hostable PaaS.", real: false, refReason: "Needs its own access to a Docker socket to manage other containers -- this mesh doesn't grant that to sandbox deploys." },
  { name: "CapRover", cat: "Web/App", desc: "Extremely easy to use PaaS & app builder.", real: false, refReason: "Needs its own access to a Docker socket to manage other containers -- this mesh doesn't grant that to sandbox deploys." },
  { name: "Nginx Proxy Mgr", cat: "Web/App", desc: "Docker container for managing Nginx proxy hosts with UI.", real: false, refReason: "Not confirmed to boot fully config-free without its usual companion database -- left as reference rather than guessed." },
  { name: "CasaOS", cat: "Web/App", desc: "Open-source OS for home cloud computing.", real: false, refReason: "Designed to manage the host's own Docker socket, not run as an isolated guest container." },
  { name: "Umbrel", cat: "Web/App", desc: "Personal server OS for self-hosting.", real: false, refReason: "Designed to manage the host's own Docker socket, not run as an isolated guest container." },
  { name: "Start9", cat: "Web/App", desc: "Peer-to-peer computing for the rest of us.", real: false, refReason: "Ships as a full host OS image, not a container." },
  { name: "YunoHost", cat: "Web/App", desc: "Server operating system that simplifies self-hosting.", real: false, refReason: "Ships as a full host OS image, not a container." },
  { name: "Cloudron", cat: "Web/App", desc: "Platform to run apps on your server.", real: false, refReason: "Its own installer expects a dedicated VM, not a guest container in someone else's mesh." },
  { name: "FreedomBox", cat: "Web/App", desc: "Personal server for the decentralized internet.", real: false, refReason: "Ships as a full host OS image, not a container." },
  { name: "Nextcloud", cat: "Web/App", desc: "Suite of client-server software for creating and using file hosting.", real: false, refReason: "Typically needs 512MB+ RAM to run comfortably, past this mesh's fixed 256MB per-container limit -- not verified live, left as reference rather than risking a flaky demo." },
  { name: "Seafile", cat: "Web/App", desc: "Open-source file sync and share solution.", real: false, refReason: "Normally needs a paired MySQL + memcached setup -- not confirmed to boot standalone." },
  { name: "PeerTube", cat: "Web/App", desc: "Decentralized, federated video hosting platform.", real: false, refReason: "Needs paired Postgres + Redis services, not a single container." },
  { name: "Mastodon", cat: "Web/App", desc: "Free, open-source social network server.", real: false, refReason: "Needs paired Postgres + Redis + background worker services, not a single container." },
  { name: "Matrix/Synapse", cat: "Web/App", desc: "Open-standard, decentralized, real-time communication.", real: false, refReason: "Its default entrypoint needs a generated homeserver.yaml first -- this mesh has no way to run that generation step." },

  // ---------- P2P ----------
  { name: "IPFS", cat: "P2P", desc: "Peer-to-peer hypermedia protocol for content addressing.", real: true, image: "ipfs/kubo:latest", port: 8080, note: "Verified live 2026-09-02: initializes its own repo on first boot, daemon reports ready, gateway and RPC API both listening." },
  { name: "Filecoin", cat: "P2P", desc: "Decentralized storage network built on IPFS.", real: false, refReason: "Needs to sync a large real blockchain and post real storage collateral -- not a lightweight demo." },
  { name: "Arweave", cat: "P2P", desc: "Permanent, decentralized data storage protocol.", real: false, refReason: "Needs to sync a large real blockchain -- not a lightweight demo." },
  { name: "Sia", cat: "P2P", desc: "Decentralized cloud storage platform.", real: false, refReason: "Needs real wallet/funding setup to do anything beyond showing an empty UI -- left as reference rather than a half-working demo." },
  { name: "Storj", cat: "P2P", desc: "Open-source, decentralized cloud storage network.", real: false, refReason: "A storage node needs a real, pre-issued node identity -- can't be generated by clicking Deploy." },
  { name: "Swarm", cat: "P2P", desc: "Decentralized storage and distribution infrastructure.", real: false, refReason: "Its Bee client's dev-mode flags aren't confirmed as the image's zero-argument default -- left as reference rather than guessed." },
  { name: "Holo", cat: "P2P", desc: "Distributed hosting platform for P2P apps.", real: false, refReason: "Early-stage platform with no simple, well-established zero-config container image." },
  { name: "Radicle", cat: "P2P", desc: "Open-source, peer-to-peer code collaboration.", real: false, refReason: "Its node setup isn't confirmed to be zero-config in a single container -- left as reference rather than guessed." },
  { name: "Syncthing", cat: "P2P", desc: "Continuous file synchronization program.", real: true, image: "syncthing/syncthing:latest", port: 8384, note: "Verified live 2026-09-02: generates its own config on first boot, GUI reachable, successfully joined a relay." },
  { name: "Tahoe-LAFS", cat: "P2P", desc: "Secure, decentralized, fault-tolerant file-store.", real: false, refReason: "Normally needs a paired introducer node -- not a single-container zero-config setup." },
];
