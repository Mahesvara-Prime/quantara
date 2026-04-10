"""Orchestration for course catalog and lesson content."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.education import repository
from app.modules.education.schemas import (
    CourseDetailResponse,
    CourseLessonSummary,
    CourseListItemResponse,
    LessonDetailResponse,
)


def list_courses(session: Session) -> list[CourseListItemResponse]:
    rows = repository.list_courses(session)
    return [CourseListItemResponse.model_validate(c) for c in rows]


def get_course_detail(session: Session, course_id: int) -> CourseDetailResponse:
    course = repository.get_course_by_id(session, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
    lessons = repository.list_lessons_by_course(session, course_id)
    return CourseDetailResponse(
        id=course.id,
        title=course.title,
        description=course.description,
        level=course.level,
        lessons=[CourseLessonSummary.model_validate(les) for les in lessons],
    )


def get_lesson(session: Session, lesson_id: int) -> LessonDetailResponse:
    lesson = repository.get_lesson_by_id(session, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")
    return LessonDetailResponse.model_validate(lesson)
