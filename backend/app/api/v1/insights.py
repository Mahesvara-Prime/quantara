"""User insights (auth required)."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_insights_service
from app.db.session import get_db_session
from app.modules.identity.models import User
from app.modules.insights.schemas import InsightsResponse
from app.modules.insights.service import InsightsService

router = APIRouter()


@router.get("", response_model=InsightsResponse)
def get_user_insights(
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    service: Annotated[InsightsService, Depends(get_insights_service)],
) -> InsightsResponse:
    return service.generate_user_insights(db, current_user.id)
