"""Schemas for chart-ready payloads (distinct from raw market_data candle rows)."""

from pydantic import BaseModel, Field


class ChartCandleResponse(BaseModel):
    """Single OHLC point for chart libraries (time axis = Unix ms)."""

    time: int = Field(description="Unix time in milliseconds (UTC), x-axis")
    open: float
    high: float
    low: float
    close: float


class ChartResponse(BaseModel):
    """Bundled series for a symbol/timeframe."""

    symbol: str
    timeframe: str
    candles: list[ChartCandleResponse]
