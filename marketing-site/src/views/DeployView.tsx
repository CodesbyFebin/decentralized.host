import React, { useState } from 'react';
import { DEPLOY_RECIPES } from '../data/deployRecipes';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { ClaimBadge } from '../components/ClaimBadge';
import { Layers, Terminal, Copy, Check, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const DeployView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/deploy/'];
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('deploy-fastapi');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const activeRecipe = DEPLOY_RECIPES.find((r) => r.id === selectedRecipeId) || DEPLOY_RECIPES[0];

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-12">
      <JsonLd frontmatter={frontmatter} />
      <LastUpdated updatedAt={frontmatter.updatedAt} />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Layers className="w-3.5 h-3.5" />
          <span>FRAMEWORK RECIPES &amp; AUTO-DETECTION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Framework Deployment Recipes
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Zero-config automated container build pipelines and sample configuration files for modern web stacks.
        </p>
      </div>

      {/* AEO Block */}
      <div className="max-w-3xl mx-auto">
        <AeoAnswerBlock
          question="How does framework auto-detection work in Decentralized.Host?"
          answer="Decentralized.Host inspects your project directory for signature files (such as requirements.txt for FastAPI, package.json for Next.js/Express, or custom Dockerfiles). If no Dockerfile is provided, it automatically generates a multi-stage OCI build pipeline and assigns memory/CPU allocations."
          sourceContext="Framework Auto-Detection heuristic (control-plane/app/detect.py, cli/dhost/detect.py)"
        />
      </div>

      {/* Framework Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
        {DEPLOY_RECIPES.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => setSelectedRecipeId(recipe.id)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap border transition-all ${
              selectedRecipeId === recipe.id
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/80 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-[#080b0f] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {recipe.name}
          </button>
        ))}
      </div>

      {/* Recipe Detail Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap pb-6 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
              {activeRecipe.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Deploy {activeRecipe.name}
            </h2>
            <div className="flex items-center gap-2 mt-2 font-mono text-xs text-slate-400">
              <span>Runtime: <strong className="text-slate-200">{activeRecipe.runtime}</strong></span>
              <span>•</span>
              <span>Detected Files: <strong className="text-emerald-400">{activeRecipe.autoDetectFiles.join(', ') || 'Custom'}</strong></span>
            </div>
          </div>
          <ClaimBadge status={activeRecipe.claimStatus} size="sm" />
        </div>

        {/* Prerequisites */}
        <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800 space-y-2">
          <h3 className="text-xs font-mono font-semibold text-emerald-400 uppercase">
            Prerequisites:
          </h3>
          <ul className="space-y-1 text-xs text-slate-300">
            {activeRecipe.prerequisites.map((p, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reference Dockerfile -- for dhost ship (the default, no-Dockerfile path),
            this is informational only: the control plane generates and uses its
            own Dockerfile server-side for detected stacks, always on port 8080
            (port 80 for static sites) regardless of framework convention. This
            reference version follows this framework's normal convention instead
            (e.g. Node on 3000) -- use it with the older `dhost init` + `dhost
            deploy` local-build path if you need that specific behavior. */}
        <div className="rounded-xl bg-[#040609] border border-slate-800 overflow-hidden font-mono text-xs">
          <div className="px-4 py-2 bg-[#080b0f] border-b border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 font-semibold">Reference Dockerfile (you don't need to write this for `dhost ship`)</span>
            <button
              onClick={() => handleCopy(activeRecipe.dockerfileSnippet, 'dockerfile')}
              className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              {copiedType === 'dockerfile' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'dockerfile' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 text-emerald-300 overflow-x-auto leading-relaxed max-h-[300px]">
            {activeRecipe.dockerfileSnippet}
          </pre>
          <p className="px-4 py-3 text-[11px] text-slate-500 border-t border-slate-800">
            `dhost ship` auto-detects your stack and generates its own Dockerfile server-side (always port 8080, or 80 for static sites) -- you never need to write or commit one. This reference version follows {activeRecipe.name}'s normal port convention instead; use it with `dhost init` + `dhost deploy` (the local-build path) if you specifically need that.
          </p>
        </div>

        {/* Deployment Steps */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-lg font-bold font-display text-white">
            Deployment Instructions
          </h3>
          <div className="space-y-2">
            {activeRecipe.steps.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-start gap-3 text-xs sm:text-sm text-slate-300 font-sans">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
