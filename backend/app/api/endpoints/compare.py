"""
IGNIS — Space Fire Intelligence
Multi-Experiment Comparison Endpoint
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.compare import CompareRequest, CompareResponse
from backend.app.services.data.repository import repository

router = APIRouter()


@router.post(
    "/compare",
    response_model=CompareResponse,
    summary="Compare Experiments Side-by-Side",
    description="Accepts a list of 1 to 10 experiment IDs and generates an aligned multi-variable comparison matrix and chart data.",
)
async def compare_experiments(request: CompareRequest) -> CompareResponse:
    if not request.experiment_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide at least one valid experiment ID to compare.",
        )

    res = repository.compare_experiments(request.experiment_ids)

    if not res["matched_ids"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"None of the requested experiment IDs were found in NASA datasets: {request.experiment_ids}",
        )

    return CompareResponse(**res)

