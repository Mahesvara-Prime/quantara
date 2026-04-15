"""Database access for users — no business rules or credential checks."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.modules.identity.models import PasswordChangeToken, PasswordResetToken, User


def get_user_by_email(session: Session, email: str) -> User | None:
    """Return the user row for an email, compared case-insensitively."""
    normalized = email.strip().lower()
    stmt = select(User).where(func.lower(User.email) == normalized)
    return session.scalar(stmt)


def get_user_by_id(session: Session, user_id: int) -> User | None:
    """Return a user by primary key."""
    return session.get(User, user_id)


def create_user(
    session: Session,
    *,
    first_name: str,
    last_name: str,
    email: str,
    hashed_password: str,
    language: str = "fr",
) -> User:
    """Insert a new user row (caller commits)."""
    user = User(
        first_name=first_name.strip(),
        last_name=last_name.strip(),
        email=email,
        hashed_password=hashed_password,
        language=language,
        notifications_enabled=True,
        is_active=True,
    )
    session.add(user)
    session.flush()
    return user


def update_user_preferences(
    session: Session,
    user: User,
    *,
    language: str | None = None,
    notifications_enabled: bool | None = None,
) -> None:
    """Apply partial preference updates on the user row."""
    if language is not None:
        user.language = language
    if notifications_enabled is not None:
        user.notifications_enabled = notifications_enabled


def update_user_profile(
    session: Session,
    user: User,
    *,
    first_name: str | None = None,
    last_name: str | None = None,
    email: str | None = None,
) -> None:
    """Apply partial profile field updates (caller validates and commits)."""
    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
    if email is not None:
        user.email = email


def update_user_hashed_password(session: Session, user: User, *, hashed_password: str) -> None:
    user.hashed_password = hashed_password


def delete_unused_password_change_tokens_for_user(session: Session, user_id: int) -> None:
    stmt = delete(PasswordChangeToken).where(
        PasswordChangeToken.user_id == user_id,
        PasswordChangeToken.used_at.is_(None),
    )
    session.execute(stmt)


def create_password_change_token(
    session: Session,
    *,
    user_id: int,
    token_hash: str,
    expires_at: datetime,
) -> PasswordChangeToken:
    row = PasswordChangeToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    session.add(row)
    session.flush()
    return row


def get_password_change_token_by_hash(session: Session, token_hash: str) -> PasswordChangeToken | None:
    stmt = select(PasswordChangeToken).where(PasswordChangeToken.token_hash == token_hash)
    return session.scalar(stmt)


def mark_password_change_token_used(session: Session, row: PasswordChangeToken, *, used_at: datetime) -> None:
    row.used_at = used_at


def delete_unused_password_reset_tokens_for_user(session: Session, user_id: int) -> None:
    stmt = delete(PasswordResetToken).where(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.used_at.is_(None),
    )
    session.execute(stmt)


def create_password_reset_token(
    session: Session,
    *,
    user_id: int,
    token_hash: str,
    expires_at: datetime,
) -> PasswordResetToken:
    row = PasswordResetToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    session.add(row)
    session.flush()
    return row


def get_password_reset_token_by_hash(session: Session, token_hash: str) -> PasswordResetToken | None:
    stmt = select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    return session.scalar(stmt)


def mark_password_reset_token_used(session: Session, row: PasswordResetToken, *, used_at: datetime) -> None:
    row.used_at = used_at
