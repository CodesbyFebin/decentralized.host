import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  ShieldCheck, 
  Menu, 
  X, 
  Github, 
  ExternalLink, 
  Cpu, 
  BookOpen, 
  Layers, 
  GitBranch, 
  Activity, 
  ChevronDown,
  Sparkles,
  Server
} from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenAudit: () => void;
}

export const Navbar: React.FC<Props> = ({ currentPath, onNavigate, onOpenSearch, onOpenAudit }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pillarsDropdownOpen, setPillarsDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Features', path: '/features/' },
    { label: 'Architecture', path: '/architecture/' },
    { label: 'Security', path: '/security/' },
    { label: 'Docs', path: '/docs/' },
    { label: 'Guides', path: '/guides/' },
    { label: 'Alternatives', path: '/alternatives/' },
    { label: 'Deploy', path: '/deploy/' }
  ];

  const pillarLinks = [
    { label: 'Decentralized Hosting', path: '/decentralized-hosting/', desc: 'Comprehensive category pillar & architecture' },
    { label: 'Self-Hosted PaaS', path: '/self-hosted-paas/', desc: 'Production guide for multi-server PaaS' },
    { label: 'DePIN Compute', path: '/depin/', desc: 'Physical compute nodes & useful workloads' },
    { label: 'Engineering Roadmap', path: '/roadmap/', desc: 'Public milestones & delivery timeline' },
    { label: 'Open Source & MIT', path: '/open-source/', desc: 'Community repository & contribution' }
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setPillarsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050505]/90 backdrop-blur-md border-b border-[#00FF41]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-6 h-6 border-2 border-[#00FF41] rounded-sm flex items-center justify-center rotate-45 group-hover:shadow-[0_0_12px_rgba(0,255,65,0.6)] transition-all">
              <div className="w-2 h-2 bg-[#00FF41]"></div>
            </div>
            <div className="text-left">
              <div className="font-mono font-bold text-base sm:text-lg tracking-tighter text-white flex items-center">
                DECENTRALIZED<span className="text-[#00FF41]">.</span>HOST
              </div>
              <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest hidden sm:block">
                OPEN SOURCE INFRASTRUCTURE
              </div>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-mono tracking-widest uppercase">
            {navLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider uppercase transition-colors ${
                  currentPath === item.path
                    ? 'bg-[#00FF41]/10 text-[#00FF41] font-semibold border border-[#00FF41]/30'
                    : 'text-white/70 hover:text-[#00FF41] hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Pillars Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPillarsDropdownOpen(!pillarsDropdownOpen)}
                onBlur={() => setTimeout(() => setPillarsDropdownOpen(false), 200)}
                className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider uppercase flex items-center gap-1 transition-colors ${
                  currentPath.includes('decentralized-hosting') || currentPath.includes('self-hosted-paas') || currentPath.includes('depin')
                    ? 'bg-[#00FF41]/10 text-[#00FF41] font-semibold border border-[#00FF41]/30'
                    : 'text-white/70 hover:text-[#00FF41] hover:bg-white/5'
                }`}
              >
                <span>Pillars</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {pillarsDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl shadow-[#00FF41]/5 space-y-1">
                  {pillarLinks.map((p) => (
                    <button
                      key={p.path}
                      onClick={() => handleNavClick(p.path)}
                      className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors block group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-[#00FF41] font-mono uppercase tracking-wider">
                        {p.label}
                      </div>
                      <div className="text-[11px] text-white/50 font-sans mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => handleNavClick('/pillars/')}
                      className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors block text-xs font-bold text-[#00FF41] font-mono uppercase tracking-wider"
                    >
                      Browse All 69 Pillars →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Tools & CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator Pill */}
          <div 
            onClick={onOpenAudit}
            className="hidden xl:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-white/80 cursor-pointer hover:border-[#00FF41]/40 transition-colors"
            title="Inspect Quality Gates and Cluster Telemetry"
          >
            <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
            <span className="text-[#00FF41] opacity-90 uppercase tracking-tighter">Network Operational</span>
          </div>

          {/* Quick Search Button (Cmd+K) */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-mono transition-colors"
            title="Search documentation and commands"
          >
            <Search className="w-3.5 h-3.5 text-[#00FF41]" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[9px] rounded bg-white/10 text-white/70 border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Quality Gates Audit Button */}
          <button
            onClick={onOpenAudit}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00FF41]/10 hover:bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30 text-xs font-mono font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Gates</span>
          </button>

          {/* Get Started / GitHub Repo Link */}
          <a
            href="https://github.com/CodesbyFebin/decentralized.hosting"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-[11px] font-mono uppercase tracking-wider hover:bg-[#00FF41] hover:text-black hover:border-[#00FF41] transition-all"
            title="View GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded lg:hidden bg-white/5 border border-white/10 text-white/80 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#00FF41]/20 bg-[#0a0a0a] p-4 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`p-2.5 rounded text-left transition-colors uppercase tracking-wider ${
                  currentPath === item.path
                    ? 'bg-[#00FF41]/20 text-[#00FF41] font-semibold border border-[#00FF41]/40'
                    : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block mb-2">
              Topic Pillars &amp; Foundations
            </span>
            <div className="space-y-1">
              {pillarLinks.map((p) => (
                <button
                  key={p.path}
                  onClick={() => handleNavClick(p.path)}
                  className="w-full text-left p-2 rounded bg-white/5 hover:bg-white/10 text-white/80 flex items-center justify-between"
                >
                  <span className="uppercase tracking-wider">{p.label}</span>
                  <span className="text-[10px] text-[#00FF41]">View</span>
                </button>
              ))}
              <button
                onClick={() => handleNavClick('/pillars/')}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-white/10 text-[#00FF41] font-bold uppercase tracking-wider"
              >
                Browse All 69 Pillars →
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onOpenAudit();
                setMobileMenuOpen(false);
              }}
              className="flex-1 p-2 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-center font-medium uppercase tracking-wider"
            >
              Inspect Quality Gates
            </button>
            <a
              href="https://github.com/CodesbyFebin/decentralized.hosting"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded bg-white/5 text-white border border-white/10 flex items-center justify-center gap-1"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
