import React, { useState } from 'react';
import { GUIDES_DATA } from '../data/guides';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { ClaimBadge } from '../components/ClaimBadge';
import { Code2, Clock, CheckCircle2, AlertCircle, Shield, Terminal, ArrowRight, Copy, Check } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const GuidesView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/guides/'];
  const [selectedGuideId, setSelectedGuideId] = useState<string>('guide-git-push');
  const [copiedStepIdx, setCopiedStepIdx] = useState<number | null>(null);

  const activeGuide = GUIDES_DATA.find((g) => g.id === selectedGuideId) || GUIDES_DATA[0];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStepIdx(idx);
    setTimeout(() => setCopiedStepIdx(null), 2000);
  };

  return (
    <div className="space-y-12">
      <JsonLd frontmatter={frontmatter} />
      <LastUpdated updatedAt={frontmatter.updatedAt} />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Code2 className="w-3.5 h-3.5" />
          <span>PRODUCTION OPERATIONS &amp; TUTORIALS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Step-by-Step Deployment Guides
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          End-to-end practical tutorials with exact terminal commands, expected outputs, troubleshooting steps, and security considerations.
        </p>
      </div>

      {/* AEO Block */}
      <div className="max-w-3xl mx-auto">
        <AeoAnswerBlock
          question="How do I deploy an app to Decentralized.Host via Git push?"
          answer="To deploy via Git push, register your SSH public key with `dhost keys add ~/.ssh/id_ed25519.pub`, add the git remote `ssh://git@host:2222/app.git`, and run `git push dhost main`. The remote SSH hook will archive your commit, invoke the scheduler, build the Docker container, and route traffic via Traefik."
          sourceContext="Deployment Guide: Deploy with Git (git-server/post-receive.template)"
        />
      </div>

      {/* Guide Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GUIDES_DATA.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setSelectedGuideId(guide.id)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono whitespace-nowrap border transition-all ${
              selectedGuideId === guide.id
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/80 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-[#080b0f] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {guide.title.split('(')[0]}
          </button>
        ))}
      </div>

      {/* Active Guide Content */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-8">
        <div className="space-y-3 pb-6 border-b border-slate-800">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Difficulty: {activeGuide.difficulty}
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {activeGuide.timeMinutes} mins
              </span>
            </div>
            <ClaimBadge status={activeGuide.claimStatus} size="sm" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            {activeGuide.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {activeGuide.architectureOverview}
          </p>
        </div>

        {/* Prerequisites */}
        <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800 space-y-2">
          <h3 className="text-xs font-mono font-semibold text-emerald-400 uppercase">
            Prerequisites:
          </h3>
          <ul className="space-y-1 text-xs text-slate-300">
            {activeGuide.prerequisites.map((p, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold font-display text-white">
            Implementation Steps
          </h3>

          <div className="space-y-6">
            {activeGuide.steps.map((step, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold border border-emerald-500/30">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 font-display">
                    {step.title}
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-sans pl-8">
                  {step.description}
                </p>

                {step.command && (
                  <div className="ml-8 rounded-xl bg-black border border-slate-800 overflow-hidden font-mono text-xs">
                    <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Terminal Command</span>
                      <button
                        onClick={() => handleCopy(step.command!, idx)}
                        className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                      >
                        {copiedStepIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedStepIdx === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3 text-emerald-300 overflow-x-auto">
                      $ {step.command}
                    </pre>
                  </div>
                )}

                {step.output && (
                  <div className="ml-8 rounded-xl bg-[#040608] border border-slate-800 p-3 font-mono text-[11px] text-slate-400 overflow-x-auto space-y-0.5">
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Expected Output:</div>
                    <pre className="text-slate-300 leading-relaxed">{step.output}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-display text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Troubleshooting Common Issues
            </h4>
            <div className="space-y-2">
              {activeGuide.troubleshooting.map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#05070a] border border-slate-800 text-xs space-y-1">
                  <div className="font-semibold text-slate-200">Issue: {t.issue}</div>
                  <div className="text-slate-400">Fix: {t.resolution}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold font-display text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Security Considerations
            </h4>
            <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800 text-xs text-slate-300 space-y-2">
              {activeGuide.securityConsiderations.map((sec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">▪</span>
                  <span>{sec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
