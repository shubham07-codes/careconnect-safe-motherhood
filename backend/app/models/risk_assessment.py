from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[int] = mapped_column(primary_key=True)
    pregnancy_id: Mapped[int] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    anc_visit_id: Mapped[int | None] = mapped_column(
        ForeignKey("anc_visits.id", ondelete="SET NULL"), nullable=True, index=True
    )
    rule_score: Mapped[int] = mapped_column(Integer, nullable=False)
    ml_probability: Mapped[float] = mapped_column(Float, nullable=False)
    combined_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    reasons: Mapped[str] = mapped_column(Text, nullable=False)
    model_source: Mapped[str] = mapped_column(String(100), nullable=False)
    assessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
