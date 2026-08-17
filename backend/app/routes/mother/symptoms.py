import json

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles

from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.symptom import SymptomLog
from app.models.user import User

from app.schemas.symptom import (
    SymptomTriageRequest,
)

from app.services.symptom_triage import (
    analyze_symptoms,
)


router = APIRouter(
    prefix="/api/mother/symptoms",
    tags=["Mother - AI Symptom Triage"],
)


def get_logged_in_mother(
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
            detail=(
                "Mother profile is not linked "
                "to this account."
            ),
        )

    return mother


@router.post("/triage")
def symptom_triage(
    payload: SymptomTriageRequest,

    db: Session = Depends(get_db),

    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_logged_in_mother(
        db,
        user,
    )

    pregnancy = db.scalar(
        select(Pregnancy)
        .where(
            Pregnancy.mother_id
            == mother.id,

            Pregnancy.status
            == "active",
        )
        .order_by(
            Pregnancy.created_at.desc()
        )
    )

    analysis = analyze_symptoms(
        payload.symptoms
    )

    symptom_log = SymptomLog(
        mother_id=mother.id,

        pregnancy_id=(
            pregnancy.id
            if pregnancy
            else None
        ),

        symptoms=json.dumps(
            payload.symptoms,
            ensure_ascii=False,
        ),

        notes=payload.notes,

        triage_level=analysis[
            "triage_level"
        ],

        ai_explanation=analysis[
            "explanation"
        ],

        precautions=json.dumps(
            analysis["precautions"],
            ensure_ascii=False,
        ),

        doctor_review_required=analysis[
            "doctor_review_required"
        ],
    )

    db.add(symptom_log)
    db.commit()
    db.refresh(symptom_log)

    return {
        "message": (
            "Symptom assessment completed."
        ),

        "symptom_log_id":
            symptom_log.id,

        "triage": {
            "level":
                analysis["triage_level"],

            "matched_flags":
                analysis["matched_flags"],

            "explanation":
                analysis["explanation"],

            "precautions":
                analysis["precautions"],

            "doctor_review_required":
                analysis[
                    "doctor_review_required"
                ],

            "analysis_source":
                analysis[
                    "analysis_source"
                ],

            "ai_status":
                analysis["ai_status"],

            "disclaimer":
                analysis["disclaimer"],
        },
    }


@router.get("/history")
def symptom_history(
    db: Session = Depends(get_db),

    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_logged_in_mother(
        db,
        user,
    )

    logs = db.scalars(
        select(SymptomLog)
        .where(
            SymptomLog.mother_id
            == mother.id
        )
        .order_by(
            SymptomLog.created_at.desc()
        )
    ).all()

    return [
        {
            "id": item.id,

            "symptoms": (
                json.loads(
                    item.symptoms
                )
                if item.symptoms
                else []
            ),

            "notes":
                item.notes,

            "triage_level":
                item.triage_level,

            "explanation":
                item.ai_explanation,

            "precautions": (
                json.loads(
                    item.precautions
                )
                if item.precautions
                else []
            ),

            "doctor_review_required":
                item.doctor_review_required,

            "created_at":
                item.created_at,
        }

        for item in logs
    ]