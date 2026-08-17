from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    mother_id: Mapped[int] = mapped_column(
        ForeignKey("mothers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    pregnancy_id: Mapped[int | None] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    symptoms: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    triage_level: Mapped[str] = mapped_column(
        String(20),
        default="unassessed",
        nullable=False,
    )

    ai_explanation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    precautions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    doctor_review_required: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )