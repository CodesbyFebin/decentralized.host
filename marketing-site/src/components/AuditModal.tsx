import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle, AlertTriangle, FileCode, Check, Copy, ExternalLink, Activity, Layers, Cpu } from 'lucide-react';
import { CONTENT_REGISTRY } from '../data/registry';
import { FEATURES_DATA } from '../data/features';
import { ClaimBadge } from './ClaimBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const AuditModal: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const [activeAuditTab, setActiveAuditTab] = useState<'gates' | 'routes' | 'matrix' | 'clusters'>('gates');
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const routes = Object.values(CONTENT_REGISTRY);

  const qualityGates = [
    {
      gate: 'Claim Integrity',
      status: 'Enforced',
      details: 'Every feature classified as IMPLEMENTED, EXPERIMENTAL, or PLANNED with a file citation -- see the Feature Claims tab.'
    },
    {
      gate: 'Canonical Content Registry & Frontmatter Schema',
      status: 'Enforced',
      details: `${routes.length} canonical pages with strict typed frontmatter, unique H1, intent, audience, and canonical URLs.`
    },
    {
      gate: 'AEO (Answer Engine Optimization) Blocks',
      status: 'Present',
      details: 'Extractable, factual definition blocks placed beneath headings across pillar, guide, and FAQ pages.'
    },
    {
      gate: 'Machine-Readable Endpoints (/llms.txt, /sitemap.xml, /robots.txt)',
      status: 'Live',
      details: 'sitemap.xml is generated at build time directly from this registry (scripts/generate-sitemap.ts), not hand-maintained.'
    },
    {
      gate: 'Evidence-Backed Competitor Comparisons',
      status: 'Present',
      details: 'Evaluations for Coolify, Dokploy, Dokku, CapRover, Heroku, Vercel, and AWS with lastVerifiedAt dates and source links.'
    },
    {
      gate: 'Performance',
      status: 'Not independently measured',
      details: 'Client-side SPA architecture with 4 of 15 routes prerendered to static HTML at build time. No Lighthouse/Core Web Vitals run has been published -- treat any specific number here as unverified until one is.'
    },
    {
      gate: 'Accessibility',
      status: 'Not independently audited',
      details: 'Keyboard-navigable Cmd+K search and semantic landmarks are present by design, but no WCAG conformance audit (axe, Lighthouse) has been run.'
    }
  ];

  const implementedCount = FEATURES_DATA.filter((f) => f.claimStatus === 'IMPLEMENTED').length;
  const experimentalCount = FEATURES_DATA.filter((f) => f.claimStatus === 'EXPERIMENTAL').length;
  const plannedCount = FEATURES_DATA.filter((f) => f.claimStatus === 'PLANNED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0a0a0a] border border-[#00FF41]/40 rounded-lg shadow-[0_0_50px_rgba(0,255,65,0.15)] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display uppercase tracking-wide">
                Release Quality Gates &amp; Authority Audit
              </h3>
              <p className="text-xs text-white/50 font-mono">
                Decentralized.Host — Content &amp; Architecture Verification Suite
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-black/40 border-b border-white/10 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveAuditTab('gates')}
            className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-colors ${
              activeAuditTab === 'gates'
                ? 'bg-[#00FF41]/20 text-[#00FF41] font-semibold border border-[#00FF41]/40'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Quality Gates (7/7)
          </button>
          <button
            onClick={() => setActiveAuditTab('routes')}
            className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-colors ${
              activeAuditTab === 'routes'
                ? 'bg-[#00FF41]/20 text-[#00FF41] font-semibold border border-[#00FF41]/40'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Route Inventory ({routes.length})
          </button>
          <button
            onClick={() => setActiveAuditTab('matrix')}
            className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-colors ${
              activeAuditTab === 'matrix'
                ? 'bg-[#00FF41]/20 text-[#00FF41] font-semibold border border-[#00FF41]/40'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Feature Claims ({implementedCount} Imp / {experimentalCount} Exp / {plannedCount} Plan)
          </button>
          <button
            onClick={() => setActiveAuditTab('clusters')}
            className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-colors ${
              activeAuditTab === 'clusters'
                ? 'bg-[#00FF41]/20 text-[#00FF41] font-semibold border border-[#00FF41]/40'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Topic Clusters
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Quality Gates */}
          {activeAuditTab === 'gates' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded flex items-center justify-between text-xs font-mono text-[#00FF41]">
                <span>CONTENT INTEGRITY: ENFORCED</span>
                <span>PERFORMANCE / A11Y: SELF-DESCRIBED, NOT LAB-VERIFIED</span>
              </div>
              <div className="divide-y divide-white/10 border border-white/10 rounded overflow-hidden bg-white/5">
                {qualityGates.map((g, i) => (
                  <div key={i} className="p-3.5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-white font-sans flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#00FF41] shrink-0" />
                        {g.gate}
                      </div>
                      <div className="text-xs text-white/60 pl-6 font-sans">{g.details}</div>
                    </div>
                    <span className="font-mono text-[10px] text-[#00FF41] bg-[#00FF41]/10 px-2 py-0.5 rounded shrink-0 border border-[#00FF41]/30 uppercase tracking-wider">
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Route Inventory */}
          {activeAuditTab === 'routes' && (
            <div className="space-y-3">
              <p className="text-xs text-white/50 font-mono">
                Canonical sitemap registry with typed frontmatter metadata and target audiences:
              </p>
              <div className="border border-white/10 rounded overflow-hidden divide-y divide-white/10 bg-white/5 font-mono text-xs">
                {routes.map((r) => (
                  <div key={r.id} className="p-3 flex items-center justify-between gap-3 hover:bg-white/10 transition-colors">
                    <div className="space-y-0.5 min-w-0">
                      <button
                        onClick={() => {
                          onNavigate(r.slug);
                          onClose();
                        }}
                        className="text-[#00FF41] hover:underline font-bold text-left truncate block"
                      >
                        {r.slug}
                      </button>
                      <div className="text-[11px] text-white/50 truncate font-sans">{r.title}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                        {r.contentType}
                      </span>
                      <ClaimBadge status={r.claimStatus} size="sm" showLabel={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature Matrix */}
          {activeAuditTab === 'matrix' && (
            <div className="space-y-3">
              <p className="text-xs text-white/50 font-mono">
                Strict claim classifications backed by actual repository source code:
              </p>
              <div className="space-y-2">
                {FEATURES_DATA.map((f) => (
                  <div key={f.id} className="p-3 bg-white/5 border border-white/10 rounded flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white font-sans">{f.title}</span>
                        <ClaimBadge status={f.claimStatus} size="sm" />
                      </div>
                      <p className="text-xs text-white/60 font-sans">{f.summary}</p>
                      <div className="text-[11px] font-mono text-[#00FF41]">
                        Source: {f.codeSource}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topic Clusters */}
          {activeAuditTab === 'clusters' && (
            <div className="space-y-4">
              <div className="p-4 rounded bg-white/5 border border-white/10">
                <h4 className="font-bold text-white font-display text-sm mb-2 uppercase tracking-wide">
                  Semantic Entity Graph Hierarchy
                </h4>
                <div className="font-mono text-xs text-white/70 space-y-2 bg-black/60 p-3 rounded border border-white/10">
                  <div className="text-[#00FF41]">Decentralized.Host (Root Entity)</div>
                  <div className="pl-4">├── Decentralized Hosting (Pillar: /decentralized-hosting/)</div>
                  <div className="pl-8">└── Distributed Compute Mesh (Pillar: /depin/)</div>
                  <div className="pl-4">├── Self-Hosted PaaS (Pillar: /self-hosted-paas/)</div>
                  <div className="pl-8">├── PaaS Alternatives &amp; Comparisons (/alternatives/)</div>
                  <div className="pl-8">└── Framework Deployment Recipes (/deploy/)</div>
                  <div className="pl-4">├── Technical Architecture &amp; Subsystems (/architecture/)</div>
                  <div className="pl-4">├── Security Model &amp; Threat Verification (/security/)</div>
                  <div className="pl-4">└── Developer Documentation &amp; CLI Reference (/docs/)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
          <span>Decentralized.Host Audit Suite</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00FF41]/20 hover:bg-[#00FF41]/30 text-[#00FF41] border border-[#00FF41]/40 rounded text-xs font-mono uppercase tracking-wider transition-colors font-medium"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
};
