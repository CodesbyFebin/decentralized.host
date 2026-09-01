import React, { useState } from 'react';
import { FEATURES_DATA } from '../data/features';
import { CONTENT_REGISTRY } from '../data/registry';
import { ClaimBadge } from '../components/ClaimBadge';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { ClaimStatus } from '../types';
import { Cpu, Terminal, Shield, Check, Filter, Code2, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const FeaturesView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/features/'];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'deployment', label: 'Deployment & Ingestion' },
    { id: 'compute-mesh', label: 'Compute Mesh & Nodes' },
    { id: 'routing', label: 'Routing & Ingress' },
    { id: 'developer-tools', label: 'Developer Tooling' },
    { id: 'security', label: 'Security & Attestation' },
    { id: 'economics', label: 'Economic Ledgers' }
  ];

  const statuses = [
    { id: 'all', label: 'All Claim States' },
    { id: 'IMPLEMENTED', label: 'Implemented' },
    { id: 'EXPERIMENTAL', label: 'Experimental' },
    { id: 'PLANNED', label: 'Planned' }
  ];

  const filteredFeatures = FEATURES_DATA.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || f.claimStatus === selectedStatus;
    return matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-12">
      <JsonLd frontmatter={frontmatter} />
      <LastUpdated updatedAt={frontmatter.updatedAt} />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <span>ZERO HALLUCINATION CAPABILITY DIRECTORY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Platform Features &amp; Verified Matrix
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Every feature in Decentralized.Host is strictly classified against the target repository state. We distinguish between fully implemented, experimental prototypes, and planned architecture milestones.
        </p>
      </div>

      {/* AEO Block */}
      <div className="max-w-3xl mx-auto">
        <AeoAnswerBlock
          question="What features does Decentralized.Host support?"
          answer="Decentralized.Host supports Git SSH push and CLI deployments, smart resource-aware multi-node scheduling, Docker container execution via decoupled node agents, automatic Traefik SSL routing, versioned rollbacks, and zero-config framework auto-detection for FastAPI, Next.js, and Express."
          sourceContext="Repository verified feature matrix (cli/dhost, control-plane/app, node-agent)"
        />
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-xl bg-[#080b0f] border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === s.id
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFeatures.map((feat) => (
          <div
            key={feat.id}
            id={feat.slug}
            className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {feat.category}
                </span>
                <ClaimBadge status={feat.claimStatus} size="sm" />
              </div>

              <h2 className="text-xl font-bold font-display text-white">
                {feat.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {feat.description}
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">
                  Technical Capabilities:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {feat.technicalCapabilities.map((cap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-mono">✔</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Source File:</span>
                <span className="text-emerald-400 truncate max-w-[240px]">{feat.codeSource}</span>
              </div>
              {feat.cliCommand && (
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-300 text-[11px] truncate">
                  $ {feat.cliCommand}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
