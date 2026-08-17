from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.user import User
from app.models.ward import Ward
from app.schemas.pregnancy_registration import (
    PregnancyRegistrationRequest,
    PregnancyRegistrationResponse,
)
from app.services.anc_service import (
    calculate_edd,
    calculate_pregnancy_week,
    generate_anc_schedule,
)

router = APIRouter(prefix="/api/field-worker", tags=["Field Worker"])

@router.post(
    "/pregnancies",
    response_model=PregnancyRegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_pregnancy(
    payload: PregnancyRegistrationRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker")),
):
    today = date.today()

    if payload.lmp > today:
        raise HTTPException(status_code=400, detail="LMP cannot be in the future.")

    pregnancy_week = calculate_pregnancy_week(payload.lmp)
    if pregnancy_week > 42:
        raise HTTPException(
            status_code=400,
            detail="LMP indicates a pregnancy greater than 42 weeks.",
        )

    if db.get(Ward, payload.ward_id) is None:
        raise HTTPException(status_code=404, detail="Ward not found.")

    try:
        mother = Mother(
            ward_id=payload.ward_id,
            full_name=payload.full_name,
            phone=payload.phone,
            date_of_birth=payload.date_of_birth,
            blood_group=payload.blood_group,
            address=payload.address,
            preferred_language=payload.preferred_language,
            reminder_consent=payload.reminder_consent,
        )
        db.add(mother)
        db.flush()

        pregnancy = Pregnancy(
            mother_id=mother.id,
            lmp=payload.lmp,
            edd=calculate_edd(payload.lmp),
            pregnancy_number=payload.pregnancy_number,
            parity=payload.parity,
            previous_complications=payload.previous_complications,
            current_risk_level="unassessed",
            status="active",
        )
        db.add(pregnancy)
        db.flush()

        visits = generate_anc_schedule(pregnancy.id, payload.lmp)
        db.add_all(visits)
        db.commit()

        return {
            "message": "Mother and pregnancy registered successfully.",
            "mother_id": mother.id,
            "pregnancy_id": pregnancy.id,
            "mother_name": mother.full_name,
            "lmp": pregnancy.lmp,
            "edd": pregnancy.edd,
            "pregnancy_week": pregnancy_week,
            "current_risk_level": pregnancy.current_risk_level,
            "anc_visits": [
                {
                    "visit_number": item.visit_number,
                    "scheduled_date": item.scheduled_date,
                    "status": item.status,
                }
                for item in visits
            ],
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not register pregnancy.",
        )
