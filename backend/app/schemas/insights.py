"""
IGNIS — Space Fire Intelligence
Pydantic Schemas for AI & Statistical Combustion Insights
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class InsightItem(BaseModel):
    id: str = Field(..., example="INS-01")
    category: str = Field(..., example="Oxidizer Dynamics")
    title: str = Field(..., example="Oxygen Mole Fraction Directly Governs Droplet Burning Rate")
    finding: str = Field(...)
    evidence_summary: str = Field(...)
    supporting_experiment_ids: List[str] = Field(default_factory=list)
    statistical_basis: str = Field(...)
    scientific_implication: str = Field(...)
    data_type: str = Field(default="observational_correlation", example="observational_correlation")


class InsightsResponse(BaseModel):
    generated_at: str = Field(...)
    investigations_covered: List[str] = Field(..., example=["FLEX (PSI-69)", "BASS-II (PSI-25)"])
    total_experiments_analyzed: int = Field(..., example=403)
    insights: List[InsightItem]
    scientific_methodology: str

