from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.anc_visit import ANCVisit
from app.models.delivery import Delivery
from app.models.immunization import Immunization
from app.models.mother import Mother
from app.models.newborn import Newborn
from app.models.postnatal_visit import PostnatalVisit
from app.models.pregnancy import Pregnancy
from app.models.referral import Referral
from app.models.user import User

router = APIRouter(
    prefix="/api/officer",
    tags=["Officer - Aggregate Dashboard"],
)

@router.get("/dashboard")
def dashboard(
    ward_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("officer")),
):
    # Intentionally aggregate only: no names, phones, addresses or patient rows.

    mother_ids_q = select(Mother.id)
    if ward_id is not None:
        mother_ids_q = mother_ids_q.where(Mother.ward_id == ward_id)

    mother_ids = list(db.scalars(mother_ids_q).all())

    if not mother_ids:
        return {
            "ward_id": ward_id,
            "privacy": "aggregate_deidentified",
            "indicators": {
                "registered_mothers": 0,
                "active_pregnancies": 0,
                "high_risk_pregnancies": 0,
                "anc_due_today": 0,
                "missed_anc_visits": 0,
                "anc_completion_percent": 0.0,
                "open_referrals": 0,
                "institutional_delivery_rate_percent": 0.0,
                "postnatal_due_or_missed": 0,
                "newborns": 0,
                "low_birth_weight_newborns": 0,
                "immunization_completion_percent": 0.0,
            },
        }

    pregnancy_ids = list(
        db.scalars(
            select(Pregnancy.id).where(
                Pregnancy.mother_id.in_(mother_ids)
            )
        ).all()
    )

    active_pregnancies = db.scalar(
        select(func.count()).select_from(Pregnancy).where(
            Pregnancy.id.in_(pregnancy_ids),
            Pregnancy.status == "active",
        )
    ) or 0

    high_risk = db.scalar(
        select(func.count()).select_from(Pregnancy).where(
            Pregnancy.id.in_(pregnancy_ids),
            Pregnancy.current_risk_level == "high",
        )
    ) or 0

    total_anc = db.scalar(
        select(func.count()).select_from(ANCVisit).where(
            ANCVisit.pregnancy_id.in_(pregnancy_ids)
        )
    ) or 0

    completed_anc = db.scalar(
        select(func.count()).select_from(ANCVisit).where(
            ANCVisit.pregnancy_id.in_(pregnancy_ids),
            ANCVisit.completed_date.is_not(None),
        )
    ) or 0

    anc_due_today = db.scalar(
        select(func.count()).select_from(ANCVisit).where(
            ANCVisit.pregnancy_id.in_(pregnancy_ids),
            ANCVisit.scheduled_date == date.today(),
            ANCVisit.completed_date.is_(None),
        )
    ) or 0

    missed_anc = db.scalar(
        select(func.count()).select_from(ANCVisit).where(
            ANCVisit.pregnancy_id.in_(pregnancy_ids),
            ANCVisit.scheduled_date < date.today(),
            ANCVisit.completed_date.is_(None),
        )
    ) or 0

    open_referrals = db.scalar(
        select(func.count()).select_from(Referral).where(
            Referral.pregnancy_id.in_(pregnancy_ids),
            Referral.status != "closed",
        )
    ) or 0

    deliveries = db.scalars(
        select(Delivery).where(
            Delivery.pregnancy_id.in_(pregnancy_ids)
        )
    ).all()

    institutional_rate = (
        round(
            100.0
            * sum(1 for delivery in deliveries if delivery.institutional)
            / len(deliveries),
            1,
        )
        if deliveries
        else 0.0
    )

    pnc_due = db.scalar(
        select(func.count()).select_from(PostnatalVisit).where(
            PostnatalVisit.pregnancy_id.in_(pregnancy_ids),
            PostnatalVisit.scheduled_date <= date.today(),
            PostnatalVisit.completed_date.is_(None),
        )
    ) or 0

    newborns = db.scalars(
        select(Newborn).where(
            Newborn.pregnancy_id.in_(pregnancy_ids)
        )
    ).all()

    newborn_ids = [item.id for item in newborns]

    low_birth_weight = sum(
        1 for item in newborns if item.low_birth_weight
    )

    if newborn_ids:
        immun_total = db.scalar(
            select(func.count()).select_from(Immunization).where(
                Immunization.newborn_id.in_(newborn_ids)
            )
        ) or 0

        immun_completed = db.scalar(
            select(func.count()).select_from(Immunization).where(
                Immunization.newborn_id.in_(newborn_ids),
                Immunization.completed_date.is_not(None),
            )
        ) or 0
    else:
        immun_total = 0
        immun_completed = 0

    return {
        "ward_id": ward_id,
        "privacy": "aggregate_deidentified",
        "indicators": {
            "registered_mothers": len(mother_ids),
            "active_pregnancies": active_pregnancies,
            "high_risk_pregnancies": high_risk,
            "anc_due_today": anc_due_today,
            "missed_anc_visits": missed_anc,
            "anc_completion_percent": (
                round(100.0 * completed_anc / total_anc, 1)
                if total_anc
                else 0.0
            ),
            "open_referrals": open_referrals,
            "institutional_delivery_rate_percent": institutional_rate,
            "postnatal_due_or_missed": pnc_due,
            "newborns": len(newborns),
            "low_birth_weight_newborns": low_birth_weight,
            "immunization_completion_percent": (
                round(100.0 * immun_completed / immun_total, 1)
                if immun_total
                else 0.0
            ),
        },
    }
