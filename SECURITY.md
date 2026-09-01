# Security Policy

decentralized.host is a self-hosted platform: you run your own control plane, node agents, and git server, on your own infrastructure. There is no hosted multi-tenant service operated by this project, so most security issues are found and fixed directly in the source.

## Reporting a vulnerability

Please report security issues privately via [GitHub Security Advisories](https://github.com/CodesbyFebin/decentralized.host/security/advisories/new) rather than opening a public issue. Include:

- The affected component (`control-plane`, `node-agent`, `cli`, `git-server`, or `blockchain`)
- Steps to reproduce
- The potential impact

There is no bug bounty program and no guaranteed response-time SLA — this is a small open-source project, not a funded security team. Reports will be acknowledged and addressed on a best-effort basis.

## Scope notes

This is a single-operator trust model by design: one shared deploy key, one shared node-join secret, and any registered SSH key can push to any repo on a given git server instance. That is documented, intentional scope (see the README's "What's not real yet" section and the [security architecture page](https://decentralized.host/security/)), not something to report as a novel finding on its own — but a way to *bypass* those boundaries (e.g. an unauthenticated request reaching a protected endpoint, a container escaping its Docker isolation, a path-traversal in the git server's repo-name handling) is exactly what this policy covers.
