from datetime import date, datetime
from sqlalchemy import Date, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Immunization(Base):
    __tablename__ = "immunizations"

    id: Mapped[int] = mapped_column(primary_key=True)
    newborn_id: Mapped[int] = mapped_column(
        ForeignKey("newborns.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vaccine_name: Mapped[str] = mapped_column(String(100), nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    completed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="due", nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
