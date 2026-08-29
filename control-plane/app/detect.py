"""Rule-based project stack detection, mirroring cli/dhost/detect.py.

Kept as a separate copy (not a shared import) because the CLI and the
control plane are independently deployable services with their own build
contexts -- see blockchain/creditor.py for the one case where sharing
across a Docker build context was worth the coupling. This module is small
enough (~60 lines) that duplication is cheaper than that coupling.
"""
import json
from pathlib import Path

DOCKERFILES = {
    "node": """FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY . .
RUN if [ -f next.config.js ] || [ -f next.config.mjs ]; then npm run build; fi
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "start"]
""",
    "python-fastapi": """FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
""",
    "python-generic": """FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
CMD ["python", "app.py"]
""",
    "go": """FROM golang:1.22 AS build
WORKDIR /src
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app ./...

FROM gcr.io/distroless/static-debian12
COPY --from=build /app /app
EXPOSE 8080
CMD ["/app"]
""",
    "static": """FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
""",
}


def detect_stack(project_dir: Path) -> tuple[str, str]:
    files = {p.name for p in project_dir.iterdir() if p.is_file()}

    if "package.json" in files:
        pkg = json.loads((project_dir / "package.json").read_text())
        deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
        if "next" in deps:
            return "Next.js", DOCKERFILES["node"]
        return "Node.js", DOCKERFILES["node"]

    if "requirements.txt" in files or "pyproject.toml" in files:
        req_text = ""
        if "requirements.txt" in files:
            req_text = (project_dir / "requirements.txt").read_text().lower()
        if "fastapi" in req_text or "uvicorn" in req_text:
            return "Python (FastAPI)", DOCKERFILES["python-fastapi"]
        return "Python", DOCKERFILES["python-generic"]

    if "go.mod" in files:
        return "Go", DOCKERFILES["go"]

    if "index.html" in files:
        return "Static site", DOCKERFILES["static"]

    return "Static site (fallback)", DOCKERFILES["static"]
