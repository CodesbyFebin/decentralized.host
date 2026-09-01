import React from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
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
      phase: 'Phase 2: Multi-Node Mesh & Smart Scheduling',
      timeline: 'Q3 – Q4 2025',
      status: 'IMPLEMENTED' as const,
      description: 'Decoupled Python node agent daemon, heartbeats, real-time CPU/RAM telemetry, resource-aware placement scheduler, and multi-host container dispatching.',
      deliverables: [
        'Standalone node-agent daemon (node-agent/agent.py)',
        'Node registration, health checks, and capacity reporting',
        'Weighted placement scheduler (control-plane/app/scheduler.py)',
        'Container lifecycle management over Docker socket',
        'Multi-server production compose topology'
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
      phase: 'Phase 4: DePIN Settlement & Compute Marketplace',
      timeline: 'Q3 – Q4 2026',
      status: 'PLANNED' as const,
      description: 'Decentralized compute marketplace enabling community node operators to monetize idle server capacity with automated micro-billing on Solana.',
      deliverables: [
        'Solana compute credit receipts & smart contracts',
        'Automated node SLA verification and slashing for downtime',
        'Federated multi-cluster peering and global DNS edge routing',
        'Public decentralized node discovery registry'
      ]
    }
  ];

  return (
    <div className="space-y-12">
      <JsonLd frontmatter={frontmatter} />

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
          answer="Decentralized.Host has completed Phase 1 (Core PaaS, Git SSH hooks, CLI, Traefik TLS) and Phase 2 (Multi-node agent daemon, telemetry, and scheduler). Phase 3 will introduce confidential computing enclaves (AMD SEV), and Phase 4 will introduce Solana DePIN settlement."
          sourceContext="Engineering Roadmap Specification (ROADMAP.md)"
        />
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
