from __future__ import annotations
from pydantic import BaseModel, Field


class RespondToNeed(BaseModel):
    offer_id: int | None = None
    message: str | None = None


class ResponseCreated(BaseModel):
    response_id: int | None = None
    detail: str = "Response sent"


class CompleteExchange(BaseModel):
    response_id: int


class StatusMessage(BaseModel):
    detail: str
