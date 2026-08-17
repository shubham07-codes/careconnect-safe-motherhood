from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles

from app.models.medicine import (
    MedicationLog,
    Prescription,
    PrescriptionItem,
)
from app.models.mother import Mother
from app.models.user import User

from app.schemas.medicine import MedicationTakenRequest

from app.services.medicine_assistant import (
    explain_medicine,
)


router = APIRouter(
    prefix="/api/mother/medicines",
    tags=["Mother - Medicines"],
)


def get_mother(
    db: Session,
    user: User,
) -> Mother:

    mother = db.scalar(
        select(Mother).where(
            Mother.user_id == user.id
        )
    )

    if mother is None:
        raise HTTPException(
            status_code=404,
            detail="Mother profile not linked.",
        )

    return mother


@router.get("")
def my_medicines(
    db: Session = Depends(get_db),

    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_mother(
        db,
        user,
    )

    rows = db.execute(
        select(
            PrescriptionItem,
            Prescription,
        )
        .join(
            Prescription,
            PrescriptionItem.prescription_id
            == Prescription.id,
        )
        .where(
            Prescription.mother_id == mother.id,
            Prescription.status == "active",
            PrescriptionItem.active.is_(True),
        )
        .order_by(
            Prescription.created_at.desc()
        )
    ).all()

    return [
        {
            "item_id": item.id,
            "prescription_id":
                prescription.id,

            "medicine_name":
                item.medicine_name,

            "dosage":
                item.dosage,

            "frequency":
                item.frequency,

            "timing_instructions":
                item.timing_instructions,

            "start_date":
                item.start_date,

            "end_date":
                item.end_date,

            "doctor_notes":
                prescription.notes,
        }

        for item, prescription in rows
    ]


@router.post("/{item_id}/explain")
def explain_prescribed_medicine(
    item_id: int,

    db: Session = Depends(get_db),

    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_mother(
        db,
        user,
    )

    row = db.execute(
        select(
            PrescriptionItem,
            Prescription,
        )
        .join(
            Prescription,
            PrescriptionItem.prescription_id
            == Prescription.id,
        )
        .where(
            PrescriptionItem.id == item_id,
            Prescription.mother_id == mother.id,
        )
    ).first()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found.",
        )

    item, prescription = row

    result = explain_medicine({
        "medicine_name":
            item.medicine_name,

        "dosage":
            item.dosage,

        "frequency":
            item.frequency,

        "timing_instructions":
            item.timing_instructions,
    })

    return result


@router.post("/{item_id}/taken")
def mark_medicine_taken(
    item_id: int,

    payload: MedicationTakenRequest,

    db: Session = Depends(get_db),

    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_mother(
        db,
        user,
    )

    row = db.execute(
        select(
            PrescriptionItem,
            Prescription,
        )
        .join(
            Prescription,
            PrescriptionItem.prescription_id
            == Prescription.id,
        )
        .where(
            PrescriptionItem.id == item_id,
            Prescription.mother_id == mother.id,
        )
    ).first()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found.",
        )

    log = MedicationLog(
        prescription_item_id=item_id,
        mother_id=mother.id,
        status="taken",
        note=payload.note,
        taken_at=datetime.now(timezone.utc),
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "message": "Medicine marked as taken.",
        "log_id": log.id,
        "taken_at": log.taken_at,
    }


@router.get("/history")
def medication_history(
    db: Session = Depends(get_db),

    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_mother(
        db,
        user,
    )

    logs = db.scalars(
        select(MedicationLog)
        .where(
            MedicationLog.mother_id == mother.id
        )
        .order_by(
            MedicationLog.created_at.desc()
        )
        .limit(100)
    ).all()

    return [
        {
            "id": log.id,
            "prescription_item_id":
                log.prescription_item_id,
            "status": log.status,
            "note": log.note,
            "taken_at": log.taken_at,
            "created_at": log.created_at,
        }

        for log in logs
    ]