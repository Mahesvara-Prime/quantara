"""Pure trading rules: sizing, validation, P&L math (no I/O)."""

from __future__ import annotations

from decimal import ROUND_DOWN, Decimal
from typing import Literal

QTY = Decimal("0.00000001")
USD = Decimal("0.01")


def normalize_symbol(symbol: str) -> str:
    return symbol.strip().upper()


def validate_trade_side(side: str) -> Literal["buy", "sell"]:
    s = side.strip().lower()
    if s not in ("buy", "sell"):
        raise ValueError("side must be 'buy' or 'sell'")
    return s  # type: ignore[return-value]


def to_decimal_amount(amount: float) -> Decimal:
    d = Decimal(str(amount))
    if d <= 0:
        raise ValueError("amount must be positive")
    return d


def validate_cash_for_buy(cash: Decimal, spend_usd: Decimal) -> None:
    if spend_usd > cash.quantize(USD, rounding=ROUND_DOWN):
        raise ValueError("Insufficient cash for this buy.")


def validate_position_for_sell(open_qty: Decimal, sell_qty: Decimal) -> None:
    if sell_qty > open_qty:
        raise ValueError("Cannot sell more than the open position quantity.")


def calculate_buy_quantity(spend_usd: Decimal, price: Decimal) -> Decimal:
    if price <= 0:
        raise ValueError("Execution price must be positive.")
    qty = spend_usd / price
    return qty.quantize(QTY, rounding=ROUND_DOWN)


def calculate_sell_proceeds(sell_qty: Decimal, price: Decimal) -> Decimal:
    if price <= 0:
        raise ValueError("Execution price must be positive.")
    return (sell_qty * price).quantize(USD, rounding=ROUND_DOWN)


def weighted_average_entry(
    old_qty: Decimal,
    old_avg: Decimal,
    add_qty: Decimal,
    add_price: Decimal,
) -> Decimal:
    """New average entry after adding to a position."""
    new_qty = old_qty + add_qty
    if new_qty <= 0:
        return add_price
    total_cost = (old_qty * old_avg) + (add_qty * add_price)
    return (total_cost / new_qty).quantize(QTY, rounding=ROUND_DOWN)


def unrealized_pnl(quantity: Decimal, average_entry_price: Decimal, current_price: Decimal) -> Decimal:
    """Mark-to-market P&L for an open position (USD)."""
    return ((current_price - average_entry_price) * quantity).quantize(USD, rounding=ROUND_DOWN)
