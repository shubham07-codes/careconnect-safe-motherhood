import json
from pypdf import PdfReader

from app.config import settings


def extract_pdf_text(file_path: str) -> str:
    reader = PdfReader(file_path)

    pages = []

    for page in reader.pages:
        text = page.extract_text() or ""

        if text.strip():
            pages.append(text.strip())

    return "\n\n".join(pages)


def ai_is_configured() -> bool:
    return bool(settings.gemini_api_key.strip())


def pending_ai_analysis() -> dict:
    return {
        "summary": (
            "Report uploaded successfully. "
            "AI analysis will become available once the AI service is configured."
        ),
        "findings": [],
        "precautions": [
            "Continue following instructions already given by your healthcare professional.",
            "Do not start, stop, or change medicines based only on automated guidance.",
            "Keep the original report available for doctor review.",
        ],
        "urgency_level": "unassessed",
        "doctor_review_required": True,
        "analysis_status": "pending_ai",
        "analysis_source": "fallback",
        "disclaimer": (
            "CareConnect AI provides decision-support only. "
            "It does not diagnose conditions or independently prescribe treatment."
        ),
    }


def analyze_report_text(report_text: str) -> dict:
    if not report_text.strip():
        return {
            "summary": "No readable text could be extracted from this PDF.",
            "findings": [],
            "precautions": [
                "Please have the original report reviewed by a healthcare professional."
            ],
            "urgency_level": "unassessed",
            "doctor_review_required": True,
            "analysis_status": "text_not_detected",
            "analysis_source": "fallback",
            "disclaimer": (
                "CareConnect AI provides decision-support only."
            ),
        }

    # Gemini key baad me add kar sakte ho.
    if not ai_is_configured():
        return pending_ai_analysis()

    from google import genai
    from google.genai import types

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    prompt = f"""
You are CareConnect AI, a maternal-health decision-support assistant.

Analyze the following pregnancy-related medical report.

SAFETY:
- Do not diagnose disease.
- Do not prescribe medicines.
- Do not change medicine dosage.
- Do not recommend stopping prescribed medicine.
- Explain findings in simple language.
- Highlight findings that may need clinician review.
- Give conservative precautions and next steps.
- If uncertain, recommend professional review.

Return JSON only:

{{
  "summary": "simple explanation",
  "findings": ["finding"],
  "precautions": ["precaution"],
  "urgency_level": "green | yellow | red",
  "doctor_review_required": true
}}

REPORT:
{report_text[:20000]}
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
        raise RuntimeError("AI returned an empty response.")

    result = json.loads(response.text)

    return {
        "summary": result.get("summary", "Report analyzed."),
        "findings": result.get("findings", []),
        "precautions": result.get("precautions", []),
        "urgency_level": result.get("urgency_level", "yellow"),
        "doctor_review_required": bool(
            result.get("doctor_review_required", True)
        ),
        "analysis_status": "completed",
        "analysis_source": "gemini",
        "disclaimer": (
            "AI-assisted decision support only. "
            "Doctor review remains important."
        ),
    }


def analyze_report(file_path: str) -> dict:
    extracted_text = extract_pdf_text(file_path)

    analysis = analyze_report_text(extracted_text)

    return {
        "extracted_text": extracted_text,
        **analysis,
    }