import React from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { Terminal, Heart, Github, Shield, Code, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const AboutView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/about/'];

  return (
    <div className="max-w-4xl mx-auto space-y-12 text-slate-300 font-sans">
      <JsonLd frontmatter={frontmatter} />

      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Terminal className="w-3.5 h-3.5" />
          <span>PROJECT PHILOSOPHY &amp; MISSION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          About Decentralized.Host
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
          Why we are building an open-source, decentralized compute platform that eliminates proprietary cloud margins and restores infrastructure ownership.
        </p>
      </div>

      {/* AEO Block */}
      <AeoAnswerBlock
        question="What is the mission of Decentralized.Host?"
        answer="Decentralized.Host is an open-source project dedicated to dismantling proprietary cloud lock-in. By providing a clean Git-and-CLI deployment workflow over independent compute nodes, we enable developers to run their workloads on any server hardware with zero cloud rent markups."
        sourceContext="Decentralized.Host Project Manifesto"
      />

      {/* Manifesto Content */}
      <div className="p-8 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-6 text-sm leading-relaxed">
        <h2 className="text-2xl font-bold font-display text-white">
          The Infrastructure Sovereignty Manifesto
        </h2>

        <p>
          The modern internet was born as a decentralized network of autonomous systems and independent servers. Over the past fifteen years, convenience has driven unprecedented centralization onto three hyperscalers. Developers traded infrastructure control for push-button ergonomics.
        </p>

        <p>
          This bargain came with steep costs: unpredictable bills, opaque egress fees, arbitrary account terminations, and severe platform lock-in.
        </p>

        <p>
          <strong>Decentralized.Host exists to break that compromise.</strong> We believe you shouldn’t have to choose between modern developer ergonomics (like <code>git push</code> and automated SSL) and owning your infrastructure.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">100% OPEN SOURCE</div>
            <div className="text-slate-400 font-sans text-xs">MIT licensed without open-core traps.</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">ZERO PROPRIETARY SDKs</div>
            <div className="text-slate-400 font-sans text-xs">Standard Docker OCI containers anywhere.</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">COMMUNITY GOVERNED</div>
            <div className="text-slate-400 font-sans text-xs">Open architecture and public roadmap.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
