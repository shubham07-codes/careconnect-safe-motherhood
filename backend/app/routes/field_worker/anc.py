from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.anc_visit import ANCVisit
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.referral import Referral
from app.models.risk_assessment import RiskAssessment
from app.models.user import User
from app.schemas.anc import ANCCompleteRequest
from app.services.priority_engine import calculate_care_priority
from app.services.risk_engine import assess_risk, calculate_age

router = APIRouter(
    prefix="/api/field-worker/anc",
    tags=["Field Worker - ANC"],
)

def base_query():
    return (
        select(ANCVisit, Pregnancy, Mother)
        .join(Pregnancy, ANCVisit.pregnancy_id == Pregnancy.id)
        .join(Mother, Pregnancy.mother_id == Mother.id)
    )

def record(visit: ANCVisit, pregnancy: Pregnancy, mother: Mother) -> dict:
    return {
        "anc_visit_id": visit.id,
        "visit_number": visit.visit_number,
        "scheduled_date": visit.scheduled_date,
        "completed_date": visit.completed_date,
        "status": visit.status,
        "mother_id": mother.id,
        "mother_name": mother.full_name,
        "phone": mother.phone,
        "ward_id": mother.ward_id,
        "pregnancy_id": pregnancy.id,
        "edd": pregnancy.edd,
        "risk_level": pregnancy.current_risk_level,
    }

@router.get("/due-list")
def due_list(
    target_date: date | None = Query(default=None),
    ward_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker")),
):
    selected = target_date or date.today()

    stmt = base_query().where(
        ANCVisit.scheduled_date == selected,
        ANCVisit.completed_date.is_(None),
    )
    if ward_id is not None:
        stmt = stmt.where(Mother.ward_id == ward_id)

    rows = db.execute(stmt.order_by(Mother.full_name)).all()
    patients = [record(v, p, m) for v, p, m in rows]

    return {
        "date": selected,
        "ward_id": ward_id,
        "total_due": len(patients),
        "patients": patients,
    }

@router.get("/missed")
def missed_visits(
    ward_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker")),
):
    today = date.today()

    stmt = base_query().where(
        ANCVisit.scheduled_date < today,
        ANCVisit.completed_date.is_(None),
    )
    if ward_id is not None:
        stmt = stmt.where(Mother.ward_id == ward_id)

    rows = db.execute(stmt.order_by(ANCVisit.scheduled_date)).all()
    patients = []

    for visit, pregnancy, mother in rows:
        visit.status = "missed"
        item = record(visit, pregnancy, mother)
        item["status"] = "missed"
        item["days_overdue"] = (today - visit.scheduled_date).days
        patients.append(item)

    db.commit()

    return {
        "date": today,
        "ward_id": ward_id,
        "total_missed": len(patients),
        "patients": patients,
    }

@router.get("/upcoming")
def upcoming(
    days: int = Query(default=7, ge=1, le=30),
    ward_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker")),
):
    today = date.today()
    end = today + timedelta(days=days)

    stmt = base_query().where(
        ANCVisit.scheduled_date > today,
        ANCVisit.scheduled_date <= end,
        ANCVisit.completed_date.is_(None),
    )
    if ward_id is not None:
        stmt = stmt.where(Mother.ward_id == ward_id)

    rows = db.execute(stmt.order_by(ANCVisit.scheduled_date)).all()
    patients = [record(v, p, m) for v, p, m in rows]

    return {
        "from_date": today,
        "to_date": end,
        "total_upcoming": len(patients),
        "patients": patients,
    }

@router.post("/{anc_visit_id}/complete")
def complete_anc(
    anc_visit_id: int,
    payload: ANCCompleteRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("field_worker", "doctor")),
):
    row = db.execute(
        base_query().where(ANCVisit.id == anc_visit_id)
    ).first()

    if row is None:
        raise HTTPException(status_code=404, detail="ANC visit not found.")

    visit, pregnancy, mother = row
    completed_date = payload.completed_date or date.today()

    visit.completed_date = completed_date
    visit.status = "completed"
    visit.systolic_bp = payload.systolic_bp
    visit.diastolic_bp = payload.diastolic_bp
    visit.hemoglobin = payload.hemoglobin
    visit.blood_sugar = payload.blood_sugar
    visit.notes = payload.notes

    risk = assess_risk(
        maternal_age=calculate_age(mother.date_of_birth, completed_date),
        systolic_bp=payload.systolic_bp,
        diastolic_bp=payload.diastolic_bp,
        hemoglobin=payload.hemoglobin,
        blood_sugar=payload.blood_sugar,
        parity=pregnancy.parity,
        previous_complications=pregnancy.previous_complications,
    )

    assessment = RiskAssessment(
        pregnancy_id=pregnancy.id,
        anc_visit_id=visit.id,
        rule_score=risk["rule_score"],
        ml_probability=risk["ml_probability"],
        combined_score=risk["combined_score"],
        risk_level=risk["risk_level"],
        reasons=risk["reasons_json"],
        model_source=risk["model_source"],
    )
    db.add(assessment)

    pregnancy.current_risk_level = risk["risk_level"]

    auto_referral_id = None

    if risk["risk_level"] == "high":
        existing = db.scalar(
            select(Referral).where(
                Referral.pregnancy_id == pregnancy.id,
                Referral.status.in_(
                    ["pending", "accepted", "reached_facility"]
                ),
            )
        )

        if existing is None:
            referral = Referral(
                pregnancy_id=pregnancy.id,
                anc_visit_id=visit.id,
                created_by_user_id=user.id,
                priority="high",
                reason="; ".join(risk["reasons"]),
                status="pending",
            )
            db.add(referral)
            db.flush()
            auto_referral_id = referral.id
        else:
            auto_referral_id = existing.id

    db.commit()
    db.refresh(assessment)

    return {
        "message": "ANC visit completed and risk assessment generated.",
        "anc_visit_id": visit.id,
        "risk_assessment_id": assessment.id,
        "risk": risk,
        "auto_referral_id": auto_referral_id,
    }

@router.get("/high-risk")
def high_risk_cases(
    ward_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker", "doctor")),
):
    stmt = (
        select(Pregnancy, Mother)
        .join(Mother, Pregnancy.mother_id == Mother.id)
        .where(
            Pregnancy.status == "active",
            Pregnancy.current_risk_level == "high",
        )
    )
    if ward_id is not None:
        stmt = stmt.where(Mother.ward_id == ward_id)

    rows = db.execute(stmt).all()

    return {
        "total": len(rows),
        "patients": [
            {
                "pregnancy_id": p.id,
                "mother_id": m.id,
                "mother_name": m.full_name,
                "phone": m.phone,
                "ward_id": m.ward_id,
                "edd": p.edd,
                "risk_level": p.current_risk_level,
            }
            for p, m in rows
        ],
    }

@router.get("/priority-queue")
def priority_queue(
    ward_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("field_worker")),
):
    today = date.today()

    stmt = base_query().where(
        ANCVisit.scheduled_date < today,
        ANCVisit.completed_date.is_(None),
        Pregnancy.status == "active",
    )

    if ward_id is not None:
        stmt = stmt.where(Mother.ward_id == ward_id)

    rows = db.execute(stmt).all()
    queue = []

    for visit, pregnancy, mother in rows:
        open_referral = db.scalar(
            select(Referral).where(
                Referral.pregnancy_id == pregnancy.id,
                Referral.status != "closed",
            )
        )

        priority = calculate_care_priority(
            pregnancy=pregnancy,
            days_overdue=(today - visit.scheduled_date).days,
            open_referral=open_referral,
        )

        queue.append(
            {
                "mother_id": mother.id,
                "mother_name": mother.full_name,
                "phone": mother.phone,
                "pregnancy_id": pregnancy.id,
                "anc_visit_id": visit.id,
                "scheduled_date": visit.scheduled_date,
                "risk_level": pregnancy.current_risk_level,
                **priority,
            }
        )

    queue.sort(key=lambda item: item["priority_score"], reverse=True)

    return {
        "total": len(queue),
        "patients": queue,
    }
