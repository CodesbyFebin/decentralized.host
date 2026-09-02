"""Optional AI commentary for the Launchpad's detect step.

Real, not simulated: tries whichever LLM provider is actually configured
(see llm.py -- Anthropic, OpenAI, or Google, in that order) for a short
note about the detected stack/Dockerfile. If none is configured, callers
get None and the UI shows "AI assistance not configured" rather than
faking a response -- see cli/dhost/detect.py's maybe_refine_with_ai for
the same pattern used by the CLI.
"""
from .llm import generate_text


def generate_ai_note(stack: str, dockerfile: str) -> str | None:
    prompt = (
        f"A developer is about to deploy a '{stack}' project with this "
        f"auto-generated Dockerfile. In 2-3 short sentences, flag anything "
        f"non-obvious or risky (wrong port, missing build step, etc.), or "
        f"say it looks fine. Be concise and specific, no filler.\n\n{dockerfile}"
    )
    text, _provider = generate_text(prompt)
    return text
