import json

from app.config import settings


RED_FLAG_KEYWORDS = {
    "vaginal bleeding",
    "heavy bleeding",
    "bleeding",
    "seizure",
    "convulsion",
    "fits",
    "unconscious",
    "fainting",
    "severe abdominal pain",
    "severe stomach pain",
    "severe belly pain",
    "severe headache",
    "blurred vision",
    "vision changes",
    "seeing spots",
    "difficulty breathing",
    "shortness of breath",
    "chest pain",
    "fluid leaking",
    "water broke",
    "water breaking",
    "no fetal movement",
    "no baby movement",
    "reduced fetal movement",
    "reduced baby movement",
}


YELLOW_FLAG_KEYWORDS = {
    "fever",
    "persistent vomiting",
    "vomiting",
    "swelling",
    "swollen hands",
    "swollen face",
    "headache",
    "dizziness",
    "painful urination",
    "burning urination",
    "persistent nausea",
}


def normalize(value: str) -> str:
    return value.strip().lower()


def contains_keyword(
    symptoms: list[str],
    keywords: set[str],
) -> list[str]:

    matched = []

    for symptom in symptoms:
        normalized = normalize(symptom)

        for keyword in keywords:
            if keyword in normalized:
                matched.append(symptom)
                break

    return matched


def rule_based_triage(symptoms: list[str]) -> dict:

    red_matches = contains_keyword(
        symptoms,
        RED_FLAG_KEYWORDS,
    )

    yellow_matches = contains_keyword(
        symptoms,
        YELLOW_FLAG_KEYWORDS,
    )

    if red_matches:
        return {
            "triage_level": "red",
            "matched_flags": red_matches,
            "explanation": (
                "One or more reported symptoms match pregnancy "
                "warning-sign rules that require urgent professional assessment."
            ),
            "precautions": [
                "Seek urgent in-person medical evaluation.",
                "Do not delay care while waiting for an AI response.",
                "Keep pregnancy records and current prescriptions available.",
                "Do not start, stop, or change medicines based on automated guidance.",
            ],
            "doctor_review_required": True,
        }

    if yellow_matches:
        return {
            "triage_level": "yellow",
            "matched_flags": yellow_matches,
            "explanation": (
                "One or more symptoms may need timely review by a "
                "healthcare professional, especially if they persist or worsen."
            ),
            "precautions": [
                "Contact your healthcare professional for guidance.",
                "Continue monitoring your symptoms.",
                "Keep your scheduled ANC appointments.",
                "Seek urgent care if symptoms become severe.",
            ],
            "doctor_review_required": True,
        }

    return {
        "triage_level": "green",
        "matched_flags": [],
        "explanation": (
            "No predefined urgent warning-sign rule was matched "
            "by the symptoms entered."
        ),
        "precautions": [
            "Continue monitoring how you feel.",
            "Keep routine ANC appointments.",
            "Contact a healthcare professional if symptoms persist or worsen.",
        ],
        "doctor_review_required": False,
    }


def ai_is_configured() -> bool:
    return bool(settings.gemini_api_key.strip())


def generate_ai_explanation(
    symptoms: list[str],
    rule_result: dict,
) -> dict:

    if not ai_is_configured():
        return {
            **rule_result,
            "analysis_source": "safety_rules",
            "ai_status": "pending_ai",
        }

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(
            api_key=settings.gemini_api_key
        )

        prompt = f"""
You are CareConnect AI, a maternal-health decision-support assistant.

The safety engine has already classified these symptoms.

Symptoms:
{json.dumps(symptoms)}

Triage level:
{rule_result["triage_level"]}

Matched flags:
{json.dumps(rule_result["matched_flags"])}

IMPORTANT:
- Never change the triage level.
- Do not diagnose.
- Do not prescribe medicines.
- Do not change medicine dosage.
- Do not recommend stopping prescribed medicines.
- Explain the result in simple language.
- If RED, clearly advise urgent in-person medical evaluation.

Return JSON only:

{{
  "explanation": "simple explanation",
  "precautions": [
    "precaution 1",
    "precaution 2"
  ]
}}
"""

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )

        if not response.text:
            raise RuntimeError("Empty AI response.")

        ai_result = json.loads(response.text)

        return {
            **rule_result,
            "explanation": ai_result.get(
                "explanation",
                rule_result["explanation"],
            ),
            "precautions": ai_result.get(
                "precautions",
                rule_result["precautions"],
            ),
            "analysis_source": "safety_rules_plus_gemini",
            "ai_status": "completed",
        }

    except Exception:
        return {
            **rule_result,
            "analysis_source": "safety_rules",
            "ai_status": "ai_unavailable",
        }


def analyze_symptoms(symptoms: list[str]) -> dict:

    rule_result = rule_based_triage(symptoms)

    result = generate_ai_explanation(
        symptoms,
        rule_result,
    )

    result["disclaimer"] = (
        "CareConnect provides decision-support only. "
        "This assessment is not a diagnosis or prescription."
    )

    return result