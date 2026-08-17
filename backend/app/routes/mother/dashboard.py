from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.anc_visit import ANCVisit
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.user import User
from app.services.anc_service import calculate_pregnancy_week

router = APIRouter(prefix="/api/mother", tags=["Mother"])

@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("mother")),
):
    mother = db.scalar(
        select(Mother).where(Mother.user_id == user.id)
    )

    if mother is None:
        raise HTTPException(
            status_code=404,
            detail="Mother profile is not linked to this login.",
        )

    pregnancy = db.scalar(
        select(Pregnancy)
        .where(Pregnancy.mother_id == mother.id)
        .order_by(Pregnancy.created_at.desc())
    )

    if pregnancy is None:
        return {
            "mother_id": mother.id,
            "mother_name": mother.full_name,
            "pregnancy": None,
        }

    next_visit = db.scalar(
        select(ANCVisit)
        .where(
            ANCVisit.pregnancy_id == pregnancy.id,
            ANCVisit.completed_date.is_(None),
            ANCVisit.scheduled_date >= date.today(),
        )
        .order_by(ANCVisit.scheduled_date)
    )

    return {
        "mother_id": mother.id,
        "mother_name": mother.full_name,
        "preferred_language": mother.preferred_language,
        "pregnancy": {
            "pregnancy_id": pregnancy.id,
            "week": calculate_pregnancy_week(pregnancy.lmp),
            "edd": pregnancy.edd,
            "risk_level": pregnancy.current_risk_level,
            "status": pregnancy.status,
        },
        "next_anc": (
            None
            if next_visit is None
            else {
                "visit_number": next_visit.visit_number,
                "scheduled_date": next_visit.scheduled_date,
            }
        ),
    }
