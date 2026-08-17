from datetime import date

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    role: str


class MotherRegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=128)

    ward_id: int
    lmp: date

    date_of_birth: date | None = None
    blood_group: str | None = Field(default=None, max_length=10)
    address: str | None = None

    preferred_language: str = Field(
        default="marathi",
        max_length=20,
    )

    reminder_consent: bool = True

    pregnancy_number: int = Field(
        default=1,
        ge=1,
    )

    parity: int = Field(
        default=0,
        ge=0,
    )

    previous_complications: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str