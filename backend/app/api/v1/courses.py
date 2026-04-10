"""Course catalog routes."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.education.schemas import CourseDetailResponse, CourseListItemResponse
from app.modules.education.service import get_course_detail, list_courses

router = APIRouter()


@router.get("", response_model=list[CourseListItemResponse])
def get_courses(
    db: Annotated[Session, Depends(get_db_session)],
) -> list[CourseListItemResponse]:
    return list_courses(db)


@router.get("/{course_id}", response_model=CourseDetailResponse)
def get_course(
    course_id: int,
    db: Annotated[Session, Depends(get_db_session)],
) -> CourseDetailResponse:
    return get_course_detail(db, course_id)
