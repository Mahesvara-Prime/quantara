"""Chart orchestration: consumes market_data only (no external providers here)."""

from __future__ import annotations

from app.modules.charting import rules as charting_rules
from app.modules.charting.schemas import ChartResponse
from app.modules.market_data import rules as market_rules
from app.modules.market_data.service import MarketDataService, get_market_data_service


class ChartingService:
    """Builds chart-ready responses from normalized candles."""

    def __init__(self, market_data: MarketDataService) -> None:
        self._market_data = market_data

    def get_chart_data(self, symbol: str, *, timeframe: str = "1d", limit: int = 100) -> ChartResponse:
        """
        Fetch OHLC via market_data and apply chart formatting.

        Raises the same HTTP exceptions as market_data for unknown symbols or bad timeframes.
        """
        candles = self._market_data.get_candles(symbol, timeframe=timeframe, limit=limit)
        tf, _ = market_rules.validate_timeframe(timeframe)
        sym = market_rules.normalize_symbol(symbol)
        formatted = charting_rules.map_candles_to_chart_format(candles)
        return ChartResponse(symbol=sym, timeframe=tf, candles=formatted)


def get_charting_service(
    market_data: MarketDataService | None = None,
) -> ChartingService:
    """Factory; inject MarketDataService for tests."""
    return ChartingService(market_data=market_data or get_market_data_service())
