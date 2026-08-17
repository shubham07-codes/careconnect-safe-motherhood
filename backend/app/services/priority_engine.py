from datetime import date
from app.models.pregnancy import Pregnancy
from app.models.referral import Referral

def calculate_care_priority(
    *,
    pregnancy: Pregnancy,
    days_overdue: int,
    open_referral: Referral | None,
) -> dict:
    score = 0
    reasons: list[str] = []

    if pregnancy.current_risk_level == "high":
        score += 50
        reasons.append("High clinical risk flag.")
    elif pregnancy.current_risk_level == "moderate":
        score += 25
        reasons.append("Moderate clinical risk flag.")

    overdue_points = min(max(days_overdue, 0), 30)
    score += overdue_points
    if days_overdue > 0:
        reasons.append(f"ANC follow-up overdue by {days_overdue} day(s).")

    if open_referral is not None:
        score += 15
        reasons.append(f"Open referral status: {open_referral.status}.")

    days_to_edd = (pregnancy.edd - date.today()).days
    if 0 <= days_to_edd <= 28:
        score += 10
        reasons.append("Estimated due date is within 28 days.")

    score = min(score, 100)

    if score >= 70:
        priority = "urgent"
    elif score >= 40:
        priority = "high"
    elif score >= 20:
        priority = "medium"
    else:
        priority = "routine"

    return {
        "priority_score": score,
        "priority": priority,
        "reasons": reasons or ["Routine operational follow-up."],
    }
