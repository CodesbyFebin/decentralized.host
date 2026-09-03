import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from .config import settings
from .database import Base, SessionLocal, engine
from .failover import check_and_reschedule
from .routers import assistant, auth, blockchain, deployments, git_keys, nodes

# There's no migration tool (Alembic, etc.) in this project -- for a single
# operator's local/self-hosted mesh that's a deliberate simplicity choice,
# not an oversight. Base.metadata.create_all only creates *new* tables, so
# additive column changes on existing tables need a one-line, idempotent
# ALTER here instead. If this list grows past a couple of entries, that's
# the signal to actually adopt Alembic.
STARTUP_MIGRATIONS = [
    "ALTER TABLE nodes ADD COLUMN IF NOT EXISTS advertise_address VARCHAR",
    "ALTER TABLE releases ADD COLUMN IF NOT EXISTS engine_report TEXT",
    "ALTER TABLE deployments ADD COLUMN IF NOT EXISTS env TEXT",
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


async def _failover_loop() -> None:
    """Background task, not a request handler -- opens its own DB session
    each pass since FastAPI's Depends(get_db) only works within a request.
    Errors are caught and logged rather than left to crash the loop: one
    bad pass (e.g. a transient DB hiccup) shouldn't permanently disable
    automated failover for the life of the process."""
    while True:
        await asyncio.sleep(settings.FAILOVER_CHECK_INTERVAL_SECONDS)
        db = SessionLocal()
        try:
            rescheduled = check_and_reschedule(db)
            if rescheduled:
                logger.info(f"Automated failover rescheduled: {rescheduled}")
        except Exception:
            logger.exception("Failover check pass failed")
        finally:
            db.close()


@app.on_event("startup")
async def on_startup() -> None:
    # Deliberately async (not sync) so asyncio.create_task() below attaches
    # to the actual running event loop -- confirmed by testing that a sync
    # startup handler here left the failover loop silently never scheduled
    # (Starlette runs sync startup handlers off the main loop thread).
    for attempt in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            with engine.begin() as conn:
                for stmt in STARTUP_MIGRATIONS:
                    conn.execute(text(stmt))
            logger.info("Database ready")
            asyncio.create_task(_failover_loop())
            return
        except OperationalError:
            logger.info(f"Waiting for database... ({attempt + 1}/30)")
            await asyncio.sleep(2)
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
