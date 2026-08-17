from pydantic import BaseModel, Field


class AIChatRequest(BaseModel):
    question: str = Field(
        min_length=2,
        max_length=2000,
        description="Question asked by the mother.",
    )