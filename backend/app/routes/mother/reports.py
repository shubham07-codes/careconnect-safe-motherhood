import json
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.report import Report
from app.models.user import User
from app.services.report_analyzer import analyze_report


router = APIRouter(
    prefix="/api/mother/reports",
    tags=["Mother - AI Reports"],
)


UPLOAD_DIR = (
    Path(__file__).resolve().parents[3]
    / "uploads"
    / "reports"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
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


@router.post("/upload")
def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("mother")),
):

    mother = get_logged_in_mother(db, user)

    pregnancy = db.scalar(
        select(Pregnancy)
        .where(
            Pregnancy.mother_id == mother.id,
            Pregnancy.status == "active",
        )
        .order_by(Pregnancy.created_at.desc())
    )

    suffix = Path(file.filename or "").suffix.lower()

    if suffix != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Currently only PDF reports are supported.",
        )

    unique_name = f"{uuid.uuid4().hex}{suffix}"
    saved_path = UPLOAD_DIR / unique_name

    try:
        with saved_path.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

        analysis = analyze_report(
            str(saved_path)
        )

        report = Report(
            mother_id=mother.id,

            pregnancy_id=(
                pregnancy.id
                if pregnancy
                else None
            ),

            original_filename=(
                file.filename
                or unique_name
            ),

            stored_path=str(saved_path),

            mime_type=file.content_type,

            extracted_text=analysis[
                "extracted_text"
            ],

            ai_summary=analysis[
                "summary"
            ],

            ai_findings=json.dumps(
                analysis["findings"],
                ensure_ascii=False,
            ),

            ai_precautions=json.dumps(
                analysis["precautions"],
                ensure_ascii=False,
            ),

            urgency_level=analysis[
                "urgency_level"
            ],

            doctor_review_required=analysis[
                "doctor_review_required"
            ],

            status=analysis[
                "analysis_status"
            ],
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        return {
            "message": "Report uploaded successfully.",

            "report_id": report.id,

            "filename": report.original_filename,

            "analysis": {
                "summary": analysis["summary"],
                "findings": analysis["findings"],
                "precautions": analysis["precautions"],
                "urgency_level": analysis["urgency_level"],
                "doctor_review_required":
                    analysis["doctor_review_required"],
                "analysis_status":
                    analysis["analysis_status"],
                "analysis_source":
                    analysis["analysis_source"],
                "disclaimer":
                    analysis["disclaimer"],
            },
        }

    except Exception as error:
        db.rollback()

        if saved_path.exists():
            saved_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Report processing failed: {error}",
        )


@router.get("")
def get_reports(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("mother")),
):

    mother = get_logged_in_mother(
        db,
        user,
    )

    reports = db.scalars(
        select(Report)
        .where(
            Report.mother_id == mother.id
        )
        .order_by(
            Report.created_at.desc()
        )
    ).all()

    return [
        {
            "report_id": report.id,
            "filename": report.original_filename,
            "status": report.status,
            "urgency_level": report.urgency_level,
            "doctor_review_required":
                report.doctor_review_required,
            "summary": report.ai_summary,

            "findings": (
                json.loads(report.ai_findings)
                if report.ai_findings
                else []
            ),

            "precautions": (
                json.loads(report.ai_precautions)
                if report.ai_precautions
                else []
            ),

            "created_at": report.created_at,
        }

        for report in reports
    ]