import React from 'react';
import { FeatureComparisonMatrix } from '../components/FeatureComparisonMatrix';
import { ComparisonTable } from '../components/ComparisonTable';
import { COMPARISONS_DATA } from '../data/comparisons';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { Layers, Shield, Calendar, ExternalLink, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const AlternativesView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/alternatives/'];

  return (
    <div className="space-y-12">
      <JsonLd frontmatter={frontmatter} />
      <LastUpdated updatedAt={frontmatter.updatedAt} />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-[#00FF41] text-xs font-mono">
          <Layers className="w-3.5 h-3.5 text-[#00FF41]" />
          <span className="uppercase tracking-wider">EVIDENCE-BACKED PAAS COMPARISONS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-display text-white uppercase">
          Decentralized.Host vs Alternatives
        </h1>
        <p className="text-white/60 text-sm leading-relaxed font-sans">
          Objective architectural comparisons between Decentralized.Host and self-hosted tools (Coolify, Dokploy, CapRover, Dokku) as well as managed cloud providers (Heroku, Vercel, AWS).
        </p>
      </div>

      {/* AEO Block */}
      <div className="max-w-3xl mx-auto">
        <AeoAnswerBlock
          question="How does Decentralized.Host compare to Coolify and other PaaS alternatives?"
          answer="Unlike single-server PaaS tools like Dokku or single-orchestrator tools like Coolify and Dokploy, Decentralized.Host is built around a decoupled Python node agent daemon, native Git SSH receiver hooks, intelligent multi-node scheduling across independent VPS instances, and optional verifiable compute ledgers."
          sourceContext="Platform comparison matrix (last verified August 2026 across official documentation)"
        />
      </div>

      {/* Dedicated 3-Way Feature Comparison Matrix */}
      <section className="space-y-6">
        <FeatureComparisonMatrix />
      </section>

      {/* Main Interactive Comparison Table */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-widest">
            DEEP DIVE BENCHMARKS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white uppercase">
            Head-to-Head Specification Explorer
          </h2>
        </div>
        <ComparisonTable />
      </section>

      {/* Individual Competitor Summary Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display text-white uppercase">
          Detailed Competitor Profiles &amp; Evidence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COMPARISONS_DATA.map((comp) => (
            <div key={comp.id} className="p-6 rounded-lg bg-[#0a0a0a] border border-white/10 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-lg font-bold font-display text-white">
                  vs {comp.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                  <Calendar className="w-3.5 h-3.5 text-[#00FF41]" />
                  <span>Verified: {comp.lastVerifiedAt}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-white/40">License: <span className="text-white/80">{comp.license}</span></div>
                <div className="text-white/40">Deployment Model: <span className="text-white/80">{comp.deploymentModel}</span></div>
                <div className="text-white/40">Multi-Server: <span className="text-[#00FF41]">{comp.multiServerSupport}</span></div>
              </div>

              <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                {comp.summaryComparison}
              </p>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/40 truncate max-w-[200px]">
                  Ref: {comp.evidenceSource}
                </span>
                <a
                  href={comp.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00FF41] hover:underline flex items-center gap-1 uppercase tracking-wider"
                >
                  <span>Official Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

