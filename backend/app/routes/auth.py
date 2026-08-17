from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.mother import Mother
from app.models.pregnancy import Pregnancy
from app.models.user import User
from app.models.ward import Ward

from app.schemas.auth import (
    LoginRequest,
    MotherRegisterRequest,
    RegisterRequest,
    TokenResponse,
)

from app.security.jwt import create_access_token
from app.security.password import hash_password, verify_password

from app.services.anc_service import (
    calculate_edd,
    calculate_pregnancy_week,
    generate_anc_schedule,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.get("/wards")
def public_wards(
    db: Session = Depends(get_db),
):
    wards = db.scalars(
        select(Ward).order_by(Ward.code)
    ).all()

    return [
        {
            "ward_id": ward.id,
            "code": ward.code,
            "name": ward.name,
            "city": ward.city,
        }
        for ward in wards
    ]

@router.post(
    "/register-mother",
    status_code=status.HTTP_201_CREATED,
)
def register_mother(
    payload: MotherRegisterRequest,
    db: Session = Depends(get_db),
):

    email = payload.email.lower().strip()

    existing_user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered.",
        )

    if db.get(Ward, payload.ward_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Ward not found.",
        )

    today = date.today()

    if payload.lmp > today:
        raise HTTPException(
            status_code=400,
            detail="LMP cannot be in the future.",
        )

    pregnancy_week = calculate_pregnancy_week(
        payload.lmp
    )

    if pregnancy_week > 42:
        raise HTTPException(
            status_code=400,
            detail=(
                "LMP indicates a pregnancy "
                "greater than 42 weeks."
            ),
        )

    try:
        user = User(
            full_name=payload.full_name,
            email=email,
            phone=payload.phone,
            password_hash=hash_password(
                payload.password
            ),
            role="mother",
            is_active=True,
        )

        db.add(user)
        db.flush()

        mother = Mother(
            user_id=user.id,
            ward_id=payload.ward_id,
            full_name=payload.full_name,
            phone=payload.phone,
            date_of_birth=payload.date_of_birth,
            blood_group=payload.blood_group,
            address=payload.address,
            preferred_language=(
                payload.preferred_language
            ),
            reminder_consent=(
                payload.reminder_consent
            ),
        )

        db.add(mother)
        db.flush()

        pregnancy = Pregnancy(
            mother_id=mother.id,
            lmp=payload.lmp,
            edd=calculate_edd(payload.lmp),
            pregnancy_number=(
                payload.pregnancy_number
            ),
            parity=payload.parity,
            previous_complications=(
                payload.previous_complications
            ),
            current_risk_level="unassessed",
            status="active",
        )

        db.add(pregnancy)
        db.flush()

        visits = generate_anc_schedule(
            pregnancy.id,
            payload.lmp,
        )

        db.add_all(visits)

        db.commit()

        return {
            "message":
                "Mother account created successfully.",

            "user_id":
                user.id,

            "mother_id":
                mother.id,

            "pregnancy_id":
                pregnancy.id,

            "role":
                "mother",

            "edd":
                pregnancy.edd,

            "pregnancy_week":
                pregnancy_week,

            "anc_visits_created":
                len(visits),
        }

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not create account.",
        )





@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(User.email == payload.email.lower())
    )
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive.")

    return {
        "access_token": create_access_token(user.id, user.role),
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
    }
