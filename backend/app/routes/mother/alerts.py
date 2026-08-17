from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles

from app.models.alert import Alert
from app.models.mother import Mother
from app.models.user import User

from app.services.alert_engine import (
    generate_alerts_for_mother,
)


router = APIRouter(
    prefix="/api/mother/alerts",
    tags=["Mother - Smart Alerts"],
)


def get_logged_in_mother(
    db: Session,
    user: User,
) -> Mother:

    mother = db.scalar(
        select(Mother).where(
            Mother.user_id == user.id
        )
    )

    if mother is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Mother profile is not linked "
                "to this account."
            ),
        )

    return mother


@router.post("/generate")
def generate_alerts(
    db: Session = Depends(get_db),
    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_logged_in_mother(
        db,
        user,
    )

    created = generate_alerts_for_mother(
        db,
        mother,
    )

    return {
        "message": "Smart alert scan completed.",
        "new_alerts": created,
    }


@router.get("")
def list_alerts(
    db: Session = Depends(get_db),
    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_logged_in_mother(
        db,
        user,
    )

    alerts = db.scalars(
        select(Alert)
        .where(
            Alert.mother_id == mother.id,
            Alert.target_role == "mother",
        )
        .order_by(
            Alert.created_at.desc()
        )
    ).all()

    return [
        {
            "id": alert.id,
            "type": alert.alert_type,
            "severity": alert.severity,
            "title": alert.title,
            "message": alert.message,
            "action_text": alert.action_text,
            "is_read": alert.is_read,
            "created_at": alert.created_at,
        }
        for alert in alerts
    ]


@router.patch("/{alert_id}/read")
def mark_read(
    alert_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(
        require_roles("mother")
    ),
):

    mother = get_logged_in_mother(
        db,
        user,
    )

    alert = db.scalar(
        select(Alert).where(
            Alert.id == alert_id,
            Alert.mother_id == mother.id,
            Alert.target_role == "mother",
        )
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found.",
        )

    alert.is_read = True

    db.commit()

    return {
        "message": "Alert marked as read."
    }