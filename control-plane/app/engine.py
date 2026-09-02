"""dhost engine: parallel deploy-time agents, git push to hosting.

Real, not simulated -- same honesty rule as ai.py. Each agent either does
genuine local analysis (the security scan needs no API key and always
runs) or a genuine Gemini call gated by GOOGLE_API_KEY (best-effort: if
the key isn't set, or the call fails, the agent reports "skipped" rather
than faking a result).

The "swarm" part is real too: a deploy already involves several
independent, I/O-bound checks (an LLM call's network latency, a source
tree walk, an HTTP health probe) that don't depend on each other, so they
run concurrently in a thread pool instead of one after another.
"""
import concurrent.futures
import logging
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Callable, Optional

from .ai import generate_ai_note
from .llm import any_provider_configured, generate_text

logger = logging.getLogger("dhost.engine")

# Deliberately simple, explainable patterns over a "smarter" ML secret
# scanner -- this has to run on every push with zero setup and no false
# sense of security about what it does/doesn't catch. It's a real safety
# net for the obvious cases, not a substitute for git-secrets/gitleaks.
SECRET_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"AKIA[0-9A-Z]{16}"), "AWS access key ID"),
    (re.compile(r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"), "private key"),
    (re.compile(r"ghp_[0-9A-Za-z]{36}"), "GitHub personal access token"),
    (re.compile(r"(?i)(api[_-]?key|secret[_-]?key|password)\s*[:=]\s*['\"][^'\"\s]{8,}['\"]"),
     "hardcoded credential-looking assignment"),
]

MAX_SCAN_FILE_BYTES = 1_000_000  # skip anything bigger -- binaries, lockfiles, etc.


@dataclass
class AgentResult:
    agent: str
    status: str  # "ok" | "warning" | "blocked" | "skipped"
    summary: str
    details: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


def _security_scan_agent(source_dir: Path) -> AgentResult:
    findings: list[str] = []
    for p in source_dir.rglob("*"):
        if not p.is_file():
            continue
        try:
            if p.stat().st_size > MAX_SCAN_FILE_BYTES:
                continue
            text = p.read_text(errors="ignore")
        except OSError:
            continue
        for pattern, label in SECRET_PATTERNS:
            if pattern.search(text):
                findings.append(f"{label} in {p.relative_to(source_dir)}")
    if findings:
        return AgentResult(
            "security-scan", "blocked",
            f"{len(findings)} potential secret(s) found in the pushed source", findings,
        )
    return AgentResult("security-scan", "ok", "No obvious hardcoded secrets found", [])


NOT_CONFIGURED_MSG = (
    "AI assistance not configured (set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY)"
)


def _dockerfile_review_agent(stack: str, dockerfile: str) -> AgentResult:
    note = generate_ai_note(stack, dockerfile)  # real, gated by llm.py's provider check
    if note is None:
        return AgentResult("dockerfile-review", "skipped", NOT_CONFIGURED_MSG, [])
    return AgentResult("dockerfile-review", "ok", note, [])


def _release_notes_agent(name: str, stack: str, message: str) -> AgentResult:
    if not any_provider_configured():
        return AgentResult("release-notes", "skipped", NOT_CONFIGURED_MSG, [])
    prompt = (
        f"Write ONE short, plain sentence summarizing this deployment for a "
        f"release log. App: '{name}' ({stack}). Ship/commit message: "
        f"'{message or '(none provided)'}'. No filler, no markdown, just the sentence."
    )
    text, provider = generate_text(prompt)
    if text is None:
        return AgentResult("release-notes", "skipped", "AI call failed on every configured provider", [])
    return AgentResult("release-notes", "ok", text, [f"provider: {provider}"])


def run_pre_deploy_agents(
    source_dir: Path, name: str, stack: str, dockerfile: str, message: str,
) -> list[AgentResult]:
    """Runs the security scan, Dockerfile review, and release-notes agents
    concurrently -- none of them depend on each other's output, so there's
    no reason to make a push wait on them one at a time."""
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        futures = [
            pool.submit(_security_scan_agent, source_dir),
            pool.submit(_dockerfile_review_agent, stack, dockerfile),
            pool.submit(_release_notes_agent, name, stack, message),
        ]
        return [f.result() for f in futures]


def run_post_deploy_health_agent(
    url: str, logs_fetcher: Optional[Callable[[], str]] = None,
) -> AgentResult:
    """A real HTTP probe against the just-deployed URL -- not a guess. If
    it's unhealthy and an LLM provider is configured (see llm.py), asks
    it to read the container's actual logs and suggest what to check
    first; otherwise just reports the raw logs tail."""
    import httpx

    try:
        resp = httpx.get(url, timeout=10, follow_redirects=True)
        if resp.status_code < 500:
            return AgentResult("post-deploy-health", "ok", f"Responded HTTP {resp.status_code}", [])
        reason = f"Responded HTTP {resp.status_code}"
    except httpx.HTTPError as e:
        reason = f"Unreachable: {e}"

    logs = logs_fetcher() if logs_fetcher else ""
    if not any_provider_configured():
        details = [logs[-2000:]] if logs else []
        return AgentResult("post-deploy-health", "warning", f"{reason}; {NOT_CONFIGURED_MSG} for log analysis", details)

    prompt = (
        f"A freshly deployed container is not responding healthily ({reason}). "
        f"Here are its last logs:\n\n{logs[-4000:]}\n\n"
        f"In 2-3 sentences, say what's most likely wrong and what to check first."
    )
    text, provider = generate_text(prompt)
    if text is None:
        return AgentResult("post-deploy-health", "warning", f"{reason}; AI log analysis failed on every configured provider", [])
    return AgentResult("post-deploy-health", "warning", text, [f"provider: {provider}"])
