"""Progress aggregates (auth required)."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db_session
from app.modules.identity.models import User
from app.modules.progress.schemas import CourseProgressResponse, GlobalProgressResponse
from app.modules.progress.service import (
    get_completed_lesson_ids_list,
    get_course_progress,
    get_global_progress,
)

router = APIRouter()


@router.get("/completed-lessons", response_model=list[int])
def read_completed_lesson_ids(
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> list[int]:
    """Lesson ids marked complete for the current user (sorted)."""
    return get_completed_lesson_ids_list(db, current_user.id)


@router.get("", response_model=GlobalProgressResponse)
def read_global_progress(
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> GlobalProgressResponse:
    return get_global_progress(db, current_user.id)


@router.get("/courses/{course_id}", response_model=CourseProgressResponse)
def read_course_progress(
    course_id: int,
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> CourseProgressResponse:
    return get_course_progress(db, current_user.id, course_id)
