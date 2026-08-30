from __future__ import annotations
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ProfileOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: int
    name: str
    username: str
    email: str
    phone: str | None = None
    bio: str | None = None
    location: str | None = None
    verified: bool
    trust_score: float
    joined_at: str | None = Field(serialization_alias="joinedAt")
    initial: str | None = None


class ProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    location: str | None = None
    bio: str | None = None
    email: EmailStr | None = None
    preferred_radius: float | None = Field(default=None, gt=0)
