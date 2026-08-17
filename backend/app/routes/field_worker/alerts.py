from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles

from app.models.alert import Alert
from app.models.mother import Mother
from app.models.user import User


router = APIRouter(
    prefix="/api/field-worker/alerts",
    tags=["Field Worker - Smart Alerts"],
)


@router.get("")
def field_worker_alerts(
    ward_id: int | None = Query(
        default=None
    ),

    db: Session = Depends(get_db),

    _: User = Depends(
        require_roles("field_worker")
    ),
):

    stmt = (
        select(Alert, Mother)
        .join(
            Mother,
            Alert.mother_id == Mother.id,
        )
        .where(
            Alert.target_role
            == "field_worker"
        )
    )

    if ward_id is not None:
        stmt = stmt.where(
            Mother.ward_id == ward_id
        )

    rows = db.execute(
        stmt.order_by(
            Alert.created_at.desc()
        )
    ).all()

    return [
        {
            "alert_id": alert.id,
            "severity": alert.severity,
            "type": alert.alert_type,
            "title": alert.title,
            "message": alert.message,
            "action_text": alert.action_text,

            "mother": {
                "mother_id": mother.id,
                "name": mother.full_name,
                "phone": mother.phone,
                "ward_id": mother.ward_id,
            },

            "created_at":
                alert.created_at,
        }

        for alert, mother in rows
    ]