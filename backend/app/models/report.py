from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Report(Base):
    __tablename__ = "reports"

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

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    stored_path: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    mime_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    extracted_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    ai_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    ai_findings: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    ai_precautions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    urgency_level: Mapped[str] = mapped_column(
        String(30),
        default="unassessed",
        nullable=False,
    )

    doctor_review_required: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="uploaded",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )