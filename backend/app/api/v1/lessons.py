"""Lesson content routes and completion (progress)."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db_session
from app.modules.education.schemas import LessonDetailResponse
from app.modules.education.service import get_lesson
from app.modules.identity.models import User
from app.modules.progress.schemas import LessonCompleteResponse
from app.modules.progress.service import mark_lesson_completed, unmark_lesson_completed

router = APIRouter()


@router.post("/{lesson_id}/complete", response_model=LessonCompleteResponse)
def post_lesson_complete(
    lesson_id: int,
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> LessonCompleteResponse:
    return mark_lesson_completed(db, current_user.id, lesson_id)


@router.delete("/{lesson_id}/complete", response_model=LessonCompleteResponse)
def delete_lesson_complete(
    lesson_id: int,
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> LessonCompleteResponse:
    """Remove completion for this lesson (same user only)."""
    return unmark_lesson_completed(db, current_user.id, lesson_id)


@router.get("/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson_detail(
    lesson_id: int,
    db: Annotated[Session, Depends(get_db_session)],
) -> LessonDetailResponse:
    return get_lesson(db, lesson_id)
