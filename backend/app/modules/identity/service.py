"""Identity domain logic: login, token issuance, authenticated user resolution."""

from __future__ import annotations

import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.modules.identity import repository, rules
from app.modules.identity.models import User
from app.modules.identity.schemas import (
    LoginRequest,
    LoginResponse,
    ProfileResponse,
    UserProfile,
    UserSettingsPatch,
    UserSettingsResponse,
)


def login_user(session: Session, body: LoginRequest) -> LoginResponse:
    """
    Validate credentials and return a JWT plus public user fields.

    Raises HTTPException for invalid input, unknown user, bad password, or inactive user.
    """
    ok, err = rules.validate_login_input(body.email, body.password)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err)

    email = rules.normalize_email(body.email)
    user = repository.get_user_by_email(session, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    if not rules.verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    if not rules.can_authenticate_user(user.is_active):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled.",
        )

    token = rules.create_access_token(
        subject_user_id=user.id,
        secret=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
        expires_minutes=settings.access_token_expire_minutes,
    )

    profile = UserProfile.model_validate(user)
    return LoginResponse(access_token=token, token_type="bearer", user=profile)


def get_current_user_profile(session: Session, user_id: int) -> UserProfile:
    """Load user by id and return the public profile shape."""
    user = repository.get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return UserProfile.model_validate(user)


def get_user_from_access_token(session: Session, token: str) -> User:
    """
    Decode JWT, load the user row, and return the ORM entity.

    Used by API dependencies; raises HTTPException on invalid/expired token or missing user.
    """
    try:
        payload = rules.decode_access_token(
            token,
            secret=settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        uid = rules.user_id_from_token_payload(payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
        ) from None
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
        ) from None

    user = repository.get_user_by_id(session, uid)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )
    return user


def require_active_user(user: User) -> User:
    """Raise if the authenticated user is inactive."""
    if not rules.can_authenticate_user(user.is_active):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled.",
        )
    return user


def get_user_profile(session: Session, user_id: int) -> ProfileResponse:
    """GET /profile — includes account status."""
    user = repository.get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return ProfileResponse.model_validate(user)


def get_user_settings(session: Session, user_id: int) -> UserSettingsResponse:
    """GET /settings — preferences stored on the user row."""
    user = repository.get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return UserSettingsResponse(
        language=user.language,
        notifications_enabled=user.notifications_enabled,
    )


def patch_user_settings(session: Session, user_id: int, body: UserSettingsPatch) -> UserSettingsResponse:
    """PATCH /settings — at least one field must be provided."""
    if body.language is None and body.notifications_enabled is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least one of: language, notifications_enabled.",
        )
    user = repository.get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    lang: str | None = None
    if body.language is not None:
        try:
            lang = rules.normalize_language(body.language)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    repository.update_user_preferences(
        session,
        user,
        language=lang,
        notifications_enabled=body.notifications_enabled,
    )
    session.commit()
    session.refresh(user)
    return UserSettingsResponse(
        language=user.language,
        notifications_enabled=user.notifications_enabled,
    )
