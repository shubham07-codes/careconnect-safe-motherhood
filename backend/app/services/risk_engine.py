import json
from datetime import date
from app.ai.risk_model import predict_probability

def calculate_age(dob: date | None, on_date: date) -> int:
    if dob is None:
        return 25
    return on_date.year - dob.year - (
        (on_date.month, on_date.day) < (dob.month, dob.day)
    )

def assess_risk(
    *,
    maternal_age: int,
    systolic_bp: int | None,
    diastolic_bp: int | None,
    hemoglobin: float | None,
    blood_sugar: float | None,
    parity: int,
    previous_complications: bool,
) -> dict:
    """
    Transparent hackathon decision-support rules + synthetic ML score.

    These rules are NOT a replacement for clinician assessment.
    Blood-sugar interpretation is deliberately treated as contextual.
    """
    reasons: list[str] = []
    rule_score = 0
    urgent_review = False

    if maternal_age < 18 or maternal_age > 35:
        reasons.append("Maternal age triggers the configured demo risk rule.")
        rule_score += 12

    if systolic_bp is not None and systolic_bp >= 140:
        reasons.append("Elevated systolic blood-pressure reading.")
        rule_score += 28

    if diastolic_bp is not None and diastolic_bp >= 90:
        reasons.append("Elevated diastolic blood-pressure reading.")
        rule_score += 28

    if (
        (systolic_bp is not None and systolic_bp >= 160)
        or (diastolic_bp is not None and diastolic_bp >= 110)
    ):
        reasons.append("Very high blood-pressure reading: urgent clinician review flag.")
        urgent_review = True

    if hemoglobin is not None and hemoglobin < 11:
        reasons.append("Haemoglobin is below the configured pregnancy anaemia screening threshold.")
        rule_score += 20

    # Blood-sugar meaning depends strongly on test type/timing.
    if blood_sugar is not None and blood_sugar >= 200:
        reasons.append(
            "Very elevated blood-sugar value recorded; interpretation requires test context and clinician review."
        )
        rule_score += 15

    if parity >= 5:
        reasons.append("High parity recorded in the configured demo rule set.")
        rule_score += 8

    if previous_complications:
        reasons.append("Previous pregnancy complication recorded.")
        rule_score += 24

    rule_score = min(rule_score, 100)

    ml_probability = predict_probability(
        age=maternal_age,
        systolic_bp=systolic_bp,
        diastolic_bp=diastolic_bp,
        hemoglobin=hemoglobin,
        blood_sugar=blood_sugar,
        parity=parity,
        previous_complications=previous_complications,
    )

    combined_score = round(
        0.65 * rule_score + 0.35 * (ml_probability * 100),
        2,
    )

    if urgent_review or combined_score >= 55:
        risk_level = "high"
    elif combined_score >= 25:
        risk_level = "moderate"
    else:
        risk_level = "low"

    if not reasons:
        reasons.append("No configured rule-based high-risk factor was triggered.")

    return {
        "rule_score": rule_score,
        "ml_probability": ml_probability,
        "combined_score": combined_score,
        "risk_level": risk_level,
        "urgent_review": urgent_review,
        "reasons": reasons,
        "reasons_json": json.dumps(reasons),
        "model_source": "synthetic_demo_logistic_model_v1",
        "disclaimer": (
            "Hackathon decision support only. This result is not a diagnosis "
            "and must not be used to prescribe treatment."
        ),
    }
