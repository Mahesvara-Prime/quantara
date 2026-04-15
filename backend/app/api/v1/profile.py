"""Authenticated user profile."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db_session
from app.modules.identity.models import User
from app.modules.identity.schemas import ProfilePatch, ProfileResponse
from app.modules.identity.service import get_user_profile, patch_user_profile

router = APIRouter()


@router.get("", response_model=ProfileResponse)
def read_profile(
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> ProfileResponse:
    return get_user_profile(db, current_user.id)


@router.patch("", response_model=ProfileResponse)
def update_profile(
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    body: ProfilePatch,
) -> ProfileResponse:
    return patch_user_profile(db, current_user.id, body)
