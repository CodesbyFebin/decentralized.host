import React from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { ClaimBadge } from '../components/ClaimBadge';
import { Globe, Server, Shield, Cpu, Network, ArrowRight, Check, BookOpen, Layers } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const DecentralizedHostingPillarView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/decentralized-hosting/'];

  return (
    <article className="max-w-4xl mx-auto space-y-12 text-slate-300 font-sans">
      <JsonLd frontmatter={frontmatter} />
      <LastUpdated updatedAt={frontmatter.updatedAt} />

      {/* Header */}
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Globe className="w-3.5 h-3.5" />
          <span>CATEGORY AUTHORITY PILLAR GUIDE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
          Decentralized Hosting: Architecture, Benefits &amp; Open-Source Deployment
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The comprehensive technical guide to understanding, architecting, and operating decentralized hosting platforms and distributed compute meshes.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2">
          <span>Published: 2025-02-20</span>
          <span>•</span>
          <span>Audience: System Architects &amp; DevOps</span>
          <span>•</span>
          <ClaimBadge status="IMPLEMENTED" size="sm" />
        </div>
      </header>

      {/* AEO Canonical Answer Block */}
      <AeoAnswerBlock
        question="What is decentralized hosting?"
        answer="Decentralized hosting distributes application workloads across independently operated compute infrastructure rather than depending entirely on a single centralized cloud provider. Workloads are scheduled across heterogeneous nodes, coordinated via lightweight control planes, and routed through automated reverse proxies with dynamic TLS encryption."
        sourceContext="Decentralized.Host Canonical Category Definition"
      />

      {/* Table of Contents */}
      <nav aria-label="Table of Contents" className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-3 font-mono text-xs">
        <h2 className="text-sm font-bold text-white font-display uppercase tracking-wider">
          Table of Contents
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
          <a href="#definition" className="hover:text-emerald-400">1. Definition &amp; Core Principles</a>
          <a href="#how-it-works" className="hover:text-emerald-400">2. How Decentralized Hosting Works</a>
          <a href="#centralized-vs-decentralized" className="hover:text-emerald-400">3. Centralized vs Decentralized</a>
          <a href="#architecture" className="hover:text-emerald-400">4. Architectural Topology</a>
          <a href="#independent-nodes" className="hover:text-emerald-400">5. Independent Compute Nodes</a>
          <a href="#scheduling-routing" className="hover:text-emerald-400">6. Scheduling &amp; Edge Routing</a>
          <a href="#security-trust" className="hover:text-emerald-400">7. Security &amp; Isolation Model</a>
          <a href="#depin-relation" className="hover:text-emerald-400">8. Decentralized Hosting vs DePIN</a>
        </div>
      </nav>

      {/* Section 1 */}
      <section id="definition" className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-white pt-6 border-t border-slate-800">
          1. Definition &amp; Core Principles
        </h2>
        <p className="text-sm leading-relaxed">
          For over two decades, modern web applications have increasingly consolidated onto three dominant hyperscalers (AWS, Microsoft Azure, and Google Cloud). While these platforms deliver immense scale, they introduce severe economic rent extraction, opaque billing structures, regional outages, and structural platform lock-in.
        </p>
        <p className="text-sm leading-relaxed">
          <strong>Decentralized hosting</strong> restores infrastructural sovereignty. Rather than leasing sandboxed serverless functions within proprietary closed ecosystems, developers deploy standardized OCI Docker containers to a distributed network of independent bare-metal servers, VPS instances, or community-operated compute nodes.
        </p>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h3 className="text-xs font-mono font-semibold text-emerald-400 uppercase">
            The Three Core Pillars:
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-mono">1.</span>
              <span><strong>Infrastructure Ownership:</strong> You control the hardware, storage volumes, and network configuration.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-mono">2.</span>
              <span><strong>Workload Portability:</strong> Any app packaged as a Docker container runs identically anywhere without proprietary runtime SDKs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-mono">3.</span>
              <span><strong>Fault-Tolerant Scheduling:</strong> Independent nodes execute workloads even if individual hosts fail or experience upstream network degradation.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2 */}
      <section id="how-it-works" className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-white pt-6 border-t border-slate-800">
          2. How Decentralized Hosting Works in Practice
        </h2>
        <p className="text-sm leading-relaxed">
          A modern decentralized hosting architecture decouples the deployment experience from the underlying execution nodes. When a developer executes <code>dhost ship</code> or pushes to a Git remote:
        </p>
        <ol className="space-y-3 text-sm list-decimal pl-6 text-slate-300">
          <li>
            <strong>Source Archive &amp; Ingestion:</strong> The local workspace is compressed into an immutable snapshot and sent over an authenticated HTTPS or SSH tunnel to the cluster control plane.
          </li>
          <li>
            <strong>Heuristic Framework Detection:</strong> The control plane inspects files (e.g. <code>requirements.txt</code>, <code>package.json</code>, <code>Dockerfile</code>) and compiles an optimal multi-stage container build definition.
          </li>
          <li>
            <strong>Resource-Aware Scheduling:</strong> The scheduler inspects real-time telemetry (CPU headroom, free memory, active socket connections) across registered node agents and selects the optimal host.
          </li>
          <li>
            <strong>Isolated Container Execution:</strong> The selected worker node downloads the archive, builds the image using its local Docker daemon, and starts the container under strict Linux cgroup limits.
          </li>
          <li>
            <strong>Dynamic Ingress &amp; ACME TLS:</strong> Traefik detects the active container labels, configures reverse proxy routes, requests Let’s Encrypt SSL certificates, and immediately exposes the live service to the public internet.
          </li>
        </ol>
      </section>

      {/* Section 3 */}
      <section id="centralized-vs-decentralized" className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-white pt-6 border-t border-slate-800">
          3. Centralized Cloud vs Decentralized Hosting
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-xs text-slate-400 uppercase">
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4 text-slate-300">Centralized Cloud (AWS/GCP/Vercel)</th>
                <th className="py-3 px-4 text-emerald-400 font-bold bg-emerald-950/20">Decentralized.Host</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-300">Cost Structure</td>
                <td className="py-3.5 px-4 text-slate-400">High markup on bandwidth, memory, and function execution.</td>
                <td className="py-3.5 px-4 text-emerald-300 bg-emerald-950/10">Zero markup. You only pay for raw compute hardware or own VPS.</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-300">Lock-In Level</td>
                <td className="py-3.5 px-4 text-slate-400">High (Proprietary APIs, CloudFormation, DynamoDB).</td>
                <td className="py-3.5 px-4 text-emerald-300 bg-emerald-950/10">Zero. Standard OCI Docker containers &amp; POSIX storage.</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-300">Workload Flexibility</td>
                <td className="py-3.5 px-4 text-slate-400">Severe duration timeouts (15min Lambda) and memory caps.</td>
                <td className="py-3.5 px-4 text-emerald-300 bg-emerald-950/10">Unlimited. WebSockets, background workers, AI models, APIs.</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-300">Data Sovereignty</td>
                <td className="py-3.5 px-4 text-slate-400">Data stored on shared multi-tenant hyperscaler disks.</td>
                <td className="py-3.5 px-4 text-emerald-300 bg-emerald-950/10">Private storage on your designated sovereign nodes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4 */}
      <section id="architecture" className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-white pt-6 border-t border-slate-800">
          4. Architectural Topology
        </h2>
        <p className="text-sm leading-relaxed">
          Decentralized hosting avoids single-point-of-failure monolithic orchestrators. The control plane acts strictly as an orchestration and state coordinator, while data-plane traffic routes directly to the edge nodes hosting the application container.
        </p>
        <div className="p-4 rounded-xl bg-[#080b0f] border border-slate-800 font-mono text-xs text-emerald-300 space-y-1">
          <div>[ Developer Terminal ] ➔ (git push / dhost ship)</div>
          <div className="pl-4">│</div>
          <div className="pl-4">▼</div>
          <div>[ Control Plane Coordinator: FastAPI ] ➔ [ Placement Scheduler ]</div>
          <div className="pl-4">│</div>
          <div className="pl-4">├───➔ [ Worker Node Alpha (Hetzner FSN) : Docker Engine ]</div>
          <div className="pl-4">├───➔ [ Worker Node Beta (DigitalOcean NYC) : Docker Engine ]</div>
          <div className="pl-4">└───➔ [ Worker Node Gamma (Bare Metal On-Prem) : Docker Engine ]</div>
          <div className="pl-4">│</div>
          <div className="pl-4">▼</div>
          <div>[ Traefik Dynamic Edge Router ] ➔ [ Public HTTPS Request ➔ Container Port ]</div>
        </div>
      </section>

      {/* Section 5 */}
      <section id="depin-relation" className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-white pt-6 border-t border-slate-800">
          5. Decentralized Hosting vs DePIN (Decentralized Physical Infrastructure)
        </h2>
        <p className="text-sm leading-relaxed">
          A common question in the industry is whether decentralized hosting requires blockchain tokens or cryptocurrency.
        </p>
        <p className="text-sm leading-relaxed">
          <strong>The answer is no.</strong> Decentralized hosting is first and foremost a software and systems engineering architecture. In Decentralized.Host, the core compute platform is 100% open-source, self-hosted, and runs seamlessly without blockchain dependencies.
        </p>
        <p className="text-sm leading-relaxed">
          Where DePIN fits into the roadmap is as an <em>optional economic settlement layer</em>: allowing independent third-party node operators to contribute bare-metal compute capacity to a global pool and receive verifiable credit receipts or SPL tokens for CPU hours and bandwidth served.
        </p>
      </section>

      {/* CTA Footer */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/40 text-center space-y-4">
        <h3 className="text-xl font-bold font-display text-white">
          Deploy on Decentralized Infrastructure Today
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Experience true developer freedom. Deploy your first application from Git or CLI across your private nodes.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/docs/')}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition-colors"
          >
            Read Quick Start
          </button>
          <button
            onClick={() => onNavigate('/architecture/')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs transition-colors"
          >
            System Architecture
          </button>
        </div>
      </div>
    </article>
  );
};
