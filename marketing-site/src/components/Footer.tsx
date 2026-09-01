import React from 'react';
import { Terminal, Github, Shield, FileText, ArrowUpRight, Cpu, Layers, BookOpen, ExternalLink, Code } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
  onOpenAudit: () => void;
}

export const Footer: React.FC<Props> = ({ onNavigate, onOpenAudit }) => {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 text-white/60 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Top Status & Telemetry Bar from Immersive UI */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
          <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[#00FF41]">INTENT:</span>
              <span className="text-white/80">AUTHORITATIVE PRODUCT HUB</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00FF41]">VERSION:</span>
              <span className="text-white/80">WEB-BUILD-1.0.4</span>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span>LLM-READY:</span>
              <span className="text-[#00FF41] font-semibold">ACTIVE</span>
            </div>
            <div className="h-3 w-px bg-white/20 hidden sm:block"></div>
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('/sitemap.xml')} className="hover:text-[#00FF41] transition-colors">Sitemap</button>
              <button onClick={() => onNavigate('/llms.txt')} className="hover:text-[#00FF41] text-[#00FF41] transition-colors">llms.txt</button>
              <button onClick={() => onNavigate('/openapi.json')} className="hover:text-[#00FF41] transition-colors">OpenAPI</button>
            </div>
          </div>
        </div>

        {/* Top Entity Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#00FF41] rounded-sm flex items-center justify-center rotate-45">
                <div className="w-2 h-2 bg-[#00FF41]"></div>
              </div>
              <span className="font-mono font-bold text-base text-white tracking-tight">
                DECENTRALIZED<span className="text-[#00FF41]">.</span>HOST
              </span>
            </div>

            <p className="text-white/60 leading-relaxed text-xs max-w-md font-sans">
              Open-source self-hosted deployment platform and distributed compute mesh. Deploy applications from Git or CLI across independently operated compute nodes. You run the platform. You own your infrastructure.
            </p>

            <div className="flex items-center gap-3 pt-2 font-mono text-[10px] uppercase tracking-wider">
              <span className="px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                MIT Licensed
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">
                100% Open Source
              </span>
              <button
                onClick={onOpenAudit}
                className="text-[#00FF41] hover:underline flex items-center gap-1"
              >
                <Shield className="w-3 h-3" /> Audit Suite
              </button>
            </div>
          </div>

          {/* Col 1: Product & Architecture */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold text-white uppercase tracking-widest">
              Product &amp; Systems
            </h4>
            <ul className="space-y-2 text-white/60">
              <li>
                <button onClick={() => onNavigate('/features/')} className="hover:text-[#00FF41] transition-colors">
                  Features Matrix
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/architecture/')} className="hover:text-[#00FF41] transition-colors">
                  System Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/security/')} className="hover:text-[#00FF41] transition-colors">
                  Security &amp; Threat Model
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/roadmap/')} className="hover:text-[#00FF41] transition-colors">
                  Engineering Roadmap
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about/')} className="hover:text-[#00FF41] transition-colors">
                  Mission &amp; Philosophy
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Category Pillars & Guides */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold text-white uppercase tracking-widest">
              Category Pillars
            </h4>
            <ul className="space-y-2 text-white/60">
              <li>
                <button onClick={() => onNavigate('/decentralized-hosting/')} className="hover:text-[#00FF41] transition-colors">
                  Decentralized Hosting
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/self-hosted-paas/')} className="hover:text-[#00FF41] transition-colors">
                  Self-Hosted PaaS
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/depin/')} className="hover:text-[#00FF41] transition-colors">
                  DePIN Compute Mesh
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/alternatives/')} className="hover:text-[#00FF41] transition-colors">
                  PaaS Alternatives (Coolify, Dokploy)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/deploy/')} className="hover:text-[#00FF41] transition-colors">
                  Framework Recipes (FastAPI, Next.js)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Developers & Machine Readable */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold text-white uppercase tracking-widest">
              Developers &amp; LLMs
            </h4>
            <ul className="space-y-2 text-white/60">
              <li>
                <button onClick={() => onNavigate('/docs/')} className="hover:text-[#00FF41] transition-colors">
                  Developer Docs &amp; CLI
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/guides/')} className="hover:text-[#00FF41] transition-colors">
                  Deployment Guides
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/llms.txt')} className="hover:text-[#00FF41] transition-colors font-mono text-[11px] text-[#00FF41]">
                  /llms.txt (LLM Spec)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/sitemap.xml')} className="hover:text-[#00FF41] transition-colors font-mono text-[11px]">
                  /sitemap.xml
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/robots.txt')} className="hover:text-[#00FF41] transition-colors font-mono text-[11px]">
                  /robots.txt
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Semantic Entity Graph Bar */}
        <div className="p-4 rounded-lg bg-[#0a0a0a] border border-white/10 font-mono text-[11px] text-white/60 space-y-2">
          <div className="text-white font-semibold uppercase tracking-wider">
            Canonical Knowledge Graph &amp; Node Hierarchy
          </div>
          <p className="text-white/60 leading-relaxed font-sans text-xs">
            <span className="text-[#00FF41] font-mono">Decentralized.Host</span> ➔ 
            <span className="text-white/80"> Control Plane (FastAPI)</span> ➔ 
            <span className="text-white/80"> Smart Scheduler</span> ➔ 
            <span className="text-white/80"> Distributed Node Agents</span> ➔ 
            <span className="text-white/80"> Docker OCI Containers</span> ➔ 
            <span className="text-white/80"> Traefik Dynamic Ingress</span> ➔ 
            <span className="text-white/80"> Optional Solana Compute Credits</span>
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap text-xs text-white/40 font-mono">
          <div>
            © 2025 Decentralized.Host. MIT Open Source License. Canonical Repository:{' '}
            <a
              href="https://github.com/CodesbyFebin/decentralized.host"
              target="_blank"
              rel="noreferrer"
              className="text-[#00FF41] hover:underline"
            >
              CodesbyFebin/decentralized.host
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/CodesbyFebin/decentralized.host"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <button onClick={onOpenAudit} className="hover:text-[#00FF41]">
              Audit Gates
            </button>
            <button onClick={() => onNavigate('/security/')} className="hover:text-white">
              security.txt
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
