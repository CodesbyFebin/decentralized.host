import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Copy, Check, RefreshCw, Layers, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const TerminalDemo: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'cli' | 'git' | 'status'>('cli');
  const [history, setHistory] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const initialCliLogs = [
    '$ dhost ship',
    '⚡ Auto-detected project framework: FastAPI (Python 3.11)',
    '📦 Packaging workspace archive (1.8 MB) [excluding .git, venv]...',
    '🔐 Authenticating with Control Plane (https://api.dhost.example.com)... OK',
    '🧠 Scheduler evaluating active compute nodes...',
    '   ✔ node-nyc-01 (CPU: 18% | Free RAM: 6.2 GB) -> Selected [Score: 94.2]',
    '🚀 Dispatching payload to node-nyc-01...',
    '🐳 [node-nyc-01] Building Docker container image (dhost-app:v4)...',
    '   Step 1/4 : FROM python:3.11-slim',
    '   Step 2/4 : COPY requirements.txt . && pip install -r requirements.txt',
    '   Step 3/4 : COPY . .',
    '   Step 4/4 : EXPOSE 8000',
    '✔ Container image built in 3.4s [SHA: 9f8a21c]',
    '🌐 Configuring dynamic Traefik ingress & ACME TLS certificate...',
    '🛡 Health check passed: GET /health -> HTTP 200 OK (12ms)',
    '✨ DEPLOYMENT SUCCESSFUL',
    '🔗 Live URL: https://fastapi-service.dhost.example.com'
  ];

  const gitPushLogs = [
    '$ git push dhost main',
    'Enumerating objects: 19, done.',
    'Counting objects: 100% (19/19), done.',
    'Compressing objects: 100% (14/14), done.',
    'Writing objects: 100% (19/19), 3.42 KiB | 3.42 MiB/s, done.',
    'remote: ========================================================',
    'remote:   DECENTRALIZED.HOST GIT RECEIVER HOOK (SSH:2222)',
    'remote: ========================================================',
    'remote: [1/4] Commit verified: 4b910e2 ("feat: add websocket endpoint")',
    'remote: [2/4] Scheduler assigned build to node-fsn-02 (Germany-Hetzner)',
    'remote: [3/4] Docker engine building image from commit tree...',
    'remote: [4/4] Ingress router updated with zero downtime.',
    'remote: App is live: https://api-gateway.dhost.example.com',
    'To ssh://git@dhost.example.com:2222/api-gateway.git',
    '   1a2b3c4..4b910e2  main -> main'
  ];

  const statusLogs = [
    '$ dhost status',
    '--- CONTROL PLANE CLUSTER STATUS ---',
    'Coordinator:   https://api.dhost.example.com (v1.0.4 - Online)',
    'Registry:      Internal Private Registry (Synced)',
    'Active Nodes:  4 compute nodes registered across 3 regions',
    '',
    'NODE ID          REGION        LOAD     RAM FREE    CONTAINERS   STATUS',
    'node-nyc-01      US-East       22%      5.8 GB      8            ONLINE (12s)',
    'node-fsn-02      EU-Central    14%      12.4 GB     11           ONLINE (6s)',
    'node-sgp-03      AP-Southeast  31%      3.9 GB      5            ONLINE (18s)',
    'node-lon-04      EU-West       08%      7.1 GB      2            ONLINE (9s)',
    '',
    'Total Capacity: 29.2 GB RAM Free | 12.8 vCPU Headroom',
    'Active Apps:    26 container services routed via Traefik v3'
  ];

  useEffect(() => {
    if (activeTab === 'cli') setHistory(initialCliLogs);
    if (activeTab === 'git') setHistory(gitPushLogs);
    if (activeTab === 'status') setHistory(statusLogs);
  }, [activeTab]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    setIsExecuting(true);
    const newHistory = [...history, `$ ${cmd}`];

    if (cmd === 'clear') {
      setHistory([]);
      setInputVal('');
      setIsExecuting(false);
      return;
    }

    if (cmd === 'help') {
      newHistory.push(
        'Available simulated commands: `dhost ship`, `dhost status`, `dhost logs`, `dhost nodes`, `git push dhost main`, `clear`'
      );
    } else if (cmd.startsWith('dhost logs')) {
      newHistory.push(
        '[2025-08-30 14:32:01] [INFO] Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)',
        '[2025-08-30 14:32:04] [INFO] 10.0.1.4:48212 - "GET /health HTTP/1.1" 200 OK',
        '[2025-08-30 14:32:15] [INFO] 192.168.1.10:51290 - "POST /api/v1/data HTTP/1.1" 201 Created'
      );
    } else if (cmd === 'dhost ship' || cmd === 'dhost deploy') {
      newHistory.push(...initialCliLogs.slice(1));
    } else if (cmd === 'dhost status' || cmd === 'dhost nodes') {
      newHistory.push(...statusLogs.slice(1));
    } else {
      newHistory.push(`Executed: ${cmd} (Command verified on control plane mock runtime)`);
    }

    setHistory(newHistory);
    setInputVal('');
    setIsExecuting(false);
  };

  const copyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg bg-[#0a0a0a] border border-white/10 shadow-2xl shadow-[#00FF41]/5 overflow-hidden font-mono">
      {/* Terminal Window Header */}
      <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          <span className="text-[10px] text-white/40 font-mono ml-2 uppercase tracking-widest hidden sm:inline">
            terminal — dh-cli v1.0.4
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-2.5 py-1 rounded text-xs transition-colors uppercase tracking-wider ${
              activeTab === 'cli'
                ? 'bg-[#00FF41]/20 text-[#00FF41] font-semibold border border-[#00FF41]/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            dhost ship
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`px-2.5 py-1 rounded text-xs transition-colors uppercase tracking-wider ${
              activeTab === 'git'
                ? 'bg-[#00FF41]/20 text-[#00FF41] font-semibold border border-[#00FF41]/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            git push
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-2.5 py-1 rounded text-xs transition-colors uppercase tracking-wider ${
              activeTab === 'status'
                ? 'bg-[#00FF41]/20 text-[#00FF41] font-semibold border border-[#00FF41]/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            dhost status
          </button>
        </div>

        <button
          onClick={() => copyCommand('dhost ship')}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-[#00FF41] transition-colors"
          title="Copy command"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Terminal Screen Body */}
      <div className="p-4 sm:p-6 bg-[#070707] text-xs sm:text-sm text-white/80 min-h-[300px] max-h-[420px] overflow-y-auto space-y-1.5 selection:bg-[#00FF41]/30 selection:text-[#00FF41]">
        {history.map((line, idx) => {
          const isCommand = line.startsWith('$');
          const isSuccess = line.includes('SUCCESSFUL') || line.includes('Live URL') || line.includes('ONLINE');
          const isHighlight = line.includes('Selected') || line.includes('Auto-detected') || line.includes('Traefik');
          
          return (
            <div
              key={idx}
              className={`leading-relaxed ${
                isCommand
                  ? 'text-[#00FF41] font-bold'
                  : isSuccess
                  ? 'text-[#00FF41] font-semibold'
                  : isHighlight
                  ? 'text-[#00e5ff]'
                  : 'text-white/60'
              }`}
            >
              {line}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Interactive Command Input Form */}
      <form
        onSubmit={handleCommandSubmit}
        className="px-4 py-2.5 bg-white/5 border-t border-white/10 flex items-center gap-2"
      >
        <span className="text-[#00FF41] font-bold text-sm">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Try typing: dhost status, dhost logs, dhost ship, help..."
          className="flex-1 bg-transparent text-white text-xs sm:text-sm focus:outline-none placeholder-white/30 font-mono"
        />
        <button
          type="submit"
          disabled={isExecuting}
          className="px-3 py-1 bg-[#00FF41]/10 hover:bg-[#00FF41] hover:text-black text-[#00FF41] border border-[#00FF41]/30 rounded text-xs transition-all flex items-center gap-1 font-semibold uppercase tracking-wider"
        >
          <Play className="w-3 h-3" /> Run
        </button>
      </form>
    </div>
  );
};
