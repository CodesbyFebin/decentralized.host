import React from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { ClaimBadge } from '../components/ClaimBadge';
import { GitBranch, CheckCircle2, Clock, Calendar, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const RoadmapView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/roadmap/'];

  const roadmapPhases = [
    {
      phase: 'Phase 1: Core Foundation & Single-Node PaaS',
      timeline: 'Q1 – Q2 2025',
      status: 'IMPLEMENTED' as const,
      description: 'FastAPI control plane, SQLite/PostgreSQL state storage, Git SSH receiver hooks, dynamic Traefik reverse proxy, dhost CLI tool, and Docker container build pipelines.',
      deliverables: [
        'FastAPI control plane & Bearer auth (control-plane/app)',
        'dhost CLI with init, ship, logs, status, keys, rollback',
        'Git SSH receiver shell (opengit-shell.sh)',
        'Traefik automated ACME SSL certificate provisioning',
        'Heuristic framework auto-detection (FastAPI, Next.js, Django)'
      ]
    },
    {
      phase: 'Phase 2: Multi-Node Mesh, Real Git Push & Node-Operator Credits',
      timeline: 'Q3 – Q4 2025',
      status: 'IMPLEMENTED' as const,
      description: 'Decoupled Python node agent daemon, heartbeats, real-time CPU/RAM telemetry, resource-aware placement scheduler, multi-host container dispatching, a real SSH git server, real production TLS, automated failover for offline nodes, and an optional Solana devnet credit system for node operators.',
      deliverables: [
        'Standalone node-agent daemon (node-agent/agent.py)',
        'Node registration, health checks, and capacity reporting',
        'Weighted placement scheduler (control-plane/app/scheduler.py)',
        'Automated failover: a node offline for NODE_OFFLINE_SECONDS has its running deployments rescheduled to a healthy node automatically (control-plane/app/failover.py)',
        'Real SSH git server with auto-create-repo on push (git-server/)',
        'Production Let\'s Encrypt TLS via Traefik HTTP-01 (docker-compose.prod.yml)',
        'Solana devnet SPL token credits for node operators (blockchain/)'
      ]
    },
    {
      phase: 'Phase 3: Hardware Enclaves & Workload Attestation',
      timeline: 'Q1 – Q2 2026',
      status: 'PLANNED' as const,
      description: 'Confidential computing integration (AMD SEV-SNP, Intel TDX) to protect application memory from untrusted host operators, cryptographic attestation receipts, and signed container provenance.',
      deliverables: [
        'Confidential VM runtime execution for untrusted nodes',
        'Signed cryptographic attestation proofs per build',
        'Zero-knowledge log streaming and secret envelope decryption',
        'Distributed volume replication across mesh nodes'
      ]
    },
    {
      phase: 'Phase 4: Mainnet Settlement & Compute Marketplace',
      timeline: 'Q3 – Q4 2026',
      status: 'PLANNED' as const,
      description: 'A real-value mainnet migration path for the credit system (currently Solana devnet-only by design), and a public marketplace for community node operators to contribute capacity across meshes they don\'t own.',
      deliverables: [
        'Optional Solana mainnet credit migration (opt-in, not default)',
        'Per-repo access control for the git server (currently any registered key can push to any repo)',
        'Public decentralized node discovery registry'
      ]
    }
  ];

  return (
    <div className="space-y-12">
      <JsonLd frontmatter={frontmatter} />
      <LastUpdated updatedAt={frontmatter.updatedAt} />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <GitBranch className="w-3.5 h-3.5" />
          <span>TRANSPARENT ENGINEERING TIMELINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Decentralized.Host Engineering Roadmap
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Our public architectural milestones and development roadmap, showing delivered capabilities and future cryptographic hardening plans.
        </p>
      </div>

      {/* AEO Block */}
      <div className="max-w-3xl mx-auto">
        <AeoAnswerBlock
          question="What is the roadmap for Decentralized.Host?"
          answer="Decentralized.Host has completed Phase 1 (Core PaaS, Git SSH hooks, CLI, Traefik TLS) and Phase 2 (multi-node agent daemon, real SSH git server, production TLS, automated node failover, and Solana devnet node-operator credits). Phase 3 will introduce confidential computing enclaves (AMD SEV), and Phase 4 will introduce an optional Solana mainnet migration and a public compute marketplace."
          sourceContext="Engineering Roadmap Specification (ROADMAP.md)"
        />
      </div>

      {/* Exploratory vision note -- deliberately kept OUT of roadmapPhases and
          the ClaimBadge system below (IMPLEMENTED/EXPERIMENTAL/PLANNED all
          imply some level of committed engineering work; this is neither).
          A genuinely different architecture (peer-to-peer content-addressed
          storage, à la the Hypercore/Dat ecosystem) was raised as an idea for
          where the project could go long-term. Framed honestly as
          brainstorming, not a decision -- today's real Decentralized.Host is
          Docker containers on servers you run or rent, nothing here changes
          that. */}
      <div className="max-w-3xl mx-auto p-6 rounded-2xl border border-purple-500/20 bg-purple-500/[0.03] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EXPLORATORY IDEA — NOT A COMMITTED PHASE</span>
        </div>
        <h2 className="text-base font-bold font-display text-white">
          A longer-term "hosting economy" direction, under consideration
        </h2>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          None of this exists in the codebase and it isn't scheduled in any phase above.
          It's a different architecture from today's Decentralized.Host (which runs your
          Docker containers on servers you own or rent), floated as a possible long-term
          direction rather than a decision: instead of one operator's VPS/bare-metal, an
          app's code and data would be content-addressed and seeded across a swarm of
          peers who get paid for the storage and bandwidth they contribute — closer to
          the peer-to-peer model pioneered by the{' '}
          <a href="https://npmjs.com/package/hypercore" target="_blank" rel="noreferrer" className="text-purple-300 underline decoration-purple-500/40 hover:text-purple-200">
            Hypercore Protocol
          </a>{' '}
          ecosystem (Hypercore, Hyperdrive, and the tools built on them) than to
          today's container-hosting model. Whether this is worth pursuing, and how it
          would interoperate with the real mesh described above, is unresolved.
        </p>
      </div>

      {/* Roadmap Phase Timeline */}
      <div className="space-y-6">
        {roadmapPhases.map((p, idx) => (
          <div
            key={idx}
            className={`p-6 sm:p-8 rounded-2xl border transition-colors space-y-4 ${
              p.status === 'IMPLEMENTED'
                ? 'bg-[#080b0f] border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                : 'bg-[#06080b] border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded">
                  {p.timeline}
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                  {p.phase}
                </h2>
              </div>
              <ClaimBadge status={p.status} size="sm" />
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              {p.description}
            </p>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">
                Milestone Deliverables:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-sans">
                {p.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
