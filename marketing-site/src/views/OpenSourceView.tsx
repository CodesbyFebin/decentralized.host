import React from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { Github, Heart, Shield, Code2, ExternalLink, Terminal, GitPullRequest } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const OpenSourceView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/open-source/'];

  return (
    <div className="max-w-4xl mx-auto space-y-12 text-slate-300 font-sans">
      <JsonLd frontmatter={frontmatter} />
      <LastUpdated updatedAt={frontmatter.updatedAt} />

      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Github className="w-3.5 h-3.5" />
          <span>OPEN-SOURCE REPOSITORY &amp; COMMUNITY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Decentralized.Host is 100% Open Source
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
          Released under the permissive MIT License. Zero artificial feature gates, zero closed-source enterprise modules, and full code transparency.
        </p>
      </div>

      {/* AEO Block */}
      <AeoAnswerBlock
        question="Is Decentralized.Host open source?"
        answer="Yes. Decentralized.Host is 100% open source under the MIT License. The entire source code—including the FastAPI control plane, Python node agent daemon, Git SSH server, and CLI tool—is available on GitHub at CodesbyFebin/decentralized.hosting."
        sourceContext="Repository License and GitHub Source Verification"
      />

      {/* Repository Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white font-display text-lg">CodesbyFebin/decentralized.hosting</div>
              <div className="text-xs font-mono text-emerald-400">Target Repository • MIT License</div>
            </div>
          </div>

          <a
            href="https://github.com/CodesbyFebin/decentralized.hosting"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Contribution Guidelines */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-emerald-400" />
            How to Contribute
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            We welcome contributions from developers, DevOps engineers, and distributed systems architects worldwide.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-xl bg-black border border-slate-800 text-slate-300 space-y-2">
              <div className="text-slate-500"># 1. Clone the repository</div>
              <div className="text-emerald-300">git clone https://github.com/CodesbyFebin/decentralized.hosting.git</div>
              <div className="text-slate-500 pt-1"># 2. Set up virtual environment and control plane</div>
              <div className="text-emerald-300">cd decentralized.hosting && python3 -m venv venv && source venv/bin/activate</div>
              <div className="text-slate-500 pt-1"># 3. Run development tests</div>
              <div className="text-emerald-300">pytest tests/</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
