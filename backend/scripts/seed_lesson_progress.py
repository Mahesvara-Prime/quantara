"""
Mark a few lessons as completed for the seed user (idempotent).

Prerequisites:
- `python -m scripts.seed_test_user`
- `python -m scripts.seed_education`

Run:

    python -m scripts.seed_lesson_progress
"""

from __future__ import annotations

import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal

from app.modules.education import models as _education_models  # noqa: F401
from app.modules.progress import models as _progress_models  # noqa: F401
from app.modules.simulation import models as _simulation_models  # noqa: F401

from app.modules.education.models import Course, Lesson
from app.modules.identity import repository as identity_repository
from app.modules.identity import rules as identity_rules
from app.modules.progress import repository as progress_repository

SEED_EMAIL = "apek062000@gmail.com"


def seed_progress(session: Session) -> None:
    email = identity_rules.normalize_email(SEED_EMAIL)
    user = identity_repository.get_user_by_email(session, email)
    if user is None:
        print(f"No user found for {email}; run seed_test_user first.")
        return

    course = session.scalar(
        select(Course).where(
            Course.title == "Introduction à la finance et aux cryptomonnaies"
        )
    )
    if course is None:
        print("Course not found; run seed_education first.")
        return

    lessons = session.scalars(
        select(Lesson)
        .where(Lesson.course_id == course.id)
        .order_by(Lesson.order_index.asc())
        .limit(2)
    ).all()
    if len(lessons) < 2:
        print("Not enough lessons in course 1; check seed_education.")
        return

    for les in lessons:
        progress_repository.mark_lesson_completed(session, user.id, les.id)
    session.commit()
    print(f"Marked {len(lessons)} lessons complete for user id={user.id}.")


def main() -> None:
    db = SessionLocal()
    try:
        seed_progress(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
