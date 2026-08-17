from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import (
    Date, DateTime, ForeignKey, Integer, Numeric, String, Text,
    UniqueConstraint, func
)
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class ANCVisit(Base):
    __tablename__ = "anc_visits"
    __table_args__ = (
        UniqueConstraint("pregnancy_id", "visit_number", name="uq_anc_pregnancy_visit"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    pregnancy_id: Mapped[int] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    visit_number: Mapped[int] = mapped_column(Integer, nullable=False)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    completed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="scheduled", nullable=False, index=True)
    systolic_bp: Mapped[int | None] = mapped_column(Integer, nullable=True)
    diastolic_bp: Mapped[int | None] = mapped_column(Integer, nullable=True)
    hemoglobin: Mapped[Decimal | None] = mapped_column(Numeric(4, 1), nullable=True)
    blood_sugar: Mapped[Decimal | None] = mapped_column(Numeric(6, 1), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
