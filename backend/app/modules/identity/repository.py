"""Database access for users — no business rules or credential checks."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.identity.models import User


def get_user_by_email(session: Session, email: str) -> User | None:
    """Return the user row for an email, compared case-insensitively."""
    normalized = email.strip().lower()
    stmt = select(User).where(func.lower(User.email) == normalized)
    return session.scalar(stmt)


def get_user_by_id(session: Session, user_id: int) -> User | None:
    """Return a user by primary key."""
    return session.get(User, user_id)


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
