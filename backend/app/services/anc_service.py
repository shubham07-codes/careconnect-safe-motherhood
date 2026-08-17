from datetime import date, timedelta
from app.models.anc_visit import ANCVisit

ANC_CONTACT_WEEKS = [12, 20, 26, 30, 34, 36, 38, 40]

def calculate_edd(lmp: date) -> date:
    return lmp + timedelta(days=280)

def calculate_pregnancy_week(lmp: date, on_date: date | None = None) -> int:
    selected = on_date or date.today()
    return max(0, (selected - lmp).days // 7)

def generate_anc_schedule(pregnancy_id: int, lmp: date) -> list[ANCVisit]:
    today = date.today()
    visits = []
    for visit_number, week in enumerate(ANC_CONTACT_WEEKS, start=1):
        scheduled_date = lmp + timedelta(weeks=week)
        visits.append(
            ANCVisit(
                pregnancy_id=pregnancy_id,
                visit_number=visit_number,
                scheduled_date=scheduled_date,
                status="missed" if scheduled_date < today else "scheduled",
            )
        )
    return visits
