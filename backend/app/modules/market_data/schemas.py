"""Pydantic schemas for market_data API responses (normalized, provider-agnostic)."""

from pydantic import BaseModel, Field


class AssetListItemResponse(BaseModel):
    """One row in GET /assets."""

    symbol: str = Field(description="Trading symbol, e.g. BTC")
    name: str
    price: float
    change_percent: float = Field(description="24h price change in percent")


class AssetDetailResponse(BaseModel):
    """GET /assets/{symbol} — superset du guide API (high/low 24h pour la fiche actif)."""

    symbol: str
    name: str
    price: float
    change_percent: float
    high_24h: float
    low_24h: float


class CandleResponse(BaseModel):
    """One OHLC candle for charting."""

    timestamp: int = Field(description="Unix time in milliseconds (UTC)")
    open: float
    high: float
    low: float
    close: float
