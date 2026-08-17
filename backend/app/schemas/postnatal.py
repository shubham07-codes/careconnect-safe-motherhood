from datetime import date
from pydantic import BaseModel, Field

class DeliveryCreateRequest(BaseModel):
    pregnancy_id: int
    delivery_date: date
    delivery_type: str | None = None
    facility_name: str | None = None
    institutional: bool = True
    outcome: str = "live_birth"
    maternal_complications: str | None = None
    newborn_name: str | None = None
    newborn_sex: str | None = None
    birth_weight_kg: float | None = Field(default=None, ge=0.3, le=8.0)

class ImmunizationCreateRequest(BaseModel):
    vaccine_name: str
    due_date: date

class PostnatalCompleteRequest(BaseModel):
    completed_date: date | None = None
    notes: str | None = None
