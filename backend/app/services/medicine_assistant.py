from app.config import settings


def fallback_explanation(item: dict) -> dict:
    return {
        "explanation": (
            f"This medicine was prescribed by your doctor as "
            f"{item['medicine_name']} - {item['dosage']}, "
            f"{item['frequency']}."
        ),
        "instructions": (
            item.get("timing_instructions")
            or "Follow the timing given by your doctor."
        ),
        "source": "doctor_prescription",
        "disclaimer": (
            "Do not start, stop, change, or adjust the dose "
            "without consulting your healthcare professional."
        ),
    }


def explain_medicine(item: dict) -> dict:

    if not settings.gemini_api_key.strip():
        return fallback_explanation(item)

    try:
        from google import genai

        client = genai.Client(
            api_key=settings.gemini_api_key
        )

        prompt = f"""
You are CareConnect AI.

Explain this DOCTOR-PRESCRIBED medicine to a pregnant mother
in simple language.

Medicine:
{item["medicine_name"]}

Dose:
{item["dosage"]}

Frequency:
{item["frequency"]}

Doctor instructions:
{item.get("timing_instructions")}

SAFETY:
- Do not diagnose.
- Do not prescribe another medicine.
- Do not change the dose.
- Do not change frequency.
- Do not recommend stopping medication.
- Do not invent an indication if it is not known.
- Preserve the doctor's instructions.
- Keep answer short and easy to understand.

Explain only how to follow the existing prescription.
"""

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
        )

        if not response.text:
            return fallback_explanation(item)

        return {
            "explanation": response.text.strip(),

            "instructions": (
                item.get("timing_instructions")
                or "Follow your doctor's instructions."
            ),

            "source": "gemini",

            "disclaimer": (
                "CareConnect AI explains the doctor's prescription only. "
                "It does not independently prescribe or change medicines."
            ),
        }

    except Exception:
        return fallback_explanation(item)