from pydantic import BaseModel

class ReferralStatusRequest(BaseModel):
    status: str
    facility_name: str | None = None
    notes: str | None = None
