import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, Download, ArrowLeft } from 'lucide-react';

interface Props {
  endpoint: 'llms.txt' | 'llms-full.txt' | 'sitemap.xml' | 'robots.txt' | 'openapi.json';
  onNavigate: (path: string) => void;
}

const MIME_TYPES: Record<Props['endpoint'], string> = {
  'llms.txt': 'text/plain',
  'llms-full.txt': 'text/plain',
  'sitemap.xml': 'application/xml',
  'robots.txt': 'text/plain',
  'openapi.json': 'application/json'
};

// Fetches the real static file at /<endpoint> rather than regenerating content
// client-side -- these are real files (scripts/generate-sitemap.ts and
// scripts/generate-machine-files.ts write them at build time), so this view
// and a plain `curl` against the same URL always show the same thing, with
// no risk of the two drifting apart.
export const MachineReadableViewer: React.FC<Props> = ({ endpoint, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState<string>('Loading...');
  const mimeType = MIME_TYPES[endpoint];

  useEffect(() => {
    setContent('Loading...');
    fetch(`/${endpoint}`)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`${res.status}`))))
      .then(setContent)
      .catch(() => setContent(`Could not load /${endpoint} -- it may not have been generated in this build yet.`));
  }, [endpoint]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = endpoint;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => onNavigate('/')}
          className="text-xs font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download /{endpoint}</span>
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2 text-white font-bold">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Real endpoint: /{endpoint}</span>
          </div>
          <span>Format: {mimeType}</span>
        </div>

        <pre className="p-4 rounded-xl bg-black border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed max-h-[600px]">
          {content}
        </pre>
      </div>
    </div>
  );
};
