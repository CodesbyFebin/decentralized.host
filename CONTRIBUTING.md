# Contributing

Thanks for considering a contribution. This is a small, actively-changing project maintained by one person, so please open an issue to discuss anything non-trivial before sending a large PR.

## Local setup

There's no automated test suite yet -- verification is manual, by actually running the mesh:

```bash
# Bring up the mesh (postgres, registry, traefik, control-plane, one node-agent)
docker compose up -d --build

# Install the CLI
pip install -e ./cli

# Confirm it's healthy
dhost node list

# Ship the example app and confirm it deploys
cd examples/hello-world && dhost ship hello-world
```

For changes to `marketing-site/`, run `npm install && npm run lint && npm run build` inside that directory -- `lint` is a `tsc --noEmit` type check, and `build` runs the real build pipeline (sitemap generation, prerendering, Vite build).

## What to include in a PR

- What you changed and why, in the PR description
- For a behavior change: the manual steps you used to verify it (which commands you ran, what you expected vs. what happened)
- Keep `README.md` and the relevant `marketing-site/src/data/*.ts` content in sync if you change a CLI command, API endpoint, or config format -- a good chunk of this repo's history is fixing exactly that kind of drift

## Reporting bugs / requesting features

Open a GitHub issue. For security issues, see [SECURITY.md](SECURITY.md) instead of a public issue.
