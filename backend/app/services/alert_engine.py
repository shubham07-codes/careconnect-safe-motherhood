from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.anc_visit import ANCVisit
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.referral import Referral
from app.models.report import Report
from app.models.symptom import SymptomLog


def create_alert_if_missing(
    db: Session,
    *,
    mother_id: int,
    pregnancy_id: int | None,
    alert_type: str,
    severity: str,
    title: str,
    message: str,
    action_text: str,
    dedupe_key: str,
    target_role: str,
) -> bool:

    existing = db.scalar(
        select(Alert).where(
            Alert.dedupe_key == dedupe_key
        )
    )

    if existing:
        return False

    alert = Alert(
        mother_id=mother_id,
        pregnancy_id=pregnancy_id,
        alert_type=alert_type,
        severity=severity,
        title=title,
        message=message,
        action_text=action_text,
        dedupe_key=dedupe_key,
        target_role=target_role,
    )

    db.add(alert)

    return True


def generate_alerts_for_mother(
    db: Session,
    mother: Mother,
) -> int:

    created = 0

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

    if pregnancy is None:
        return 0

    # --------------------------------------------------
    # 1. HIGH-RISK PREGNANCY
    # --------------------------------------------------

    if pregnancy.current_risk_level == "high":

        if create_alert_if_missing(
            db,
            mother_id=mother.id,
            pregnancy_id=pregnancy.id,
            alert_type="high_risk",
            severity="red",
            title="High-Risk Pregnancy Alert",
            message=(
                "Your CareConnect assessment currently "
                "flags this pregnancy as high risk. "
                "Professional follow-up is important."
            ),
            action_text="Contact your healthcare team",
            dedupe_key=(
                f"high-risk:"
                f"{pregnancy.id}"
            ),
            target_role="mother",
        ):
            created += 1

        if create_alert_if_missing(
            db,
            mother_id=mother.id,
            pregnancy_id=pregnancy.id,
            alert_type="high_risk_followup",
            severity="red",
            title="Priority Mother Follow-Up",
            message=(
                f"{mother.full_name} is currently "
                "classified as high risk and should "
                "be prioritized for follow-up."
            ),
            action_text="Review case",
            dedupe_key=(
                f"asha-high-risk:"
                f"{pregnancy.id}"
            ),
            target_role="field_worker",
        ):
            created += 1

    # --------------------------------------------------
    # 2. MISSED ANC
    # --------------------------------------------------

    missed_visits = db.scalars(
        select(ANCVisit).where(
            ANCVisit.pregnancy_id == pregnancy.id,
            ANCVisit.completed_date.is_(None),
            ANCVisit.scheduled_date < date.today(),
        )
    ).all()

    for visit in missed_visits:

        days_overdue = (
            date.today()
            - visit.scheduled_date
        ).days

        if create_alert_if_missing(
            db,
            mother_id=mother.id,
            pregnancy_id=pregnancy.id,
            alert_type="missed_anc",
            severity="yellow",
            title="ANC Visit Missed",
            message=(
                f"ANC Visit {visit.visit_number} "
                f"was due on {visit.scheduled_date}. "
                f"It is currently {days_overdue} "
                "day(s) overdue."
            ),
            action_text="Contact your ASHA/ANM or clinic",
            dedupe_key=(
                f"missed-anc:"
                f"{visit.id}"
            ),
            target_role="mother",
        ):
            created += 1

        if create_alert_if_missing(
            db,
            mother_id=mother.id,
            pregnancy_id=pregnancy.id,
            alert_type="missed_anc_followup",
            severity="yellow",
            title="Missed ANC Follow-Up",
            message=(
                f"{mother.full_name} missed "
                f"ANC Visit {visit.visit_number}."
            ),
            action_text="Schedule follow-up",
            dedupe_key=(
                f"asha-missed-anc:"
                f"{visit.id}"
            ),
            target_role="field_worker",
        ):
            created += 1

    # --------------------------------------------------
    # 3. LATEST SYMPTOM TRIAGE
    # --------------------------------------------------

    latest_symptom = db.scalar(
        select(SymptomLog)
        .where(
            SymptomLog.mother_id == mother.id
        )
        .order_by(
            SymptomLog.created_at.desc()
        )
    )

    if (
        latest_symptom
        and latest_symptom.triage_level
        in {"yellow", "red"}
    ):

        severity = (
            "red"
            if latest_symptom.triage_level == "red"
            else "yellow"
        )

        if create_alert_if_missing(
            db,
            mother_id=mother.id,
            pregnancy_id=pregnancy.id,
            alert_type="symptom_triage",
            severity=severity,
            title="Symptom Review Alert",
            message=(
                latest_symptom.ai_explanation
                or "Your recent symptom check may "
                   "require professional review."
            ),
            action_text=(
                "Seek urgent medical evaluation"
                if severity == "red"
                else "Contact your healthcare professional"
            ),
            dedupe_key=(
                f"symptom:"
                f"{latest_symptom.id}:"
                f"{severity}"
            ),
            target_role="mother",
        ):
            created += 1

        if create_alert_if_missing(
            db,
            mother_id=mother.id,
            pregnancy_id=pregnancy.id,
            alert_type="symptom_followup",
            severity=severity,
            title="Mother Needs Symptom Follow-Up",
            message=(
                f"{mother.full_name} has a "
                f"{severity.upper()} symptom triage result."
            ),
            action_text="Review mother",
            dedupe_key=(
                f"asha-symptom:"
                f"{latest_symptom.id}:"
                f"{severity}"
            ),
            target_role="field_worker",
        ):
            created += 1

    # --------------------------------------------------
    # 4. LATEST REPORT
    # --------------------------------------------------

    latest_report = db.scalar(
        select(Report)
        .where(
            Report.mother_id == mother.id
        )
        .order_by(
            Report.created_at.desc()
        )
    )

    if (
        latest_report
        and latest_report.urgency_level
        in {"yellow", "red"}
    ):

        severity = latest_report.urgency_level

        if create_alert_if_missing(
            db,
            mother_id=mother.id,
            pregnancy_id=pregnancy.id,
            alert_type="report_review",
            severity=severity,
            title="Medical Report Review",
            message=(
                latest_report.ai_summary
                or "Your uploaded report requires review."
            ),
            action_text="Review with your doctor",
            dedupe_key=(
                f"report:"
                f"{latest_report.id}:"
                f"{severity}"
            ),
            target_role="mother",
        ):
            created += 1

    # --------------------------------------------------
    # 5. OPEN REFERRALS
    # --------------------------------------------------

    referrals = db.scalars(
        select(Referral).where(
            Referral.pregnancy_id == pregnancy.id,
            Referral.status.in_(
                [
                    "pending",
                    "accepted",
                    "reached_facility",
                ]
            ),
        )
    ).all()

    for referral in referrals:

        if create_alert_if_missing(
            db,
            mother_id=mother.id,
            pregnancy_id=pregnancy.id,
            alert_type="referral",
            severity="yellow",
            title="Referral Follow-Up",
            message=(
                "A maternal-care referral is currently "
                f"in '{referral.status}' status."
            ),
            action_text="Follow referral instructions",
            dedupe_key=(
                f"referral:"
                f"{referral.id}:"
                f"{referral.status}"
            ),
            target_role="mother",
        ):
            created += 1

    db.commit()

    return created