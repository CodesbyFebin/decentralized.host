import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Calendar, 
  ShieldCheck, 
  ExternalLink, 
  Info, 
  Search,
  Layers,
  Sparkles
} from 'lucide-react';
import { FEATURE_COMPARISON_MATRIX } from '../data/comparisons';
import { ClaimBadge } from './ClaimBadge';

export const FeatureComparisonMatrix: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(FEATURE_COMPARISON_MATRIX.map((r) => r.category)))];

  const filteredRows = FEATURE_COMPARISON_MATRIX.filter((row) => {
    const matchesCategory = selectedCategory === 'ALL' || row.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      row.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderStatusBadge = (status: 'Supported' | 'Limited' | 'Not Supported') => {
    switch (status) {
      case 'Supported':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 font-mono text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle className="w-3 h-3" />
            <span>Supported</span>
          </span>
        );
      case 'Limited':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffbd2e]/10 text-[#ffbd2e] border border-[#ffbd2e]/30 font-mono text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" />
            <span>Limited</span>
          </span>
        );
      case 'Not Supported':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ff5f56]/10 text-[#ff5f56] border border-[#ff5f56]/30 font-mono text-[10px] font-bold uppercase tracking-wider">
            <XCircle className="w-3 h-3" />
            <span>Not Supported</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full rounded-lg bg-[#0a0a0a] border border-white/10 p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-widest px-2 py-0.5 bg-[#00FF41]/10 rounded border border-[#00FF41]/30">
              AUTHORITATIVE BENCHMARK MATRIX
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display uppercase tracking-wide">
            Decentralized.Host vs Coolify vs Dokploy
          </h3>
          <p className="text-xs sm:text-sm text-white/60 font-sans mt-1 max-w-3xl">
            Evidence-based architectural matrix comparing self-hosted PaaS solutions, clustering models, developer workflows, and sovereignty guarantees.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search features..."
              className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-white/10 rounded text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#00FF41] font-mono"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-black/60 border border-white/10 rounded text-xs text-white py-1.5 px-3 focus:outline-none focus:border-[#00FF41] font-mono"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 font-mono text-[11px] text-white/40 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-[28%]">Feature / Capability</th>
              <th className="py-3.5 px-4 w-[26%] bg-[#00FF41]/10 text-[#00FF41] font-bold border-t border-l border-r border-[#00FF41]/20 rounded-t">
                Decentralized.Host (dhost)
              </th>
              <th className="py-3.5 px-4 w-[20%] text-white">
                Coolify
              </th>
              <th className="py-3.5 px-4 w-[16%] text-white">
                Dokploy
              </th>
              <th className="py-3.5 px-4 w-[10%] text-right">
                Verified
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 font-sans">
            {filteredRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                {/* Feature Info */}
                <td className="py-4 px-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-display text-sm">
                      {row.featureName}
                    </span>
                  </div>
                  <span className="inline-block text-[10px] font-mono uppercase text-[#00FF41]/80 bg-[#00FF41]/5 px-1.5 py-0.2 rounded border border-[#00FF41]/20">
                    {row.category}
                  </span>
                  <p className="text-xs text-white/50 leading-relaxed font-sans mt-0.5">
                    {row.description}
                  </p>
                </td>

                {/* Decentralized.Host column */}
                <td className="py-4 px-4 bg-[#00FF41]/5 border-l border-r border-[#00FF41]/20 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {renderStatusBadge(row.decentralizedHost.status)}
                    <ClaimBadge status={row.decentralizedHost.claimStatus} size="sm" showLabel={false} />
                  </div>
                  <p className="text-xs text-white/80 font-sans leading-relaxed">
                    {row.decentralizedHost.detail}
                  </p>
                </td>

                {/* Coolify column */}
                <td className="py-4 px-4 space-y-2">
                  {renderStatusBadge(row.coolify.status)}
                  <p className="text-xs text-white/60 font-sans leading-relaxed">
                    {row.coolify.detail}
                  </p>
                </td>

                {/* Dokploy column */}
                <td className="py-4 px-4 space-y-2">
                  {renderStatusBadge(row.dokploy.status)}
                  <p className="text-xs text-white/60 font-sans leading-relaxed">
                    {row.dokploy.detail}
                  </p>
                </td>

                {/* Verified column */}
                <td className="py-4 px-4 text-right space-y-1 font-mono text-[10px] text-white/40">
                  <div className="flex items-center gap-1 justify-end text-white/60">
                    <Calendar className="w-3 h-3 text-[#00FF41]" />
                    <span>{row.lastVerifiedAt}</span>
                  </div>
                  <div className="truncate max-w-[120px] ml-auto" title={row.evidenceSource}>
                    {row.evidenceSource}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Attribution & Audit Note */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/40 flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#00FF41]" />
          <span>Strict Evidence Policy: All matrix status indicators are audited against official repositories and release notes.</span>
        </div>
        <span className="text-[#00FF41]">Matrix Last Synced: 2026-08-25</span>
      </div>
    </div>
  );
};
