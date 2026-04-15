"""Identity domain logic: login, token issuance, authenticated user resolution."""

from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.modules.identity import repository, rules
from app.modules.identity.models import User
from app.modules.identity import mailer
from app.modules.identity.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    PasswordChangeConfirm,
    PasswordChangeRequest,
    PasswordResetConfirm,
    ProfilePatch,
    ProfileResponse,
    RegisterRequest,
    StatusMessageResponse,
    UserProfile,
    UserSettingsPatch,
    UserSettingsResponse,
)


def register_user(session: Session, body: RegisterRequest) -> LoginResponse:
    """
    Create a new user if email is unused; return JWT + profile (same contract as login).

    Raises HTTPException 400 on validation errors, 409 if email already registered.
    """
    ok, err = rules.validate_register_input(
        body.first_name,
        body.last_name,
        body.email,
        body.password,
    )
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err)

    email = rules.normalize_email(body.email)
    if repository.get_user_by_email(session, email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    hashed = rules.hash_password(body.password)
    user = repository.create_user(
        session,
        first_name=body.first_name,
        last_name=body.last_name,
        email=email,
        hashed_password=hashed,
        language="fr",
    )
    session.commit()
    session.refresh(user)

    token = rules.create_access_token(
        subject_user_id=user.id,
        secret=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
        expires_minutes=settings.access_token_expire_minutes,
    )
    profile = UserProfile.model_validate(user)
    return LoginResponse(access_token=token, token_type="bearer", user=profile)


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


def request_password_change(
    session: Session,
    user_id: int,
    body: PasswordChangeRequest,
) -> StatusMessageResponse:
    """Create a one-time token and email a confirmation link (or log URL in dev)."""
    if body.new_password != body.new_password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les nouveaux mots de passe ne correspondent pas.",
        )

    user = repository.get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if not rules.verify_password(body.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe actuel incorrect.",
        )

    if rules.verify_password(body.new_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nouveau mot de passe doit être différent de l’actuel.",
        )

    raw = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    repository.delete_unused_password_change_tokens_for_user(session, user_id)
    repository.create_password_change_token(
        session,
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    base = settings.public_app_url.rstrip("/")
    confirm_url = f"{base}/confirm-password-change?token={quote(raw, safe='')}"

    try:
        mailer.send_password_change_confirmation_email(to_email=user.email, confirm_url=confirm_url)
    except RuntimeError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    session.commit()
    return StatusMessageResponse(message="Un e-mail de confirmation a été envoyé.")


def confirm_password_change(session: Session, body: PasswordChangeConfirm) -> StatusMessageResponse:
    """Apply new password if token is valid and unused."""
    if body.new_password != body.new_password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les mots de passe ne correspondent pas.",
        )

    token_hash = hashlib.sha256(body.token.strip().encode("utf-8")).hexdigest()
    row = repository.get_password_change_token_by_hash(session, token_hash)
    now = datetime.now(timezone.utc)

    invalid_msg = "Lien invalide ou expiré. Recommence depuis les paramètres."
    if row is None or row.used_at is not None or row.expires_at < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=invalid_msg)

    user = repository.get_user_by_id(session, row.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=invalid_msg)

    hashed = rules.hash_password(body.new_password)
    repository.update_user_hashed_password(session, user, hashed_password=hashed)
    repository.mark_password_change_token_used(session, row, used_at=now)
    session.commit()
    return StatusMessageResponse(message="Mot de passe mis à jour. Tu peux te connecter avec le nouveau mot de passe.")


_FORGOT_PASSWORD_GENERIC_MESSAGE = (
    "Si un compte actif existe pour cet e-mail, un lien de réinitialisation a été envoyé."
)


def request_password_reset(session: Session, body: ForgotPasswordRequest) -> StatusMessageResponse:
    """Create reset token and email link if user exists and is active; same message otherwise."""
    ok, err = rules.validate_email_format(body.email)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err)

    email = rules.normalize_email(body.email)
    user = repository.get_user_by_email(session, email)
    if user is None or not rules.can_authenticate_user(user.is_active):
        return StatusMessageResponse(message=_FORGOT_PASSWORD_GENERIC_MESSAGE)

    raw = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    repository.delete_unused_password_reset_tokens_for_user(session, user.id)
    repository.create_password_reset_token(
        session,
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    base = settings.public_app_url.rstrip("/")
    reset_url = f"{base}/reset-password?token={quote(raw, safe='')}"

    try:
        mailer.send_password_reset_email(to_email=user.email, reset_url=reset_url)
    except RuntimeError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    session.commit()
    return StatusMessageResponse(message=_FORGOT_PASSWORD_GENERIC_MESSAGE)


def confirm_password_reset(session: Session, body: PasswordResetConfirm) -> StatusMessageResponse:
    """Set new password from forgot-password email token."""
    if body.new_password != body.new_password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les mots de passe ne correspondent pas.",
        )

    token_hash = hashlib.sha256(body.token.strip().encode("utf-8")).hexdigest()
    row = repository.get_password_reset_token_by_hash(session, token_hash)
    now = datetime.now(timezone.utc)

    invalid_msg = "Lien invalide ou expiré. Demande un nouveau lien depuis « Mot de passe oublié »."
    if row is None or row.used_at is not None or row.expires_at < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=invalid_msg)

    user = repository.get_user_by_id(session, row.user_id)
    if user is None or not rules.can_authenticate_user(user.is_active):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=invalid_msg)

    hashed = rules.hash_password(body.new_password)
    repository.update_user_hashed_password(session, user, hashed_password=hashed)
    repository.mark_password_reset_token_used(session, row, used_at=now)
    repository.delete_unused_password_change_tokens_for_user(session, user.id)
    session.commit()
    return StatusMessageResponse(
        message="Mot de passe mis à jour. Tu peux te connecter avec le nouveau mot de passe.",
    )


def get_user_profile(session: Session, user_id: int) -> ProfileResponse:
    """GET /profile — includes account status."""
    user = repository.get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return ProfileResponse.model_validate(user)


def patch_user_profile(session: Session, user_id: int, body: ProfilePatch) -> ProfileResponse:
    """PATCH /profile — update display name and/or email (unique)."""
    if body.first_name is None and body.last_name is None and body.email is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least one of: first_name, last_name, email.",
        )

    user = repository.get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    new_fn: str | None = None
    if body.first_name is not None:
        fn = body.first_name.strip()
        if not fn:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="First name cannot be empty.")
        if len(fn) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="First name must be at most 100 characters.",
            )
        new_fn = fn

    new_ln: str | None = None
    if body.last_name is not None:
        ln = body.last_name.strip()
        if not ln:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Last name cannot be empty.")
        if len(ln) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Last name must be at most 100 characters.",
            )
        new_ln = ln

    new_email: str | None = None
    if body.email is not None:
        ok, err = rules.validate_email_format(body.email)
        if not ok:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err)
        normalized = rules.normalize_email(body.email)
        if normalized != rules.normalize_email(user.email):
            existing = repository.get_user_by_email(session, normalized)
            if existing is not None and existing.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists.",
                )
        new_email = normalized

    repository.update_user_profile(
        session,
        user,
        first_name=new_fn,
        last_name=new_ln,
        email=new_email,
    )
    session.commit()
    session.refresh(user)
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
