import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Server, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { TerminalCursor } from './TerminalCursor';
import { ClaimBadge } from './ClaimBadge';

interface FrameworkOption {
  id: string;
  name: string;
  category: string;
  defaultRepo: string;
  defaultPort: number;
  runtime: string;
  dockerfile: string;
}

const FRAMEWORKS: FrameworkOption[] = [
  {
    id: 'fastapi',
    name: 'Python / FastAPI',
    category: 'Backend API',
    defaultRepo: 'fastapi-service',
    defaultPort: 8000,
    runtime: 'Python 3.12 (FastAPI + Uvicorn)',
    dockerfile: `FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`
  },
  {
    id: 'nextjs',
    name: 'Next.js / React',
    category: 'Full-Stack SSR',
    defaultRepo: 'nextjs-storefront',
    defaultPort: 3000,
    runtime: 'Node.js 20 (Next.js 15 Standalone)',
    dockerfile: `FROM node:20-alpine AS runner\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["npm", "start"]`
  },
  {
    id: 'docker',
    name: 'Docker OCI',
    category: 'Any Container',
    defaultRepo: 'custom-container',
    defaultPort: 8080,
    runtime: 'Custom Dockerfile / OCI Spec',
    dockerfile: `FROM alpine:latest\nRUN apk add --no-cache curl ca-certificates\nWORKDIR /root/\nCOPY bin/app .\nEXPOSE 8080\nCMD ["./app"]`
  },
  {
    id: 'golang',
    name: 'Go Microservice',
    category: 'High-Perf Backend',
    defaultRepo: 'go-mesh-worker',
    defaultPort: 8080,
    runtime: 'Go 1.23 (Distroless / Scratch)',
    dockerfile: `FROM golang:1.23-alpine AS builder\nWORKDIR /build\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 go build -o server .\nFROM gcr.io/distroless/static-debian12\nCOPY --from=builder /build/server /server\nEXPOSE 8080\nENTRYPOINT ["/server"]`
  },
  {
    id: 'rust',
    name: 'Rust / Axum',
    category: 'Memory-Safe API',
    defaultRepo: 'rust-crypto-service',
    defaultPort: 8080,
    runtime: 'Rust 1.80 (Axum + Tokio)',
    dockerfile: `FROM rust:1.80-slim AS builder\nWORKDIR /usr/src/app\nCOPY Cargo.toml Cargo.lock ./\nCOPY src ./src\nRUN cargo build --release\nFROM debian:bookworm-slim\nCOPY --from=builder /usr/src/app/target/release/app /usr/local/bin/app\nEXPOSE 8080\nCMD ["app"]`
  }
];

// Illustrative only -- a real mesh's nodes are whatever machines its
// operator has actually joined (see the OpenGit Console's Mesh Nodes tab
// for real ones). No fabricated latency/load numbers here; this simulator
// is clearly a scripted demo, not a live view of any real infrastructure.
const COMPUTE_NODES = [
  { id: 'node-eu-1', name: 'example-node-eu (illustrative)', region: 'EU' },
  { id: 'node-us-1', name: 'example-node-us (illustrative)', region: 'US' },
  { id: 'node-ap-1', name: 'example-node-ap (illustrative)', region: 'APAC' }
];

export const DeployTerminal: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState<FrameworkOption>(FRAMEWORKS[0]);
  const [selectedNode, setSelectedNode] = useState(COMPUTE_NODES[0]);
  const [repoUrl, setRepoUrl] = useState(FRAMEWORKS[0].defaultRepo);
  const [appPort, setAppPort] = useState(FRAMEWORKS[0].defaultPort);
  const [activeTab, setActiveTab] = useState<'terminal' | 'dockerfile'>('terminal');
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    '[*] Decentralized.Host Interactive Deployment Engine',
    '[*] Select a framework recipe and compute node, then press [DEPLOY NOW].'
  ]);
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleFrameworkChange = (fw: FrameworkOption) => {
    setSelectedFramework(fw);
    setRepoUrl(fw.defaultRepo);
    setAppPort(fw.defaultPort);
    if (!isDeploying) {
      setLogs([
        `[*] Switched template preset to: ${fw.name} (${fw.category})`,
        `[*] Runtime: ${fw.runtime}`,
        `[*] Ingress Port target: ${fw.defaultPort}`,
        '[*] Ready for deployment pipeline execution.'
      ]);
      setIsCompleted(false);
      setCurrentStep(0);
    }
  };

  const runDeploymentSimulation = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setIsCompleted(false);
    setCurrentStep(1);

    const steps = [
      {
        stepNum: 1,
        message: `$ dhost ship ${repoUrl} --port ${appPort}`,
        log: `[01/06] [SNAPSHOT] Packaged local project '${repoUrl}' into a content-addressed snapshot (no Git required)`
      },
      {
        stepNum: 2,
        message: `[02/06] [ANALYZE] Detected project stack: ${selectedFramework.name}`,
        log: `[02/06] [BUILD] Server-side Dockerfile generated automatically for ${selectedFramework.name} -- none committed to your repo`
      },
      {
        stepNum: 3,
        message: `[03/06] [BUILD] Building standard OCI container image layer-by-layer...`,
        log: `[03/06] [OCI] Created container image tag: registry:5000/${selectedFramework.id}:latest`
      },
      {
        stepNum: 4,
        message: `[04/06] [SCHEDULER] Dispatching workload to compute node ${selectedNode.name}...`,
        log: `[04/06] [AGENT] Node ${selectedNode.name} accepted workload (RAM: 256MB allocated, CPU limit: 1.0)`
      },
      {
        stepNum: 5,
        message: `[05/06] [EDGE] Configuring dynamic Traefik ingress & ACME Let's Encrypt TLS...`,
        log: `[05/06] [INGRESS] Registered dynamic router rule: Host(\`${selectedFramework.id}.dhost.app\`) -> Port ${appPort}`
      },
      {
        stepNum: 6,
        message: `[06/06] [HEALTH] Executing HTTP health probe: GET http://${selectedFramework.id}.dhost.app/health -> 200 OK (8ms)`,
        log: `[✔] DEPLOYMENT COMPLETE! Live at: https://${selectedFramework.id}.dhost.app (SSL Verified)`
      }
    ];

    setLogs([
      `[*] INITIALIZING DECENTRALIZED.HOST DEPLOYMENT PIPELINE...`,
      `[*] Target Compute Node: ${selectedNode.name} (${selectedNode.region})`,
      `[*] Ingress Dynamic Proxy: Traefik v3.0 ACME TLS`
    ]);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < steps.length) {
        const s = steps[idx];
        setCurrentStep(s.stepNum);
        setLogs((prev) => [...prev, s.message, s.log]);
        idx++;
      } else {
        clearInterval(interval);
        setIsDeploying(false);
        setIsCompleted(true);
      }
    }, 650);
  };

  const resetTerminal = () => {
    setIsDeploying(false);
    setIsCompleted(false);
    setCurrentStep(0);
    setLogs([
      '[*] Terminal reset.',
      '[*] Select a framework and click [DEPLOY NOW] to simulate pipeline execution.'
    ]);
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText(`dhost ship ${repoUrl} --port ${appPort}`);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const copyLiveUrl = () => {
    navigator.clipboard.writeText(`https://${selectedFramework.id}.dhost.app`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-lg bg-[#0a0a0a] border border-white/10 shadow-2xl shadow-[#00FF41]/5 overflow-hidden font-mono text-xs sm:text-sm">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[11px] text-white/50 uppercase tracking-widest ml-2 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-[#00FF41]" />
            Interactive Deployment Simulator
          </span>
          <ClaimBadge status="IMPLEMENTED" size="sm" showLabel={false} />
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded border border-white/10 text-[11px]">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 ${
              activeTab === 'terminal'
                ? 'bg-[#00FF41]/20 text-[#00FF41] font-semibold border border-[#00FF41]/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Terminal</span>
          </button>
          <button
            onClick={() => setActiveTab('dockerfile')}
            className={`px-3 py-1 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 ${
              activeTab === 'dockerfile'
                ? 'bg-[#00FF41]/20 text-[#00FF41] font-semibold border border-[#00FF41]/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Dockerfile</span>
          </button>
        </div>
      </div>

      {/* Framework & Target Selector Controls */}
      <div className="p-4 bg-black/40 border-b border-white/10 space-y-4">
        {/* Framework presets */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-white/50 mb-2 uppercase tracking-wider">
            <span>Select Runtime Framework Recipe:</span>
            <span className="text-[#00FF41]">{selectedFramework.runtime}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {FRAMEWORKS.map((fw) => {
              const isSelected = selectedFramework.id === fw.id;
              return (
                <button
                  key={fw.id}
                  onClick={() => handleFrameworkChange(fw)}
                  className={`p-2.5 rounded border text-left transition-all ${
                    isSelected
                      ? 'bg-[#00FF41]/15 border-[#00FF41] text-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.2)] font-bold'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="text-xs truncate">{fw.name}</div>
                  <div className="text-[10px] text-white/40 truncate mt-0.5">{fw.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Node & Config bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Target Mesh Node */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
              Target Compute Node (Mesh Agent):
            </label>
            <select
              value={selectedNode.id}
              onChange={(e) => {
                const n = COMPUTE_NODES.find((item) => item.id === e.target.value);
                if (n) setSelectedNode(n);
              }}
              className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs rounded p-2 focus:outline-none focus:border-[#00FF41]"
            >
              {COMPUTE_NODES.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name} ({node.region})
                </option>
              ))}
            </select>
          </div>

          {/* App Name Input */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
              App Name (local project dir):
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs rounded p-2 focus:outline-none focus:border-[#00FF41]"
              placeholder="my-app"
            />
          </div>

          {/* Port & Trigger Action */}
          <div className="flex items-end gap-2">
            <div className="w-24">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                Port:
              </label>
              <input
                type="number"
                value={appPort}
                onChange={(e) => setAppPort(Number(e.target.value))}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs rounded p-2 focus:outline-none focus:border-[#00FF41]"
              />
            </div>
            
            <button
              onClick={runDeploymentSimulation}
              disabled={isDeploying}
              className={`flex-1 p-2 rounded text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                isDeploying
                  ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 cursor-not-allowed animate-pulse'
                  : 'bg-[#00FF41] hover:bg-[#00FF41]/90 text-black shadow-[0_0_20px_rgba(0,255,65,0.4)]'
              }`}
            >
              {isDeploying ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Deploying (Step {currentStep}/6)...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Deploy Now</span>
                </>
              )}
            </button>

            <button
              onClick={resetTerminal}
              title="Reset terminal output"
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Output or File Preview */}
      <div className="p-4 sm:p-6 bg-[#070707] min-h-[280px] max-h-[360px] overflow-y-auto">
        {activeTab === 'terminal' && (
          <div className="space-y-1.5 font-mono text-xs sm:text-sm selection:bg-[#00FF41]/30 selection:text-[#00FF41]">
            {logs.map((logLine, idx) => {
              const isCommand = logLine.startsWith('$');
              const isSuccess = logLine.includes('COMPLETE') || logLine.includes('Live at:') || logLine.includes('200 OK');
              const isStep = logLine.includes('[0') || logLine.includes('[*]');

              return (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    isCommand
                      ? 'text-[#00FF41] font-bold'
                      : isSuccess
                      ? 'text-[#00FF41] font-semibold bg-[#00FF41]/10 px-2 py-1 rounded border border-[#00FF41]/20 my-1'
                      : isStep
                      ? 'text-white/80'
                      : 'text-white/50'
                  }`}
                >
                  {logLine}
                </div>
              );
            })}
            
            {isDeploying && (
              <div className="flex items-center gap-1 text-[#00FF41] pt-1">
                <span>Executing OCI mesh step...</span>
                <TerminalCursor color="text-[#00FF41]" />
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        )}

        {activeTab === 'dockerfile' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-white/40 pb-2 border-b border-white/10">
              <span>Reference Dockerfile -- dhost ship generates its own automatically, you don't write this</span>
              <span className="text-[#00FF41]">100% Zero Vendor Lock-in</span>
            </div>
            <pre className="text-white/80 font-mono text-xs leading-relaxed overflow-x-auto p-3 bg-black/60 rounded border border-white/10">
              {selectedFramework.dockerfile}
            </pre>
          </div>
        )}
      </div>

      {/* Live Deployment Status Banner (When Completed) */}
      {isCompleted && (
        <div className="p-4 bg-[#00FF41]/10 border-t border-[#00FF41]/30 flex items-center justify-between gap-4 flex-wrap animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#00FF41]/20 text-[#00FF41] rounded border border-[#00FF41]/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>App Live &amp; Secured:</span>
                <span className="text-[#00FF41] underline">https://{selectedFramework.id}.dhost.app</span>
              </div>
              <div className="text-[10px] text-white/60 mt-0.5 flex items-center gap-4">
                <span>Node: {selectedNode.name}</span>
                <span>TLS: Let’s Encrypt (Automated)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLiveUrl}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded text-xs flex items-center gap-1.5"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied URL' : 'Copy URL'}</span>
            </button>
            <a
              href={`#${selectedFramework.id}`}
              onClick={(e) => {
                e.preventDefault();
                alert(`Simulated live endpoint: https://${selectedFramework.id}.dhost.app is online on node ${selectedNode.name}`);
              }}
              className="px-3 py-1.5 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold rounded text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,65,0.3)]"
            >
              <span>Visit App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Footer CLI helper */}
      <div className="p-3 bg-white/5 border-t border-white/10 flex items-center justify-between gap-4 text-[11px] text-white/50 flex-wrap font-mono">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[#00FF41]">CLI Equivalent:</span>
          <code className="text-white/80 bg-black/60 px-2 py-0.5 rounded border border-white/10 truncate">
            dhost ship {repoUrl} --port {appPort}
          </code>
        </div>
        <button
          onClick={copyCliCommand}
          className="text-[#00FF41] hover:underline flex items-center gap-1 shrink-0 uppercase tracking-wider"
        >
          {copiedCli ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copiedCli ? 'Copied CLI Command' : 'Copy Command'}</span>
        </button>
      </div>
    </div>
  );
};
