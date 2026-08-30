from __future__ import annotations
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SettingsOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: int
    name: str
    username: str
    email: str
    phone: str | None = None
    push_alerts: bool = Field(serialization_alias="pushAlerts")
    sms_alerts: bool = Field(serialization_alias="smsAlerts")
    email_alerts: bool = Field(serialization_alias="emailAlerts")
    public_profile: bool = Field(serialization_alias="profilePublic")
    show_location: bool | None = Field(default=None, serialization_alias="showLocation")
    language: str
    dark_mode: bool = Field(serialization_alias="darkMode")
    visibility: str


class SettingsUpdate(BaseModel):
    name: str | None = None
    username: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    pushAlerts: bool | None = None
    smsAlerts: bool | None = None
    emailAlerts: bool | None = None
    profilePublic: bool | None = None
    showLocation: bool | None = None
    language: str | None = None
    darkMode: bool | None = None
    visibility: str | None = None
