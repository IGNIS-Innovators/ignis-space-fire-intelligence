"""
IGNIS — Space Fire Intelligence
Pydantic Schemas for Dataset Overview & Statistics
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class InvestigationStat(BaseModel):
    name: str = Field(..., example="FLEX")
    full_name: str = Field(..., example="Flame Extinction Experiment")
    psi_reference: str = Field(..., example="PSI-69")
    mission: str = Field(..., example="ISS CIR (Combustion Integrated Rack)")
    apparatus: str = Field(..., example="Multi-user Droplet Combustion Apparatus")
    experiment_count: int = Field(..., example=274)
    physical_regime: str = Field(..., example="Isolated Liquid Droplet Spherical Combustion")
    fuel_states: List[str] = Field(..., example=["liquid"])
    fuels: List[str] = Field(..., example=["Methanol", "Heptane"])


class NumericSummary(BaseModel):
    count: int
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    unit: str


class OverviewResponse(BaseModel):
    total_experiments: int = Field(..., example=403)
    total_investigations: int = Field(..., example=2)
    investigations: List[InvestigationStat]
    fuel_distribution: Dict[str, int]
    flex_outcomes: Dict[str, int]
    numeric_summaries: Dict[str, NumericSummary]
    scientific_notice: str

