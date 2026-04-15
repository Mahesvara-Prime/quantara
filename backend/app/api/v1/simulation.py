"""Simulation routes — execute paper trades (auth required)."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db_session, get_simulation_service
from app.modules.identity.models import User
from app.modules.simulation.schemas import CreateTradeRequest, TradeResponse
from app.modules.simulation.service import SimulationService

router = APIRouter()


@router.post("/trades", response_model=TradeResponse)
def post_simulation_trade(
    body: CreateTradeRequest,
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    service: Annotated[SimulationService, Depends(get_simulation_service)],
) -> TradeResponse:
    """Execute a simulated market order; pricing comes from market_data."""
    return service.execute_trade(db, current_user.id, body)
