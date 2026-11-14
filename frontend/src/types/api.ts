import {
  OverviewViewModel,
  Experiment,
  ComparisonViewModel,
  InsightViewModel,
  PredictionInputs,
  PredictionResult,
  PaginatedExperiments,
  ExperimentQueryParams,
  HealthViewModel,
} from './experiment';
import { AnalyticsViewModel } from './analytics';

export interface IgnisDataSource {
  getOverview(): Promise<OverviewViewModel>;
  listExperiments(params?: ExperimentQueryParams): Promise<PaginatedExperiments>;
  getExperiment(id: string): Promise<Experiment>;
  getFeaturedExperiments(): Promise<Experiment[]>;
  getAnalytics(investigation?: string, fuel?: string): Promise<AnalyticsViewModel>;
  compareExperiments(ids: string[]): Promise<ComparisonViewModel>;
  getInsights(category?: string): Promise<InsightViewModel[]>;
  predictScenario(inputs: PredictionInputs): Promise<PredictionResult>;
  getHealth(): Promise<HealthViewModel>;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs: number;
}
