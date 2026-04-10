"""Pydantic schemas for education API responses."""

from pydantic import BaseModel, Field


class CourseListItemResponse(BaseModel):
    """GET /courses — catalog row."""

    model_config = {"from_attributes": True}

    id: int
    title: str
    level: str


class CourseLessonSummary(BaseModel):
    """Lesson row embedded in course detail (no full body text)."""

    model_config = {"from_attributes": True}

    id: int
    title: str
    order_index: int


class CourseDetailResponse(BaseModel):
    """GET /courses/{id} — course metadata plus ordered lesson list."""

    model_config = {"from_attributes": True}

    id: int
    title: str
    description: str
    # Champ utile au front (filtres UI) ; superset du contrat minimal du guide API.
    level: str
    lessons: list[CourseLessonSummary] = Field(default_factory=list)


class LessonDetailResponse(BaseModel):
    """GET /lessons/{id} — lesson body (contract from api-endpoints-guide)."""

    model_config = {"from_attributes": True}

    id: int
    title: str
    content: str
