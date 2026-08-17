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
from app.models.ward import Ward


router = APIRouter(
    prefix="/api/officer",
    tags=["Officer - Aggregate Dashboard"],
)


def build_indicators(db: Session, mother_ids: list[int]):

    indicators = {
        "registered_mothers": len(mother_ids),
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
    }

    if not mother_ids:
        return indicators

    pregnancy_ids = list(
        db.scalars(
            select(Pregnancy.id).where(
                Pregnancy.mother_id.in_(mother_ids)
            )
        ).all()
    )

    if not pregnancy_ids:
        return indicators

    indicators["active_pregnancies"] = (
        db.scalar(
            select(func.count())
            .select_from(Pregnancy)
            .where(
                Pregnancy.id.in_(pregnancy_ids),
                Pregnancy.status == "active",
            )
        )
        or 0
    )

    indicators["high_risk_pregnancies"] = (
        db.scalar(
            select(func.count())
            .select_from(Pregnancy)
            .where(
                Pregnancy.id.in_(pregnancy_ids),
                func.lower(
                    Pregnancy.current_risk_level
                )
                == "high",
            )
        )
        or 0
    )

    total_anc = (
        db.scalar(
            select(func.count())
            .select_from(ANCVisit)
            .where(
                ANCVisit.pregnancy_id.in_(
                    pregnancy_ids
                )
            )
        )
        or 0
    )

    completed_anc = (
        db.scalar(
            select(func.count())
            .select_from(ANCVisit)
            .where(
                ANCVisit.pregnancy_id.in_(
                    pregnancy_ids
                ),
                ANCVisit.completed_date.is_not(
                    None
                ),
            )
        )
        or 0
    )

    indicators["anc_due_today"] = (
        db.scalar(
            select(func.count())
            .select_from(ANCVisit)
            .where(
                ANCVisit.pregnancy_id.in_(
                    pregnancy_ids
                ),
                ANCVisit.scheduled_date
                == date.today(),
                ANCVisit.completed_date.is_(
                    None
                ),
            )
        )
        or 0
    )

    indicators["missed_anc_visits"] = (
        db.scalar(
            select(func.count())
            .select_from(ANCVisit)
            .where(
                ANCVisit.pregnancy_id.in_(
                    pregnancy_ids
                ),
                ANCVisit.scheduled_date
                < date.today(),
                ANCVisit.completed_date.is_(
                    None
                ),
            )
        )
        or 0
    )

    indicators["anc_completion_percent"] = (
        round(
            100.0
            * completed_anc
            / total_anc,
            1,
        )
        if total_anc
        else 0.0
    )

    indicators["open_referrals"] = (
        db.scalar(
            select(func.count())
            .select_from(Referral)
            .where(
                Referral.pregnancy_id.in_(
                    pregnancy_ids
                ),
                Referral.status != "closed",
            )
        )
        or 0
    )

    deliveries = db.scalars(
        select(Delivery).where(
            Delivery.pregnancy_id.in_(
                pregnancy_ids
            )
        )
    ).all()

    indicators[
        "institutional_delivery_rate_percent"
    ] = (
        round(
            100.0
            * sum(
                1
                for item in deliveries
                if item.institutional
            )
            / len(deliveries),
            1,
        )
        if deliveries
        else 0.0
    )

    indicators["postnatal_due_or_missed"] = (
        db.scalar(
            select(func.count())
            .select_from(PostnatalVisit)
            .where(
                PostnatalVisit.pregnancy_id.in_(
                    pregnancy_ids
                ),
                PostnatalVisit.scheduled_date
                <= date.today(),
                PostnatalVisit.completed_date.is_(
                    None
                ),
            )
        )
        or 0
    )

    newborns = db.scalars(
        select(Newborn).where(
            Newborn.pregnancy_id.in_(
                pregnancy_ids
            )
        )
    ).all()

    indicators["newborns"] = len(
        newborns
    )

    indicators[
        "low_birth_weight_newborns"
    ] = sum(
        1
        for newborn in newborns
        if newborn.low_birth_weight
    )

    newborn_ids = [
        newborn.id
        for newborn in newborns
    ]

    if newborn_ids:

        total_immunizations = (
            db.scalar(
                select(func.count())
                .select_from(Immunization)
                .where(
                    Immunization.newborn_id.in_(
                        newborn_ids
                    )
                )
            )
            or 0
        )

        completed_immunizations = (
            db.scalar(
                select(func.count())
                .select_from(Immunization)
                .where(
                    Immunization.newborn_id.in_(
                        newborn_ids
                    ),
                    Immunization.completed_date.is_not(
                        None
                    ),
                )
            )
            or 0
        )

        indicators[
            "immunization_completion_percent"
        ] = (
            round(
                100.0
                * completed_immunizations
                / total_immunizations,
                1,
            )
            if total_immunizations
            else 0.0
        )

    return indicators


@router.get("/dashboard")
def dashboard(
    ward_id: int | None = Query(
        default=None
    ),
    db: Session = Depends(get_db),
    _: User = Depends(
        require_roles("officer")
    ),
):

    stmt = select(Mother.id)

    if ward_id is not None:
        stmt = stmt.where(
            Mother.ward_id == ward_id
        )

    mother_ids = list(
        db.scalars(stmt).all()
    )

    return {
        "ward_id": ward_id,
        "privacy":
            "aggregate_deidentified",
        "indicators":
            build_indicators(
                db,
                mother_ids,
            ),
    }


@router.get("/wards")
def ward_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(
        require_roles("officer")
    ),
):

    wards = db.scalars(
        select(Ward).order_by(
            Ward.code
        )
    ).all()

    result = []

    for ward in wards:

        mother_ids = list(
            db.scalars(
                select(Mother.id).where(
                    Mother.ward_id
                    == ward.id
                )
            ).all()
        )

        result.append({
            "ward_id": ward.id,
            "code": ward.code,
            "name": ward.name,
            "city": ward.city,
            "indicators":
                build_indicators(
                    db,
                    mother_ids,
                ),
        })

    return {
        "privacy":
            "aggregate_deidentified",
        "wards": result,
    }