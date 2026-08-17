"""
Synthetic/demo logistic model.

This is intentionally NOT a clinical model. Coefficients are fixed demo
coefficients representing a logistic-regression-style scoring component so
the hackathon can demonstrate a hybrid rules + ML architecture without real
patient training data.
"""

from math import exp

# Synthetic-demo coefficients only.
_INTERCEPT = -5.2
_COEF = {
    "age_risk": 1.10,
    "sbp_norm": 1.35,
    "dbp_norm": 1.10,
    "hb_low": 1.15,
    "sugar_norm": 0.55,
    "parity_risk": 0.70,
    "previous": 1.25,
}

def _sigmoid(x: float) -> float:
    if x >= 0:
        z = exp(-x)
        return 1.0 / (1.0 + z)
    z = exp(x)
    return z / (1.0 + z)

def predict_probability(
    *,
    age: int,
    systolic_bp: int | None,
    diastolic_bp: int | None,
    hemoglobin: float | None,
    blood_sugar: float | None,
    parity: int,
    previous_complications: bool,
) -> float:
    sbp = systolic_bp if systolic_bp is not None else 120
    dbp = diastolic_bp if diastolic_bp is not None else 80
    hb = hemoglobin if hemoglobin is not None else 11.5
    sugar = blood_sugar if blood_sugar is not None else 100

    features = {
        "age_risk": 1.0 if age < 18 or age > 35 else 0.0,
        "sbp_norm": max(0.0, (sbp - 120) / 20.0),
        "dbp_norm": max(0.0, (dbp - 80) / 15.0),
        "hb_low": max(0.0, (11.0 - hb) / 2.0),
        "sugar_norm": max(0.0, (sugar - 100) / 60.0),
        "parity_risk": 1.0 if parity >= 5 else 0.0,
        "previous": 1.0 if previous_complications else 0.0,
    }

    logit = _INTERCEPT
    for key, value in features.items():
        logit += _COEF[key] * value

    return round(_sigmoid(logit), 4)
