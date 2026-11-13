"""
IGNIS — Space Fire Intelligence
Experiment Exploration & Search Endpoints
"""

import math
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.experiment import (
    ExperimentDetail,
    ExperimentListResponse,
    ExperimentSummary,
)
from backend.app.services.data.repository import repository

router = APIRouter()


@router.get(
    "/experiments",
    response_model=ExperimentListResponse,
    summary="Search & Filter NASA Experiments",
    description="Multi-attribute query interface with pagination, text search, fuel filtering, and numerical range filtering.",
)
async def list_experiments(
    investigation: Optional[str] = Query(
        None,
        description="Filter by investigation: 'FLEX', 'BASS-II', or 'all'",
    ),
    fuel: Optional[str] = Query(
        None,
        description="Filter by fuel material: e.g. 'Methanol', 'Heptane', 'PMMA', 'SIBAL'",
    ),
    q: Optional[str] = Query(
        None,
        description="Search text query across experiment IDs, titles, fuels, PIs, or run codes",
    ),
    pressure_min: Optional[float] = Query(
        None,
        ge=0.0,
        description="Minimum ambient pressure in kPa",
    ),
    pressure_max: Optional[float] = Query(
        None,
        ge=0.0,
        description="Maximum ambient pressure in kPa",
    ),
    o2_min: Optional[float] = Query(
        None,
        ge=0.0,
        le=100.0,
        description="Minimum oxygen percentage (% vol)",
    ),
    o2_max: Optional[float] = Query(
        None,
        ge=0.0,
        le=100.0,
        description="Maximum oxygen percentage (% vol)",
    ),
    sort_by: str = Query(
        "id",
        description="Sort field: 'id', 'ambient_pressure_kpa', 'oxygen_percentage', 'burning_rate_mm2_s', 'burn_time_s', 'test_number'",
    ),
    sort_order: str = Query(
        "asc",
        description="Sort direction: 'asc' or 'desc'",
    ),
    page: int = Query(
        1,
        ge=1,
        description="Page number (1-indexed)",
    ),
    page_size: int = Query(
        20,
        ge=1,
        le=100,
        description="Records per page (max: 100)",
    ),
) -> ExperimentListResponse:
    results, total_count = repository.search_experiments(
        investigation=investigation,
        fuel=fuel,
        query=q,
        pressure_min=pressure_min,
        pressure_max=pressure_max,
        o2_min=o2_min,
        o2_max=o2_max,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )

    total_pages = max(1, math.ceil(total_count / page_size))

    summaries = [ExperimentSummary(**r) for r in results]

    return ExperimentListResponse(
        total=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        investigation_filter=investigation,
        fuel_filter=fuel,
        query=q,
        results=summaries,
    )


@router.get(
    "/experiments/{experiment_id}",
    response_model=ExperimentDetail,
    summary="Get Single Experiment Details",
    description="Returns full normalized parameters, measured sensor metrics, data quality flags, and source provenance.",
)
async def get_experiment(experiment_id: str) -> ExperimentDetail:
    record = repository.get_experiment_by_id(experiment_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment '{experiment_id}' not found. Examples of valid IDs: 'FLEX-70', 'BASS-II-B1'.",
        )
    return ExperimentDetail(**record)
