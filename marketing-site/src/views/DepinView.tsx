import React from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { ClaimBadge } from '../components/ClaimBadge';
import { Cpu, Network, Shield, Zap, Terminal, ArrowRight, Layers, Coins } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const DepinView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/depin/'];

  return (
    <div className="space-y-12">
      <JsonLd frontmatter={frontmatter} />
      <LastUpdated updatedAt={frontmatter.updatedAt} />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>DEPIN &amp; DISTRIBUTED COMPUTE SPECIFICATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Decentralized Physical Infrastructure (DePIN) &amp; Compute Mesh
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          How Decentralized.Host models physical compute nodes, useful work execution, and verifiable telemetry without speculative token lockups.
        </p>
      </div>

      {/* AEO Block */}
      <div className="max-w-3xl mx-auto">
        <AeoAnswerBlock
          question="How does Decentralized.Host integrate with DePIN?"
          answer="Decentralized.Host is an open compute network where independent hardware operators run lightweight daemon agents to join a distributed compute mesh. Workloads are scheduled based on actual compute capacity and uptime. Node operators can already earn real Solana devnet SPL token credits per healthy heartbeat interval (off by default, devnet only); cryptographic proof-of-execution verification is a planned future addition, not yet built."
          sourceContext="DePIN Protocol Specification (node-agent/agent.py, control-plane/app/scheduler.py, roadmap)"
        />
      </div>

      {/* DePIN Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-semibold">01. USEFUL WORKLOADS</span>
            <ClaimBadge status="IMPLEMENTED" size="sm" />
          </div>
          <h2 className="text-base font-bold font-display text-white">Real-World Application Execution</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Unlike proof-of-work crypto mining that burns electricity on useless hashing, DePIN compute nodes in Decentralized.Host run production web apps, REST APIs, AI inferences, and databases.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-semibold">02. DECOUPLED AGENTS</span>
            <ClaimBadge status="IMPLEMENTED" size="sm" />
          </div>
          <h2 className="text-base font-bold font-display text-white">Lightweight Node Daemons</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Hardware operators only need Python 3.11+ and Docker. The node agent exposes a clean REST API, polls for container assignments, and streams back health telemetry.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-semibold">03. NODE-OPERATOR CREDITS</span>
            <ClaimBadge status="IMPLEMENTED" size="sm" />
          </div>
          <h2 className="text-base font-bold font-display text-white">Solana Devnet Credits (Live, Off by Default)</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Real SPL token credits mint to a node operator's linked wallet every few healthy heartbeats -- devnet only, no monetary value, real on-chain transactions. Cryptographic proof-of-execution verification and a mainnet migration remain future, unbuilt work (see the roadmap).
          </p>
        </div>
      </div>

      {/* Node Operator Experience */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold font-display text-white">
          Joining the Compute Mesh as a Node Provider
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          Running a compute node requires zero proprietary hardware -- any Linux server with Docker can join your own private mesh, given the real `NODE_JOIN_SECRET` for that mesh.
        </p>

        <div className="p-4 rounded-xl bg-black border border-slate-800 font-mono text-xs text-emerald-300 space-y-2">
          <div className="text-slate-500"># Build and run the node agent (see the multi-node guide for the full walkthrough)</div>
          <div>docker build -t dhost/node-agent -f node-agent/Dockerfile .</div>
          <div>docker run -d --name dhost-node-agent \</div>
          <div className="pl-4">-v /var/run/docker.sock:/var/run/docker.sock \</div>
          <div className="pl-4">-e CONTROL_PLANE_URL=https://api.your-domain.com \</div>
          <div className="pl-4">-e NODE_JOIN_SECRET=&lt;your real secret&gt; \</div>
          <div className="pl-4">-e NODE_NAME=worker-2 dhost/node-agent</div>
          <div className="pt-2 text-slate-500"># Heartbeats every 10s by default (HEARTBEAT_INTERVAL)</div>
        </div>
      </div>
    </div>
  );
};
