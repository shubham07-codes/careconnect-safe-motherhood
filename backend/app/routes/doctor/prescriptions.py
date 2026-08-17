from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles

from app.models.medicine import (
    Prescription,
    PrescriptionItem,
)
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.user import User

from app.schemas.medicine import (
    PrescriptionCreateRequest,
)


router = APIRouter(
    prefix="/api/doctor/prescriptions",
    tags=["Doctor - Prescriptions"],
)


@router.post("")
def create_prescription(
    payload: PrescriptionCreateRequest,

    db: Session = Depends(get_db),

    doctor: User = Depends(
        require_roles("doctor")
    ),
):

    mother = db.get(
        Mother,
        payload.mother_id,
    )

    if mother is None:
        raise HTTPException(
            status_code=404,
            detail="Mother not found.",
        )

    pregnancy_id = payload.pregnancy_id

    if pregnancy_id is None:
        pregnancy = db.scalar(
            select(Pregnancy)
            .where(
                Pregnancy.mother_id == mother.id,
                Pregnancy.status == "active",
            )
            .order_by(
                Pregnancy.created_at.desc()
            )
        )

        pregnancy_id = (
            pregnancy.id
            if pregnancy
            else None
        )

    prescription = Prescription(
        mother_id=mother.id,
        pregnancy_id=pregnancy_id,
        doctor_user_id=doctor.id,
        notes=payload.notes,
        status="active",
    )

    db.add(prescription)
    db.flush()

    created_items = []

    for medicine in payload.medicines:

        item = PrescriptionItem(
            prescription_id=prescription.id,
            medicine_name=medicine.medicine_name,
            dosage=medicine.dosage,
            frequency=medicine.frequency,
            timing_instructions=medicine.timing_instructions,
            start_date=medicine.start_date,
            end_date=medicine.end_date,
            active=True,
        )

        db.add(item)
        db.flush()

        created_items.append({
            "item_id": item.id,
            "medicine_name": item.medicine_name,
            "dosage": item.dosage,
            "frequency": item.frequency,
            "timing_instructions":
                item.timing_instructions,
        })

    db.commit()

    return {
        "message": "Prescription created successfully.",
        "prescription_id": prescription.id,
        "mother_id": mother.id,
        "doctor_id": doctor.id,
        "medicines": created_items,
    }


@router.get("")
def list_prescriptions(
    mother_id: int,

    db: Session = Depends(get_db),

    _: User = Depends(
        require_roles("doctor")
    ),
):

    prescriptions = db.scalars(
        select(Prescription)
        .where(
            Prescription.mother_id == mother_id
        )
        .order_by(
            Prescription.created_at.desc()
        )
    ).all()

    result = []

    for prescription in prescriptions:

        items = db.scalars(
            select(PrescriptionItem)
            .where(
                PrescriptionItem.prescription_id
                == prescription.id
            )
        ).all()

        result.append({
            "prescription_id":
                prescription.id,

            "status":
                prescription.status,

            "notes":
                prescription.notes,

            "created_at":
                prescription.created_at,

            "medicines": [
                {
                    "id": item.id,
                    "medicine_name":
                        item.medicine_name,

                    "dosage":
                        item.dosage,

                    "frequency":
                        item.frequency,

                    "timing_instructions":
                        item.timing_instructions,

                    "active":
                        item.active,
                }

                for item in items
            ],
        })

    return result