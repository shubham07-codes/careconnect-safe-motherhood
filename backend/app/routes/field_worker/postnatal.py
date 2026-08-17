from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.delivery import Delivery
from app.models.immunization import Immunization
from app.models.newborn import Newborn
from app.models.postnatal_visit import PostnatalVisit
from app.models.pregnancy import Pregnancy
from app.models.user import User
from app.schemas.postnatal import (
    DeliveryCreateRequest,
    ImmunizationCreateRequest,
    PostnatalCompleteRequest,
)

router = APIRouter(
    prefix="/api/field-worker/postnatal",
    tags=["Postnatal & Newborn"],
)

@router.post("/delivery")
def record_delivery(
    payload: DeliveryCreateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker", "doctor")),
):
    pregnancy = db.get(Pregnancy, payload.pregnancy_id)

    if pregnancy is None:
        raise HTTPException(status_code=404, detail="Pregnancy not found.")

    if db.scalar(
        select(Delivery).where(Delivery.pregnancy_id == pregnancy.id)
    ):
        raise HTTPException(status_code=409, detail="Delivery already recorded.")

    delivery = Delivery(
        pregnancy_id=pregnancy.id,
        delivery_date=payload.delivery_date,
        delivery_type=payload.delivery_type,
        facility_name=payload.facility_name,
        institutional=payload.institutional,
        outcome=payload.outcome,
        maternal_complications=payload.maternal_complications,
    )
    db.add(delivery)

    pregnancy.status = "delivered"

    # Demo scheduling points chosen inside WHO postnatal contact windows:
    # within 24 h, 48-72 h, 7-14 d, and week 6.
    pnc_offsets = [1, 3, 10, 42]

    for visit_number, days in enumerate(pnc_offsets, start=1):
        db.add(
            PostnatalVisit(
                pregnancy_id=pregnancy.id,
                visit_number=visit_number,
                scheduled_date=payload.delivery_date + timedelta(days=days),
                status="scheduled",
            )
        )

    newborn = Newborn(
        pregnancy_id=pregnancy.id,
        name=payload.newborn_name,
        sex=payload.newborn_sex,
        date_of_birth=payload.delivery_date,
        birth_weight_kg=payload.birth_weight_kg,
        low_birth_weight=(
            payload.birth_weight_kg is not None
            and payload.birth_weight_kg < 2.5
        ),
    )

    db.add(newborn)
    db.commit()
    db.refresh(delivery)
    db.refresh(newborn)

    return {
        "message": (
            "Delivery/newborn recorded and postnatal follow-up schedule generated."
        ),
        "delivery_id": delivery.id,
        "newborn_id": newborn.id,
        "low_birth_weight": newborn.low_birth_weight,
    }

@router.get("/due-list")
def pnc_due_list(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker", "doctor")),
):
    today = date.today()

    visits = db.scalars(
        select(PostnatalVisit)
        .where(
            PostnatalVisit.scheduled_date <= today,
            PostnatalVisit.completed_date.is_(None),
        )
        .order_by(PostnatalVisit.scheduled_date)
    ).all()

    return {
        "total": len(visits),
        "visits": [
            {
                "id": v.id,
                "pregnancy_id": v.pregnancy_id,
                "visit_number": v.visit_number,
                "scheduled_date": v.scheduled_date,
                "status": "missed" if v.scheduled_date < today else "due",
            }
            for v in visits
        ],
    }

@router.post("/visits/{visit_id}/complete")
def complete_pnc(
    visit_id: int,
    payload: PostnatalCompleteRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker", "doctor")),
):
    visit = db.get(PostnatalVisit, visit_id)

    if visit is None:
        raise HTTPException(status_code=404, detail="Postnatal visit not found.")

    visit.completed_date = payload.completed_date or date.today()
    visit.status = "completed"
    visit.notes = payload.notes
    db.commit()

    return {"message": "Postnatal visit completed."}

@router.post("/newborns/{newborn_id}/immunizations")
def create_immunization_due(
    newborn_id: int,
    payload: ImmunizationCreateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker", "doctor")),
):
    if db.get(Newborn, newborn_id) is None:
        raise HTTPException(status_code=404, detail="Newborn not found.")

    item = Immunization(
        newborn_id=newborn_id,
        vaccine_name=payload.vaccine_name,
        due_date=payload.due_date,
        status="due",
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "message": "Immunization due item created.",
        "immunization_id": item.id,
    }

@router.get("/immunizations/due-list")
def immunization_due_list(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker", "doctor")),
):
    today = date.today()

    items = db.scalars(
        select(Immunization)
        .where(
            Immunization.due_date <= today,
            Immunization.completed_date.is_(None),
        )
        .order_by(Immunization.due_date)
    ).all()

    return {
        "total": len(items),
        "items": [
            {
                "id": item.id,
                "newborn_id": item.newborn_id,
                "vaccine_name": item.vaccine_name,
                "due_date": item.due_date,
                "status": "missed" if item.due_date < today else "due",
            }
            for item in items
        ],
    }

@router.post("/immunizations/{immunization_id}/complete")
def complete_immunization(
    immunization_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker", "doctor")),
):
    item = db.get(Immunization, immunization_id)

    if item is None:
        raise HTTPException(status_code=404, detail="Immunization not found.")

    item.completed_date = date.today()
    item.status = "completed"
    db.commit()

    return {"message": "Immunization marked completed."}
