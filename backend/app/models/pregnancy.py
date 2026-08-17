from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Pregnancy(Base):
    __tablename__ = "pregnancies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    mother_id: Mapped[int] = mapped_column(
        ForeignKey("mothers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lmp: Mapped[date] = mapped_column(Date, nullable=False)
    edd: Mapped[date] = mapped_column(Date, nullable=False)
    pregnancy_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    parity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    previous_complications: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    current_risk_level: Mapped[str] = mapped_column(
        String(20), default="unassessed", nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
