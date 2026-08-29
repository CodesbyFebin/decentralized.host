"""A single, real AI chat assistant embedded in the console -- not a "God
Router" across 100 providers. One model (Gemini, reusing the same
GOOGLE_API_KEY pattern as ai.py's Launchpad notes), read-only tool access
to the mesh's real state, and an honest "not configured" response when no
key is set. It cannot deploy, delete, or change anything -- only look."""
import logging
import os

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..auth import require_deploy_key
from ..database import get_db
from ..models import Deployment, Node, Release
from .deployments import _node_agent_url

router = APIRouter(prefix="/assistant", tags=["assistant"], dependencies=[Depends(require_deploy_key)])
logger = logging.getLogger("dhost.assistant")

SYSTEM_INSTRUCTION = (
    "You are the assistant embedded in the OpenGit Console, a self-hosted "
    "deployment mesh. You have read-only tools to check real, current "
    "deployment status, logs, node health, and release history -- use them "
    "rather than guessing. You cannot deploy, delete, or modify anything; "
    "if asked to, say so and point to the relevant CLI command or console "
    "button instead. If a tool returns an error or empty result, say so "
    "plainly rather than inventing an answer. Be concise."
)


class ChatMessage(BaseModel):
    role: str  # "user" | "model"
    text: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    tool_calls: list[str] = []


@router.get("/status")
def assistant_status():
    return {"enabled": bool(os.getenv("GOOGLE_API_KEY")), "model": "gemini-1.5-flash"}


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(503, "AI assistant not configured -- set GOOGLE_API_KEY on the control plane")

    import google.generativeai as genai

    genai.configure(api_key=api_key)
    tool_calls_made: list[str] = []

    def list_deployments() -> list[dict]:
        """List every deployment on the mesh: name, status
        (running/building/failed/pending), live URL, and error if any."""
        tool_calls_made.append("list_deployments()")
        rows = db.query(Deployment).all()
        return [
            {
                "name": d.name, "status": d.status,
                "url": f"http://{d.subdomain}" if d.subdomain else None,
                "error": d.error,
            }
            for d in rows
        ]

    def get_deployment_logs(name: str) -> str:
        """Get the last ~200 lines of container logs for a deployment, by name."""
        tool_calls_made.append(f"get_deployment_logs({name})")
        deployment = db.query(Deployment).filter(Deployment.name == name).first()
        if deployment is None:
            return f"No deployment named '{name}'"
        if not deployment.container_id or deployment.node is None:
            return "(no container yet)"
        try:
            resp = httpx.get(
                f"{_node_agent_url(deployment.node)}/logs/{deployment.container_id}", timeout=10
            )
            resp.raise_for_status()
            return resp.json().get("logs", "") or "(empty)"
        except Exception as e:
            return f"Could not fetch logs: {e}"

    def list_nodes() -> list[dict]:
        """List mesh nodes with health status, CPU used %, and RAM used (MB)."""
        tool_calls_made.append("list_nodes()")
        rows = db.query(Node).all()
        return [
            {"name": n.name, "status": n.status, "cpu_used_pct": n.cpu_used_pct, "ram_used_mb": n.ram_used_mb}
            for n in rows
        ]

    def get_release_history(name: str) -> list[dict]:
        """Get the last 10 releases (deploy events) for one deployment: message, status, error, timestamp."""
        tool_calls_made.append(f"get_release_history({name})")
        rows = (
            db.query(Release)
            .filter(Release.deployment_name == name)
            .order_by(Release.created_at.desc())
            .limit(10)
            .all()
        )
        return [
            {"message": r.message, "status": r.status, "error": r.error, "created_at": str(r.created_at)}
            for r in rows
        ]

    model = genai.GenerativeModel(
        "gemini-1.5-flash",
        tools=[list_deployments, get_deployment_logs, list_nodes, get_release_history],
        system_instruction=SYSTEM_INSTRUCTION,
    )
    history = [{"role": m.role, "parts": [m.text]} for m in payload.history]
    session = model.start_chat(history=history, enable_automatic_function_calling=True)

    try:
        response = session.send_message(payload.message)
        reply_text = response.text
    except Exception as e:
        logger.error(f"Assistant chat failed: {e}")
        raise HTTPException(502, f"AI assistant request failed: {e}")

    return ChatResponse(reply=reply_text, tool_calls=tool_calls_made)
