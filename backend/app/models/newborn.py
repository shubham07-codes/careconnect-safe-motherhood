from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Newborn(Base):
    __tablename__ = "newborns"

    id: Mapped[int] = mapped_column(primary_key=True)
    pregnancy_id: Mapped[int] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="CASCADE"),
        unique=True, nullable=False, index=True
    )
    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    sex: Mapped[str | None] = mapped_column(String(20), nullable=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    birth_weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(4, 2), nullable=True)
    low_birth_weight: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
