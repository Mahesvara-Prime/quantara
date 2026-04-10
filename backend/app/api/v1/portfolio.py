"""Portfolio routes — balances and open positions (auth required)."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db_session, get_simulation_service
from app.modules.identity.models import User
from app.modules.simulation.schemas import PortfolioResponse, PositionResponse
from app.modules.simulation.service import SimulationService

router = APIRouter()


@router.get("", response_model=PortfolioResponse)
def get_portfolio(
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    service: Annotated[SimulationService, Depends(get_simulation_service)],
) -> PortfolioResponse:
    """Cash, total mark-to-market value, and aggregate unrealized P&L."""
    return service.get_portfolio_summary(db, current_user.id)


@router.get("/positions", response_model=list[PositionResponse])
def get_portfolio_positions(
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    service: Annotated[SimulationService, Depends(get_simulation_service)],
) -> list[PositionResponse]:
    """Open simulated positions with live reference prices."""
    return service.get_open_positions_view(db, current_user.id)
