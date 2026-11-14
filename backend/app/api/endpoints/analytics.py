"""
IGNIS — Space Fire Intelligence
Scientific Data Analytics Endpoint
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.analytics import AnalyticsResponse
from backend.app.services.data.repository import repository

router = APIRouter()


@router.get(
    "/analytics",
    response_model=AnalyticsResponse,
    summary="Scientific Data Analytics",
    description=(
        "Returns comprehensive, verified scientific distributions, bivariate scatter plots, "
        "burn time histograms, and test outcome breakdowns computed across the complete NASA PSI datasets."
    ),
)
async def get_analytics(
    investigation: Optional[str] = Query(
        "all",
        description="Filter by investigation ('all', 'FLEX', 'BASS-II')",
    ),
    fuel: Optional[str] = Query(
        "all",
        description="Filter by fuel or material name ('all', 'Methanol', 'Heptane', 'PMMA', 'SIBAL', etc.)",
    ),
) -> AnalyticsResponse:
    data = repository.get_analytics(investigation=investigation, fuel=fuel)
    return AnalyticsResponse(**data)
