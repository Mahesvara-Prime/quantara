"""Persistence for lesson_progress only — course aggregates are computed in the service."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.progress.models import LessonProgress


def get_lesson_progress(session: Session, user_id: int, lesson_id: int) -> LessonProgress | None:
    return session.scalar(
        select(LessonProgress).where(
            LessonProgress.user_id == user_id,
            LessonProgress.lesson_id == lesson_id,
        )
    )


def list_completed_lesson_ids(session: Session, user_id: int) -> set[int]:
    stmt = select(LessonProgress.lesson_id).where(
        LessonProgress.user_id == user_id,
        LessonProgress.completed.is_(True),
    )
    return set(session.scalars(stmt).all())


def mark_lesson_completed(session: Session, user_id: int, lesson_id: int) -> None:
    """Idempotent: ensures a completed row exists with completed_at set."""
    row = get_lesson_progress(session, user_id, lesson_id)
    now = datetime.now(timezone.utc)
    if row is None:
        session.add(
            LessonProgress(
                user_id=user_id,
                lesson_id=lesson_id,
                completed=True,
                completed_at=now,
            )
        )
    else:
        if not row.completed or row.completed_at is None:
            row.completed = True
            row.completed_at = now
    session.flush()
