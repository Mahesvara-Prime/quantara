"""Compose insights from simulation + progress (no direct provider calls)."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.modules.insights import rules
from app.modules.insights.rules import InsightSignals
from app.modules.insights.schemas import InsightsResponse
from app.modules.market_data.service import MarketDataService
from app.modules.progress import repository as progress_repository
from app.modules.simulation import repository as simulation_repository
from app.modules.simulation.service import SimulationService


class InsightsService:
    """Uses simulation for trading/positions and progress for learning signals."""

    def __init__(self, market_data: MarketDataService) -> None:
        self._simulation = SimulationService(market_data=market_data)

    def generate_user_insights(self, session: Session, user_id: int) -> InsightsResponse:
        completed_ids = progress_repository.list_completed_lesson_ids(session, user_id)
        completed_n = len(completed_ids)

        portfolio = simulation_repository.get_portfolio_by_user_id(session, user_id)
        if portfolio is None:
            sig = InsightSignals(
                total_pnl_usd=0.0,
                trade_count=0,
                open_position_count=0,
                completed_lesson_count=completed_n,
                trades_without_stop_loss=0,
                recent_sell_streak=0,
            )
            return InsightsResponse(items=rules.build_insights(sig))

        summary = self._simulation.get_portfolio_summary(session, user_id)
        trades = simulation_repository.list_trades_by_portfolio(session, portfolio.id, limit=100)
        positions = simulation_repository.list_open_positions(session, portfolio.id)

        trade_count = len(trades)
        missing_stop = sum(1 for t in trades if t.stop_loss is None)

        # Newest-first trades: count consecutive sells from the start of the list
        streak = 0
        for t in trades[:5]:
            if t.side == "sell":
                streak += 1
            else:
                break

        sig = InsightSignals(
            total_pnl_usd=float(summary.total_pnl),
            trade_count=trade_count,
            open_position_count=len(positions),
            completed_lesson_count=completed_n,
            trades_without_stop_loss=missing_stop,
            recent_sell_streak=streak,
        )
        return InsightsResponse(items=rules.build_insights(sig))
