"""User preferences (MVP: columns on users)."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db_session
from app.modules.identity.models import User
from app.modules.identity.schemas import UserSettingsPatch, UserSettingsResponse
from app.modules.identity.service import get_user_settings, patch_user_settings

router = APIRouter()


@router.get("", response_model=UserSettingsResponse)
def read_settings(
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> UserSettingsResponse:
    return get_user_settings(db, current_user.id)


@router.patch("", response_model=UserSettingsResponse)
def update_settings(
    body: UserSettingsPatch,
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> UserSettingsResponse:
    return patch_user_settings(db, current_user.id, body)
