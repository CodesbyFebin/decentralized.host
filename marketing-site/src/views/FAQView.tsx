import React, { useState } from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { LastUpdated } from '../components/LastUpdated';
import { ClaimBadge } from '../components/ClaimBadge';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

interface FAQEntry {
  question: string;
  answerText: string;
  answer: React.ReactNode;
}

const FAQ_ENTRIES: FAQEntry[] = [
  {
    question: 'Is Decentralized.Host a blockchain storage network like IPFS, Arweave, or Filecoin?',
    answerText: 'No. The core platform is a self-hosted Docker deployment mesh -- a FastAPI control plane, Python node agents, and Traefik edge routing -- with no dependency on any blockchain to function. "Decentralized" refers to distributing container workloads across independently operated compute nodes you control, not to content-addressed or blockchain-based storage. The only blockchain component is optional and narrow: a Solana devnet credit system that rewards node operators for healthy uptime.',
    answer: (
      <>
        No. Despite the name, the core platform is a self-hosted Docker deployment mesh -- a FastAPI control plane,
        Python node agents, and Traefik edge routing -- with no dependency on any blockchain to function. "Decentralized"
        refers to distributing container workloads across independently operated compute nodes you control, not to
        content-addressed or blockchain-based storage. The only blockchain component in the project is optional and
        narrow: a Solana <em>devnet</em> credit system that rewards node operators for healthy uptime. See{' '}
        <button onClick={() => { window.location.hash = '/depin/'; window.scrollTo(0, 0); }} className="text-[#00FF41] hover:underline">
          the DePIN page
        </button>{' '}
        for exactly what that does and doesn't cover.
      </>
    )
  },
  {
    question: 'Does the Solana integration involve real money or a real token I can buy or sell?',
    answerText: "No. It runs on Solana's public devnet cluster, not mainnet -- devnet SOL and tokens have no monetary value, are funded by a free public faucet, and exist purely for testing. Every mint is a real on-chain transaction with a real Explorer link, but nothing here is a security, an investment, or a purchase. A mainnet migration is an explicit future decision on the roadmap, not something this version does quietly.",
    answer: (
      <>
        No. It runs on Solana's public <strong>devnet</strong> cluster, not mainnet -- devnet SOL and tokens have no
        monetary value, are funded by a free public faucet, and exist purely for testing. Every mint is a real
        on-chain transaction with a real Explorer link, but nothing here is a security, an investment, or a purchase.
        A mainnet migration is an explicit future decision on the roadmap, not something this version does quietly.
      </>
    )
  },
  {
    question: 'Do I need Docker or Git installed on my own laptop to deploy?',
    answerText: "No for either, if you use dhost ship/dhost update: the CLI snapshots your project (SHA-256 content-addressed, no Git involved) and the node agent builds the Docker image server-side. If you'd rather use git push, you do need Git locally, but still not Docker -- the same server-side build pipeline runs on the other end of the SSH push.",
    answer: (
      <>
        No for either, if you use <code>dhost ship</code>/<code>dhost update</code>: the CLI snapshots your project
        (SHA-256 content-addressed, no Git involved) and the node agent builds the Docker image server-side. If you'd
        rather use <code>git push</code>, you do need Git locally, but still not Docker -- the same server-side build
        pipeline runs on the other end of the SSH push.
      </>
    )
  },
  {
    question: 'Is this a multi-tenant SaaS I can sign up for?',
    answerText: "No. You run your own control plane (locally via Docker Compose, or on your own server for production) and deploy your own applications to it. There's no hosted signup, no per-user accounts, and no billing -- authentication is a single shared deploy key and a single shared node-join secret, the same trust model as running your own server. It's built for one operator (or a small trusted team) running their own mesh, not for reselling hosting to strangers.",
    answer: (
      <>
        No. You run your own control plane (locally via Docker Compose, or on your own server for production) and
        deploy your own applications to it. There's no hosted signup, no per-user accounts, and no billing --
        authentication is a single shared deploy key and a single shared node-join secret, the same trust model as
        running your own server. It's built for one operator (or a small trusted team) running their own mesh, not
        for reselling hosting to strangers.
      </>
    )
  },
  {
    question: 'Can I host WordPress, or anything besides a Docker-buildable app?',
    answerText: 'Anything that can run in a Docker container, yes -- including a WordPress container, if you bring your own Dockerfile or docker-compose setup for it. The automatic stack detection recognizes common frameworks (FastAPI, Flask, Django, Express, Next.js, static HTML) and generates a Dockerfile for those; anything else needs its own Dockerfile at the project root, which the detector will pick up and use directly.',
    answer: (
      <>
        Anything that can run in a Docker container, yes -- including a WordPress container, if you bring your own
        Dockerfile or docker-compose setup for it. The automatic stack detection recognizes common frameworks
        (FastAPI, Flask, Django, Express, Next.js, static HTML) and generates a Dockerfile for those; anything else
        needs its own Dockerfile at the project root, which the detector will pick up and use directly.
      </>
    )
  },
  {
    question: 'How is this different from just running Coolify, Dokploy, or Dokku on my server?',
    answerText: 'Architecturally: those tools centralize around one coordinator server that reaches out to workers over SSH or Docker Swarm. Decentralized.Host instead runs a decoupled node-agent daemon on every machine, each reporting its own address and telemetry to a lightweight control plane that schedules by load -- closer to a small distributed system than a single-server dashboard. See the full comparison page for a feature-by-feature breakdown against each one, with sources.',
    answer: (
      <>
        Architecturally: those tools centralize around one coordinator server that reaches out to workers over SSH or
        Docker Swarm. Decentralized.Host instead runs a decoupled node-agent daemon on every machine, each reporting
        its own address and telemetry to a lightweight control plane that schedules by load -- closer to a small
        distributed system than a single-server dashboard. See the{' '}
        <button onClick={() => { window.location.hash = '/alternatives/'; window.scrollTo(0, 0); }} className="text-[#00FF41] hover:underline">
          full comparison page
        </button>{' '}
        for a feature-by-feature breakdown against each one, with sources.
      </>
    )
  },
  {
    question: 'Does deploying get me real HTTPS out of the box?',
    answerText: "Locally, no -- local dev uses nip.io wildcard DNS over plain HTTP for zero-config routing. In production (the docker-compose.prod.yml overlay, with PUBLIC_SCHEME=https and a real domain), yes -- Traefik requests real Let's Encrypt certificates via the HTTP-01 challenge for the control plane, the console, and every deployed app automatically, no DNS-provider API key required.",
    answer: (
      <>
        Locally, no -- local dev uses <code>nip.io</code> wildcard DNS over plain HTTP for zero-config routing. In
        production (the <code>docker-compose.prod.yml</code> overlay, with <code>PUBLIC_SCHEME=https</code> and a
        real domain), yes -- Traefik requests real Let's Encrypt certificates via the HTTP-01 challenge for the
        control plane, the console, and every deployed app automatically, no DNS-provider API key required.
      </>
    )
  },
  {
    question: 'What happens if one of my nodes goes down?',
    answerText: "The scheduler places new deployments only on nodes reporting healthy heartbeats, so a down node stops receiving new work. It does not currently migrate an already-running container off a node that goes down mid-flight -- that container stays down until the node recovers or you redeploy it elsewhere manually. There's no automatic failover yet.",
    answer: (
      <>
        The scheduler places new deployments only on nodes reporting healthy heartbeats, so a down node stops
        receiving new work. It does not currently migrate an already-running container off a node that goes down
        mid-flight -- that container stays down until the node recovers or you redeploy it elsewhere manually. There's
        no automatic failover yet; that's honestly reflected as a gap, not a hidden limitation.
      </>
    )
  },
  {
    question: 'Is there a public node network I can join to earn credits, like a DePIN marketplace?',
    answerText: "No. Every mesh is private and self-hosted -- you run your own control plane and invite only the nodes you choose to join it with your own shared secret. There's no public registry of nodes, no marketplace matching strangers' hardware to workloads, and no way to earn credits on someone else's mesh.",
    answer: (
      <>
        No. Every mesh is private and self-hosted -- you run your own control plane and invite only the nodes you
        choose to join it with your own shared secret. There's no public registry of nodes, no marketplace matching
        strangers' hardware to workloads, and no way to earn credits on someone else's mesh. The credit system only
        rewards operators of nodes already trusted and joined to your own mesh.
      </>
    )
  },
  {
    question: 'Can I roll back a bad deployment?',
    answerText: "Yes, two ways. If you shipped with the CLI, dhost rollback <snapshot-id> restores a local snapshot from .dhost/ledger/ and redeploys it (snapshots are local to whichever machine ran the ship, not centrally synced). Separately, the console's Git Manager tab and GET /deployments/{name}/releases show read-only release history from any machine.",
    answer: (
      <>
        Yes, two ways. If you shipped with the CLI, <code>dhost rollback &lt;snapshot-id&gt;</code> restores a local
        snapshot from <code>.dhost/ledger/</code> and redeploys it (snapshots are local to whichever machine ran the
        ship, not centrally synced). Separately, the console's Git Manager tab and{' '}
        <code>GET /deployments/&#123;name&#125;/releases</code> show read-only release history from any machine, useful for
        seeing what happened even without local snapshot files.
      </>
    )
  },
  {
    question: 'What still isn\'t built?',
    answerText: "Being direct about scope: no automatic failover for a crashed node, no per-user accounts or per-repo access control (one shared deploy key trusts everyone equally), no multi-branch preview environments in the git server, and the node agent still runs Docker internally to build/run containers (developer machines don't need Docker, but the mesh itself does). See the roadmap for what's planned next.",
    answer: (
      <>
        Being direct about scope: no automatic failover for a crashed node, no per-user accounts or per-repo access
        control (one shared deploy key trusts everyone equally), no multi-branch preview environments in the git
        server, and the node agent still runs Docker internally to build/run containers (developer machines don't
        need Docker, but the mesh itself does). See the{' '}
        <button onClick={() => { window.location.hash = '/roadmap/'; window.scrollTo(0, 0); }} className="text-[#00FF41] hover:underline">
          roadmap
        </button>{' '}
        for what's planned next.
      </>
    )
  }
];

export const FAQView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/faq/'];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto space-y-10 text-slate-300 font-sans">
      <JsonLd
        frontmatter={frontmatter}
        faqEntries={FAQ_ENTRIES.map((e) => ({ question: e.question, answerText: e.answerText }))}
      />
      <LastUpdated updatedAt={frontmatter.updatedAt} />

      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>SCOPE &amp; QUALIFICATION FAQ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
          Straight answers about what Decentralized.Host actually is -- including what it deliberately doesn't do.
        </p>
        <div className="flex items-center justify-center gap-2">
          <ClaimBadge status="IMPLEMENTED" size="sm" />
        </div>
      </div>

      <AeoAnswerBlock
        question="What is Decentralized.Host, in one sentence?"
        answer="Decentralized.Host is a self-hosted, open-source Docker deployment mesh -- a FastAPI control plane, node agents, and Traefik edge routing, with an optional Solana-devnet credit system for node operators -- not a blockchain storage network."
        sourceContext="README.md, blockchain/README.md"
      />

      <div className="space-y-3">
        {FAQ_ENTRIES.map((entry, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="rounded-xl bg-[#080b0f] border border-slate-800 overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
              >
                <span className="text-sm sm:text-base font-semibold text-white">{entry.question}</span>
                <ChevronDown className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm leading-relaxed text-slate-300 border-t border-slate-800 pt-4">
                  {entry.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/40 text-center space-y-4">
        <h3 className="text-lg font-bold font-display text-white">Still have questions?</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          The full developer documentation and CLI reference cover every real command and endpoint in detail.
        </p>
        <button
          onClick={() => onNavigate('/docs/')}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition-colors"
        >
          Read the Docs
        </button>
      </div>
    </div>
  );
};
