from pydantic import BaseModel, Field


class DoctorPrepRequest(BaseModel):
    extra_concern: str | None = Field(
        default=None,
        max_length=1000,
    )