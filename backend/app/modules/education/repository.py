"""Read-only access to courses and lessons."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.education.models import Course, Lesson


def list_courses(session: Session) -> list[Course]:
    stmt = select(Course).order_by(Course.id.asc())
    return list(session.scalars(stmt).all())


def get_course_by_id(session: Session, course_id: int) -> Course | None:
    return session.get(Course, course_id)


def list_lessons_by_course(session: Session, course_id: int) -> list[Lesson]:
    stmt = (
        select(Lesson)
        .where(Lesson.course_id == course_id)
        .order_by(Lesson.order_index.asc(), Lesson.id.asc())
    )
    return list(session.scalars(stmt).all())


def get_lesson_by_id(session: Session, lesson_id: int) -> Lesson | None:
    return session.get(Lesson, lesson_id)
