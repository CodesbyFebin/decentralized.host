import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { AuditModal } from './components/AuditModal';
import { HomeView } from './views/HomeView';
import { FeaturesView } from './views/FeaturesView';
import { ArchitectureView } from './views/ArchitectureView';
import { SecurityView } from './views/SecurityView';
import { DocsView } from './views/DocsView';
import { GuidesView } from './views/GuidesView';
import { AlternativesView } from './views/AlternativesView';
import { DeployView } from './views/DeployView';
import { DecentralizedHostingPillarView } from './views/DecentralizedHostingPillarView';
import { SelfHostedPaasPillarView } from './views/SelfHostedPaasPillarView';
import { DepinView } from './views/DepinView';
import { RoadmapView } from './views/RoadmapView';
import { AboutView } from './views/AboutView';
import { OpenSourceView } from './views/OpenSourceView';
import { FAQView } from './views/FAQView';
import { MachineReadableViewer } from './views/MachineReadableViewer';
import { CONTENT_REGISTRY } from './data/registry';

export default function App() {
  // Determine initial path from URL hash or pathname
  const getInitialPath = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash && hash.startsWith('/')) {
        return hash;
      }
      if (window.location.pathname && window.location.pathname !== '/') {
        return window.location.pathname;
      }
    }
    return '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath());
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [auditOpen, setAuditOpen] = useState<boolean>(false);

  // Sync with browser navigation & hash
  useEffect(() => {
    const handlePopState = () => {
      const path = getInitialPath();
      setCurrentPath(path);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Global Cmd+K / Ctrl+K shortcut for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavigate = (path: string) => {
    // Normalise path
    let normalized = path;
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    setCurrentPath(normalized);
    if (typeof window !== 'undefined') {
      window.location.hash = normalized;
      window.scrollTo(0, 0);
    }
  };

  // Select View Component based on current path
  const renderView = () => {
    const p = currentPath.split('#')[0]; // strip hash anchors

    switch (p) {
      case '/':
        return <HomeView onNavigate={handleNavigate} onOpenAudit={() => setAuditOpen(true)} />;
      case '/features/':
      case '/features':
        return <FeaturesView onNavigate={handleNavigate} />;
      case '/architecture/':
      case '/architecture':
        return <ArchitectureView onNavigate={handleNavigate} />;
      case '/security/':
      case '/security':
        return <SecurityView onNavigate={handleNavigate} />;
      case '/docs/':
      case '/docs':
        return <DocsView onNavigate={handleNavigate} />;
      case '/guides/':
      case '/guides':
        return <GuidesView onNavigate={handleNavigate} />;
      case '/alternatives/':
      case '/alternatives':
        return <AlternativesView onNavigate={handleNavigate} />;
      case '/deploy/':
      case '/deploy':
        return <DeployView onNavigate={handleNavigate} />;
      case '/decentralized-hosting/':
      case '/decentralized-hosting':
        return <DecentralizedHostingPillarView onNavigate={handleNavigate} />;
      case '/self-hosted-paas/':
      case '/self-hosted-paas':
        return <SelfHostedPaasPillarView onNavigate={handleNavigate} />;
      case '/depin/':
      case '/depin':
        return <DepinView onNavigate={handleNavigate} />;
      case '/roadmap/':
      case '/roadmap':
        return <RoadmapView onNavigate={handleNavigate} />;
      case '/about/':
      case '/about':
        return <AboutView onNavigate={handleNavigate} />;
      case '/open-source/':
      case '/open-source':
        return <OpenSourceView onNavigate={handleNavigate} />;
      case '/faq/':
      case '/faq':
        return <FAQView onNavigate={handleNavigate} />;
      case '/llms.txt':
        return <MachineReadableViewer endpoint="llms.txt" onNavigate={handleNavigate} />;
      case '/llms-full.txt':
        return <MachineReadableViewer endpoint="llms-full.txt" onNavigate={handleNavigate} />;
      case '/sitemap.xml':
        return <MachineReadableViewer endpoint="sitemap.xml" onNavigate={handleNavigate} />;
      case '/robots.txt':
        return <MachineReadableViewer endpoint="robots.txt" onNavigate={handleNavigate} />;
      case '/openapi.json':
        return <MachineReadableViewer endpoint="openapi.json" onNavigate={handleNavigate} />;
      default:
        // Default to HomeView if unmatched
        return <HomeView onNavigate={handleNavigate} onOpenAudit={() => setAuditOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative selection:bg-[#00FF41]/30 selection:text-[#00FF41] crt-scanlines overflow-x-hidden">
      {/* Background Matrix Grid Overlay */}
      <div 
        className="fixed inset-0 opacity-[0.035] pointer-events-none bg-matrix-grid z-0" 
        aria-hidden="true" 
      />

      {/* Subtle Animated Film Grain Noise Layer */}
      <div
        className="fixed inset-[-200%] w-[500%] h-[500%] opacity-40 pointer-events-none bg-film-grain animate-film-grain z-0"
        aria-hidden="true"
      />

      {/* Navbar Header */}
      <div className="relative z-10">
        <Navbar
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenAudit={() => setAuditOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {renderView()}
      </main>

      {/* Semantic Footer */}
      <div className="relative z-10">
        <Footer
          onNavigate={handleNavigate}
          onOpenAudit={() => setAuditOpen(true)}
        />
      </div>

      {/* Global Command+K Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Quality Gates & Authority Audit Modal */}
      <AuditModal
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
