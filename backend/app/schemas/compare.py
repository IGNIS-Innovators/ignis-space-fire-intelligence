"""
IGNIS — Space Fire Intelligence
Pydantic Schemas for Multi-Experiment Comparison
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.experiment import ExperimentDetail


class CompareRequest(BaseModel):
    experiment_ids: List[str] = Field(
        ...,
        min_length=1,
        max_length=10,
        example=["FLEX-1", "FLEX-2", "FLEX-3"],
    )


class ComparisonMatrixRow(BaseModel):
    parameter: str = Field(..., example="Ambient Pressure")
    category: str = Field(..., example="Chamber Conditions")
    unit: str = Field(..., example="kPa")
    values: Dict[str, Any] = Field(..., example={"FLEX-1": 101.02, "FLEX-2": 101.59})


class CompareResponse(BaseModel):
    requested_ids: List[str]
    matched_ids: List[str]
    missing_ids: List[str]
    investigation_homogeneity: bool
    comparability_notice: str
    experiments: List[ExperimentDetail]
    matrix: List[ComparisonMatrixRow]
    chart_series: Dict[str, Any]

