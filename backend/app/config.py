from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    app_name: str = "CareConnect API"
    app_env: str = "development"
    database_url: str
    frontend_url: str = "http://localhost:5173"

    # JWT Authentication
    jwt_secret_key: str = "CHANGE_ME_FOR_LOCAL_DEMO"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    # Gemini AI
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.6-flash"

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()