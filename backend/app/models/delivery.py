from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Delivery(Base):
    __tablename__ = "deliveries"

    id: Mapped[int] = mapped_column(primary_key=True)
    pregnancy_id: Mapped[int] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="CASCADE"),
        unique=True, nullable=False, index=True
    )
    delivery_date: Mapped[date] = mapped_column(Date, nullable=False)
    delivery_type: Mapped[str | None] = mapped_column(String(40), nullable=True)
    facility_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    institutional: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    outcome: Mapped[str] = mapped_column(String(40), default="live_birth", nullable=False)
    maternal_complications: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
