"""
IGNIS — Space Fire Intelligence
Dataset Overview & Statistical Aggregations
"""

from fastapi import APIRouter
from backend.app.schemas.overview import OverviewResponse
from backend.app.services.data.repository import repository

router = APIRouter()


@router.get(
    "/overview",
    response_model=OverviewResponse,
    summary="Mission & Investigation Overview",
    description="Returns verified aggregate statistics, fuel distributions, outcomes, and numeric metric summaries across all NASA datasets.",
)
async def get_overview() -> OverviewResponse:
    stats = repository.get_overview_stats()
    return OverviewResponse(**stats)

