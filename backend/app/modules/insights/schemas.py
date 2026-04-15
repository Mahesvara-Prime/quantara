"""API payloads for lightweight behavioral insights."""

from typing import Literal

from pydantic import BaseModel, Field


class InsightItemResponse(BaseModel):
    """Single recommendation or observation."""

    type: str = Field(description="Stable machine key, e.g. portfolio_loss")
    title: str
    message: str
    severity: Literal["low", "medium", "high"]


class InsightsResponse(BaseModel):
    """GET /insights — bundle of items (see api-endpoints-guide)."""

    items: list[InsightItemResponse]
