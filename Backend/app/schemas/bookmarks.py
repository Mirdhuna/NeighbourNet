from __future__ import annotations
from typing import List, Dict, Optional, Any, Union
from pydantic import BaseModel, Field


class BookmarkToggle(BaseModel):
    item_id: int
    item_type: str = Field(pattern="^(need|offer)$")


class BookmarkToggleOut(BaseModel):
    item_id: int
    item_type: str
    bookmarked: bool


class BookmarkCheckOut(BaseModel):
    item_id: int
    item_type: str
    bookmarked: bool


class BookmarkOut(BaseModel):
    id: int
    bookmarkType: str
    title: str | None = None
    description: str | None = None
    location: str | None = None
    distance: float | None = None
    time: str | None = None
    urgency: str | None = None
    condition: str | None = None
    category: str | None = None
    tags: List[str] = []
    requesterInitial: str | None = None
    requesterName: str | None = None
    ownerInitial: str | None = None
    ownerName: str | None = None
    verified: bool | None = None
