"""
Insert or update demo courses and lessons (idempotent by course title + lesson order_index).

Content lives in scripts/education_corpus/markdown/*.md (>= 500 words per lesson).
Regenerate courses 2–8 Markdown from templates:

    python scripts/education_corpus/build_markdown_courses.py

Run seed from `backend`:

    python -m scripts.seed_education

Requires PostgreSQL and existing `courses` / `lessons` tables (Alembic upgrade).
"""

from __future__ import annotations

import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal

# Register all ORM relationships (same order idea as app.main / Alembic env).
from app.modules.identity import models as _identity_models  # noqa: F401
from app.modules.education import models as _education_models  # noqa: F401
from app.modules.progress import models as _progress_models  # noqa: F401
from app.modules.simulation import models as _simulation_models  # noqa: F401

from app.modules.education.models import Course, Lesson
from app.modules.progress.models import LessonProgress

from scripts.education_corpus import load_all_lessons_validated


def _ensure_course(
    session: Session,
    *,
    title: str,
    description: str,
    level: str,
) -> Course:
    existing = session.scalar(select(Course).where(Course.title == title))
    if existing:
        existing.description = description
        existing.level = level
        return existing
    c = Course(title=title, description=description, level=level)
    session.add(c)
    session.flush()
    return c


def _upsert_lesson(
    session: Session,
    *,
    course_id: int,
    title: str,
    content: str,
    order_index: int,
) -> None:
    """Insert or update lesson body (titres + Markdown) pour aligner seed et BDD existante."""
    existing = session.scalar(
        select(Lesson).where(Lesson.course_id == course_id, Lesson.order_index == order_index)
    )
    if existing:
        existing.title = title
        existing.content = content
        return
    session.add(
        Lesson(
            course_id=course_id,
            title=title,
            content=content,
            order_index=order_index,
        )
    )


def seed_education(session: Session) -> None:
    course_ids: list[int] = []
    for spec, lessons in load_all_lessons_validated():
        c = _ensure_course(
            session,
            title=spec.title,
            description=spec.description,
            level=spec.level,
        )
        course_ids.append(c.id)
        for order_index, (title, content) in enumerate(lessons):
            _upsert_lesson(
                session,
                course_id=c.id,
                title=title,
                content=content,
                order_index=order_index,
            )
        orphan_ids = session.scalars(
            select(Lesson.id).where(
                Lesson.course_id == c.id,
                Lesson.order_index >= len(lessons),
            )
        ).all()
        if orphan_ids:
            session.execute(delete(LessonProgress).where(LessonProgress.lesson_id.in_(orphan_ids)))
            session.execute(
                delete(Lesson).where(
                    Lesson.course_id == c.id,
                    Lesson.order_index >= len(lessons),
                )
            )

    session.commit()
    ids_str = ", ".join(str(i) for i in course_ids)
    print(f"Education seed OK ({len(course_ids)} courses; ids: {ids_str}).")


def main() -> None:
    db = SessionLocal()
    try:
        seed_education(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
