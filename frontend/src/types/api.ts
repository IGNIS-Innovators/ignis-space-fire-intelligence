import {
  OverviewViewModel,
  Experiment,
  ComparisonViewModel,
  InsightViewModel,
  PredictionInputs,
  PredictionResult,
} from './experiment';

export interface IgnisDataSource {
  getOverview(): Promise<OverviewViewModel>;
  listExperiments(): Promise<Experiment[]>;
  compareExperiments(ids: [string, string]): Promise<ComparisonViewModel>;
  getInsights(): Promise<InsightViewModel[]>;
  predictScenario(inputs: PredictionInputs): Promise<PredictionResult>;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs: number;
}
