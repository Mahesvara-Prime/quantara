"""Trade history — GET /trades (simulation log)."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_simulation_service
from app.db.session import get_db_session
from app.modules.identity.models import User
from app.modules.simulation.schemas import TradeHistoryItem
from app.modules.simulation.service import SimulationService

router = APIRouter()


@router.get("", response_model=list[TradeHistoryItem])
def list_trades(
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    service: Annotated[SimulationService, Depends(get_simulation_service)],
    limit: Annotated[int, Query(ge=1, le=500)] = 200,
) -> list[TradeHistoryItem]:
    """Chronological trade log (newest first)."""
    return service.get_trade_history(db, current_user.id, limit=limit)
