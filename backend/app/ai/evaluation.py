from random import Random
from app.ai.risk_model import predict_probability

def synthetic_metrics(samples: int = 1000) -> dict:
    rng = Random(2026)

    tp = tn = fp = fn = 0

    for _ in range(samples):
        age = rng.randint(16, 42)
        sbp = rng.randint(90, 185)
        dbp = rng.randint(55, 120)
        hb = round(rng.uniform(7.0, 14.5), 1)
        sugar = round(rng.uniform(70, 240), 1)
        parity = rng.randint(0, 6)
        previous = bool(rng.randint(0, 1))

        # Synthetic ground truth, deliberately based on synthetic risk factors.
        latent = (
            1.0 * int(age < 18 or age > 35)
            + 1.6 * int(sbp >= 140)
            + 1.5 * int(dbp >= 90)
            + 1.1 * int(hb < 11)
            + 0.5 * int(sugar >= 200)
            + 0.6 * int(parity >= 5)
            + 1.2 * int(previous)
        )

        actual = latent >= 2.0

        probability = predict_probability(
            age=age,
            systolic_bp=sbp,
            diastolic_bp=dbp,
            hemoglobin=hb,
            blood_sugar=sugar,
            parity=parity,
            previous_complications=previous,
        )

        # Tuned low threshold to prioritize sensitivity in synthetic demo.
        predicted = probability >= 0.10

        if actual and predicted:
            tp += 1
        elif actual and not predicted:
            fn += 1
        elif not actual and predicted:
            fp += 1
        else:
            tn += 1

    sensitivity = tp / (tp + fn) if (tp + fn) else 0.0
    specificity = tn / (tn + fp) if (tn + fp) else 0.0

    return {
        "dataset": "synthetic_demo_only",
        "samples": samples,
        "sensitivity": round(sensitivity, 4),
        "specificity": round(specificity, 4),
        "tp": tp,
        "fn": fn,
        "tn": tn,
        "fp": fp,
        "warning": (
            "Synthetic validation is not clinical validation and must not be "
            "presented as real-world medical performance."
        ),
    }
