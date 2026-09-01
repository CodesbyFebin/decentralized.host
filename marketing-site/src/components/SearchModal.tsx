import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ArrowRight, FileText, Code2, BookOpen, Layers, Shield, Cpu } from 'lucide-react';
import { CONTENT_REGISTRY } from '../data/registry';
import { FEATURES_DATA } from '../data/features';
import { DOCS_DATA } from '../data/docs';
import { GUIDES_DATA } from '../data/guides';
import { DEPLOY_RECIPES } from '../data/deployRecipes';
import { ClaimBadge } from './ClaimBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build searchable index
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const items: Array<{
      id: string;
      title: string;
      snippet: string;
      path: string;
      category: string;
      icon: any;
      claimStatus?: any;
    }> = [];

    // Search Pages
    Object.values(CONTENT_REGISTRY).forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.h1.toLowerCase().includes(q) ||
        p.primaryEntity.toLowerCase().includes(q) ||
        p.secondaryEntities.some((e) => e.toLowerCase().includes(q))
      ) {
        items.push({
          id: p.id,
          title: p.title,
          snippet: p.description,
          path: p.slug,
          category: 'Page / Pillar',
          icon: FileText,
          claimStatus: p.claimStatus
        });
      }
    });

    // Search Features
    FEATURES_DATA.forEach((f) => {
      if (
        f.title.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.codeSource.toLowerCase().includes(q)
      ) {
        items.push({
          id: f.id,
          title: f.title,
          snippet: f.summary,
          path: `/features/#${f.slug}`,
          category: 'Feature Matrix',
          icon: Cpu,
          claimStatus: f.claimStatus
        });
      }
    });

    // Search Docs
    DOCS_DATA.forEach((d) => {
      if (
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q)
      ) {
        items.push({
          id: d.id,
          title: d.title,
          snippet: d.description,
          path: `/docs/#${d.slug}`,
          category: 'Documentation',
          icon: BookOpen
        });
      }
    });

    // Search Guides
    GUIDES_DATA.forEach((g) => {
      if (
        g.title.toLowerCase().includes(q) ||
        g.architectureOverview.toLowerCase().includes(q)
      ) {
        items.push({
          id: g.id,
          title: g.title,
          snippet: g.architectureOverview,
          path: `/guides/#${g.slug}`,
          category: 'Guide / Tutorial',
          icon: Code2,
          claimStatus: g.claimStatus
        });
      }
    });

    // Search Deploy Recipes
    DEPLOY_RECIPES.forEach((r) => {
      if (
        r.name.toLowerCase().includes(q) ||
        r.runtime.toLowerCase().includes(q)
      ) {
        items.push({
          id: r.id,
          title: `Deploy ${r.name}`,
          snippet: `Runtime: ${r.runtime}. Auto-detect files: ${r.autoDetectFiles.join(', ')}`,
          path: `/deploy/#${r.slug}`,
          category: 'Deploy Recipe',
          icon: Layers,
          claimStatus: r.claimStatus
        });
      }
    });

    return items.slice(0, 10);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0b0e14] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-slate-800 bg-[#07090e]">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            placeholder="Search docs, features, architecture, guides, CLI commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full px-3 py-4 bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-md"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-2 overflow-y-auto divide-y divide-slate-800/50">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <p className="font-mono text-emerald-400/80 text-xs mb-2">QUICK SEARCH INDEX</p>
              <p>Type keywords like <span className="text-emerald-300 font-mono">"FastAPI"</span>, <span className="text-emerald-300 font-mono">"Coolify"</span>, <span className="text-emerald-300 font-mono">"Git push"</span>, or <span className="text-emerald-300 font-mono">"Traefik"</span></p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <p>No results found for "<span className="text-slate-200">{query}</span>"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for generic categories like Docker, CLI, scheduler, or security.</p>
            </div>
          ) : (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.path);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded bg-slate-800 text-emerald-400 shrink-0 mt-0.5 group-hover:bg-emerald-500/20">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-200 group-hover:text-emerald-300 text-sm">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                        {item.claimStatus && (
                          <ClaimBadge status={item.claimStatus} size="sm" showLabel={false} />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {item.snippet}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0 self-center" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 px-4 bg-[#07090e] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Search index: 40+ canonical entities</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
