import React, { useState } from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { FileText, Copy, Check, Download, ArrowLeft, Terminal } from 'lucide-react';

interface Props {
  endpoint: 'llms.txt' | 'llms-full.txt' | 'sitemap.xml' | 'robots.txt' | 'openapi.json';
  onNavigate: (path: string) => void;
}

export const MachineReadableViewer: React.FC<Props> = ({ endpoint, onNavigate }) => {
  const [copied, setCopied] = useState(false);

  // Generate content dynamically
  let content = '';
  let mimeType = 'text/plain';

  if (endpoint === 'llms.txt') {
    content = `# Decentralized.Host (dhost) — Machine-Readable LLM Specification
# Standard: https://llmstxt.org/
# Canonical Repository: https://github.com/CodesbyFebin/decentralized.host
# License: MIT Open Source

> Decentralized.Host is an open-source self-hosted deployment platform and distributed compute mesh for running containerized web applications across independently operated compute nodes.

## Core Capabilities
- CLI & Git Push Deployments: Automated Docker packaging and container scheduling via \`dhost ship\` and SSH Git hooks.
- Multi-Node Compute Mesh: Decoupled Python node agent daemon reporting real-time CPU/RAM telemetry for weighted scheduler placement.
- Automatic Edge Routing: Traefik dynamic reverse proxy with automated Let's Encrypt SSL/TLS certificates.
- Zero Platform Lock-in: Runs standard OCI Docker containers on any Linux server, VPS, or bare-metal machine.

## Canonical Reference Pages
- /: Decentralized.Host homepage and interactive terminal simulator
- /features/: Verified capability matrix with code file references
- /architecture/: Subsystems specification (FastAPI control plane, scheduler, node-agent, Traefik)
- /security/: Threat matrix, authentication model, and RFC 9116 security.txt
- /docs/: Developer CLI manual, quickstart guide, and self-hosting runbook
- /guides/: Step-by-step technical guides (Git push, multi-node mesh, rollbacks)
- /alternatives/: Evidence-backed comparisons with Coolify, Dokploy, CapRover, Dokku, Heroku
- /deploy/: Framework auto-detection recipes (FastAPI, Next.js, Django, Express, Docker)
- /decentralized-hosting/: Comprehensive category authority guide on decentralized hosting
- /self-hosted-paas/: Comprehensive category authority guide on self-hosted PaaS architecture
- /depin/: Distributed physical infrastructure compute mesh and Solana economic settlement
- /roadmap/: Public engineering milestones (Phase 1 to Phase 4)
- /about/: Infrastructure sovereignty manifesto and project philosophy
- /open-source/: MIT license and GitHub contribution guidelines

## Developer Quick Start
\`\`\`bash
# 1. Clone and install the CLI (not on PyPI yet)
git clone https://github.com/CodesbyFebin/decentralized.host.git
cd decentralized.host && pip install -e ./cli

# 2. Point at your control plane
export DHOST_API_URL=http://localhost:8000
export DHOST_DEPLOY_KEY=<your deploy API key>

# 3. Ship an app -- no Dockerfile, no Git required
cd my-app && dhost ship my-app
\`\`\`
`;
  } else if (endpoint === 'llms-full.txt') {
    content = `# Decentralized.Host — Complete Technical Knowledge Base for LLM Retrieval
# Generated: 2025-02-22T00:00:00.000Z

${Object.values(CONTENT_REGISTRY).map((page) => `
================================================================================
URL: ${page.canonical}
H1: ${page.h1}
Type: ${page.contentType}
Summary: ${page.description}
Audience: ${page.audience}
Primary Intent: ${page.intent}
AEO Answer: ${page.extractableAnswer || 'N/A'}
================================================================================
`).join('\n')}
`;
  } else if (endpoint === 'sitemap.xml') {
    mimeType = 'application/xml';
    content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.values(CONTENT_REGISTRY).map((page) => `  <url>
    <loc>${page.canonical}</loc>
    <lastmod>${page.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.slug === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;
  } else if (endpoint === 'robots.txt') {
    content = `# robots.txt for Decentralized.Host
User-agent: *
Allow: /

# Canonical Sitemaps
Sitemap: https://decentralized.host/sitemap.xml

# LLM Discovery Specs
# LLMs: https://decentralized.host/llms.txt
# Full LLMs: https://decentralized.host/llms-full.txt
`;
  } else if (endpoint === 'openapi.json') {
    mimeType = 'application/json';
    content = JSON.stringify({
      openapi: '3.1.0',
      info: {
        title: 'Decentralized.Host Control Plane API',
        version: '1.0.0',
        description: 'REST API for orchestrating multi-node container deployments, nodes, and routing.'
      },
      servers: [{ url: 'https://coordinator.decentralized.host/api/v1' }],
      paths: {
        '/deployments': {
          post: {
            summary: 'Ship a new application release',
            security: [{ BearerAuth: [] }],
            responses: { '200': { description: 'Deployment initiated' } }
          }
        },
        '/nodes': {
          get: {
            summary: 'List registered compute node agents',
            responses: { '200': { description: 'Active node telemetry list' } }
          }
        },
        '/health': {
          get: {
            summary: 'Cluster health and latency status',
            responses: { '200': { description: 'System healthy' } }
          }
        }
      }
    }, null, 2);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = endpoint;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => onNavigate('/')}
          className="text-xs font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download /{endpoint}</span>
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2 text-white font-bold">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Raw Endpoint: /{endpoint}</span>
          </div>
          <span>Format: {mimeType}</span>
        </div>

        <pre className="p-4 rounded-xl bg-black border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed max-h-[600px]">
          {content}
        </pre>
      </div>
    </div>
  );
};
