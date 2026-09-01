import React from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { ClaimBadge } from '../components/ClaimBadge';
import { Server, HardDrive, Cpu, Terminal, ArrowRight, ShieldCheck, Check, Layers } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const SelfHostedPaasPillarView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/self-hosted-paas/'];

  return (
    <article className="max-w-4xl mx-auto space-y-12 text-slate-300 font-sans">
      <JsonLd frontmatter={frontmatter} />

      {/* Header */}
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Server className="w-3.5 h-3.5" />
          <span>COMMERCIAL AUTHORITY PILLAR GUIDE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
          Self-Hosted PaaS: Architecture, Multi-Server Operations &amp; Production Guide
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          How to build, deploy, and scale a private Platform-as-a-Service on your own VPS or bare-metal servers with automated Git push and Docker isolation.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2">
          <span>Published: 2025-02-22</span>
          <span>•</span>
          <span>Audience: Developers &amp; Engineering Leads</span>
          <span>•</span>
          <ClaimBadge status="IMPLEMENTED" size="sm" />
        </div>
      </header>

      {/* AEO Canonical Answer Block */}
      <AeoAnswerBlock
        question="What is a self-hosted PaaS?"
        answer="A self-hosted Platform-as-a-Service (PaaS) is an open-source software layer installed on privately managed cloud servers (VPS or bare-metal) that replicates the developer ergonomics of managed platforms like Heroku or Render. It automates container packaging, ingress routing, SSL certification, database provisioning, and rolling updates."
        sourceContext="Decentralized.Host Self-Hosted PaaS Specification"
      />

      {/* Table of Contents */}
      <nav aria-label="Table of Contents" className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-3 font-mono text-xs">
        <h2 className="text-sm font-bold text-white font-display uppercase tracking-wider">
          Table of Contents
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
          <a href="#why-self-host" className="hover:text-emerald-400">1. Why Self-Host a PaaS?</a>
          <a href="#single-vs-multi" className="hover:text-emerald-400">2. Single-Node vs Multi-Node PaaS</a>
          <a href="#core-components" className="hover:text-emerald-400">3. Essential Architectural Components</a>
          <a href="#git-workflow" className="hover:text-emerald-400">4. Developer Experience &amp; Git Push</a>
          <a href="#cost-economics" className="hover:text-emerald-400">5. Cost Comparison &amp; Infrastructure ROI</a>
          <a href="#production-checklist" className="hover:text-emerald-400">6. Production Hardening Checklist</a>
        </div>
      </nav>

      {/* Section 1 */}
      <section id="why-self-host" className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-white pt-6 border-t border-slate-800">
          1. Why Self-Host a PaaS? The Economic &amp; Architectural Case
        </h2>
        <p className="text-sm leading-relaxed">
          Managed deployment platforms (Heroku, Render, Vercel, Railway, Fly.io) revolutionized developer productivity by making deployment as simple as <code>git push</code>. However, as an engineering organization scales, managed cloud pricing scales exponentially with memory and bandwidth markups of 300% to 1,000% over raw infrastructure costs.
        </p>
        <p className="text-sm leading-relaxed">
          By deploying a <strong>self-hosted PaaS</strong> like Decentralized.Host on commodity hardware (Hetzner, OVH, DigitalOcean, Linode, or bare-metal), developers retain 100% of the developer experience while slashing operational cloud expenditure by up to 80%.
        </p>
      </section>

      {/* Section 2 */}
      <section id="single-vs-multi" className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-white pt-6 border-t border-slate-800">
          2. Single-Node vs Multi-Node PaaS Architecture
        </h2>
        <p className="text-sm leading-relaxed">
          The primary architectural distinction among open-source PaaS tools is single-server versus multi-node distribution:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white font-display">Single-Server PaaS (e.g. Dokku)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All applications, databases, reverse proxies, and build steps share a single VPS instance. Ideal for side projects and early prototypes, but vulnerable to single-host outages and resource starvation.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <h3 className="text-sm font-bold text-emerald-300 font-display">Multi-Node Mesh (Decentralized.Host)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              A decoupled control plane distributes workloads across independent compute nodes according to real-time memory and CPU availability. Nodes can be added or removed dynamically across global data centers.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id="cost-economics" className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-white pt-6 border-t border-slate-800">
          3. Infrastructure Cost Comparison (Real-World Benchmark)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-xs text-slate-400 uppercase">
                <th className="py-3 px-4">Configuration (32 GB RAM, 8 vCPU, 5 TB Bandwidth)</th>
                <th className="py-3 px-4 text-slate-300">Managed Cloud (Heroku / Render / Vercel)</th>
                <th className="py-3 px-4 text-emerald-400 font-bold bg-emerald-950/20">Self-Hosted PaaS on Hetzner / OVH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-300">Compute &amp; RAM</td>
                <td className="py-3.5 px-4 text-slate-400">$350 – $700 / month</td>
                <td className="py-3.5 px-4 text-emerald-300 bg-emerald-950/10">$35 – $45 / month (Raw VPS)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-300">Egress Bandwidth (5 TB)</td>
                <td className="py-3.5 px-4 text-slate-400">$250 – $450 / month</td>
                <td className="py-3.5 px-4 text-emerald-300 bg-emerald-950/10">Included (Free 20 TB quota)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-300">Database Add-ons</td>
                <td className="py-3.5 px-4 text-slate-400">$100 – $250 / month</td>
                <td className="py-3.5 px-4 text-emerald-300 bg-emerald-950/10">$0 (Containerized PostgreSQL on NVMe)</td>
              </tr>
              <tr className="font-bold">
                <td className="py-3.5 px-4 font-mono text-xs text-white">Estimated Annual Total</td>
                <td className="py-3.5 px-4 text-rose-400 font-mono">$8,400 – $16,800 / year</td>
                <td className="py-3.5 px-4 text-emerald-400 font-mono bg-emerald-950/20">$480 – $600 / year (95% Savings)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Production Checklist */}
      <section id="production-checklist" className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-white pt-6 border-t border-slate-800">
          4. Production Hardening Checklist for Self-Hosted PaaS
        </h2>
        <div className="space-y-2 font-mono text-xs">
          {[
            { item: 'Enable UFW / iptables firewall restricting ports to 80, 443, 22, and 2222 (Git SSH)', status: 'CRITICAL' },
            { item: 'Set strong API_SECRET_KEY in control plane .env and rotate regularly', status: 'CRITICAL' },
            { item: 'Configure automated PostgreSQL database snapshots to external S3/Wasabi volume', status: 'REQUIRED' },
            { item: 'Monitor node disk space and prune unused Docker build cache layers weekly', status: 'RECOMMENDED' },
            { item: 'Deploy a secondary worker node to enable instant failover scheduling', status: 'RECOMMENDED' }
          ].map((c, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#080b0f] border border-slate-800 flex items-center justify-between gap-3">
              <span className="text-slate-300 font-sans text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                {c.item}
              </span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-emerald-400 shrink-0">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/40 text-center space-y-4">
        <h3 className="text-xl font-bold font-display text-white">
          Launch Your Private Self-Hosted PaaS in 3 Minutes
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Deploy Decentralized.Host on your server with a single Docker Compose command.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/docs/')}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition-colors"
          >
            Self-Hosting Guide
          </button>
          <button
            onClick={() => onNavigate('/alternatives/')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs transition-colors"
          >
            Compare with Coolify &amp; Dokploy
          </button>
        </div>
      </div>
    </article>
  );
};
