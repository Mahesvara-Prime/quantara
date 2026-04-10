"""Market data orchestration: provider calls, rules, normalized API-ready structures."""

from __future__ import annotations

import threading
import time
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.modules.market_data.providers.base import MarketDataProvider
from app.modules.market_data.providers.coingecko import CoinGeckoProvider
from app.modules.market_data import rules
from app.modules.market_data.schemas import AssetDetailResponse, AssetListItemResponse, CandleResponse

_SIMPLE_PRICE_BATCH = 40


class MarketDataService:
    """Fetches from a MarketDataProvider and returns normalized Pydantic models."""

    def __init__(self, provider: MarketDataProvider | None = None) -> None:
        self._provider = provider or CoinGeckoProvider(
            base_url=settings.coingecko_api_base_url,
            timeout_seconds=settings.coingecko_http_timeout_seconds,
        )
        self._detail_lock = threading.Lock()
        self._detail_cache: dict[str, tuple[AssetDetailResponse, float]] = {}

    def list_assets(self, *, limit: int = 50, page: int = 1) -> list[AssetListItemResponse]:
        """Ranked list vs USD (provider-defined ordering, typically by market cap)."""
        per_page = max(1, min(limit, 100))
        pg = max(1, page)
        try:
            raw = self._provider.fetch_markets(
                vs_currency="usd",
                per_page=per_page,
                page=pg,
            )
        except httpx.HTTPStatusError as exc:
            _raise_http_error(exc)
        out: list[AssetListItemResponse] = []
        for row in raw:
            mapped = rules.market_row_to_list_item(row)
            if mapped:
                out.append(AssetListItemResponse.model_validate(mapped))
        return out

    def get_spot_prices_usd(self, symbols: list[str]) -> dict[str, float]:
        """
        Batch USD spot for normalized symbols (one /simple/price round-trip per chunk of coin ids).
        Symbols without a CoinGecko mapping are omitted from the result.
        """
        seen: set[str] = set()
        sym_norm: list[str] = []
        for raw in symbols:
            s = rules.normalize_symbol(raw)
            if s in seen:
                continue
            seen.add(s)
            sym_norm.append(s)
        if not sym_norm:
            return {}

        id_to_syms: dict[str, list[str]] = {}
        for s in sym_norm:
            cid = rules.resolve_coingecko_id(s)
            if cid:
                id_to_syms.setdefault(cid, []).append(s)
        if not id_to_syms:
            return {}

        coin_ids = list(id_to_syms.keys())
        merged: dict[str, Any] = {}
        for i in range(0, len(coin_ids), _SIMPLE_PRICE_BATCH):
            chunk = coin_ids[i : i + _SIMPLE_PRICE_BATCH]
            try:
                raw = self._provider.fetch_simple_prices(chunk)
            except httpx.HTTPStatusError as exc:
                _raise_http_error(exc)
            if isinstance(raw, dict):
                merged.update(raw)

        out: dict[str, float] = {}
        for coin_id, sym_list in id_to_syms.items():
            entry = merged.get(coin_id)
            price = rules.simple_price_entry_usd(entry) if isinstance(entry, dict) else None
            if price is None:
                continue
            for sym in sym_list:
                out[sym] = price
        return out

    def get_asset_detail(self, symbol: str) -> AssetDetailResponse:
        """Detail for a supported symbol (see rules.SYMBOL_TO_COINGECKO_ID)."""
        sym = rules.normalize_symbol(symbol)
        coin_id = rules.resolve_coingecko_id(sym)
        if not coin_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unknown or unsupported symbol: {sym}",
            )

        ttl = max(0.0, settings.market_data_price_cache_ttl_seconds)
        now = time.monotonic()
        with self._detail_lock:
            hit = self._detail_cache.get(coin_id)
            if hit is not None and ttl > 0:
                cached, expires_at = hit
                if now < expires_at:
                    if cached.symbol != sym:
                        return cached.model_copy(update={"symbol": sym})
                    return cached

        try:
            raw = self._provider.fetch_coin_detail(coin_id)
        except httpx.HTTPStatusError as exc:
            if exc.response is not None and exc.response.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Asset not found on provider.",
                ) from None
            _raise_http_error(exc)
        if not raw:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Empty response from market data provider.",
            )
        mapped = rules.coin_detail_to_asset_detail(raw, symbol_override=sym)
        response = AssetDetailResponse.model_validate(mapped)

        if ttl > 0:
            with self._detail_lock:
                self._detail_cache[coin_id] = (response, now + ttl)

        return response

    def get_candles(
        self,
        symbol: str,
        *,
        timeframe: str = "1d",
        limit: int = 100,
    ) -> list[CandleResponse]:
        """OHLC series for charting; timeframe selects CoinGecko OHLC window."""
        coin_id = rules.resolve_coingecko_id(symbol)
        if not coin_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unknown or unsupported symbol: {rules.normalize_symbol(symbol)}",
            )
        try:
            _, days = rules.validate_timeframe(timeframe)
            lim = rules.clamp_limit(limit)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc

        try:
            raw_rows = self._provider.fetch_ohlc(
                coin_id,
                vs_currency="usd",
                days=days,
            )
        except httpx.HTTPStatusError as exc:
            _raise_http_error(exc)

        candles: list[CandleResponse] = []
        for row in raw_rows:
            m = rules.ohlc_row_to_candle(row)
            if m:
                candles.append(CandleResponse.model_validate(m))

        if len(candles) > lim:
            candles = candles[-lim:]
        return candles


def _raise_http_error(exc: httpx.HTTPStatusError) -> None:
    code = exc.response.status_code if exc.response is not None else 502
    if code == 429:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Market data provider rate limit exceeded. Try again shortly.",
        ) from exc
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Market data provider error (HTTP {code}).",
    ) from exc


def get_market_data_service() -> MarketDataService:
    """FastAPI dependency factory (stateless service, default provider from settings)."""
    return MarketDataService()
