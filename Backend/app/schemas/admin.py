from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class AdminLoginRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


class AdminSummary(BaseModel):
    admin_id: int
    name: str
    email: str
    username: str


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminSummary


class AdminRegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(min_length=1)


class AdminStatsOut(BaseModel):
    total_users: int
    active_needs: int
    active_offers: int
    total_completed: int
    total_responses: int
    resolved_today: int
    pending_responses: int
    verified_users: int


class AdminActivityOut(BaseModel):
    user_name: str | None = None
    activity_type: str | None = None
    category: str | None = None
    status: str | None = None
    created_date: datetime | None = None
