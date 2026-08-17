from app.config import settings


RED_FLAG_TERMS = [
    "heavy bleeding",
    "vaginal bleeding",
    "severe headache",
    "blurred vision",
    "vision changes",
    "seizure",
    "convulsion",
    "difficulty breathing",
    "shortness of breath",
    "chest pain",
    "severe abdominal pain",
    "no baby movement",
    "reduced baby movement",
    "no fetal movement",
    "reduced fetal movement",
    "water broke",
    "fluid leaking",
]


def contains_red_flag(question: str) -> bool:
    text = question.lower()

    return any(
        term in text
        for term in RED_FLAG_TERMS
    )


def emergency_response() -> dict:
    return {
        "answer": (
            "Your message contains a pregnancy warning sign that may require "
            "urgent in-person medical assessment. Please seek urgent medical "
            "care or contact your healthcare professional immediately. "
            "Do not wait for an AI response before seeking care."
        ),
        "source": "safety_rules",
        "urgent": True,
    }


def fallback_answer(
    question: str,
    context: dict,
) -> dict:

    q = question.lower()

    pregnancy = context.get("pregnancy")
    next_anc = context.get("next_anc")

    if "pregnancy week" in q or "which week" in q or "mera week" in q:
        if pregnancy:
            return {
                "answer": (
                    f"You are currently around pregnancy week "
                    f"{pregnancy.get('week')}. "
                    f"Your expected delivery date is "
                    f"{pregnancy.get('edd')}."
                ),
                "source": "careconnect_data",
                "urgent": False,
            }

    if (
        "next anc" in q
        or "next visit" in q
        or "doctor kab" in q
    ):
        if next_anc:
            return {
                "answer": (
                    f"Your next ANC visit is scheduled for "
                    f"{next_anc.get('scheduled_date')} "
                    f"(Visit {next_anc.get('visit_number')})."
                ),
                "source": "careconnect_data",
                "urgent": False,
            }

        return {
            "answer": (
                "I could not find an upcoming ANC visit in your "
                "CareConnect record. Please confirm your schedule "
                "with your healthcare worker."
            ),
            "source": "careconnect_data",
            "urgent": False,
        }

    if "risk" in q:
        if pregnancy:
            return {
                "answer": (
                    f"Your current CareConnect risk level is "
                    f"{pregnancy.get('risk_level')}. "
                    "This is a decision-support indicator and not a diagnosis."
                ),
                "source": "careconnect_data",
                "urgent": False,
            }

    return {
        "answer": (
            "Your question has been received. The personalized AI response "
            "will become available when the CareConnect AI service is "
            "configured. You can still use pregnancy tracking, ANC schedules, "
            "risk assessment, reports and symptom triage."
        ),
        "source": "fallback",
        "urgent": False,
    }


def ask_careconnect_ai(
    question: str,
    context: dict,
) -> dict:

    if contains_red_flag(question):
        return emergency_response()

    if not settings.gemini_api_key.strip():
        return fallback_answer(
            question,
            context,
        )

    try:
        from google import genai

        client = genai.Client(
            api_key=settings.gemini_api_key
        )

        prompt = f"""
You are CareConnect AI, a maternal-health support assistant.

You are answering an expecting mother.

CARECONNECT CONTEXT:
{context}

USER QUESTION:
{question}

SAFETY RULES:
- Do not diagnose disease.
- Do not independently prescribe medicines.
- Do not recommend starting, stopping, or changing medication doses.
- Explain doctor-prescribed medicines only when information is available.
- Use simple, calm language.
- Use the stored CareConnect context where relevant.
- Do not invent missing medical information.
- If information is unavailable, clearly say so.
- Encourage professional medical review where appropriate.
- Never override deterministic CareConnect safety rules.
- Keep the response concise and useful.

Answer in simple language suitable for the mother.
"""

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
        )

        if not response.text:
            raise RuntimeError(
                "AI returned an empty response."
            )

        return {
            "answer": response.text.strip(),
            "source": "gemini",
            "urgent": False,
        }

    except Exception:
        return fallback_answer(
            question,
            context,
        )