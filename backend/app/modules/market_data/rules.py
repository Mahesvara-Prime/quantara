"""Pure helpers: symbol/timeframe normalization and mapping from provider payloads."""

from __future__ import annotations

import math
from typing import Any

# Curated map: public trading symbol -> CoinGecko coin id (path segment for /coins/{id}).
# Extend as needed; unknown symbols return None until a registry or search is added.
SYMBOL_TO_COINGECKO_ID: dict[str, str] = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "BNB": "binancecoin",
    "SOL": "solana",
    "XRP": "ripple",
    "ADA": "cardano",
    "DOGE": "dogecoin",
    "DOT": "polkadot",
    "MATIC": "matic-network",
    "POL": "matic-network",
    "AVAX": "avalanche-2",
    "LINK": "chainlink",
    "SHIB": "shiba-inu",
    "LTC": "litecoin",
    "BCH": "bitcoin-cash",
    "ATOM": "cosmos",
    "UNI": "uniswap",
    "XLM": "stellar",
    "NEAR": "near",
    "APT": "aptos",
    "ARB": "arbitrum",
    "OP": "optimism",
}


def normalize_symbol(symbol: str) -> str:
    """Uppercase and strip user input for comparisons and responses."""
    return symbol.strip().upper()


def resolve_coingecko_id(symbol: str) -> str | None:
    """Return CoinGecko `id` for a trading symbol, or None if unsupported in MVP."""
    key = normalize_symbol(symbol)
    return SYMBOL_TO_COINGECKO_ID.get(key)


def validate_timeframe(timeframe: str) -> tuple[str, int]:
    """
    Map API timeframe labels to CoinGecko OHLC `days` parameter.

    CoinGecko accepts: 1, 7, 14, 30, 90, 180, 365, max. Granularity is provider-defined.

    Returns (canonical_timeframe, days).
    """
    tf = timeframe.strip().lower()
    allowed: dict[str, tuple[str, int]] = {
        "1h": ("1h", 1),
        "4h": ("4h", 7),
        "1d": ("1d", 30),
        "7d": ("7d", 7),
        "30d": ("30d", 30),
        "90d": ("90d", 90),
    }
    if tf not in allowed:
        valid = ", ".join(sorted(allowed.keys()))
        raise ValueError(f"Invalid timeframe '{timeframe}'. Allowed: {valid}")
    return allowed[tf]


def clamp_limit(limit: int, *, max_candles: int = 500) -> int:
    """Keep candle count within sensible bounds."""
    if limit < 1:
        raise ValueError("limit must be at least 1")
    return min(limit, max_candles)


def market_row_to_list_item(row: dict[str, Any]) -> dict[str, Any] | None:
    """Map one CoinGecko /coins/markets row to AssetListItemResponse fields."""
    sym = row.get("symbol")
    if not sym:
        return None
    price = row.get("current_price")
    chg = row.get("price_change_percentage_24h")
    return {
        "symbol": str(sym).upper(),
        "name": str(row.get("name") or ""),
        "price": _safe_float(price),
        "change_percent": _safe_float(chg),
    }


def coin_detail_to_asset_detail(
    payload: dict[str, Any],
    *,
    symbol_override: str | None = None,
) -> dict[str, Any]:
    """Map CoinGecko /coins/{id} JSON to AssetDetailResponse fields."""
    md = payload.get("market_data") or {}
    prices = md.get("current_price") or {}
    high = md.get("high_24h") or {}
    low = md.get("low_24h") or {}
    sym = symbol_override or str((payload.get("symbol") or "")).upper()
    name = str(payload.get("name") or "")
    price = _safe_float(prices.get("usd"))
    chg = _safe_float(md.get("price_change_percentage_24h"))
    return {
        "symbol": sym,
        "name": name,
        "price": price,
        "change_percent": chg,
        "high_24h": _safe_float(high.get("usd")),
        "low_24h": _safe_float(low.get("usd")),
    }


def ohlc_row_to_candle(row: list[Any]) -> dict[str, Any] | None:
    """Map [timestamp_ms, open, high, low, close] to CandleResponse fields."""
    if not row or len(row) < 5:
        return None
    try:
        ts = int(row[0])
        o, h, l, c = (float(row[1]), float(row[2]), float(row[3]), float(row[4]))
    except (TypeError, ValueError):
        return None
    if any(math.isnan(x) or math.isinf(x) for x in (o, h, l, c)):
        return None
    return {
        "timestamp": ts,
        "open": o,
        "high": h,
        "low": l,
        "close": c,
    }


def _safe_float(value: Any) -> float:
    try:
        if value is None:
            return 0.0
        v = float(value)
        return 0.0 if math.isnan(v) or math.isinf(v) else v
    except (TypeError, ValueError):
        return 0.0


def simple_price_entry_usd(entry: dict[str, Any] | None) -> float | None:
    """Extract USD spot from CoinGecko /simple/price row; None if missing or invalid."""
    if not isinstance(entry, dict):
        return None
    v = _safe_float(entry.get("usd"))
    if v <= 0:
        return None
    return v
