"""
IGNIS — Space Fire Intelligence
Scientific Data Analytics Schemas
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ScatterPoint(BaseModel):
    test_id: str
    fuel: str
    x: float
    y: float
    secondary_val: Optional[float] = None
    extra: Optional[Dict[str, Any]] = None


class ScatterChartData(BaseModel):
    title: str
    investigation: str
    x_label: str
    x_unit: str
    y_label: str
    y_unit: str
    sample_count: int
    missing_count: int
    points: List[ScatterPoint]
    correlations: Optional[Dict[str, float]] = None
    notes: Optional[str] = None


class DistributionBin(BaseModel):
    bin_range: str
    bin_start: float
    bin_end: float
    count: int
    percentage: float


class DistributionChartData(BaseModel):
    title: str
    investigation: str
    metric_label: str
    unit: str
    sample_count: int
    missing_count: int
    stats: Dict[str, float]
    bins: List[DistributionBin]
    notes: Optional[str] = None


class CategoryItem(BaseModel):
    name: str
    count: int
    percentage: float
    color: Optional[str] = None
    description: Optional[str] = None


class CategoryChartData(BaseModel):
    title: str
    investigation: str
    sample_count: int
    missing_count: int
    items: List[CategoryItem]
    notes: Optional[str] = None


class FlexAnalytics(BaseModel):
    investigation: str = "FLEX"
    psi_reference: str = "PSI-69"
    total_records: int = 274
    o2_vs_burning_rate: ScatterChartData
    pressure_vs_burning_rate: ScatterChartData
    diameter_vs_burning_rate: ScatterChartData
    burn_time_distribution: DistributionChartData
    outcomes: CategoryChartData
    fuels: CategoryChartData


class BassAnalytics(BaseModel):
    investigation: str = "BASS-II"
    psi_reference: str = "PSI-25"
    total_records: int = 129
    material_distribution: CategoryChartData
    geometry_distribution: CategoryChartData
    initial_o2_distribution: DistributionChartData
    o2_consumption_scatter: ScatterChartData
    combustion_products_scatter: ScatterChartData


class AnalyticsResponse(BaseModel):
    investigation_filter: str
    fuel_filter: str
    total_records_analyzed: int
    provenance: str
    scientific_notice: str
    flex: Optional[FlexAnalytics] = None
    bass: Optional[BassAnalytics] = None
