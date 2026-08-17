from fastapi import APIRouter, Depends
from app.ai.evaluation import synthetic_metrics
from app.dependencies import require_roles
from app.models.user import User

router = APIRouter(prefix="/api/ai", tags=["AI / Model"])

@router.get("/risk-model/metrics")
def model_metrics(
    _: User = Depends(require_roles("doctor", "officer")),
):
    return synthetic_metrics()
