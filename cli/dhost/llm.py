"""Multi-provider LLM text generation for the CLI's optional Dockerfile
refinement step (see detect.py's maybe_refine_with_ai). Real calls only:
if no provider is configured, or the configured one fails, callers get
(None, None) -- never a fabricated result.

Kept as a separate copy of control-plane/app/llm.py, not a shared import
-- same reasoning as detect.py's duplication (see that module's
docstring): the CLI and control plane are independently distributed.

Provider order is fixed and simple: Anthropic, then OpenAI, then Google
-- first one with an API key actually set in the environment wins. This
is "use whichever real key you gave me," not a router or a fallback
chain that silently retries across providers on every call.
"""
import logging
import os

import httpx

logger = logging.getLogger("dhost.llm")

DEFAULT_SYSTEM = "You are a concise, helpful assistant. No filler, no markdown unless asked."


def _anthropic(prompt: str, system: str) -> str | None:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    try:
        resp = httpx.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022"),
                "max_tokens": 300,
                "system": system,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        text = "".join(block.get("text", "") for block in data.get("content", [])).strip()
        return text or None
    except Exception as e:
        logger.warning(f"Anthropic call failed: {e}")
        return None


def _openai(prompt: str, system: str) -> str | None:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    try:
        resp = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "content-type": "application/json"},
            json={
                "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                "max_tokens": 300,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        text = (data["choices"][0]["message"]["content"] or "").strip()
        return text or None
    except Exception as e:
        logger.warning(f"OpenAI call failed: {e}")
        return None


def _google(prompt: str, system: str) -> str | None:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            os.getenv("GOOGLE_MODEL", "gemini-1.5-flash"), system_instruction=system,
        )
        text = (model.generate_content(prompt).text or "").strip()
        return text or None
    except Exception as e:
        logger.warning(f"Google call failed: {e}")
        return None


PROVIDERS: list[tuple[str, "callable"]] = [
    ("anthropic", _anthropic),
    ("openai", _openai),
    ("google", _google),
]


def generate_text(prompt: str, system: str = DEFAULT_SYSTEM) -> tuple[str | None, str | None]:
    """Returns (text, provider_name) from the first configured provider
    that succeeds, in Anthropic -> OpenAI -> Google order. Returns
    (None, None) if nothing is configured or every configured provider
    failed -- callers must treat that as "unavailable," not retry with a
    fabricated answer."""
    for name, fn in PROVIDERS:
        text = fn(prompt, system)
        if text:
            return text, name
    return None, None


def any_provider_configured() -> bool:
    return bool(
        os.getenv("ANTHROPIC_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    )
