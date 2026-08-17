import json

from app.config import settings


def fallback_doctor_prep(context: dict) -> dict:

    questions = []
    documents = []
    concerns = []
    checklist = []

    pregnancy = context.get("pregnancy")
    latest_report = context.get("latest_report")
    latest_symptom = context.get("latest_symptom")
    medicines = context.get("medicines", [])
    next_anc = context.get("next_anc")

    # -------------------------------
    # Pregnancy questions
    # -------------------------------

    if pregnancy:
        week = pregnancy.get("week")
        risk = pregnancy.get("risk_level")

        questions.append(
            f"Is my pregnancy progressing normally for week {week}?"
        )

        questions.append(
            "Are there any tests or scans I should complete before my next visit?"
        )

        if risk in {"moderate", "high"}:
            questions.append(
                f"My CareConnect risk level is {risk}. "
                "What should I monitor closely?"
            )

            concerns.append(
                f"Current CareConnect risk level: {risk}"
            )

    # -------------------------------
    # Symptom
    # -------------------------------

    if latest_symptom:

        level = latest_symptom.get(
            "triage_level"
        )

        questions.append(
            "Should my recently reported symptoms "
            "change my care plan?"
        )

        concerns.append(
            f"Recent symptom triage: {level}"
        )

    # -------------------------------
    # Report
    # -------------------------------

    if latest_report:

        questions.append(
            "Can you explain the important findings "
            "in my latest medical report?"
        )

        documents.append(
            "Latest uploaded medical report"
        )

        if latest_report.get(
            "doctor_review_required"
        ):
            concerns.append(
                "Latest report marked for doctor review"
            )

    # -------------------------------
    # Medicines
    # -------------------------------

    if medicines:

        questions.append(
            "Should I continue all currently prescribed "
            "medicines in the same way?"
        )

        documents.append(
            "Current prescription / medicine list"
        )

    # -------------------------------
    # ANC
    # -------------------------------

    if next_anc:

        checklist.append(
            f"Next ANC: {next_anc.get('scheduled_date')}"
        )

    documents.extend([
        "ANC records",
        "Previous prescriptions",
        "Available blood test / scan reports",
    ])

    checklist.extend([
        "Carry all recent medical reports",
        "Carry current prescription",
        "Write down new symptoms before the visit",
        "Ask the doctor to explain any medicine changes",
        "Confirm the next ANC / follow-up date",
    ])

    if not concerns:
        concerns.append(
            "No major CareConnect alert detected from available data."
        )

    return {
        "questions": questions[:6],
        "documents": list(dict.fromkeys(documents)),
        "concerns": concerns,
        "checklist": checklist,
        "source": "careconnect_rules",
    }


def generate_doctor_prep(
    context: dict,
    extra_concern: str | None = None,
) -> dict:

    fallback = fallback_doctor_prep(
        context
    )

    if extra_concern:
        fallback["questions"].append(
            f"Please discuss this concern: {extra_concern}"
        )

    # Gemini key baad me add hogi
    if not settings.gemini_api_key.strip():
        return fallback

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(
            api_key=settings.gemini_api_key
        )

        prompt = f"""
You are CareConnect Doctor Prep AI.

Prepare an expecting mother for her upcoming
doctor consultation.

CARECONNECT CONTEXT:
{json.dumps(context, default=str)}

EXTRA CONCERN:
{extra_concern}

Create:
1. 3 to 6 important questions to ask the doctor.
2. Documents/reports to carry.
3. Important concerns that should be mentioned.
4. A short visit checklist.

SAFETY:
- Do not diagnose.
- Do not prescribe medicines.
- Do not change medication.
- Do not invent missing medical facts.
- Preserve professional doctor decision-making.
- Keep language simple.

Return JSON only:

{{
  "questions": [],
  "documents": [],
  "concerns": [],
  "checklist": []
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
            return fallback

        result = json.loads(
            response.text
        )

        return {
            "questions": result.get(
                "questions",
                fallback["questions"],
            ),
            "documents": result.get(
                "documents",
                fallback["documents"],
            ),
            "concerns": result.get(
                "concerns",
                fallback["concerns"],
            ),
            "checklist": result.get(
                "checklist",
                fallback["checklist"],
            ),
            "source": "gemini",
        }

    except Exception:
        return fallback