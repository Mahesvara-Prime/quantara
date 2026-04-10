"""Auth routes: thin HTTP adapters delegating to the identity service."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db_session
from app.modules.identity.models import User
from app.modules.identity.schemas import LoginRequest, LoginResponse, UserProfile
from app.modules.identity.service import login_user

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def post_login(
    body: LoginRequest,
    db: Annotated[Session, Depends(get_db_session)],
) -> LoginResponse:
    """Issue a JWT for valid email/password; embed public user fields in the response."""
    return login_user(db, body)


@router.get("/me", response_model=UserProfile)
def get_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    """Return the authenticated user's public profile (requires Bearer token)."""
    return current_user
