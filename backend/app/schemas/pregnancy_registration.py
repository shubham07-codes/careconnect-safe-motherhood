from datetime import date
from pydantic import BaseModel, Field

class PregnancyRegistrationRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=20)
    date_of_birth: date | None = None
    blood_group: str | None = Field(default=None, max_length=10)
    address: str | None = None
    preferred_language: str = Field(default="marathi", max_length=20)
    reminder_consent: bool = False
    ward_id: int
    lmp: date
    pregnancy_number: int = Field(default=1, ge=1)
    parity: int = Field(default=0, ge=0)
    previous_complications: bool = False

class ANCVisitResponse(BaseModel):
    visit_number: int
    scheduled_date: date
    status: str

class PregnancyRegistrationResponse(BaseModel):
    message: str
    mother_id: int
    pregnancy_id: int
    mother_name: str
    lmp: date
    edd: date
    pregnancy_week: int
    current_risk_level: str
    anc_visits: list[ANCVisitResponse]
