"""Persistence for portfolios, positions, and trades — no business rules."""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.simulation.models import Portfolio, Position, Trade


def get_portfolio_by_user_id(session: Session, user_id: int) -> Portfolio | None:
    return session.scalar(select(Portfolio).where(Portfolio.user_id == user_id))


def create_portfolio_for_user(session: Session, user_id: int, cash_balance: Decimal) -> Portfolio:
    portfolio = Portfolio(user_id=user_id, cash_balance=cash_balance)
    session.add(portfolio)
    session.flush()
    return portfolio


def update_portfolio_cash(session: Session, portfolio: Portfolio, cash_balance: Decimal) -> None:
    portfolio.cash_balance = cash_balance


def get_open_position_by_symbol(session: Session, portfolio_id: int, symbol: str) -> Position | None:
    return session.scalar(
        select(Position).where(
            Position.portfolio_id == portfolio_id,
            Position.symbol == symbol,
            Position.status == "open",
        )
    )


def list_open_positions(session: Session, portfolio_id: int) -> list[Position]:
    stmt = (
        select(Position)
        .where(Position.portfolio_id == portfolio_id, Position.status == "open")
        .order_by(Position.symbol.asc())
    )
    return list(session.scalars(stmt).all())


def create_position(
    session: Session,
    *,
    portfolio_id: int,
    symbol: str,
    quantity: Decimal,
    average_entry_price: Decimal,
) -> Position:
    pos = Position(
        portfolio_id=portfolio_id,
        symbol=symbol,
        quantity=quantity,
        average_entry_price=average_entry_price,
        status="open",
    )
    session.add(pos)
    session.flush()
    return pos


def update_position_open(
    session: Session,
    position: Position,
    *,
    quantity: Decimal,
    average_entry_price: Decimal,
) -> None:
    position.quantity = quantity
    position.average_entry_price = average_entry_price


def close_position(session: Session, position: Position) -> None:
    position.quantity = Decimal("0")
    position.status = "closed"


def create_trade(
    session: Session,
    *,
    portfolio_id: int,
    symbol: str,
    side: str,
    amount: Decimal,
    quantity: Decimal,
    price: Decimal,
) -> Trade:
    trade = Trade(
        portfolio_id=portfolio_id,
        symbol=symbol,
        side=side,
        amount=amount,
        quantity=quantity,
        price=price,
    )
    session.add(trade)
    session.flush()
    return trade


def list_trades_by_portfolio(
    session: Session,
    portfolio_id: int,
    *,
    limit: int = 200,
) -> list[Trade]:
    stmt = (
        select(Trade)
        .where(Trade.portfolio_id == portfolio_id)
        .order_by(Trade.created_at.desc())
        .limit(limit)
    )
    return list(session.scalars(stmt).all())
