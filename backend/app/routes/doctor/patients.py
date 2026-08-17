from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.user import User
from app.services.anc_service import calculate_pregnancy_week


router = APIRouter(
    prefix="/api/doctor/patients",
    tags=["Doctor - Patients"],
)


@router.get("")
def list_patients(
    risk_level: str | None = Query(default=None),
    search: str | None = Query(default=None),

    db: Session = Depends(get_db),

    _: User = Depends(
        require_roles("doctor")
    ),
):

    stmt = (
        select(Pregnancy, Mother)
        .join(
            Mother,
            Pregnancy.mother_id == Mother.id,
        )
        .where(
            Pregnancy.status == "active"
        )
    )

    if risk_level:
        stmt = stmt.where(
            func.lower(
                Pregnancy.current_risk_level
            ) == risk_level.lower()
        )

    if search:
        stmt = stmt.where(
            Mother.full_name.ilike(
                f"%{search}%"
            )
        )

    rows = db.execute(
        stmt.order_by(
            Pregnancy.created_at.desc()
        )
    ).all()

    patients = []

    for pregnancy, mother in rows:

        patients.append({
            "mother_id": mother.id,
            "pregnancy_id": pregnancy.id,

            "mother_name":
                mother.full_name,

            "phone":
                mother.phone,

            "ward_id":
                mother.ward_id,

            "blood_group":
                mother.blood_group,

            "week":
                calculate_pregnancy_week(
                    pregnancy.lmp
                ),

            "edd":
                pregnancy.edd,

            "risk_level":
                pregnancy.current_risk_level,

            "status":
                pregnancy.status,

            "previous_complications":
                pregnancy.previous_complications,
        })

    return {
        "total": len(patients),
        "patients": patients,
    }