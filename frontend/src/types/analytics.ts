export interface ScatterPoint {
  test_id: string;
  fuel: string;
  x: number;
  y: number;
  secondary_val?: number | null;
  extra?: Record<string, any>;
}

export interface ScatterChartData {
  title: string;
  investigation: string;
  x_label: string;
  x_unit: string;
  y_label: string;
  y_unit: string;
  sample_count: number;
  missing_count: number;
  points: ScatterPoint[];
  correlations?: Record<string, number> | null;
  notes?: string | null;
}

export interface DistributionBin {
  bin_range: string;
  bin_start: number;
  bin_end: number;
  count: number;
  percentage: number;
}

export interface DistributionChartData {
  title: string;
  investigation: string;
  metric_label: string;
  unit: string;
  sample_count: number;
  missing_count: number;
  stats: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
  };
  bins: DistributionBin[];
  notes?: string | null;
}

export interface CategoryItem {
  name: string;
  count: number;
  percentage: number;
  color?: string;
  description?: string;
}

export interface CategoryChartData {
  title: string;
  investigation: string;
  sample_count: number;
  missing_count: number;
  items: CategoryItem[];
  notes?: string | null;
}

export interface FlexAnalytics {
  investigation: 'FLEX';
  psi_reference: 'PSI-69';
  total_records: number;
  o2_vs_burning_rate: ScatterChartData;
  pressure_vs_burning_rate: ScatterChartData;
  diameter_vs_burning_rate: ScatterChartData;
  burn_time_distribution: DistributionChartData;
  outcomes: CategoryChartData;
  fuels: CategoryChartData;
}

export interface BassAnalytics {
  investigation: 'BASS-II';
  psi_reference: 'PSI-25';
  total_records: number;
  material_distribution: CategoryChartData;
  geometry_distribution: CategoryChartData;
  initial_o2_distribution: DistributionChartData;
  o2_consumption_scatter: ScatterChartData;
  combustion_products_scatter: ScatterChartData;
}

export interface AnalyticsViewModel {
  investigation_filter: string;
  fuel_filter: string;
  total_records_analyzed: number;
  provenance: string;
  scientific_notice: string;
  flex?: FlexAnalytics | null;
  bass?: BassAnalytics | null;
}
