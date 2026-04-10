"""Dashboard summary route."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_dashboard_service, get_db_session
from app.modules.dashboard.schemas import DashboardSummaryResponse
from app.modules.dashboard.service import DashboardService
from app.modules.identity.models import User

router = APIRouter()


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    service: Annotated[DashboardService, Depends(get_dashboard_service)],
) -> DashboardSummaryResponse:
    """Aggregated portfolio, learning progress, recent trades, and market preview."""
    return service.get_summary(db, current_user.id)
