from pydantic import BaseModel, Field


class SymptomTriageRequest(BaseModel):
    symptoms: list[str] = Field(
        min_length=1,
        description="Symptoms reported by the mother.",
    )

    notes: str | None = None