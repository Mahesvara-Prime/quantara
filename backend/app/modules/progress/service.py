"""Progress orchestration: lesson_progress rows + dynamic stats from the education catalog."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.education import repository as education_repository
from app.modules.progress import repository as progress_repository
from app.modules.progress import rules
from app.modules.progress.schemas import (
    CourseProgressResponse,
    GlobalProgressResponse,
    LessonCompleteResponse,
)


def mark_lesson_completed(
    session: Session,
    user_id: int,
    lesson_id: int,
) -> LessonCompleteResponse:
    """Record completion; lesson must exist in the catalog."""
    lesson = education_repository.get_lesson_by_id(session, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")
    progress_repository.mark_lesson_completed(session, user_id, lesson_id)
    session.commit()
    return LessonCompleteResponse()


def get_course_progress(
    session: Session,
    user_id: int,
    course_id: int,
) -> CourseProgressResponse:
    """Percent of lessons in the course marked complete for this user."""
    course = education_repository.get_course_by_id(session, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    lessons = education_repository.list_lessons_by_course(session, course_id)
    total = len(lessons)
    if total == 0:
        return CourseProgressResponse(course_id=course_id, progress_percent=0.0, completed=False)

    lesson_ids = {les.id for les in lessons}
    done_ids = progress_repository.list_completed_lesson_ids(session, user_id)
    completed_count = len(lesson_ids & done_ids)
    pct = rules.progress_percentage(completed_count, total)
    return CourseProgressResponse(
        course_id=course_id,
        progress_percent=pct,
        completed=rules.course_is_completed(pct),
    )


def get_completed_lesson_ids_list(session: Session, user_id: int) -> list[int]:
    """Sorted lesson ids marked complete for this user (for Learn UI)."""
    ids = progress_repository.list_completed_lesson_ids(session, user_id)
    return sorted(ids)


def get_global_progress(session: Session, user_id: int) -> GlobalProgressResponse:
    """Totals across all catalog courses; course completion derived dynamically."""
    courses = education_repository.list_courses(session)
    done_ids = progress_repository.list_completed_lesson_ids(session, user_id)

    total_lessons_in_catalog = 0
    total_completed = 0
    courses_completed = 0

    for course in courses:
        lessons = education_repository.list_lessons_by_course(session, course.id)
        n = len(lessons)
        total_lessons_in_catalog += n
        if n == 0:
            continue
        lids = {les.id for les in lessons}
        done_here = len(lids & done_ids)
        total_completed += done_here
        if done_here == n:
            courses_completed += 1

    overall = rules.progress_percentage(total_completed, total_lessons_in_catalog)

    return GlobalProgressResponse(
        total_lessons_completed=total_completed,
        total_courses_completed=courses_completed,
        overall_progress=overall,
    )
