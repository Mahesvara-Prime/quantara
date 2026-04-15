"""Dashboard aggregation — composes simulation, progress, and market_data (no providers here)."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.modules.dashboard.schemas import (
    DashboardMarketItem,
    DashboardPortfolioBlock,
    DashboardProgressBlock,
    DashboardRecentTradeItem,
    DashboardSummaryResponse,
)
from app.modules.market_data.service import MarketDataService
from app.modules.progress.service import get_global_progress
from app.modules.simulation import repository as simulation_repository
from app.modules.simulation.service import SimulationService


class DashboardService:
    """Builds a compact overview for the authenticated user."""

    def __init__(self, market_data: MarketDataService) -> None:
        self._market_data = market_data
        self._simulation = SimulationService(market_data=market_data)

    def get_summary(self, session: Session, user_id: int) -> DashboardSummaryResponse:
        """Portfolio + progress + last trades + a few market rows."""
        portfolio_block: DashboardPortfolioBlock
        if simulation_repository.get_portfolio_by_user_id(session, user_id) is None:
            portfolio_block = DashboardPortfolioBlock(
                cash_balance=0.0,
                total_value=0.0,
                total_pnl=0.0,
            )
        else:
            ps = self._simulation.get_portfolio_summary(session, user_id)
            portfolio_block = DashboardPortfolioBlock(
                cash_balance=ps.cash_balance,
                total_value=ps.total_value,
                total_pnl=ps.total_pnl,
            )

        gp = get_global_progress(session, user_id)
        progress_block = DashboardProgressBlock(
            total_lessons_completed=gp.total_lessons_completed,
            total_courses_completed=gp.total_courses_completed,
            overall_progress=gp.overall_progress,
        )

        recent: list[DashboardRecentTradeItem] = []
        pf = simulation_repository.get_portfolio_by_user_id(session, user_id)
        if pf is not None:
            trades = simulation_repository.list_trades_by_portfolio(session, pf.id, limit=5)
            for t in trades:
                recent.append(
                    DashboardRecentTradeItem(
                        symbol=t.symbol,
                        side=t.side,
                        created_at=t.created_at,
                    )
                )

        assets = self._market_data.list_assets(limit=5, page=1)
        market_preview = [
            DashboardMarketItem(
                symbol=a.symbol,
                name=a.name,
                price=a.price,
                change_percent=a.change_percent,
            )
            for a in assets[:5]
        ]

        return DashboardSummaryResponse(
            portfolio=portfolio_block,
            progress=progress_block,
            recent_activity=recent,
            market_preview=market_preview,
        )
