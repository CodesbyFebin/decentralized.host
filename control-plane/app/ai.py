"""Optional AI commentary for the Launchpad's detect step.

Real, not simulated: if GOOGLE_API_KEY is set, this calls Gemini for a short
note about the detected stack/Dockerfile. If it isn't set, callers get
None and the UI shows "AI assistance not configured" rather than faking a
response -- see cli/dhost/detect.py's maybe_refine_with_ai for the same
pattern used by the CLI.
"""
import logging
import os

logger = logging.getLogger("dhost.ai")


def generate_ai_note(stack: str, dockerfile: str) -> str | None:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"A developer is about to deploy a '{stack}' project with this "
            f"auto-generated Dockerfile. In 2-3 short sentences, flag anything "
            f"non-obvious or risky (wrong port, missing build step, etc.), or "
            f"say it looks fine. Be concise and specific, no filler.\n\n{dockerfile}"
        )
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        return text or None
    except Exception as e:
        logger.warning(f"AI note generation failed: {e}")
        return None
