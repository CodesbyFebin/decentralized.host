import React from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
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
          answer="Decentralized.Host is designed as an open compute network where independent hardware operators run lightweight daemon agents to join a distributed compute mesh. Workloads are scheduled based on actual compute capacity and uptime, with planned cryptographic proofs of execution settled via Solana SPL tokens."
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
            <span className="text-xs font-mono text-emerald-400 font-semibold">03. ECONOMIC SETTLEMENT</span>
            <ClaimBadge status="PLANNED" size="sm" />
          </div>
          <h2 className="text-base font-bold font-display text-white">Optional Solana Settlement</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Phase 4 architecture will introduce optional on-chain compute receipts on Solana, enabling decentralized micro-payments between app developers and node operators.
          </p>
        </div>
      </div>

      {/* Node Operator Experience */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold font-display text-white">
          Joining the Compute Mesh as a Node Provider
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          Running a compute node requires zero proprietary hardware. Any Linux x86_64 or ARM64 VPS or dedicated server with Docker installed can join a private or federated cluster.
        </p>

        <div className="p-4 rounded-xl bg-black border border-slate-800 font-mono text-xs text-emerald-300 space-y-2">
          <div className="text-slate-500"># Step 1: Install and launch the node agent daemon</div>
          <div>export CONTROL_PLANE_URL="https://coordinator.example.com"</div>
          <div>export AGENT_SECRET_KEY="sec_node_cluster_auth_key"</div>
          <div>python3 node-agent/agent.py</div>
          <div className="pt-2 text-slate-500"># Output:</div>
          <div className="text-slate-400">[INFO] Node registered successfully. UUID: node-9f82-a3c1</div>
          <div className="text-slate-400">[INFO] Telemetry heartbeat active (interval: 30s)</div>
        </div>
      </div>
    </div>
  );
};
