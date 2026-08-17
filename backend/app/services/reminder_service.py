def reminder_text(
    language: str,
    mother_name: str,
    visit_date: str,
    missed: bool,
) -> str:
    lang = (language or "english").lower()

    if lang == "marathi":
        if missed:
            return (
                f"{mother_name}, तुमची ANC भेट राहिली आहे. "
                "कृपया तुमच्या आरोग्य कर्मचाऱ्याशी संपर्क करा."
            )
        return f"{mother_name}, तुमची पुढील ANC भेट {visit_date} रोजी आहे."

    if lang == "hindi":
        if missed:
            return (
                f"{mother_name}, आपकी ANC विज़िट छूट गई है। "
                "कृपया अपने स्वास्थ्य कार्यकर्ता से संपर्क करें।"
            )
        return f"{mother_name}, आपकी अगली ANC विज़िट {visit_date} को है।"

    if missed:
        return (
            f"{mother_name}, your ANC visit was missed. "
            "Please contact your health worker."
        )
    return f"{mother_name}, your next ANC visit is on {visit_date}."
