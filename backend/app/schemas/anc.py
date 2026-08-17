from datetime import date
from pydantic import BaseModel, Field

class ANCCompleteRequest(BaseModel):
    completed_date: date | None = None
    systolic_bp: int | None = Field(default=None, ge=50, le=260)
    diastolic_bp: int | None = Field(default=None, ge=30, le=160)
    hemoglobin: float | None = Field(default=None, ge=2, le=25)
    blood_sugar: float | None = Field(default=None, ge=20, le=600)
    notes: str | None = None
