"""
IGNIS — Space Fire Intelligence
Configuration & Environment Settings
"""

from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base workspace directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "IGNIS — Space Fire Intelligence API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DESCRIPTION: str = (
        "Scientific microgravity fire intelligence backend for NASA Space Apps Challenge 2026. "
        "Integrates genuine NASA PSI-69 (FLEX) and PSI-25 (BASS-II) datasets, experiment exploration, "
        "side-by-side comparison matrix, statistical AI insights, and predictive combustion ML models."
    )

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # CORS Origins (Comma-separated string or JSON list from env)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Storage Paths
    DATA_PROCESSED_DIR: Path = BASE_DIR / "data" / "processed"
    MODELS_DIR: Path = BASE_DIR / "models"


settings = Settings()

