"""
IGNIS — Space Fire Intelligence
Pydantic Schemas for System Health
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    version: str = Field(..., example="1.0.0")
    timestamp: str = Field(..., example="2026-11-13T18:00:00Z")
    datasets_loaded: bool = Field(..., example=True)
    experiments_count: int = Field(..., example=403)
    investigations_loaded: List[str] = Field(..., example=["FLEX", "BASS-II"])
    model_ready: bool = Field(..., example=True)
    default_model: str = Field(..., example="Ridge Regression (Tuned)")
    notes: Optional[str] = None

