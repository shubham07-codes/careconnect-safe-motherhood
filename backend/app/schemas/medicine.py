from datetime import date

from pydantic import BaseModel, Field


class PrescriptionItemCreate(BaseModel):
    medicine_name: str = Field(min_length=1, max_length=150)
    dosage: str = Field(min_length=1, max_length=100)
    frequency: str = Field(min_length=1, max_length=100)

    timing_instructions: str | None = None

    start_date: date | None = None
    end_date: date | None = None


class PrescriptionCreateRequest(BaseModel):
    mother_id: int
    pregnancy_id: int | None = None

    notes: str | None = None

    medicines: list[PrescriptionItemCreate] = Field(
        min_length=1
    )


class MedicationTakenRequest(BaseModel):
    note: str | None = None