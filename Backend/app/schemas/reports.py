from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    reason: str = Field(min_length=1)


class ReportCreated(BaseModel):
    detail: str = "Report submitted"
