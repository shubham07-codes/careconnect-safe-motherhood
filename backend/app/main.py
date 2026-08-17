from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.database import check_database_connection

from app.routes.ai import router as ai_router
from app.routes.auth import router as auth_router
from app.routes.doctor.referrals import router as doctor_referrals_router
from app.routes.field_worker.anc import router as anc_router
from app.routes.field_worker.postnatal import router as postnatal_router
from app.routes.field_worker.pregnancies import router as pregnancies_router
from app.routes.field_worker.reminders import router as reminders_router
from app.routes.mother.content import router as mother_content_router
from app.routes.mother.dashboard import router as mother_dashboard_router
from app.routes.officer.dashboard import router as officer_dashboard_router

app = FastAPI(
    title=settings.app_name,
    description=(
        "CareConnect - Safe Motherhood API. "
        "Hackathon decision-support prototype; not a diagnostic system."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(pregnancies_router)
app.include_router(anc_router)
app.include_router(reminders_router)
app.include_router(postnatal_router)
app.include_router(doctor_referrals_router)
app.include_router(mother_dashboard_router)
app.include_router(mother_content_router)
app.include_router(officer_dashboard_router)
app.include_router(ai_router)

@app.get("/")
def root():
    return {
        "name": "CareConnect API",
        "project": "Safe Motherhood",
        "status": "running",
    }

@app.get("/api/health")
def health_check():
    try:
        check_database_connection()

        return {
            "status": "ok",
            "api": "running",
            "database": "connected",
            "service": "CareConnect",
        }

    except SQLAlchemyError as error:
        print("Database connection error:", error)

        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "api": "running",
                "database": "disconnected",
                "service": "CareConnect",
            },
        )
