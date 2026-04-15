"""Abstract market data provider — isolates external HTTP APIs from services."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class MarketDataProvider(ABC):
    """Contract for fetching raw market payloads; normalization happens in rules/service."""

    @abstractmethod
    def fetch_markets(
        self,
        *,
        vs_currency: str,
        per_page: int,
        page: int,
    ) -> list[dict[str, Any]]:
        """Return provider-specific rows for a ranked list of markets (e.g. CoinGecko markets)."""

    @abstractmethod
    def fetch_coin_detail(self, coin_id: str) -> dict[str, Any]:
        """Return provider JSON for a single coin by provider id (e.g. bitcoin)."""

    @abstractmethod
    def fetch_simple_prices(self, coin_ids: list[str]) -> dict[str, Any]:
        """Spot USD price per provider coin id (batch); empty list -> {}."""

    @abstractmethod
    def fetch_ohlc(
        self,
        coin_id: str,
        *,
        vs_currency: str,
        days: int | str,
    ) -> list[list[Any]]:
        """Return OHLC rows: each row [timestamp_ms, open, high, low, close]."""
