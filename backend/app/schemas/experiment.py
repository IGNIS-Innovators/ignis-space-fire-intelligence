"""
IGNIS — Space Fire Intelligence
Pydantic Schemas for Experiment Exploration and Details
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ExperimentSummary(BaseModel):
    id: str = Field(..., example="FLEX-70")
    investigation: str = Field(..., example="FLEX")
    mission: str = Field(..., example="ISS CIR")
    test_number: str = Field(..., example="70")
    run_identifier: Optional[str] = Field(None, example="193F001")
    date: Optional[str] = Field(None, example="3/23/2010")
    fuel_name: str = Field(..., example="Heptane")
    fuel_type: str = Field(..., example="liquid")
    fuel_geometry: Optional[str] = Field(None, example="spherical droplet")
    ambient_pressure_kpa: Optional[float] = Field(None, example=101.46)
    oxygen_percentage: Optional[float] = Field(None, example=15.0)
    burning_rate_mm2_s: Optional[float] = Field(None, example=0.41)
    burn_time_s: Optional[float] = Field(None, example=1.6)
    extinction_observed: bool = Field(..., example=True)
    outcome: Optional[str] = Field(None, example="Extinction")
    source_reference: str = Field(..., example="NASA PSI-69")


class ExperimentDetail(BaseModel):
    id: str = Field(..., example="FLEX-70")
    investigation: str = Field(..., example="FLEX")
    mission: str = Field(..., example="ISS CIR (Combustion Integrated Rack)")
    apparatus: str = Field(..., example="Multi-user Droplet Combustion Apparatus (MDCA)")
    title: str = Field(..., example="FLEX Droplet Combustion Trial #70 (Heptane)")
    test_number: str = Field(..., example="70")
    run_identifier: Optional[str] = Field(None, example="193F001")
    date: Optional[str] = Field(None, example="3/23/2010")
    gmt: Optional[str] = Field(None, example="7:25:43")
    pi: Optional[str] = Field(None, example="Forman A. Williams")
    fuel_name: str = Field(..., example="Heptane")
    fuel_material_raw: Optional[str] = Field(None, example="Heptane")
    fuel_type: str = Field(..., example="liquid")
    fuel_geometry: Optional[str] = Field(None, example="spherical droplet")
    
    # Environmental & Chamber Conditions
    chamber_parameters: Dict[str, Any]
    
    # Measured Combustion Metrics
    measurements: Dict[str, Any]
    
    # Outcome & Termination
    outcome: Optional[str] = Field(None, example="Extinction")
    extinction_observed: bool = Field(..., example=True)
    
    # Data Quality & Anomaly Flags
    data_quality_flags: Dict[str, bool]
    
    # Provenance
    source_file: str = Field(..., example="PSI-69_Experimental table_FLEX.csv")
    provenance: str = Field(..., example="NASA Physical Sciences Informatics (PSI-69)")
    scientific_regime: str = Field(..., example="Quiescent Microgravity Droplet Combustion")


class ExperimentListResponse(BaseModel):
    total: int = Field(..., example=274)
    page: int = Field(..., example=1)
    page_size: int = Field(..., example=20)
    total_pages: int = Field(..., example=14)
    investigation_filter: Optional[str] = None
    fuel_filter: Optional[str] = None
    query: Optional[str] = None
    results: List[ExperimentSummary]

