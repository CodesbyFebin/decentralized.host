import React from 'react';
import { ArchitectureVisualizer } from '../components/ArchitectureVisualizer';
import { ARCHITECTURE_COMPONENTS, DEPLOYMENT_LIFECYCLE_STEPS } from '../data/architecture';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { ClaimBadge } from '../components/ClaimBadge';
import { Network, Server, Cpu, Globe, GitBranch, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const ArchitectureView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/architecture/'];

  return (
    <div className="space-y-12">
      <JsonLd frontmatter={frontmatter} />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <span>SYSTEM DESIGN &amp; TOPOLOGY SPECIFICATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          System Architecture &amp; Data Flow
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Decentralized.Host is designed from the ground up as a decoupled, multi-node compute mesh. Learn how the control plane, scheduler, node agents, and edge routers collaborate.
        </p>
      </div>

      {/* AEO Block */}
      <div className="max-w-3xl mx-auto">
        <AeoAnswerBlock
          question="How does Decentralized.Host system architecture work?"
          answer="The Decentralized.Host system architecture is divided into three decoupled layers: a FastAPI control plane handling authentication, state, and scheduling; distributed worker node agents managing local Docker runtimes via Unix sockets; and an edge layer running Traefik for automated Let’s Encrypt TLS and HTTP routing."
          sourceContext="Architecture specification (control-plane/app/, node-agent/agent.py, docker-compose.prod.yml)"
        />
      </div>

      {/* Interactive Visualizer */}
      <ArchitectureVisualizer />

      {/* Deep Dive Subsystem Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display text-white text-center sm:text-left">
          Core Subsystems Specification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARCHITECTURE_COMPONENTS.map((comp) => (
            <div key={comp.id} className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-emerald-400 font-semibold">{comp.name}</span>
                <ClaimBadge status={comp.claimStatus} size="sm" />
              </div>

              <div className="text-xs font-mono text-slate-400">
                Tech Stack: <span className="text-slate-200">{comp.techStack}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                {comp.role}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">
                  Responsibilities:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                  {comp.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-mono">▪</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 text-[11px] font-mono text-slate-500">
                Source Repository Path: <span className="text-emerald-400">{comp.repoPath}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
