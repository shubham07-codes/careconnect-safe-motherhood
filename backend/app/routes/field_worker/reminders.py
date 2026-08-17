from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.anc_visit import ANCVisit
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.reminder import Reminder
from app.models.user import User
from app.services.reminder_service import reminder_text

router = APIRouter(
    prefix="/api/field-worker/reminders",
    tags=["Field Worker - Reminders"],
)

@router.post("/generate")
def generate_reminders(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker")),
):
    today = date.today()
    upcoming_limit = today + timedelta(days=3)

    rows = db.execute(
        select(ANCVisit, Pregnancy, Mother)
        .join(Pregnancy, ANCVisit.pregnancy_id == Pregnancy.id)
        .join(Mother, Pregnancy.mother_id == Mother.id)
        .where(
            ANCVisit.completed_date.is_(None),
            ANCVisit.scheduled_date <= upcoming_limit,
            Pregnancy.status == "active",
        )
    ).all()

    created = 0
    skipped_no_consent = 0

    for visit, pregnancy, mother in rows:
        if not mother.reminder_consent:
            skipped_no_consent += 1
            continue

        missed = visit.scheduled_date < today
        reminder_type = "missed_anc" if missed else "upcoming_anc"

        existing = db.scalar(
            select(Reminder).where(
                Reminder.anc_visit_id == visit.id,
                Reminder.reminder_type == reminder_type,
                Reminder.status.in_(["pending", "sent"]),
            )
        )

        if existing is not None:
            continue

        db.add(
            Reminder(
                mother_id=mother.id,
                pregnancy_id=pregnancy.id,
                anc_visit_id=visit.id,
                reminder_type=reminder_type,
                message=reminder_text(
                    mother.preferred_language,
                    mother.full_name,
                    str(visit.scheduled_date),
                    missed,
                ),
                language=mother.preferred_language,
                channel="sms",
                due_at=datetime.combine(
                    today,
                    time(hour=9),
                    tzinfo=timezone.utc,
                ),
                status="pending",
            )
        )
        created += 1

    db.commit()

    return {
        "created": created,
        "skipped_no_consent": skipped_no_consent,
        "mode": "demo_queue_only",
        "note": "No external SMS/WhatsApp provider is called.",
    }

@router.get("/pending")
def pending(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker")),
):
    items = db.scalars(
        select(Reminder)
        .where(Reminder.status == "pending")
        .order_by(Reminder.due_at)
    ).all()

    return [
        {
            "id": item.id,
            "mother_id": item.mother_id,
            "type": item.reminder_type,
            "message": item.message,
            "language": item.language,
            "channel": item.channel,
            "due_at": item.due_at,
        }
        for item in items
    ]

@router.post("/{reminder_id}/mock-send")
def mock_send(
    reminder_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker")),
):
    item = db.get(Reminder, reminder_id)

    if item is None:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    item.status = "sent"
    item.sent_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "message": "Reminder marked sent in demo mode.",
        "preview": item.message,
    }
