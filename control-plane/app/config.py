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
    # How long a node can go without a heartbeat before it's considered truly
    # gone (not just briefly stale) and its running deployments get
    # automatically rescheduled elsewhere -- see app/failover.py. Deliberately
    # much bigger than HEARTBEAT_STALE_SECONDS: a node's Docker runtime
    # restarting (observed taking 10-90s in practice) should not trigger a
    # reschedule while it's still on its way back up.
    NODE_OFFLINE_SECONDS: int = int(os.getenv("NODE_OFFLINE_SECONDS", "180"))
    # How often the background loop checks for offline nodes with running
    # deployments to reschedule. Independent of HEARTBEAT_INTERVAL (the
    # node-agent's own heartbeat cadence, set on node-agent, not here).
    FAILOVER_CHECK_INTERVAL_SECONDS: int = int(
        os.getenv("FAILOVER_CHECK_INTERVAL_SECONDS", "20")
    )
    ENABLE_BLOCKCHAIN: bool = os.getenv("ENABLE_BLOCKCHAIN", "false").lower() == "true"
    SOLANA_RPC_URL: str = os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com")
    SOLANA_MINT_ADDRESS: str = os.getenv("SOLANA_MINT_ADDRESS", "")
    SOLANA_PAYER_KEYPAIR_PATH: str = os.getenv(
        "SOLANA_PAYER_KEYPAIR_PATH", "/app/blockchain/.keys/payer.json"
    )
    CREDITS_PER_REWARD: int = int(os.getenv("CREDITS_PER_REWARD", "10"))
    HEARTBEATS_PER_REWARD: int = int(os.getenv("HEARTBEATS_PER_REWARD", "6"))
    # Fallback only, used if a node somehow has no advertise_address on file
    # (shouldn't happen for any node that registered post-hardening). Each
    # node now reports its own reachable address at join time and the
    # control plane talks to *that* node specifically -- see Node.advertise_address.
    NODE_AGENT_LOG_BASE_URL: str = os.getenv(
        "NODE_AGENT_LOG_BASE_URL", "http://node-agent:8100"
    )


settings = Settings()
