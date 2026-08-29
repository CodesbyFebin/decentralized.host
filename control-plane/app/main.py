import logging
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from .database import Base, engine
from .routers import auth, blockchain, deployments, nodes

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
