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
from app.models.report import Report
from app.models.user import User


router = APIRouter(
    prefix="/api/doctor/reports",
    tags=["Doctor - Reports"],
)


@router.get("")
def list_reports(
    db: Session = Depends(get_db),

    _: User = Depends(
        require_roles("doctor")
    ),
):

    rows = db.execute(
        select(Report, Mother)
        .join(
            Mother,
            Report.mother_id == Mother.id,
        )
        .order_by(
            Report.created_at.desc()
        )
    ).all()

    return [
        {
            "report_id": report.id,

            "mother_id": mother.id,
            "mother_name":
                mother.full_name,

            "filename":
                report.original_filename,

            "summary":
                report.ai_summary,

            "findings":
                report.ai_findings,

            "precautions":
                report.ai_precautions,

            "urgency":
                report.urgency_level,

            "doctor_review_required":
                report.doctor_review_required,

            "status":
                report.status,

            "created_at":
                report.created_at,
        }

        for report, mother
        in rows
    ]


@router.patch("/{report_id}/review")
def mark_report_reviewed(
    report_id: int,

    db: Session = Depends(get_db),

    _: User = Depends(
        require_roles("doctor")
    ),
):

    report = db.get(
        Report,
        report_id,
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    report.doctor_review_required = False
    report.status = "reviewed"

    db.commit()

    return {
        "message":
            "Report marked as reviewed.",

        "report_id":
            report.id,

        "status":
            report.status,
    }