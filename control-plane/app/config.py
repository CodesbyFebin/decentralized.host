import os


class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg2://dhost:dhost@postgres:5432/dhost"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-insecure-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    NODE_JOIN_SECRET: str = os.getenv("NODE_JOIN_SECRET", "dev-join-secret")
    DEPLOY_API_KEY: str = os.getenv("DEPLOY_API_KEY", "dev-deploy-key")
    NODE_TOKEN_TTL_HOURS: int = int(os.getenv("NODE_TOKEN_TTL_HOURS", "24"))
    BASE_DOMAIN: str = os.getenv("BASE_DOMAIN", "127.0.0.1.nip.io")
    HEARTBEAT_STALE_SECONDS: int = int(os.getenv("HEARTBEAT_STALE_SECONDS", "30"))
    ENABLE_BLOCKCHAIN: bool = os.getenv("ENABLE_BLOCKCHAIN", "false").lower() == "true"
    SOLANA_RPC_URL: str = os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com")
    SOLANA_MINT_ADDRESS: str = os.getenv("SOLANA_MINT_ADDRESS", "")
    SOLANA_PAYER_KEYPAIR_PATH: str = os.getenv(
        "SOLANA_PAYER_KEYPAIR_PATH", "/app/blockchain/.keys/payer.json"
    )
    CREDITS_PER_REWARD: int = int(os.getenv("CREDITS_PER_REWARD", "10"))
    HEARTBEATS_PER_REWARD: int = int(os.getenv("HEARTBEATS_PER_REWARD", "6"))
    # Single-node MVP: all nodes are reachable at this internal address for
    # log streaming. Multi-node address-per-node tracking is a Phase 2 item.
    NODE_AGENT_LOG_BASE_URL: str = os.getenv(
        "NODE_AGENT_LOG_BASE_URL", "http://node-agent:8100"
    )


settings = Settings()
