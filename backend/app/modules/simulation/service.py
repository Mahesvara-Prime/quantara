"""Simulation engine: trades, portfolio, positions — orchestrates repository, rules, market_data."""

from __future__ import annotations

from decimal import ROUND_DOWN, Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.modules.market_data.service import MarketDataService
from app.modules.simulation import repository, rules
from app.modules.simulation.models import Portfolio, Trade
from app.modules.simulation.schemas import (
    CreateTradeRequest,
    PortfolioResponse,
    PositionResponse,
    TradeHistoryItem,
    TradeResponse,
)

class SimulationService:
    """Paper trading: execution price from market_data, state in PostgreSQL."""

    def __init__(self, market_data: MarketDataService) -> None:
        self._market = market_data

    @staticmethod
    def _initial_cash() -> Decimal:
        return Decimal(str(settings.simulation_initial_cash_usd))

    def _get_or_create_portfolio(self, session: Session, user_id: int, *, commit: bool = True) -> Portfolio:
        p = repository.get_portfolio_by_user_id(session, user_id)
        if p:
            return p
        p = repository.create_portfolio_for_user(session, user_id, self._initial_cash())
        if commit:
            session.commit()
            session.refresh(p)
        else:
            session.flush()
        return p

    def execute_trade(self, session: Session, user_id: int, body: CreateTradeRequest) -> TradeResponse:
        """Market buy (USD spend) or sell (base quantity); persists trade and updates cash/positions."""
        symbol = rules.normalize_symbol(body.symbol)
        side = rules.validate_trade_side(body.side)
        raw_amt = rules.to_decimal_amount(body.amount)

        portfolio = self._get_or_create_portfolio(session, user_id, commit=False)

        try:
            quote = self._market.get_asset_detail(symbol)
        except HTTPException:
            session.rollback()
            raise
        price = Decimal(str(quote.price))
        if price <= 0:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Invalid price from market data provider.",
            )

        try:
            sl: Decimal | None = None
            tp: Decimal | None = None
            if body.stop_loss is not None:
                sl = Decimal(str(body.stop_loss))
            if body.take_profit is not None:
                tp = Decimal(str(body.take_profit))

            if side == "buy":
                rules.validate_buy_brackets(price, sl, tp)
            elif sl is not None or tp is not None:
                raise ValueError("stop_loss and take_profit are only supported on buy orders in this MVP.")

            if side == "buy":
                spend_usd = raw_amt.quantize(rules.USD, rounding=ROUND_DOWN)
                rules.validate_cash_for_buy(portfolio.cash_balance, spend_usd)
                qty = rules.calculate_buy_quantity(spend_usd, price)
                if qty <= 0:
                    raise ValueError("Trade size too small at the current price.")

                new_cash = portfolio.cash_balance - spend_usd
                pos = repository.get_open_position_by_symbol(session, portfolio.id, symbol)
                if pos:
                    merged_qty = pos.quantity + qty
                    merged_avg = rules.weighted_average_entry(
                        pos.quantity, pos.average_entry_price, qty, price
                    )
                    repository.update_position_open(
                        session, pos, quantity=merged_qty, average_entry_price=merged_avg
                    )
                else:
                    repository.create_position(
                        session,
                        portfolio_id=portfolio.id,
                        symbol=symbol,
                        quantity=qty,
                        average_entry_price=price,
                    )

                repository.update_portfolio_cash(session, portfolio, new_cash)
                trade = repository.create_trade(
                    session,
                    portfolio_id=portfolio.id,
                    symbol=symbol,
                    side="buy",
                    amount=spend_usd,
                    quantity=qty,
                    price=price,
                    stop_loss=sl,
                    take_profit=tp,
                )
            else:
                sell_qty = raw_amt.quantize(rules.QTY, rounding=ROUND_DOWN)
                if sell_qty <= 0:
                    raise ValueError("Sell amount too small after rounding.")

                pos = repository.get_open_position_by_symbol(session, portfolio.id, symbol)
                if pos is None:
                    raise ValueError("No open position for this symbol.")
                rules.validate_position_for_sell(pos.quantity, sell_qty)

                proceeds = rules.calculate_sell_proceeds(sell_qty, price)
                new_cash = portfolio.cash_balance + proceeds
                new_qty = pos.quantity - sell_qty

                if new_qty == 0:
                    repository.close_position(session, pos)
                else:
                    repository.update_position_open(
                        session,
                        pos,
                        quantity=new_qty,
                        average_entry_price=pos.average_entry_price,
                    )

                repository.update_portfolio_cash(session, portfolio, new_cash)
                trade = repository.create_trade(
                    session,
                    portfolio_id=portfolio.id,
                    symbol=symbol,
                    side="sell",
                    amount=proceeds,
                    quantity=sell_qty,
                    price=price,
                )
        except ValueError as exc:
            session.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

        session.commit()
        session.refresh(trade)
        return self._trade_to_response(trade)

    def get_portfolio_summary(self, session: Session, user_id: int) -> PortfolioResponse:
        """Cash + mark-to-market equity; total_pnl is sum of unrealized P&L on open positions."""
        portfolio = self._get_or_create_portfolio(session, user_id, commit=True)

        positions = repository.list_open_positions(session, portfolio.id)
        cash = portfolio.cash_balance
        positions_market_value = Decimal(0)
        total_pnl = Decimal(0)

        symbols = [rules.normalize_symbol(p.symbol) for p in positions]
        batch_prices = self._market.get_spot_prices_usd(symbols) if positions else {}

        for pos in positions:
            sym = rules.normalize_symbol(pos.symbol)
            try:
                if sym in batch_prices:
                    cur = Decimal(str(batch_prices[sym]))
                else:
                    q = self._market.get_asset_detail(sym)
                    cur = Decimal(str(q.price))
            except HTTPException as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Could not price position {pos.symbol}: {exc.detail}",
                ) from exc
            positions_market_value += pos.quantity * cur
            total_pnl += rules.unrealized_pnl(pos.quantity, pos.average_entry_price, cur)

        total_value = (cash + positions_market_value).quantize(rules.USD, rounding=ROUND_DOWN)

        return PortfolioResponse(
            cash_balance=float(cash),
            total_value=float(total_value),
            total_pnl=float(total_pnl),
        )

    def get_open_positions_view(self, session: Session, user_id: int) -> list[PositionResponse]:
        """Open positions with live price and unrealized P&L."""
        portfolio = self._get_or_create_portfolio(session, user_id, commit=True)
        rows: list[PositionResponse] = []

        open_rows = repository.list_open_positions(session, portfolio.id)
        symbols = [rules.normalize_symbol(p.symbol) for p in open_rows]
        batch_prices = self._market.get_spot_prices_usd(symbols) if open_rows else {}

        for pos in open_rows:
            sym = rules.normalize_symbol(pos.symbol)
            try:
                if sym in batch_prices:
                    cur = Decimal(str(batch_prices[sym]))
                else:
                    q = self._market.get_asset_detail(sym)
                    cur = Decimal(str(q.price))
            except HTTPException as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Could not price position {pos.symbol}: {exc.detail}",
                ) from exc
            pnl = rules.unrealized_pnl(pos.quantity, pos.average_entry_price, cur)
            sl_b, tp_b = repository.get_latest_buy_brackets(session, portfolio.id, pos.symbol)
            rows.append(
                PositionResponse(
                    symbol=pos.symbol,
                    quantity=float(pos.quantity),
                    average_entry_price=float(pos.average_entry_price),
                    current_price=float(cur),
                    pnl=float(pnl),
                    stop_loss=float(sl_b) if sl_b is not None else None,
                    take_profit=float(tp_b) if tp_b is not None else None,
                )
            )
        return rows

    def get_trade_history(self, session: Session, user_id: int, *, limit: int = 200) -> list[TradeHistoryItem]:
        """Recent trades newest first."""
        portfolio = self._get_or_create_portfolio(session, user_id, commit=True)
        trades = repository.list_trades_by_portfolio(session, portfolio.id, limit=limit)
        return [
            TradeHistoryItem(
                symbol=t.symbol,
                side=t.side,
                amount=float(t.amount),
                price=float(t.price),
                created_at=t.created_at,
            )
            for t in trades
        ]

    @staticmethod
    def _trade_to_response(trade: Trade) -> TradeResponse:
        return TradeResponse(
            id=trade.id,
            symbol=trade.symbol,
            side=trade.side,
            amount=float(trade.amount),
            quantity=float(trade.quantity),
            price=float(trade.price),
            stop_loss=float(trade.stop_loss) if trade.stop_loss is not None else None,
            take_profit=float(trade.take_profit) if trade.take_profit is not None else None,
            created_at=trade.created_at,
        )
