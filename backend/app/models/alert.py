from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

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

    alert_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    action_text: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    dedupe_key: Mapped[str] = mapped_column(
        String(200),
        unique=True,
        nullable=False,
        index=True,
    )

    target_role: Mapped[str] = mapped_column(
        String(30),
        default="mother",
        nullable=False,
        index=True,
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )