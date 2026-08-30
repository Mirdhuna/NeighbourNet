from pydantic import BaseModel, ConfigDict, Field


class OfferCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1)
    category: str
    condition: str = "N/A"
    availability: str | None = "Flexible"
    pickupOption: str = "Pickup only"
    location: str = Field(min_length=1)
    radius: float | None = Field(default=5.0, gt=0)
    photo: str | None = None
    tags: list[str] | None = None


class OfferOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    title: str
    description: str | None = None
    category: str | None = None
    condition: str | None = None
    availability: str | None = None
    pickupOption: str | None = None
    location: str | None = None
    distance: float | None = None
    tags: list[str] = []
    ownerName: str | None = None
    ownerInitial: str | None = None
    verified: bool | None = None
    trust_score: float | None = None
    time: str | None = None
    photo: str | None = None
    status: str | None = None
    type: str | None = None
    owner_user_id: int | None = None


class OfferCreated(BaseModel):
    id: int
    detail: str = "Offer posted"
