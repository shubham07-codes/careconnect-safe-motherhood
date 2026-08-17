from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class DoctorPrep(Base):
    __tablename__ = "doctor_prep"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    mother_id: Mapped[int] = mapped_column(
        ForeignKey("mothers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    pregnancy_id: Mapped[int | None] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    questions: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    documents: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    concerns: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    checklist: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(40),
        default="careconnect_rules",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )