"""Transform market_data candles into chart-friendly structures (no provider I/O)."""

from __future__ import annotations

from app.modules.charting.schemas import ChartCandleResponse
from app.modules.market_data import rules as market_rules
from app.modules.market_data.schemas import CandleResponse


def map_candle_to_chart_format(candle: CandleResponse) -> ChartCandleResponse:
    """Map normalized provider candle → chart schema (`time` replaces `timestamp` label)."""
    return ChartCandleResponse(
        time=candle.timestamp,
        open=candle.open,
        high=candle.high,
        low=candle.low,
        close=candle.close,
    )


def map_candles_to_chart_format(candles: list[CandleResponse]) -> list[ChartCandleResponse]:
    """Batch mapping; order is preserved."""
    return [map_candle_to_chart_format(c) for c in candles]


def canonical_timeframe(timeframe: str) -> str:
    """Validate and return the canonical timeframe key (e.g. 1d)."""
    label, _days = market_rules.validate_timeframe(timeframe)
    return label


def format_timestamp_unix_ms(timestamp_ms: int) -> int:
    """Pass-through for ms; hook if we ever normalize to seconds for a given client."""
    return int(timestamp_ms)
