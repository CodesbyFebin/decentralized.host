import React, { useState, useMemo } from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { PILLARS, PILLAR_GROUPS } from '../data/pillars';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { Search, Link2, Link2Off } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const PillarsIndexView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/pillars/'];
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return PILLARS.filter(
      (p) =>
        (group === 'all' || p.group === group) &&
        (p.title.toLowerCase().includes(q) || p.oneLine.toLowerCase().includes(q))
    );
  }, [query, group]);

  const writtenCount = PILLARS.filter((p) => p.written).length;

  return (
    <div className="space-y-10">
      <JsonLd frontmatter={frontmatter} />
      <LastUpdated updatedAt={frontmatter.updatedAt} />

      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Decentralized.Host Pillar Directory
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          69 topic pillars across decentralized infrastructure, self-hosting, and Web3 --
          a deliberately broad content directory, not a product feature list. Each page says
          plainly whether the topic actually connects to what Decentralized.Host does.{' '}
          <span className="text-emerald-400 font-semibold">{writtenCount} of 69</span> have full
          write-ups today; the rest carry a short, honest summary while more get written in
          batches, the same way this project's own docs grew.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <AeoAnswerBlock
          question="What is the Decentralized.Host Pillar Directory?"
          answer="A 69-page topic directory covering decentralized infrastructure, self-hosting/DevOps, and Web3/blockchain concepts. It is a broad content strategy, not a map of product features -- most topics (DAO governance, yield farming, NFT metadata) have no connection to the real product, and each page states that honestly rather than implying a capability that doesn't exist."
          sourceContext="src/data/pillars.ts"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 69 pillars..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-slate-800 text-sm text-slate-300 font-mono"
        >
          <option value="all">All groups</option>
          {PILLAR_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {filtered.map((p) => (
          <button
            key={p.slug}
            onClick={() => onNavigate(`/${p.slug}/`)}
            className={`text-left p-4 rounded-xl border transition-colors ${
              p.written
                ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-400/50'
                : 'border-slate-800 bg-[#0a0a0a] hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="font-bold text-white text-sm font-display">{p.title}</span>
              {p.relatesToProduct ? (
                <Link2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Link2Off className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">{p.oneLine}</p>
            <span className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
              {p.group}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-slate-500 text-sm py-8">
            No pillars match "{query}".
          </p>
        )}
      </div>
    </div>
  );
};
