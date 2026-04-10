"""Market data routes — delegate to MarketDataService (no provider calls here)."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.modules.market_data.schemas import AssetDetailResponse, AssetListItemResponse, CandleResponse
from app.modules.market_data.service import MarketDataService, get_market_data_service

router = APIRouter()


@router.get("", response_model=list[AssetListItemResponse])
def list_assets(
    service: Annotated[MarketDataService, Depends(get_market_data_service)],
    limit: Annotated[int, Query(ge=1, le=100, description="Page size (max 100)")] = 50,
    page: Annotated[int, Query(ge=1, description="Page index (1-based)")] = 1,
) -> list[AssetListItemResponse]:
    """List tradable assets with last price and 24h change (USD)."""
    return service.list_assets(limit=limit, page=page)


@router.get("/{symbol}/candles", response_model=list[CandleResponse])
def get_asset_candles(
    symbol: str,
    service: Annotated[MarketDataService, Depends(get_market_data_service)],
    timeframe: Annotated[str, Query(description="e.g. 1h, 1d, 30d")] = "1d",
    limit: Annotated[int, Query(ge=1, le=500, description="Max candles returned (newest retained)")] = 100,
) -> list[CandleResponse]:
    """OHLC candles for charts; granularity follows the provider for the chosen window."""
    return service.get_candles(symbol, timeframe=timeframe, limit=limit)


@router.get("/{symbol}", response_model=AssetDetailResponse)
def get_asset_detail(
    symbol: str,
    service: Annotated[MarketDataService, Depends(get_market_data_service)],
) -> AssetDetailResponse:
    """Single-asset snapshot including 24h high/low."""
    return service.get_asset_detail(symbol)
