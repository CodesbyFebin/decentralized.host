import React, { useState } from 'react';
import { DOCS_DATA } from '../data/docs';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { BookOpen, Terminal, Copy, Check, Server, Shield, Cpu, Code2, ExternalLink } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const DocsView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/docs/'];
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-quickstart');
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const activeDoc = DOCS_DATA.find((d) => d.id === selectedDocId) || DOCS_DATA[0];

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  return (
    <div className="space-y-12">
      <JsonLd frontmatter={frontmatter} />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <BookOpen className="w-3.5 h-3.5" />
          <span>TECHNICAL DOCUMENTATION &amp; CLI REFERENCE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Developer Documentation
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Complete guides for shipping apps with the dhost CLI, self-hosting the control plane, attaching node agents, and integrating the REST API.
        </p>
      </div>

      {/* AEO Block */}
      <div className="max-w-3xl mx-auto">
        <AeoAnswerBlock
          question="How do I get started with Decentralized.Host?"
          answer="To get started with Decentralized.Host, clone the repo and install the CLI with `pip install -e ./cli`, then run `dhost ship <name>` inside your application directory -- it detects your stack, snapshots it (no Git required), and deploys across the mesh with no Dockerfile needed."
          sourceContext="Developer Quick Start Documentation (cli/dhost/main.py, DEPLOY.md)"
        />
      </div>

      {/* Main Docs Layout (Sidebar + Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2 font-mono text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 block mb-2">
            Documentation Index
          </span>
          {DOCS_DATA.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`w-full text-left p-3 rounded-xl transition-colors flex items-center justify-between gap-2 ${
                selectedDocId === doc.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-[#080b0f] text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="truncate">{doc.title}</span>
            </button>
          ))}

          {/* Quick Links */}
          <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => onNavigate('/guides/')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-between"
            >
              <span>Explore Guides &amp; Tutorials</span>
              <span className="text-emerald-400">➔</span>
            </button>
            <button
              onClick={() => onNavigate('/deploy/')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-between"
            >
              <span>Framework Recipes</span>
              <span className="text-emerald-400">➔</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-6">
          <div className="space-y-2 pb-6 border-b border-slate-800">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
              {activeDoc.category}
            </span>
            <h2 className="text-2xl font-bold font-display text-white">
              {activeDoc.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
              {activeDoc.description}
            </p>
          </div>

          {/* Markdown-style Doc Body */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-300 space-y-4 font-sans">
            {activeDoc.content.split('\n\n').map((paragraph, pIdx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={pIdx} className="text-base sm:text-lg font-bold text-white font-display pt-4">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('```')) {
                const lines = paragraph.replace(/```[a-z]*/g, '').trim();
                return (
                  <pre key={pIdx} className="p-4 rounded-xl bg-black border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto my-3">
                    {lines}
                  </pre>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n- ');
                return (
                  <ul key={pIdx} className="space-y-1.5 list-disc pl-5 text-slate-300 my-2">
                    {items.map((it, itIdx) => (
                      <li key={itIdx}>{it.replace(/^- /, '')}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={pIdx}>{paragraph}</p>;
            })}
          </div>

          {/* Code Blocks */}
          {activeDoc.codeBlocks && activeDoc.codeBlocks.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-slate-800">
              {activeDoc.codeBlocks.map((block, bIdx) => (
                <div key={bIdx} className="rounded-xl bg-[#040609] border border-slate-800 overflow-hidden font-mono text-xs">
                  <div className="px-4 py-2 bg-[#080b0f] border-b border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">{block.label}</span>
                    <button
                      onClick={() => handleCopy(block.code, bIdx)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {copiedCodeIdx === bIdx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-emerald-400 overflow-x-auto leading-relaxed">
                    {block.code}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
