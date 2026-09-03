import React from 'react';
import { getPillar } from '../data/pillars';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { ArrowLeft, Link2, Link2Off } from 'lucide-react';

interface Props {
  slug: string;
  onNavigate: (path: string) => void;
}

export const PillarDetailView: React.FC<Props> = ({ slug, onNavigate }) => {
  const pillar = getPillar(slug);
  const frontmatter = CONTENT_REGISTRY['/pillars/']; // shared JSON-LD context; per-pillar entries are lightweight by design

  if (!pillar) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Unknown pillar.</p>
        <button onClick={() => onNavigate('/pillars/')} className="text-emerald-400 text-sm mt-2 underline">
          Back to Pillar Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <JsonLd frontmatter={frontmatter} />
      <button
        onClick={() => onNavigate('/pillars/')}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Pillar Directory
      </button>

      <div className="space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{pillar.group}</span>
        <h1 className="text-3xl font-bold font-display text-white">{pillar.title}</h1>
        <p className="text-slate-300 text-sm">{pillar.oneLine}</p>
        <LastUpdated updatedAt="2026-09-03T00:00:00Z" />
      </div>

      <div
        className={`p-4 rounded-lg border flex items-start gap-3 ${
          pillar.relatesToProduct
            ? 'border-emerald-500/30 bg-emerald-950/10'
            : 'border-amber-500/20 bg-amber-950/5'
        }`}
      >
        {pillar.relatesToProduct ? (
          <Link2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <Link2Off className="w-4 h-4 text-amber-400/70 shrink-0 mt-0.5" />
        )}
        <div>
          <div className="text-xs font-mono uppercase tracking-wide text-slate-400 mb-1">
            {pillar.relatesToProduct ? 'Real connection to Decentralized.Host' : "Doesn't connect to Decentralized.Host"}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{pillar.productNote}</p>
        </div>
      </div>

      {pillar.written && pillar.sections ? (
        <div className="space-y-8">
          {pillar.sections.map((s, i) => (
            <div key={i} className="space-y-2">
              <h2 className="text-lg font-bold text-white font-display">{s.heading}</h2>
              {s.body.split('\n\n').map((para, j) => (
                <p key={j} className="text-sm text-slate-300 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-slate-800 bg-[#0a0a0a] text-center">
          <p className="text-sm text-slate-400">
            Short summary above; the full write-up for this pillar hasn't been produced yet --
            it's queued for a future content batch, not padded out to look finished.
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-slate-800">
        <AeoAnswerBlock
          question={`What is ${pillar.title}?`}
          answer={pillar.oneLine + ' ' + pillar.productNote}
          sourceContext="src/data/pillars.ts"
        />
      </div>
    </div>
  );
};
