import React from 'react';
import { DeployTerminal } from '../components/DeployTerminal';
import { TerminalCursor } from '../components/TerminalCursor';
import { ArchitectureVisualizer } from '../components/ArchitectureVisualizer';
import { FeatureComparisonMatrix } from '../components/FeatureComparisonMatrix';
import { ComparisonTable } from '../components/ComparisonTable';
import { ClaimBadge } from '../components/ClaimBadge';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { CONTENT_REGISTRY } from '../data/registry';
import { FEATURES_DATA } from '../data/features';
import { DEPLOY_RECIPES } from '../data/deployRecipes';
import { 
  Terminal, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  GitBranch, 
  Server, 
  Zap, 
  Lock, 
  Check, 
  Layers, 
  Code2, 
  BookOpen,
  Sparkles,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
  onOpenAudit: () => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate, onOpenAudit }) => {
  const frontmatter = CONTENT_REGISTRY['/'];

  return (
    <div className="space-y-16 sm:space-y-24">
      <JsonLd frontmatter={frontmatter} />

      {/* HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-8 text-center space-y-6">
        {/* Top claim pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono">
          <span className="px-2 py-0.5 bg-[#00FF41]/10 text-[#00FF41] text-[9px] font-mono rounded-full border border-[#00FF41]/30 uppercase">
            MIT Licensed
          </span>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
            Open Source Infrastructure
          </span>
          <ClaimBadge status="IMPLEMENTED" size="sm" showLabel={false} />
        </div>

        {/* Semantic H1 & Hero Headings */}
        <div className="space-y-4 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight text-white leading-[0.95] uppercase">
            DEPLOY ANYWHERE.<br/>
            <span className="text-transparent text-stroke-matrix" style={{ WebkitTextStroke: '1px #00FF41' }}>
              OWN THE INFRA.
            </span>
            <TerminalCursor className="ml-2 inline-block" />
          </h1>
          <p className="text-base sm:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto font-sans">
            Distributed compute mesh for deploying containerized applications from Git or CLI across independently operated compute nodes.
          </p>

          {/* Key Architectural Principles Callout */}
          <div className="flex items-center justify-center gap-8 pt-2 font-mono text-left">
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-mono text-[#00FF41] mb-1 uppercase opacity-70">
                Core Capability
              </span>
              <span className="text-xs sm:text-sm font-medium border-l border-[#00FF41] pl-3 text-white">
                Multi-Server Deployment
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-mono text-[#00FF41] mb-1 uppercase opacity-70">
                Trust Model
              </span>
              <span className="text-xs sm:text-sm font-medium border-l border-[#00FF41] pl-3 text-white">
                Self-Hosted Control Plane
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
          <button
            onClick={() => onNavigate('/docs/')}
            className="px-6 py-3 rounded bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)] flex items-center gap-2"
          >
            <span>Deploy First App</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('/features/')}
            className="px-6 py-3 rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#00FF41]/40 font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>View Verified Features</span>
          </button>

          <a
            href="https://github.com/CodesbyFebin/decentralized.host"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#00FF41]/40 font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/40" />
          </a>
        </div>

        {/* Canonical AEO Definition Box */}
        <div className="max-w-3xl mx-auto px-4 text-left pt-2">
          <AeoAnswerBlock
            question="What is Decentralized.Host?"
            answer="Decentralized.Host is an open-source self-hosted deployment platform and distributed compute mesh for deploying applications from Git or CLI across independently operated compute nodes. It pairs a FastAPI control plane and smart scheduler with lightweight Docker node agents and Traefik dynamic SSL routing."
            sourceContext="Repository core architecture (control-plane/app/main.py, node-agent/agent.py)"
          />
        </div>

        {/* Interactive Deploy Now Live Terminal */}
        <div className="pt-6 px-2 max-w-5xl mx-auto text-left">
          <DeployTerminal />
        </div>
      </section>

      {/* OPEN SOURCE TRUST STRIP */}
      <section className="p-6 rounded-lg bg-white/5 border border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#00FF41]">100% MIT</div>
            <div className="text-xs text-white/50 uppercase font-mono tracking-wider">Permissive Open Source</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">Zero Lock-In</div>
            <div className="text-xs text-white/50 uppercase font-mono tracking-wider">Standard Docker OCI Runtimes</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#00FF41]">Multi-Node</div>
            <div className="text-xs text-white/50 uppercase font-mono tracking-wider">Heterogeneous VPS Scheduling</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">Auto TLS</div>
            <div className="text-xs text-white/50 uppercase font-mono tracking-wider">Let’s Encrypt Reverse Proxy</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: 5-STEP LIFECYCLE */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-semibold text-[#00FF41] uppercase tracking-widest">
            DEPLOYMENT WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            From Code to Globally Routed Container in Seconds
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto font-sans">
            Decentralized.Host simplifies deployment without hiding the underlying Linux and Docker machinery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Code Ingestion', desc: 'Push via Git SSH or run dhost ship in terminal.', icon: Terminal },
            { step: '02', title: 'Auto-Detect', desc: 'Identifies framework (FastAPI, Next.js, Docker) automatically.', icon: Zap },
            { step: '03', title: 'Smart Schedule', desc: 'Selects the healthiest node with available CPU and RAM.', icon: Server },
            { step: '04', title: 'Docker Build', desc: 'Node agent builds and runs container in isolated cgroups.', icon: Cpu },
            { step: '05', title: 'Dynamic Ingress', desc: 'Traefik provisions SSL and routes public traffic instantly.', icon: Globe }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-5 rounded-lg bg-[#0a0a0a] border border-white/10 space-y-2 hover:border-[#00FF41]/40 transition-colors">
                <div className="flex items-center justify-between text-xs font-mono text-white/40">
                  <span>STEP {item.step}</span>
                  <Icon className="w-4 h-4 text-[#00FF41]" />
                </div>
                <h3 className="font-bold text-white text-sm font-display">{item.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed font-sans">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE ARCHITECTURE VISUALIZER */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-semibold text-[#00FF41] uppercase tracking-widest">
            SUBSYSTEMS SPECIFICATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Decoupled Architecture &amp; Data Flow
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto">
            Inspect the interaction between the FastAPI control plane, worker node agents, and Traefik edge.
          </p>
        </div>

        <ArchitectureVisualizer />
      </section>

      {/* AUTHORITATIVE FEATURE COMPARISON MATRIX */}
      <section className="space-y-6">
        <FeatureComparisonMatrix />
      </section>

      {/* VERIFIED CORE CAPABILITIES GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="text-xs font-mono font-semibold text-[#00FF41] uppercase tracking-widest">
              FEATURE DIRECTORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Verified Platform Capabilities
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/features/')}
            className="text-xs font-mono text-[#00FF41] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View all 11 verified features</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES_DATA.slice(0, 6).map((feat) => (
            <div key={feat.id} className="p-5 rounded-lg bg-[#0a0a0a] border border-white/10 space-y-3 flex flex-col justify-between hover:border-[#00FF41]/40 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                    {feat.category}
                  </span>
                  <ClaimBadge status={feat.claimStatus} size="sm" />
                </div>
                <h3 className="font-bold text-white text-base font-display">{feat.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed font-sans">{feat.summary}</p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1.5 font-mono text-[11px]">
                <div className="text-white/40 truncate text-[10px]">Source: {feat.codeSource}</div>
                {feat.cliCommand && (
                  <div className="text-[#00FF41] bg-[#00FF41]/10 px-2 py-1 rounded truncate border border-[#00FF41]/30">
                    {feat.cliCommand}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUPPORTED FRAMEWORKS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="text-xs font-mono font-semibold text-[#00FF41] uppercase tracking-widest">
              ZERO-CONFIG DEPLOYMENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Deploy Any Language, Framework, or Database
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/deploy/')}
            className="text-xs font-mono text-[#00FF41] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View all recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          {DEPLOY_RECIPES.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => onNavigate(`/deploy/#${recipe.slug}`)}
              className="p-4 rounded-lg bg-[#0a0a0a] border border-white/10 text-left hover:border-[#00FF41]/50 transition-colors space-y-1 group"
            >
              <div className="font-bold text-white group-hover:text-[#00FF41] font-sans">
                {recipe.name}
              </div>
              <div className="text-[11px] text-white/40">{recipe.runtime}</div>
              <div className="text-[10px] text-[#00FF41] pt-2 flex items-center gap-1 uppercase tracking-wider">
                <span>View recipe</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* FINAL ACTIVATION CALL TO ACTION */}
      <section className="p-8 sm:p-12 rounded-lg bg-[#0a0a0a] border border-[#00FF41]/30 text-center space-y-6 relative overflow-hidden shadow-2xl shadow-[#00FF41]/5">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-semibold text-[#00FF41] uppercase tracking-widest">
            OWN YOUR COMPUTE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white uppercase">
            Ready to Deploy without Cloud Lock-In?
          </h2>
          <p className="text-white/60 text-sm leading-relaxed font-sans">
            Install the dhost CLI or self-host your own coordinator in under 3 minutes with Docker Compose.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 p-2 px-4 rounded bg-white/5 border border-white/10 font-mono text-xs sm:text-sm text-[#00FF41]">
          <Terminal className="w-4 h-4 text-[#00FF41]" />
          <span>git clone https://github.com/CodesbyFebin/decentralized.host && pip install -e ./cli</span>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
          <button
            onClick={() => onNavigate('/docs/')}
            className="px-6 py-3 rounded bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)]"
          >
            Read Documentation
          </button>
          <a
            href="https://github.com/CodesbyFebin/decentralized.host"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
};

