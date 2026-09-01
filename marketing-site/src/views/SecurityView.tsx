import React from 'react';
import { CONTENT_REGISTRY } from '../data/registry';
import { AeoAnswerBlock } from '../components/AeoAnswerBlock';
import { JsonLd } from '../components/JsonLd';
import { ClaimBadge } from '../components/ClaimBadge';
import { Shield, Lock, Key, AlertTriangle, CheckCircle, FileText, Terminal, Copy } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const SecurityView: React.FC<Props> = ({ onNavigate }) => {
  const frontmatter = CONTENT_REGISTRY['/security/'];

  const securityTxtContent = `Contact: https://github.com/CodesbyFebin/decentralized.host/security/advisories/new
Expires: 2027-09-01T00:00:00.000Z
Preferred-Languages: en
Canonical: https://decentralized.host/.well-known/security.txt
Policy: https://github.com/CodesbyFebin/decentralized.host/blob/main/SECURITY.md
Acknowledgments: https://github.com/CodesbyFebin/decentralized.host/graphs/contributors`;

  const threatMatrix = [
    {
      threat: 'Compromised Node Host attempting to tamper with coordinator',
      mitigation: 'Node Agents only communicate via outbound HTTPS to control plane; coordinator verifies agent secret keys and rejects unauthenticated telemetry.',
      status: 'MITIGATED'
    },
    {
      threat: 'Malicious application escaping container cgroups to host',
      mitigation: 'Containers execute in standard Docker namespaces with hardcoded cgroup memory (256MB) and CPU (1 vCPU) limits and no host volume mounts by default. This is stock Docker isolation, not rootless or additionally hardened -- stronger sandboxing (gVisor/Kata-style, confidential VMs) is Phase 3 roadmap, not built yet.',
      status: 'MITIGATED'
    },
    {
      threat: 'Unauthorized user executing arbitrary shell commands over Git SSH',
      mitigation: 'Git SSH server forces session into `opengit-shell.sh` and only permits `git-receive-pack` commands matching authorized developer public keys.',
      status: 'MITIGATED'
    },
    {
      threat: 'Untrusted node operator inspecting application runtime memory',
      mitigation: 'Under current Docker architecture, host root can inspect processes. Hardware enclave encryption (AMD SEV/Intel SGX) is scheduled for Phase 3.',
      status: 'PLANNED HARDENING'
    }
  ];

  return (
    <div className="space-y-12">
      <JsonLd frontmatter={frontmatter} />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>SECURITY ARCHITECTURE &amp; THREAT MATRIX</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Security Model &amp; Trust Boundaries
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Zero-fluff transparency regarding the current security architecture, authentication layers, container isolation boundaries, and ongoing cryptographic hardening.
        </p>
      </div>

      {/* AEO Block */}
      <div className="max-w-3xl mx-auto">
        <AeoAnswerBlock
          question="What is the security model of Decentralized.Host?"
          answer="Decentralized.Host enforces security using bearer API key authentication on the FastAPI control plane, SSH public key verification via opengit-shell.sh for Git deployments, Linux process and network namespace isolation in Docker containers, and dynamic Let’s Encrypt TLS encryption on Traefik edge routers."
          sourceContext="Security implementation (control-plane/app/auth.py, git-server/opengit-shell.sh, docker-compose.prod.yml)"
        />
      </div>

      {/* 4 Pillars of Current Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>01. CONTROL PLANE AUTHENTICATION</span>
          </div>
          <h2 className="text-lg font-bold font-display text-white">
            Bearer Token &amp; Scoped API Keys
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Every administrative request, deployment upload, log stream, or node registration must include a valid cryptographic token. Tokens are hashed with SHA-256 and verified on every route invocation via FastAPI dependency injection.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-slate-800">
            Implementation: control-plane/app/auth.py
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
            <Key className="w-4 h-4" />
            <span>02. RESTRICTED GIT SSH SHELL</span>
          </div>
          <h2 className="text-lg font-bold font-display text-white">
            Forced opengit-shell.sh Execution
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Developers authenticate via standard SSH public keys (`id_ed25519` / `id_rsa`). The SSH daemon binds user shells strictly to `opengit-shell.sh`, rejecting interactive terminal logins and only permitting Git object transfers.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-slate-800">
            Implementation: git-server/opengit-shell.sh
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
            <Shield className="w-4 h-4" />
            <span>03. CONTAINER ISOLATION BOUNDARIES</span>
          </div>
          <h2 className="text-lg font-bold font-display text-white">
            Linux Namespaces &amp; Resource Cgroups
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Worker nodes execute applications inside standardized Docker OCI containers with CPU quotas (`nano_cpus`), memory ceilings (`mem_limit`), and non-privileged kernel capabilities to prevent host exhaustion.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-slate-800">
            Implementation: node-agent/agent.py
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
            <Terminal className="w-4 h-4" />
            <span>04. AUTOMATED TLS AT INGRESS</span>
          </div>
          <h2 className="text-lg font-bold font-display text-white">
            Strict Let’s Encrypt ACME &amp; HSTS
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Traefik proxies all external traffic over port 443 with automated TLS certificate issuance and renewal. Plain HTTP requests on port 80 are permanently redirected to HTTPS with standard security headers.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-slate-800">
            Implementation: docker-compose.prod.yml
          </div>
        </div>
      </div>

      {/* Threat Matrix Table */}
      <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold font-display text-white">
          Active Threat Model &amp; Defense Matrix
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-sans">
          Factual audit of threat vectors, mitigation mechanisms, and ongoing security work.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-xs text-slate-400 uppercase">
                <th className="py-3 px-4 w-1/3">Threat Vector</th>
                <th className="py-3 px-4 w-1/2">Mitigation Strategy</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {threatMatrix.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {t.threat}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                    {t.mitigation}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-emerald-400">
                    {t.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RFC 9116 security.txt */}
      <div className="p-6 rounded-2xl bg-[#080b0f] border border-slate-800 space-y-4 font-mono">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-slate-200 text-sm font-bold font-display">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>/.well-known/security.txt (RFC 9116 Compliant)</span>
          </div>
          <span className="text-xs text-slate-400">Vulnerability Disclosure Protocol</span>
        </div>

        <pre className="p-4 rounded-xl bg-black border border-slate-800 text-xs text-emerald-400 overflow-x-auto leading-relaxed">
          {securityTxtContent}
        </pre>
      </div>
    </div>
  );
};
