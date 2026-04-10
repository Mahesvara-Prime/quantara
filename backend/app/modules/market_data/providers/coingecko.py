"""CoinGecko REST client (public API v3) — raw JSON only; no business rules here."""

from __future__ import annotations

from typing import Any

import httpx

from app.modules.market_data.providers.base import MarketDataProvider


class CoinGeckoProvider(MarketDataProvider):
    """Thin wrapper around https://api.coingecko.com/api/v3."""

    def __init__(
        self,
        *,
        base_url: str,
        timeout_seconds: float = 15.0,
    ) -> None:
        self._base = base_url.rstrip("/")
        self._timeout = timeout_seconds

    def fetch_markets(
        self,
        *,
        vs_currency: str,
        per_page: int,
        page: int,
    ) -> list[dict[str, Any]]:
        params = {
            "vs_currency": vs_currency,
            "order": "market_cap_desc",
            "per_page": per_page,
            "page": page,
            "sparkline": "false",
            "price_change_percentage": "24h",
        }
        data = self._get("/coins/markets", params)
        if not isinstance(data, list):
            return []
        return data

    def fetch_coin_detail(self, coin_id: str) -> dict[str, Any]:
        params = {
            "localization": "false",
            "tickers": "false",
            "market_data": "true",
            "community_data": "false",
            "developer_data": "false",
            "sparkline": "false",
        }
        data = self._get(f"/coins/{coin_id}", params)
        if not isinstance(data, dict):
            return {}
        return data

    def fetch_simple_prices(self, coin_ids: list[str]) -> dict[str, Any]:
        if not coin_ids:
            return {}
        params = {
            "ids": ",".join(dict.fromkeys(coin_ids)),
            "vs_currencies": "usd",
            "include_24hr_change": "true",
        }
        data = self._get("/simple/price", params)
        return data if isinstance(data, dict) else {}

    def fetch_ohlc(
        self,
        coin_id: str,
        *,
        vs_currency: str,
        days: int | str,
    ) -> list[list[Any]]:
        params = {
            "vs_currency": vs_currency,
            "days": days,
        }
        data = self._get(f"/coins/{coin_id}/ohlc", params)
        if not isinstance(data, list):
            return []
        return data

    def _get(self, path: str, params: dict[str, Any]) -> Any:
        url = f"{self._base}{path}"
        with httpx.Client(timeout=self._timeout) as client:
            response = client.get(url, params=params)
            response.raise_for_status()
            return response.json()
