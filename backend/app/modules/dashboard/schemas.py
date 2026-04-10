"""Aggregated dashboard payload for GET /dashboard/summary."""

from datetime import datetime

from pydantic import BaseModel, Field


class DashboardPortfolioBlock(BaseModel):
    """Subset of portfolio summary for the dashboard card."""

    cash_balance: float
    total_value: float
    total_pnl: float


class DashboardProgressBlock(BaseModel):
    """Global learning progress snapshot."""

    total_lessons_completed: int
    total_courses_completed: int
    overall_progress: float = Field(ge=0.0, le=100.0)


class DashboardRecentTradeItem(BaseModel):
    """Lightweight row for recent simulated activity."""

    symbol: str
    side: str
    created_at: datetime


class DashboardMarketItem(BaseModel):
    """Top-of-book style preview from market_data list."""

    symbol: str
    name: str
    price: float
    change_percent: float


class DashboardSummaryResponse(BaseModel):
    """Single payload for the main dashboard."""

    portfolio: DashboardPortfolioBlock
    progress: DashboardProgressBlock
    recent_activity: list[DashboardRecentTradeItem]
    market_preview: list[DashboardMarketItem]
