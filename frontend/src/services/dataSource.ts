import { IgnisDataSource } from '../types/api';
import {
  OverviewViewModel,
  Experiment,
  ComparisonViewModel,
  InsightViewModel,
  PredictionInputs,
  PredictionResult,
} from '../types/experiment';
import { apiRequest } from './apiClient';
import { fixtureAdapter } from './fixtureAdapter';

class DataSourceManager implements IgnisDataSource {
  private getMode(): 'mock' | 'api' | 'auto' {
    const mode = (import.meta.env.VITE_DATA_MODE || 'auto').toLowerCase();
    if (mode === 'api') return 'api';
    if (mode === 'mock') return 'mock';
    return 'auto';
  }

  async getOverview(): Promise<OverviewViewModel> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.getOverview();
    }

    try {
      // GET /api/overview
      const data = await apiRequest<OverviewViewModel>('/api/overview', 'GET');
      return { ...data, dataSource: 'api' };
    } catch (err) {
      if (mode === 'api') throw err;
      // Auto fallback to fixture
      return fixtureAdapter.getOverview();
    }
  }

  async listExperiments(): Promise<Experiment[]> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.listExperiments();
    }

    try {
      // GET /api/experiments
      const data = await apiRequest<Experiment[]>('/api/experiments', 'GET');
      return data;
    } catch (err) {
      if (mode === 'api') throw err;
      return fixtureAdapter.listExperiments();
    }
  }

  async compareExperiments(ids: [string, string]): Promise<ComparisonViewModel> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.compareExperiments(ids);
    }

    try {
      // POST /api/compare
      const data = await apiRequest<ComparisonViewModel>('/api/compare', 'POST', { ids });
      return { ...data, dataSource: 'api' };
    } catch (err) {
      if (mode === 'api') throw err;
      return fixtureAdapter.compareExperiments(ids);
    }
  }

  async getInsights(): Promise<InsightViewModel[]> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.getInsights();
    }

    try {
      // GET /api/insights
      const data = await apiRequest<InsightViewModel[]>('/api/insights', 'GET');
      return data;
    } catch (err) {
      if (mode === 'api') throw err;
      return fixtureAdapter.getInsights();
    }
  }

  async predictScenario(inputs: PredictionInputs): Promise<PredictionResult> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.predictScenario(inputs);
    }

    try {
      // POST /api/predict
      const data = await apiRequest<PredictionResult>('/api/predict', 'POST', inputs);
      return data;
    } catch (err) {
      if (mode === 'api') throw err;
      return fixtureAdapter.predictScenario(inputs);
    }
  }
}

export const dataSource = new DataSourceManager();
