/**
 * Generates real static public/llms-full.txt and public/openapi.json files.
 *
 * Before this script existed, both were only produced client-side by
 * MachineReadableViewer.tsx -- meaning a plain HTTP fetch (curl, or any
 * non-JS-executing crawler, which is most of the audience these formats
 * exist for) got vercel.json's SPA-rewrite HTML shell instead of real
 * content. Verified live: `curl https://www.decentralized.host/llms-full.txt`
 * returned `<!doctype html>...`, not text. This generates the real files at
 * build time from the same data sources, so both the static file and the
 * in-app viewer describe the same real thing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTENT_REGISTRY } from '../src/data/registry';
import { DOCS_DATA } from '../src/data/docs';
import { GUIDES_DATA } from '../src/data/guides';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function generateLlmsFullTxt(): string {
  const pages = Object.values(CONTENT_REGISTRY).map((page) => `
================================================================================
URL: ${page.canonical}
H1: ${page.h1}
Type: ${page.contentType}
Summary: ${page.description}
Claim status: ${page.claimStatus}
AEO answer: ${page.extractableAnswer || 'N/A'}
`).join('\n');

  const docs = DOCS_DATA.map((d) => `
================================================================================
DOC: ${d.title}
URL: https://decentralized.host/docs/#${d.slug}
Category: ${d.category}

${d.content}
`).join('\n');

  const guides = GUIDES_DATA.map((g) => `
================================================================================
GUIDE: ${g.title}
URL: https://decentralized.host/guides/#${g.slug}
Difficulty: ${g.difficulty} (${g.timeMinutes} min)
Claim status: ${g.claimStatus}

${g.architectureOverview}

Steps:
${g.steps.map((s, i) => `${i + 1}. ${s.title} -- ${s.description}${s.command ? `\n   $ ${s.command}` : ''}`).join('\n')}
`).join('\n');

  return `# decentralized.host -- Complete Technical Reference for LLM Retrieval
# Generated at build time from the real site data (registry.ts, docs.ts, guides.ts)
# Generated: ${new Date().toISOString()}

## Pages
${pages}

## Documentation
${docs}

## Guides
${guides}
`;
}

function generateOpenApiJson(): object {
  return {
    openapi: '3.1.0',
    info: {
      title: 'decentralized.host control plane API',
      version: '0.1.0',
      description: 'Self-hosted REST API -- no fixed public instance. Every mesh runs its own control plane; substitute your own base URL. No /api/v1 prefix -- paths are relative to the root. See control-plane/app/routers/ in the repo for the real implementation.'
    },
    servers: [{ url: 'http://localhost:8000', description: 'Default local dev URL; production is whatever domain you deploy the control plane to' }],
    security: [{ BearerAuth: [] }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', description: 'The deploy API key (DEPLOY_API_KEY)' }
      }
    },
    paths: {
      '/healthz': {
        get: { summary: 'Health check', security: [], responses: { '200': { description: '{"status": "ok"}' } } }
      },
      '/deployments/detect': {
        post: { summary: 'Upload source, get back detected stack + generated Dockerfile', responses: { '200': { description: 'Detection result + upload_id' } } }
      },
      '/deployments/ship': {
        post: { summary: 'Build and deploy from an upload_id or fresh upload + Dockerfile', responses: { '200': { description: 'Deployment result' } } }
      },
      '/deployments/push': {
        post: { summary: 'Single-call detect+build+deploy from one tarball -- what the git server post-receive hook calls', responses: { '200': { description: 'Deployment result' } } }
      },
      '/deployments': {
        get: { summary: 'List all deployments', responses: { '200': { description: 'Deployment[]' } } }
      },
      '/deployments/{name}': {
        get: { summary: "One deployment's status", responses: { '200': { description: 'Deployment' } } },
        delete: { summary: 'Tear down the container and delete the record', responses: { '200': { description: 'ok' } } }
      },
      '/deployments/{name}/logs': {
        get: { summary: 'Last ~200 log lines', responses: { '200': { description: 'text' } } }
      },
      '/deployments/{name}/releases': {
        get: { summary: 'Release/deploy history', responses: { '200': { description: 'Release[]' } } }
      },
      '/nodes': {
        get: { summary: 'List registered compute nodes', responses: { '200': { description: 'Node[]' } } }
      },
      '/auth/node-join': {
        post: { summary: 'A node registers with join_secret, gets back a JWT (node auth, separate from the deploy-key bearer token)', security: [], responses: { '200': { description: '{"token": "..."}' } } }
      },
      '/git/keys': {
        get: { summary: 'List registered SSH keys', responses: { '200': { description: 'SSHKey[]' } } },
        post: { summary: 'Register an SSH public key', responses: { '200': { description: 'SSHKey' } } }
      },
      '/git/keys/authorized_keys': {
        get: { summary: 'Plain-text authorized_keys format, polled by the git-server container', security: [], responses: { '200': { description: 'text' } } }
      },
      '/blockchain/status': {
        get: { summary: 'Whether Solana devnet credits are enabled, mint address, reward config', responses: { '200': { description: 'BlockchainStatus' } } }
      },
      '/blockchain/credits/{node_id}': {
        get: { summary: 'Credit balance + mint ledger for a node', responses: { '200': { description: 'CreditLedger[]' } } }
      },
      '/assistant/status': {
        get: { summary: 'Whether the AI assistant is configured (GOOGLE_API_KEY set)', responses: { '200': { description: '{"enabled": boolean}' } } }
      },
      '/assistant/chat': {
        post: { summary: 'Read-only chat with the AI assistant -- cannot deploy or delete anything', responses: { '200': { description: '{"reply": "...", "tool_calls": [...]}' } } }
      }
    }
  };
}

fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-full.txt'), generateLlmsFullTxt(), 'utf-8');
fs.writeFileSync(path.join(PUBLIC_DIR, 'openapi.json'), JSON.stringify(generateOpenApiJson(), null, 2), 'utf-8');
console.log('Generated public/llms-full.txt and public/openapi.json from real site data');
