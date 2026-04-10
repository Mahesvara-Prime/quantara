"""API schemas for progress (global, per-course, lesson completion)."""

from typing import Literal

from pydantic import BaseModel, Field


class LessonCompleteResponse(BaseModel):
    """POST /lessons/{id}/complete."""

    status: Literal["completed"] = "completed"


class CourseProgressResponse(BaseModel):
    """GET /progress/courses/{course_id} — computed from lesson completions."""

    course_id: int
    progress_percent: float = Field(ge=0.0, le=100.0)
    completed: bool


class GlobalProgressResponse(BaseModel):
    """GET /progress — aggregates over the catalog (no course_progress table)."""

    total_lessons_completed: int
    total_courses_completed: int
    overall_progress: float = Field(ge=0.0, le=100.0)
