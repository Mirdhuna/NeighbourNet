from __future__ import annotations
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DashboardStatsOut(BaseModel):
    total_needs: int
    total_offers: int
    total_responses: int
    total_completed: int
    average_rating: float | None = None
    trust_score: float | None = None


class ActivityOut(BaseModel):
    activity_id: int
    activity_type: str
    reference_id: int | None = None
    description: str | None = None
    created_date: datetime | None = None


class NearbyNeedOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    title: str
    owner: str | None = None
    distance: float | None = None
    location: str | None = None
    urgency: str | None = None


class NearbyOfferOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    title: str
    owner: str | None = None
    distance: float | None = None
    location: str | None = None
    type: str | None = Field(default=None)
