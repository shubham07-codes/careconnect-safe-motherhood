import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles

from app.models.anc_visit import ANCVisit
from app.models.doctor_prep import DoctorPrep
from app.models.medicine import Prescription, PrescriptionItem
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.report import Report
from app.models.symptom import SymptomLog
from app.models.user import User

from app.schemas.doctor_prep import DoctorPrepRequest

from app.services.anc_service import calculate_pregnancy_week
from app.services.doctor_prep_service import generate_doctor_prep


router = APIRouter(
    prefix="/api/mother/doctor-prep",
    tags=["Mother - Doctor Prep AI"],
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
            detail="Mother profile is not linked.",
        )

    return mother


def build_context(
    db: Session,
    mother: Mother,
) -> dict:

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

    pregnancy_data = None
    next_anc_data = None

    if pregnancy:

        pregnancy_data = {
            "pregnancy_id": pregnancy.id,
            "week": calculate_pregnancy_week(
                pregnancy.lmp
            ),
            "edd": str(pregnancy.edd),
            "risk_level":
                pregnancy.current_risk_level,
        }

        next_anc = db.scalar(
            select(ANCVisit)
            .where(
                ANCVisit.pregnancy_id
                == pregnancy.id,

                ANCVisit.completed_date
                .is_(None),

                ANCVisit.scheduled_date
                >= date.today(),
            )
            .order_by(
                ANCVisit.scheduled_date
            )
        )

        if next_anc:

            next_anc_data = {
                "visit_number":
                    next_anc.visit_number,

                "scheduled_date":
                    str(
                        next_anc.scheduled_date
                    ),
            }

    latest_report = db.scalar(
        select(Report)
        .where(
            Report.mother_id == mother.id
        )
        .order_by(
            Report.created_at.desc()
        )
    )

    latest_symptom = db.scalar(
        select(SymptomLog)
        .where(
            SymptomLog.mother_id
            == mother.id
        )
        .order_by(
            SymptomLog.created_at.desc()
        )
    )

    medicine_rows = db.execute(
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
            Prescription.mother_id
            == mother.id,

            Prescription.status
            == "active",

            PrescriptionItem.active
            .is_(True),
        )
    ).all()

    medicines = [
        {
            "medicine_name":
                item.medicine_name,

            "dosage":
                item.dosage,

            "frequency":
                item.frequency,
        }

        for item, prescription
        in medicine_rows
    ]

    return {

        "mother": {
            "name":
                mother.full_name,
        },

        "pregnancy":
            pregnancy_data,

        "next_anc":
            next_anc_data,

        "latest_report": (
            None
            if latest_report is None
            else {
                "summary":
                    latest_report.ai_summary,

                "urgency_level":
                    latest_report.urgency_level,

                "doctor_review_required":
                    latest_report.doctor_review_required,
            }
        ),

        "latest_symptom": (
            None
            if latest_symptom is None
            else {
                "triage_level":
                    latest_symptom.triage_level,

                "explanation":
                    latest_symptom.ai_explanation,
            }
        ),

        "medicines":
            medicines,
    }


@router.post("/generate")
def generate_prep(
    payload: DoctorPrepRequest,

    db: Session = Depends(get_db),

    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_mother(
        db,
        user,
    )

    context = build_context(
        db,
        mother,
    )

    result = generate_doctor_prep(
        context,
        payload.extra_concern,
    )

    pregnancy_id = (
        context["pregnancy"][
            "pregnancy_id"
        ]
        if context["pregnancy"]
        else None
    )

    prep = DoctorPrep(
        mother_id=mother.id,
        pregnancy_id=pregnancy_id,

        questions=json.dumps(
            result["questions"],
            ensure_ascii=False,
        ),

        documents=json.dumps(
            result["documents"],
            ensure_ascii=False,
        ),

        concerns=json.dumps(
            result["concerns"],
            ensure_ascii=False,
        ),

        checklist=json.dumps(
            result["checklist"],
            ensure_ascii=False,
        ),

        source=result["source"],
    )

    db.add(prep)
    db.commit()
    db.refresh(prep)

    return {
        "doctor_prep_id":
            prep.id,

        **result,

        "disclaimer": (
            "Doctor Prep helps organize information "
            "for your consultation. "
            "Clinical decisions remain with your healthcare professional."
        ),
    }


@router.get("/latest")
def latest_doctor_prep(
    db: Session = Depends(get_db),

    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_mother(
        db,
        user,
    )

    prep = db.scalar(
        select(DoctorPrep)
        .where(
            DoctorPrep.mother_id
            == mother.id
        )
        .order_by(
            DoctorPrep.created_at.desc()
        )
    )

    if prep is None:
        return None

    return {
        "id": prep.id,

        "questions":
            json.loads(prep.questions),

        "documents":
            json.loads(prep.documents),

        "concerns":
            json.loads(prep.concerns),

        "checklist":
            json.loads(prep.checklist),

        "source":
            prep.source,

        "created_at":
            prep.created_at,
    }