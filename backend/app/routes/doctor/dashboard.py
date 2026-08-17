from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.referral import Referral
from app.models.report import Report
from app.models.user import User
from app.services.anc_service import calculate_pregnancy_week


router = APIRouter(
    prefix="/api/doctor",
    tags=["Doctor"],
)


@router.get("/dashboard")
def doctor_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("doctor")),
):

    active_patients = db.scalar(
        select(func.count())
        .select_from(Pregnancy)
        .where(Pregnancy.status == "active")
    ) or 0

    high_risk = db.scalar(
        select(func.count())
        .select_from(Pregnancy)
        .where(
            Pregnancy.status == "active",
            func.lower(Pregnancy.current_risk_level) == "high",
        )
    ) or 0

    pending_referrals = db.scalar(
        select(func.count())
        .select_from(Referral)
        .where(Referral.status != "closed")
    ) or 0

    reports_pending = db.scalar(
        select(func.count())
        .select_from(Report)
        .where(Report.doctor_review_required.is_(True))
    ) or 0

    high_risk_rows = db.execute(
        select(Pregnancy, Mother)
        .join(
            Mother,
            Pregnancy.mother_id == Mother.id,
        )
        .where(
            Pregnancy.status == "active",
            func.lower(
                Pregnancy.current_risk_level
            ) == "high",
        )
        .order_by(
            Pregnancy.created_at.desc()
        )
        .limit(8)
    ).all()

    report_rows = db.execute(
        select(Report, Mother)
        .join(
            Mother,
            Report.mother_id == Mother.id,
        )
        .where(
            Report.doctor_review_required.is_(True)
        )
        .order_by(
            Report.created_at.desc()
        )
        .limit(5)
    ).all()

    return {
        "stats": {
            "active_patients": active_patients,
            "high_risk": high_risk,
            "pending_referrals": pending_referrals,
            "reports_pending": reports_pending,
        },

        "high_risk_queue": [
            {
                "mother_id": mother.id,
                "pregnancy_id": pregnancy.id,
                "mother_name": mother.full_name,
                "phone": mother.phone,
                "ward_id": mother.ward_id,
                "week": calculate_pregnancy_week(
                    pregnancy.lmp
                ),
                "edd": pregnancy.edd,
                "risk_level":
                    pregnancy.current_risk_level,
            }
            for pregnancy, mother
            in high_risk_rows
        ],

        "reports_pending": [
            {
                "report_id": report.id,
                "mother_id": mother.id,
                "mother_name": mother.full_name,
                "filename":
                    report.original_filename,
                "urgency":
                    report.urgency_level,
                "status":
                    report.status,
                "created_at":
                    report.created_at,
            }
            for report, mother
            in report_rows
        ],
    }