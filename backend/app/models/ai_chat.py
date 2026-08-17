from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AIChatLog(Base):
    __tablename__ = "ai_chat_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

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

    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)

    response_source: Mapped[str] = mapped_column(
        String(40),
        default="fallback",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )