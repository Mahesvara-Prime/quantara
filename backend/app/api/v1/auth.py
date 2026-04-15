"""Auth routes: thin HTTP adapters delegating to the identity service."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db_session
from app.modules.identity.models import User
from app.modules.identity.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    PasswordChangeConfirm,
    PasswordChangeRequest,
    PasswordResetConfirm,
    RegisterRequest,
    StatusMessageResponse,
    UserProfile,
)
from app.modules.identity.service import (
    confirm_password_change,
    confirm_password_reset,
    login_user,
    register_user,
    request_password_change,
    request_password_reset,
)

router = APIRouter()


@router.post("/register", response_model=LoginResponse)
def post_register(
    body: RegisterRequest,
    db: Annotated[Session, Depends(get_db_session)],
) -> LoginResponse:
    """Create account and return JWT + public user (auto sign-in)."""
    return register_user(db, body)


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


@router.post("/password-change/request", response_model=StatusMessageResponse)
def post_password_change_request(
    body: PasswordChangeRequest,
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> StatusMessageResponse:
    """Start password change: validates current password and emails a confirmation link."""
    return request_password_change(db, current_user.id, body)


@router.post("/password-change/confirm", response_model=StatusMessageResponse)
def post_password_change_confirm(
    body: PasswordChangeConfirm,
    db: Annotated[Session, Depends(get_db_session)],
) -> StatusMessageResponse:
    """Complete password change using the token from the confirmation email."""
    return confirm_password_change(db, body)


@router.post("/password-reset/request", response_model=StatusMessageResponse)
def post_password_reset_request(
    body: ForgotPasswordRequest,
    db: Annotated[Session, Depends(get_db_session)],
) -> StatusMessageResponse:
    """Request a password reset email (same response whether or not the email is registered)."""
    return request_password_reset(db, body)


@router.post("/password-reset/confirm", response_model=StatusMessageResponse)
def post_password_reset_confirm(
    body: PasswordResetConfirm,
    db: Annotated[Session, Depends(get_db_session)],
) -> StatusMessageResponse:
    """Complete password reset using the token from the forgot-password email."""
    return confirm_password_reset(db, body)
