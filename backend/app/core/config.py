"""Central application settings.

This module provides typed settings for runtime configuration, including
the PostgreSQL connection URL used by SQLAlchemy and Alembic.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables when available."""

    app_name: str = "Quantara Backend API"
    app_version: str = "1.0.0"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/quantara?connect_timeout=5"

    # JWT (HS256). Override JWT_SECRET_KEY in production; the default is for local dev only.
    jwt_secret_key: str = "quantara-dev-jwt-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # CoinGecko public API (no key required for basic usage; respect rate limits).
    coingecko_api_base_url: str = "https://api.coingecko.com/api/v3"
    coingecko_http_timeout_seconds: float = 15.0
    # In-memory caches (reduce CoinGecko public API rate limits; tune via env).
    market_data_price_cache_ttl_seconds: float = 60.0
    market_data_markets_list_cache_ttl_seconds: float = 60.0
    market_data_ohlc_cache_ttl_seconds: float = 180.0

    # Paper trading starting balance (USD).
    simulation_initial_cash_usd: str = "100000.00"

    # Password change by email — link target (SPA origin, no trailing path).
    public_app_url: str = "http://localhost:5173"
    # Optional Resend API (https://resend.com). If unset, confirmation links are logged only.
    resend_api_key: str | None = None
    resend_from_email: str = "Quantara <onboarding@resend.dev>"

    # Comma-separated browser origins for CORS. Use "*" alone to allow any origin
    # (credentials are then disabled — OK for quick tests, not for cookie-based auth).
    cors_allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
