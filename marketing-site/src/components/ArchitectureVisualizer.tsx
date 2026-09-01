import React, { useState } from 'react';
import { ARCHITECTURE_COMPONENTS, DEPLOYMENT_LIFECYCLE_STEPS } from '../data/architecture';
import { ClaimBadge } from './ClaimBadge';
import { Server, Terminal, Shield, ArrowRight, Activity, Cpu, HardDrive, Network, GitBranch, Globe } from 'lucide-react';

export const ArchitectureVisualizer: React.FC = () => {
  const [selectedCompId, setSelectedCompId] = useState<string>('comp-control-plane');
  const [activeStep, setActiveStep] = useState<number>(1);

  const selectedComp = ARCHITECTURE_COMPONENTS.find((c) => c.id === selectedCompId) || ARCHITECTURE_COMPONENTS[0];

  return (
    <div className="w-full space-y-8">
      {/* High Level Flow Chart */}
      <div className="p-6 rounded-lg bg-[#0a0a0a] border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2 uppercase tracking-wide">
              <Network className="w-5 h-5 text-[#00FF41]" />
              Decentralized Mesh Architecture
            </h3>
            <p className="text-xs text-white/50 mt-0.5 font-sans">
              Click any component block to inspect internal implementation, responsibilities, and code sources.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ClaimBadge status="IMPLEMENTED" size="sm" />
          </div>
        </div>

        {/* Interactive Block Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* 1. Developer Client */}
          <div
            onClick={() => setSelectedCompId('comp-cli-tool')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedCompId === 'comp-cli-tool'
                ? 'bg-[#00FF41]/10 border-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-white/40 font-mono mb-2">
              <span>01. INGESTION</span>
              <Terminal className="w-4 h-4 text-[#00FF41]" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">dhost CLI &amp; Git Push</h4>
            <p className="text-xs text-white/60 mt-1 line-clamp-2 font-sans">
              Auto-detects framework, packages archive or SSH post-receive hook.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[#00FF41]">cli/dhost/main.py</div>
          </div>

          {/* 2. Control Plane */}
          <div
            onClick={() => setSelectedCompId('comp-control-plane')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedCompId === 'comp-control-plane'
                ? 'bg-[#00FF41]/10 border-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-white/40 font-mono mb-2">
              <span>02. COORDINATOR</span>
              <Server className="w-4 h-4 text-[#00FF41]" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">FastAPI Control Plane</h4>
            <p className="text-xs text-white/60 mt-1 line-clamp-2 font-sans">
              Manages state, auth, and invokes resource-aware placement scheduler.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[#00FF41]">control-plane/app/</div>
          </div>

          {/* 3. Node Mesh */}
          <div
            onClick={() => setSelectedCompId('comp-node-agent')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedCompId === 'comp-node-agent'
                ? 'bg-[#00FF41]/10 border-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-white/40 font-mono mb-2">
              <span>03. COMPUTE MESH</span>
              <Cpu className="w-4 h-4 text-[#00FF41]" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">Distributed Node Agents</h4>
            <p className="text-xs text-white/60 mt-1 line-clamp-2 font-sans">
              Worker daemons driving local Docker engine, reporting telemetry.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[#00FF41]">node-agent/agent.py</div>
          </div>

          {/* 4. Traefik Edge */}
          <div
            onClick={() => setSelectedCompId('comp-traefik-edge')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedCompId === 'comp-traefik-edge'
                ? 'bg-[#00FF41]/10 border-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-white/40 font-mono mb-2">
              <span>04. EDGE INGRESS</span>
              <Globe className="w-4 h-4 text-[#00FF41]" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">Traefik Ingress &amp; TLS</h4>
            <p className="text-xs text-white/60 mt-1 line-clamp-2 font-sans">
              Dynamic Docker label detection, automated Let’s Encrypt SSL routing.
            </p>
            <div className="mt-3 text-[11px] font-mono text-[#00FF41]">docker-compose.yml</div>
          </div>
        </div>

        {/* Selected Component Inspection Box */}
        <div className="mt-6 p-5 rounded-lg bg-black/60 border border-white/10">
          <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-widest">
                INSPECTED SUBSYSTEM
              </span>
              <h4 className="text-lg font-bold text-white font-display mt-0.5">
                {selectedComp.name}
              </h4>
              <p className="text-xs text-white/60 mt-1 font-sans">{selectedComp.role}</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-white/50">Tech Stack:</div>
              <div className="text-xs font-mono text-[#00FF41] font-semibold">{selectedComp.techStack}</div>
              <div className="text-[10px] font-mono text-white/40 mt-0.5">Source: {selectedComp.repoPath}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h5 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-2">
                Key Responsibilities
              </h5>
              <ul className="space-y-1.5 text-xs text-white/60 font-sans">
                {selectedComp.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#00FF41] font-mono mt-0.5">▪</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-2">
                Interfaces &amp; Protocols
              </h5>
              <ul className="space-y-1.5 text-xs text-white/60 font-sans">
                {selectedComp.interfaces.map((intf, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#00FF41] font-mono mt-0.5">▪</span>
                    <span>{intf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Deployment Lifecycle Steps */}
      <div className="p-6 rounded-lg bg-[#0a0a0a] border border-white/10">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wide">
          <Activity className="w-5 h-5 text-[#00FF41]" />
          End-to-End Deployment Lifecycle (6 Stages)
        </h3>
        <p className="text-xs text-white/50 mb-6 font-sans">
          Step-by-step trace of how a code commit becomes a live, SSL-secured container routed across the mesh.
        </p>

        <div className="space-y-3">
          {DEPLOYMENT_LIFECYCLE_STEPS.map((step) => {
            const isCurrent = activeStep === step.stepNumber;
            return (
              <div
                key={step.stepNumber}
                onClick={() => setActiveStep(step.stepNumber)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#00FF41]/10 border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.15)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono font-bold ${
                        isCurrent
                          ? 'bg-[#00FF41] text-black'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      0{step.stepNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white font-display">
                        {step.title}
                      </h4>
                      <span className="text-[11px] font-mono text-white/40">
                        Actor: {step.component}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#00FF41] bg-[#00FF41]/10 px-2 py-0.5 rounded border border-[#00FF41]/30 uppercase">
                    Source: {step.source}
                  </span>
                </div>
                {isCurrent && (
                  <p className="mt-3 pt-3 border-t border-white/10 text-xs text-white/70 leading-relaxed font-sans">
                    {step.action}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
