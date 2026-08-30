from pydantic import BaseModel, ConfigDict, Field


class NeedCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1)
    category: str
    urgency: str = "medium"
    duration: str | None = "Flexible"
    location: str = Field(min_length=1)
    radius: float | None = Field(default=5.0, gt=0)
    photo: str | None = None
    tags: list[str] | None = None


class NeedOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    title: str
    description: str | None = None
    category: str | None = None
    urgency: str | None = None
    duration: str | None = None
    location: str | None = None
    distance: float | None = None
    tags: list[str] = []
    requesterName: str | None = None
    requesterInitial: str | None = None
    verified: bool | None = None
    trust_score: float | None = None
    time: str | None = None
    photo: str | None = None
    status: str | None = None
    owner_user_id: int | None = None


class NeedCreated(BaseModel):
    id: int
    detail: str = "Need posted"


class CategoryOut(BaseModel):
    category_id: int
    category_name: str
    category_description: str | None = None
