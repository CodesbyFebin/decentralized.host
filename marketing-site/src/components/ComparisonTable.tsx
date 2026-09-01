import React, { useState } from 'react';
import { COMPARISONS_DATA } from '../data/comparisons';
import { Check, X, Shield, ExternalLink, Calendar, Info, Layers } from 'lucide-react';
import { ClaimBadge } from './ClaimBadge';

export const ComparisonTable: React.FC = () => {
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>('comp-coolify');

  const selectedComp = COMPARISONS_DATA.find((c) => c.id === selectedCompetitorId) || COMPARISONS_DATA[0];

  const comparisonAttributes = [
    { label: 'Primary Deployment Model', dhost: 'Decoupled Node Mesh / Independent Nodes', compKey: 'deploymentModel' },
    { label: 'License / Open Source', dhost: '100% MIT License', compKey: 'license' },
    { label: 'Container Runtime', dhost: 'Docker Engine via Node Agent', compKey: 'runtime' },
    { label: 'Multi-Server Scheduling', dhost: 'Built-in Resource-Aware Node Scheduler', compKey: 'multiServerSupport' },
    { label: 'Git Push Deployment', dhost: 'Native `git push dhost main` over SSH', compKey: 'gitDeployment' },
    { label: 'CLI Tooling', dhost: 'Native Python CLI (`dhost ship`, `dhost logs`)', compKey: 'cliTool' },
    { label: 'Automatic TLS / Reverse Proxy', dhost: 'Dynamic Traefik v3 + Let’s Encrypt', compKey: 'automaticTls' },
    { label: 'Rollback & History', dhost: 'Sub-second version tag rollback', compKey: 'rollbackSupport' },
    { label: 'Decentralized / Mesh Concept', dhost: 'Decentralized compute mesh + optional Solana credits', compKey: 'decentralizedOrMesh' }
  ];

  return (
    <div className="space-y-8">
      {/* Competitor Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {COMPARISONS_DATA.map((comp) => (
          <button
            key={comp.id}
            onClick={() => setSelectedCompetitorId(comp.id)}
            className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider whitespace-nowrap border transition-all ${
              selectedCompetitorId === comp.id
                ? 'bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41] font-bold shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            vs {comp.name}
          </button>
        ))}
      </div>

      {/* Side-by-Side Comparison Card */}
      <div className="rounded-lg bg-[#0a0a0a] border border-white/10 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 flex-wrap pb-6 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-widest">
              FACTUAL TECHNICAL COMPARISON
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-1 uppercase">
              Decentralized.Host vs {selectedComp.name}
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-3xl leading-relaxed font-sans">
              {selectedComp.summaryComparison}
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-white/50 justify-end">
              <Calendar className="w-3.5 h-3.5 text-[#00FF41]" />
              <span>Verified: {selectedComp.lastVerifiedAt}</span>
            </div>
            <a
              href={selectedComp.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-[#00FF41] hover:underline uppercase tracking-wider"
            >
              {selectedComp.name} Official Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 font-mono text-xs text-white/40 uppercase tracking-wider">
                <th className="py-3 px-4 w-1/3">Capability / Architecture</th>
                <th className="py-3 px-4 w-1/3 text-[#00FF41] font-bold bg-[#00FF41]/10 rounded-t border-t border-l border-r border-[#00FF41]/20">
                  Decentralized.Host
                </th>
                <th className="py-3 px-4 w-1/3 text-white">
                  {selectedComp.name}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-sans">
              {comparisonAttributes.map((attr, idx) => {
                const compVal = (selectedComp as any)[attr.compKey];
                return (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-3.5 px-4 font-medium text-white/80 font-mono text-xs">
                      {attr.label}
                    </td>
                    <td className="py-3.5 px-4 text-[#00FF41] bg-[#00FF41]/5 font-medium border-l border-r border-[#00FF41]/20">
                      {attr.dhost}
                    </td>
                    <td className="py-3.5 px-4 text-white/60">
                      {compVal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40 flex-wrap gap-2 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#00FF41]" />
            Evidence: {selectedComp.evidenceSource}
          </span>
          <span className="text-white/40">
            Strict Claim Classification: All comparison rows verified against official documentation &amp; codebases.
          </span>
        </div>
      </div>
    </div>
  );
};
