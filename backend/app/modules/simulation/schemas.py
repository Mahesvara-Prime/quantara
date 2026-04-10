"""Pydantic schemas for simulation API (trades, portfolio, positions)."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class CreateTradeRequest(BaseModel):
    """POST /simulation/trades — market orders only at MVP."""

    symbol: str = Field(min_length=1, max_length=30)
    side: Literal["buy", "sell"]
    # Buy: USD notional to spend from cash. Sell: base-asset units to sell.
    amount: float = Field(gt=0, description="Buy: USD to spend. Sell: asset quantity to sell.")


class TradeResponse(BaseModel):
    """POST /simulation/trades — exécution confirmée (created_at utile au front / historique)."""

    model_config = {"from_attributes": True}

    id: int
    symbol: str
    side: str
    amount: float
    quantity: float
    price: float
    created_at: datetime


class PortfolioResponse(BaseModel):
    """GET /portfolio — cash plus mark-to-market value and unrealized P&L."""

    cash_balance: float
    total_value: float
    total_pnl: float


class PositionResponse(BaseModel):
    """One open simulated position."""

    symbol: str
    quantity: float
    average_entry_price: float
    current_price: float
    pnl: float


class TradeHistoryItem(BaseModel):
    """GET /trades — compact history row."""

    symbol: str
    side: str
    amount: float
    price: float
    created_at: datetime
