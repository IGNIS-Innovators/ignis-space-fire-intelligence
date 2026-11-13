"""
IGNIS — Space Fire Intelligence
Consolidated API Router
"""

from fastapi import APIRouter
from backend.app.api.endpoints import (
    compare,
    experiments,
    health,
    insights,
    overview,
    predict,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["System Health"])
api_router.include_router(overview.router, tags=["Mission Overview"])
api_router.include_router(experiments.router, tags=["Experiment Explorer"])
api_router.include_router(compare.router, tags=["Compare Experiments"])
api_router.include_router(predict.router, tags=["Predictive Combustion Lab"])
api_router.include_router(insights.router, tags=["AI Scientific Insights"])

