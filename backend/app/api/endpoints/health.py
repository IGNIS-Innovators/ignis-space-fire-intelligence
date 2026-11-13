"""
IGNIS — Space Fire Intelligence
Health Check Endpoint
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.schemas.health import HealthResponse
from backend.app.services.data.repository import repository
from backend.app.services.prediction.predict_flex import prediction_service

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="System Health & Scientific Readiness",
    description="Returns service status, loaded dataset availability, experiment counts, and ML model readiness.",
)
async def get_health() -> HealthResponse:
    health_stats = repository.get_health_stats()
    model_ready = prediction_service.is_ready()

    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc).isoformat(),
        datasets_loaded=health_stats["datasets_loaded"],
        experiments_count=health_stats["experiments_count"],
        investigations_loaded=health_stats["investigations_loaded"],
        model_ready=model_ready,
        default_model=prediction_service.get_default_model_name(),
        notes="NASA PSI-69 (FLEX) and PSI-25 (BASS-II) verified and ready for research.",
    )

