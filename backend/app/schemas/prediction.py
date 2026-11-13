"""
IGNIS — Space Fire Intelligence
Pydantic Schemas for Predictive Combustion ML Service
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class PredictionRequest(BaseModel):
    fuel: str = Field(..., example="Methanol", description="Liquid fuel name: 'Methanol' or 'Heptane'")
    ambient_pressure_kpa: float = Field(..., gt=0.0, example=101.3, description="Ambient pressure in kPa (> 0)")
    o2_mole_fraction: float = Field(..., ge=0.0, le=1.0, example=0.21, description="Oxygen mole fraction (0 to 1)")
    n2_mole_fraction: float = Field(..., ge=0.0, le=1.0, example=0.79, description="Nitrogen mole fraction (0 to 1)")
    co2_mole_fraction: float = Field(default=0.0, ge=0.0, le=1.0, example=0.0, description="Carbon dioxide mole fraction (0 to 1)")
    he_mole_fraction: float = Field(default=0.0, ge=0.0, le=1.0, example=0.0, description="Helium mole fraction (0 to 1)")
    droplet_initial_diameter_mm: float = Field(..., gt=0.0, example=2.5, description="Initial droplet diameter in mm (> 0)")
    model_choice: Optional[str] = Field(default="ridge", example="ridge", description="Model architecture: 'ridge' or 'random_forest'")

    @field_validator("fuel")
    @classmethod
    def validate_fuel(cls, v: str) -> str:
        s = v.strip().capitalize()
        if s not in {"Methanol", "Heptane"}:
            raise ValueError(f"Fuel '{v}' not supported. Allowed fuels: 'Methanol', 'Heptane'")
        return s

    @field_validator("model_choice")
    @classmethod
    def validate_model_choice(cls, v: Optional[str]) -> str:
        if not v:
            return "ridge"
        norm = v.strip().lower()
        if norm in ["ridge", "ridge_regression", "linear"]:
            return "ridge"
        elif norm in ["rf", "random_forest", "forest"]:
            return "random_forest"
        raise ValueError(f"Invalid model_choice '{v}'. Allowed: 'ridge', 'random_forest'")


class PredictionResponse(BaseModel):
    predicted_burning_rate_constant: float = Field(..., example=0.5142, description="Estimated d²-law burning rate constant K")
    units: str = Field(default="mm2/s", example="mm2/s")
    model_name: str = Field(..., example="Ridge Regression (Tuned)")
    model_version: str = Field(default="1.0.0-flex", example="1.0.0-flex")
    model_selection_basis: str = Field(..., example="Selected via 5-fold cross-validation evidence on training data (CV R²=0.732 vs RF 0.687)")
    input_parameters: Dict[str, Any]
    is_extrapolation: bool = Field(..., example=False)
    extrapolation_warnings: List[str] = Field(default_factory=list)
    scientific_disclaimer: str = Field(...)
    scientific_notes: str = Field(...)
    physical_domain: str = Field(default="NASA PSI-69 Quiescent Microgravity Droplet Combustion")

