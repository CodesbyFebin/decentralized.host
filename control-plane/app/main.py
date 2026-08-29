import logging
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from .database import Base, engine
from .routers import assistant, auth, blockchain, deployments, git_keys, nodes

# There's no migration tool (Alembic, etc.) in this project -- for a single
# operator's local/self-hosted mesh that's a deliberate simplicity choice,
# not an oversight. Base.metadata.create_all only creates *new* tables, so
# additive column changes on existing tables need a one-line, idempotent
# ALTER here instead. If this list grows past a couple of entries, that's
# the signal to actually adopt Alembic.
STARTUP_MIGRATIONS = [
    "ALTER TABLE nodes ADD COLUMN IF NOT EXISTS advertise_address VARCHAR",
]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dhost.control-plane")

app = FastAPI(title="decentralized.host control plane", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    for attempt in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            with engine.begin() as conn:
                for stmt in STARTUP_MIGRATIONS:
                    conn.execute(text(stmt))
            logger.info("Database ready")
            return
        except OperationalError:
            logger.info(f"Waiting for database... ({attempt + 1}/30)")
            time.sleep(2)
    raise RuntimeError("Database never became available")


@app.get("/")
def root():
    return {"service": "decentralized.host control plane", "status": "ok"}


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(nodes.router)
app.include_router(deployments.router)
app.include_router(blockchain.router)
app.include_router(git_keys.router)
app.include_router(assistant.router)
