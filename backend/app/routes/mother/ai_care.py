from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles

from app.models.ai_chat import AIChatLog
from app.models.anc_visit import ANCVisit
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.report import Report
from app.models.symptom import SymptomLog
from app.models.user import User

from app.schemas.ai_chat import AIChatRequest

from app.services.anc_service import (
    calculate_pregnancy_week,
)

from app.services.care_assistant import (
    ask_careconnect_ai,
)


router = APIRouter(
    prefix="/api/mother/ai-care",
    tags=["Mother - AI Care Assistant"],
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
            detail="Mother profile is not linked to this account.",
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
            "pregnancy_number":
                pregnancy.pregnancy_number,
            "parity":
                pregnancy.parity,
            "previous_complications":
                pregnancy.previous_complications,
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

    return {
        "mother": {
            "name":
                mother.full_name,

            "preferred_language":
                mother.preferred_language,
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

                "urgency":
                    latest_report.urgency_level,

                "doctor_review_required":
                    latest_report.doctor_review_required,
            }
        ),

        "latest_symptom_triage": (
            None
            if latest_symptom is None
            else {
                "level":
                    latest_symptom.triage_level,

                "explanation":
                    latest_symptom.ai_explanation,

                "doctor_review_required":
                    latest_symptom.doctor_review_required,
            }
        ),
    }


@router.post("/ask")
def ask_ai(
    payload: AIChatRequest,

    db: Session = Depends(get_db),

    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_logged_in_mother(
        db,
        user,
    )

    context = build_context(
        db,
        mother,
    )

    result = ask_careconnect_ai(
        payload.question,
        context,
    )

    pregnancy_id = (
        context["pregnancy"]["pregnancy_id"]
        if context["pregnancy"]
        else None
    )

    log = AIChatLog(
        mother_id=mother.id,
        pregnancy_id=pregnancy_id,
        question=payload.question,
        answer=result["answer"],
        response_source=result["source"],
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "chat_id": log.id,
        "question": payload.question,
        "answer": result["answer"],
        "source": result["source"],
        "urgent": result["urgent"],
        "disclaimer": (
            "CareConnect AI provides decision-support "
            "and educational guidance only. "
            "It does not replace professional medical care."
        ),
    }


@router.get("/history")
def ai_history(
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
        select(AIChatLog)
        .where(
            AIChatLog.mother_id
            == mother.id
        )
        .order_by(
            AIChatLog.created_at.desc()
        )
        .limit(50)
    ).all()

    return [
        {
            "id": log.id,
            "question": log.question,
            "answer": log.answer,
            "source":
                log.response_source,
            "created_at":
                log.created_at,
        }
        for log in logs
    ]