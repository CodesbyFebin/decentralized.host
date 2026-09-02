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
            // Infrastructure Without Permission
          </span>
          <ClaimBadge status="IMPLEMENTED" size="sm" showLabel={false} />
        </div>

        {/* Semantic H1 & Hero Headings */}
        <div className="space-y-4 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight text-white leading-[0.95] uppercase">
            HOST ANYWHERE. RUN EVERYWHERE.<br/>
            <span className="text-transparent text-stroke-matrix" style={{ WebkitTextStroke: '1px #00FF41' }}>
              OWN THE INFRASTRUCTURE.
            </span>
            <TerminalCursor className="ml-2 inline-block" />
          </h1>
          <p className="text-base sm:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto font-sans">
            Deploy applications across an open network of independently operated compute and
            storage nodes — self-host it yourself, or join a mesh someone else is running.
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

          {/* Developer -> Host Network flow -- the real flow today is
              single-operator (you run the control plane, you decide which
              nodes join it via a shared secret, see /docs/ and /depin/), not
              a permissionless public marketplace. Framed as the mesh
              topology, not as "anyone anywhere can join your mesh." */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-4 font-mono text-[10px] sm:text-xs text-white/50 uppercase tracking-wide flex-wrap">
            <span className="text-white">Developer</span>
            <ArrowRight className="w-3 h-3 text-[#00FF41]" />
            <span className="text-white">Decentralized.Host</span>
            <ArrowRight className="w-3 h-3 text-[#00FF41]" />
            <span className="text-white">Node Mesh</span>
            <ArrowRight className="w-3 h-3 text-[#00FF41]" />
            <span className="text-white">Independent Peers</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
          <button
            onClick={() => onNavigate('/docs/')}
            className="px-6 py-3 rounded bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)] flex items-center gap-2"
          >
            <span>Deploy to the Network</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('/depin/')}
            className="px-6 py-3 rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#00FF41]/40 font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>Become a Host</span>
          </button>

          <a
            href="https://github.com/CodesbyFebin/decentralized.hosting"
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
            answer="Decentralized.Host is an open-source self-hosted deployment platform and distributed compute mesh for deploying applications from Git or CLI across independently operated compute nodes. It pairs a FastAPI control plane and smart scheduler with lightweight Docker node agents and Traefik dynamic SSL routing. Today, joining a mesh as a node operator requires that mesh's shared join secret -- it is not yet a public, permissionless marketplace; see /depin/ for the real node-operator flow."
            sourceContext="Repository core architecture (control-plane/app/main.py, node-agent/agent.py)"
          />
        </div>

        {/* Interactive Deploy Now Live Terminal */}
        <div className="pt-6 px-2 max-w-5xl mx-auto text-left">
          <DeployTerminal />
        </div>
      </section>

      {/* THE NETWORK -- narrative framing is fine (it's the same "open
          network of independently operated nodes" story as the hero), but
          the pipeline below is the REAL one (ship -> detect -> build ->
          schedule -> route -> monitor), not the fictional
          replication/peer-discovery/verification/settlement one from the
          mockup this section was adapted from -- none of those exist. */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-[10px] sm:text-[11px] font-mono text-[#00FF41] uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="text-white/30">&gt;</span> The Network
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white uppercase">
            The Internet Should Run <span className="text-[#00FF41]">Everywhere</span>
          </h2>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed font-sans">
            Decentralized Hosting reimagines hosting as a network of independently operated
            computers instead of one provider's data center. Developers ship once; whichever
            node in the mesh has capacity picks up the build and serves the traffic.
          </p>
        </div>

        <div className="flex flex-wrap items-stretch justify-center gap-2 sm:gap-3">
          {[
            'Ship (CLI / Git push)', 'Detect Stack', 'Build Container',
            'Schedule to Node', 'Route + TLS', 'Heartbeat Monitor',
          ].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="px-4 py-2.5 rounded border border-[#00FF41]/20 bg-white/[0.02] text-[10px] sm:text-xs font-mono text-[#00FF41] uppercase tracking-wide">
                {step}
              </div>
              {i < arr.length - 1 && (
                <span className="self-center text-[#00FF41]/40 font-mono">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-[11px] text-white/30 font-mono text-center">
          The real pipeline, stage by stage -- see cli/dhost/main.py, control-plane/app/scheduler.py, node-agent/agent.py
        </p>
      </section>

      {/* TWO-SIDED NETWORK -- kept the "Airbnb-for-compute" framing since
          it's genuinely how this works, but the mechanism described is the
          real one (run node-agent, optionally earn Solana devnet credits
          for verified uptime -- see /depin/), not a "buy persistent
          capacity from the network" marketplace, which doesn't exist. */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#080b0f] border border-white/10 space-y-3">
          <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-[0.2em]">For Hosts</span>
          <h3 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-[#00FF41]" />
            Turn Idle Hardware Into Infrastructure
          </h3>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
            Run a node-agent on hardware you already own and it joins your mesh's scheduling
            pool. Node operators can optionally earn Solana devnet credits for verified uptime
            heartbeats -- devnet only, no real monetary value today (see{' '}
            <button onClick={() => onNavigate('/depin/')} className="text-[#00FF41] underline decoration-[#00FF41]/40 hover:text-white">/depin/</button>).
          </p>
          <p className="text-[11px] font-mono text-white/40 pt-1">PC • Server • VPS • NAS • Homelab</p>
        </div>
        <div className="p-6 sm:p-8 rounded-2xl bg-[#080b0f] border border-white/10 space-y-3">
          <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-[0.2em]">For Developers</span>
          <h3 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#00FF41]" />
            Deploy Without Owning Servers
          </h3>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
            <code className="text-[#00FF41]">dhost ship</code> or a plain <code className="text-[#00FF41]">git push</code> -- no
            Dockerfile to write, no server to provision by hand. The control plane detects your
            stack, builds the container, and schedules it onto the best available node in your mesh.
          </p>
          <p className="text-[11px] font-mono text-white/40 pt-1">No Dockerfile • No managed-platform lock-in</p>
        </div>
      </section>

      {/* SELF-HEALING -- automatic rescheduling of a crashed node's
          deployments is real now (control-plane/app/failover.py), verified
          end-to-end: a node's heartbeat going stale past NODE_OFFLINE_SECONDS
          gets its running deployments rescheduled to a healthy node,
          pulling the already-built image from the mesh's shared registry.
          Still no animated "watch it happen" demo here -- that's a
          real gap (there IS a real gap between the old node going offline
          and the new container being ready, and in-container state isn't
          migrated), stated honestly in the copy below instead of hidden
          behind an animation. */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#080b0f] border border-white/10 space-y-5">
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-[0.2em] flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" /> Resilience
          </span>
          <h3 className="text-lg sm:text-xl font-bold font-display text-white">
            Health Monitoring and Automated Failover
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <ClaimBadge status="IMPLEMENTED" size="sm" />
              <span className="text-xs font-mono text-white uppercase">Heartbeat health tracking</span>
            </div>
            <p className="text-xs text-white/50 font-sans leading-relaxed">
              Every node reports in on an interval; the control plane marks it healthy, stale,
              or offline based on how recently it last checked in.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <ClaimBadge status="IMPLEMENTED" size="sm" />
              <span className="text-xs font-mono text-white uppercase">Automatic failover</span>
            </div>
            <p className="text-xs text-white/50 font-sans leading-relaxed">
              A node offline for NODE_OFFLINE_SECONDS (180s default) has its running deployments
              rescheduled to a healthy node automatically, no rebuild needed. Real limits: a real
              gap while the new container starts (not zero-downtime), and in-container state isn't
              migrated -- see the FAQ.
            </p>
          </div>
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
          <span>git clone https://github.com/CodesbyFebin/decentralized.hosting && pip install -e ./cli</span>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
          <button
            onClick={() => onNavigate('/docs/')}
            className="px-6 py-3 rounded bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)]"
          >
            Read Documentation
          </button>
          <a
            href="https://github.com/CodesbyFebin/decentralized.hosting"
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

