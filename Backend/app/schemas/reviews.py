from __future__ import annotations
from datetime import datetime

from pydantic import BaseModel, Field


class RatingCreate(BaseModel):
    rating_value: int = Field(ge=1, le=5)


class ReviewCreate(BaseModel):
    review_text: str = Field(min_length=1)


class ReviewOut(BaseModel):
    reviewer_name: str | None = None
    rating: int | None = None
    review_text: str | None = None
    created_date: datetime | None = None


class StatusMessage(BaseModel):
    detail: str
