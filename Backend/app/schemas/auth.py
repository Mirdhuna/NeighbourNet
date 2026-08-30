from __future__ import annotations
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(min_length=1)
    phone: str | None = None
    address: str | None = None
    preferred_radius: float | None = Field(default=5.0, gt=0)


class LoginRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: str
    email: str
    username: str
    is_verified: bool
    trust_score: float


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary


class MessageResponse(BaseModel):
    detail: str
