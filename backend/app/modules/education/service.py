"""Orchestration for course catalog and lesson content."""

from __future__ import annotations

import re

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.education import repository
from app.modules.education.schemas import (
    CourseDetailResponse,
    CourseLessonSummary,
    CourseListItemResponse,
    LessonDetailResponse,
)

_EXTENSION_TITLE_RE = re.compile(r"^##\s+Extension\s+[—-]\s+volet\s+(\d+)\s*$", re.MULTILINE)
_APPROF_TITLE_RE = re.compile(r"^##\s+Approfondissement\s+pedagogique\s+(\d+)\s*$", re.MULTILINE)
_HR_LINE_RE = re.compile(r"^\s*---\s*$", re.MULTILINE)
_IMPORTED_TITLE_RE = re.compile(
    r"^(?:Leçon\s+\d+\s+—\s+)?(\[[^\]]+\]\s+.+\s+—\s+partie\s+(\d{3}))$"
)
_AUTO_IMPORTED_DESC_PREFIX = "Texte extrait automatiquement depuis"


def _normalize_lesson_content(content: str) -> str:
    """Normalize legacy headings and remove horizontal separators in lesson body."""
    normalized = _EXTENSION_TITLE_RE.sub(r"## Approfondissement pédagogique \1", content)
    normalized = _APPROF_TITLE_RE.sub(r"## Approfondissement pédagogique \1", normalized)
    lines = [line for line in normalized.splitlines() if not _HR_LINE_RE.match(line)]
    return "\n".join(lines).strip()


def _normalize_lesson_title(title: str) -> str:
    """Unify imported lesson titles to: 'Leçon N — [Domaine] ... — partie 00N'."""
    match = _IMPORTED_TITLE_RE.match(title.strip())
    if not match:
        return title
    raw_tail = match.group(1)
    part_str = match.group(2)
    lesson_n = int(part_str)
    return f"Leçon {lesson_n} — {raw_tail}"


def _pedagogical_imported_description(course_title: str) -> str:
    """Provide learner-centered description for imported PDF courses."""
    domain = course_title.split("—", 1)[0].strip().lower()
    if domain == "trading":
        return (
            "Parcours pratique pour apprendre à lire le marché, construire un plan de trading, "
            "gérer le risque et améliorer la discipline d’exécution."
        )
    if domain == "cryptomonnaies":
        return (
            "Cours pour comprendre l’écosystème crypto : fonctionnement des actifs, usages concrets, "
            "risques majeurs et bonnes pratiques de décision."
        )
    if domain == "blockchain":
        return (
            "Introduction structurée à la blockchain : principes techniques, cas d’usage, limites "
            "et impacts pour les marchés et les entreprises."
        )
    if domain == "investissement":
        return (
            "Parcours pour acquérir des bases solides en investissement : analyse, allocation, "
            "gestion du risque et construction d’une stratégie durable."
        )
    return (
        "Cours pédagogique pour développer des bases solides, comprendre les concepts clés, "
        "et les appliquer pas à pas dans un cadre pratique."
    )


def _normalize_course_description(course_title: str, description: str) -> str:
    """Replace raw extraction disclaimer with a learner-centered course promise."""
    if not description.startswith(_AUTO_IMPORTED_DESC_PREFIX):
        return description
    return _pedagogical_imported_description(course_title)


def list_courses(session: Session) -> list[CourseListItemResponse]:
    rows = repository.list_courses(session)
    return [CourseListItemResponse.model_validate(c) for c in rows]


def get_course_detail(session: Session, course_id: int) -> CourseDetailResponse:
    course = repository.get_course_by_id(session, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
    lessons = repository.list_lessons_by_course(session, course_id)
    lesson_items = [CourseLessonSummary.model_validate(les) for les in lessons]
    lesson_items = [
        item.model_copy(update={"title": _normalize_lesson_title(item.title)}) for item in lesson_items
    ]
    return CourseDetailResponse(
        id=course.id,
        title=course.title,
        description=_normalize_course_description(course.title, course.description),
        level=course.level,
        lessons=lesson_items,
    )


def get_lesson(session: Session, lesson_id: int) -> LessonDetailResponse:
    lesson = repository.get_lesson_by_id(session, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")
    payload = LessonDetailResponse.model_validate(lesson)
    return payload.model_copy(
        update={
            "title": _normalize_lesson_title(payload.title),
            "content": _normalize_lesson_content(payload.content),
        }
    )
