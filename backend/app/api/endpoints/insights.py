"""
IGNIS — Space Fire Intelligence
Scientific AI Insights Endpoint
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.insights import InsightsResponse
from backend.app.services.insights.insights_service import insights_service

router = APIRouter()


@router.get(
    "/insights",
    response_model=InsightsResponse,
    summary="Evidence-Based Combustion Insights",
    description=(
        "Returns deterministic, statistically grounded research insights derived from authentic NASA microgravity experiments. "
        "Includes supporting trial IDs, correlation statistics, and physical implications."
    ),
)
async def get_insights(
    category: Optional[str] = Query(
        None,
        description="Filter by insight category (e.g., 'oxidizer', 'diluent', 'soot', 'solid', 'scale')",
    ),
) -> InsightsResponse:
    res = insights_service.generate_insights(category=category)
    return InsightsResponse(**res)
