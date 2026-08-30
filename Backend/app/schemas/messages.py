from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):
    other_user_id: int


class ConversationOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    name: str
    initial: str | None = None
    online: bool = False
    unread: int = 0
    updatedAt: datetime | None = None


class ConversationCreated(BaseModel):
    id: int


class MessageCreate(BaseModel):
    text: str = Field(min_length=1)


class MessageOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    sender_id: int | None = None
    sender_name: str | None = None
    text: str
    from_: str = Field(serialization_alias="from", alias="from_")
    time: str | None = None
    is_read: bool | None = None
