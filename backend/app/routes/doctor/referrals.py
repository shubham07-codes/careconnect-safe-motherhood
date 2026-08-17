from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.referral import Referral
from app.models.user import User
from app.schemas.referral import ReferralStatusRequest

router = APIRouter(
    prefix="/api/doctor/referrals",
    tags=["Doctor - Referrals"],
)

@router.get("")
def list_referrals(
    status_filter: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("doctor", "field_worker")),
):
    stmt = (
        select(Referral, Pregnancy, Mother)
        .join(Pregnancy, Referral.pregnancy_id == Pregnancy.id)
        .join(Mother, Pregnancy.mother_id == Mother.id)
    )

    if status_filter:
        stmt = stmt.where(Referral.status == status_filter)

    rows = db.execute(
        stmt.order_by(Referral.created_at.desc())
    ).all()

    return [
        {
            "referral_id": referral.id,
            "status": referral.status,
            "priority": referral.priority,
            "reason": referral.reason,
            "facility_name": referral.facility_name,
            "mother_name": mother.full_name,
            "mother_id": mother.id,
            "pregnancy_id": pregnancy.id,
            "risk_level": pregnancy.current_risk_level,
            "created_at": referral.created_at,
            "accepted_at": referral.accepted_at,
            "reached_facility_at": referral.reached_facility_at,
            "closed_at": referral.closed_at,
        }
        for referral, pregnancy, mother in rows
    ]

@router.patch("/{referral_id}")
def update_referral(
    referral_id: int,
    payload: ReferralStatusRequest,
    db: Session = Depends(get_db),
    doctor: User = Depends(require_roles("doctor")),
):
    referral = db.get(Referral, referral_id)

    if referral is None:
        raise HTTPException(status_code=404, detail="Referral not found.")

    allowed = {
        "pending",
        "accepted",
        "reached_facility",
        "closed",
    }

    if payload.status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid referral status.")

    now = datetime.now(timezone.utc)

    referral.status = payload.status
    referral.assigned_doctor_user_id = doctor.id

    if payload.facility_name is not None:
        referral.facility_name = payload.facility_name

    if payload.notes is not None:
        referral.notes = payload.notes

    if payload.status == "accepted":
        referral.accepted_at = now
    elif payload.status == "reached_facility":
        referral.reached_facility_at = now
    elif payload.status == "closed":
        referral.closed_at = now

    db.commit()

    return {
        "message": "Referral updated.",
        "referral_id": referral.id,
        "status": referral.status,
    }
