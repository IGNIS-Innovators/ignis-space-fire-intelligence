import { IgnisDataSource } from '../types/api';
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
} from '../types/experiment';
import { apiRequest } from './apiClient';
import {
  transformOverviewResponse,
  transformPaginatedExperiments,
  transformBackendDetail,
  transformCompareResponse,
  buildPredictionPayload,
  transformPredictionResponse,
  transformInsightsResponse,
  transformHealthResponse,
  transformAnalyticsResponse,
} from './apiAdapter';
import { AnalyticsViewModel } from '../types/analytics';
import { fixtureAdapter } from './fixtureAdapter';

class DataSourceManager implements IgnisDataSource {
  public getMode(): 'mock' | 'api' | 'auto' {
    const saved = localStorage.getItem('ignis_data_mode');
    if (saved === 'mock' || saved === 'api' || saved === 'auto') {
      return saved;
    }
    const envMode = (import.meta.env.VITE_DATA_MODE || 'api').toLowerCase();
    if (envMode === 'mock') return 'mock';
    if (envMode === 'auto') return 'auto';
    return 'api'; // default development behavior uses the real backend
  }

  public setMode(mode: 'mock' | 'api' | 'auto') {
    localStorage.setItem('ignis_data_mode', mode);
  }

  async getOverview(): Promise<OverviewViewModel> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.getOverview();
    }

    try {
      const data = await apiRequest<any>('/api/overview', 'GET');
      return transformOverviewResponse(data);
    } catch (err) {
      if (mode === 'api') throw err;
      // In auto mode, if network completely unreachable, alert caller rather than silent falsification
      throw err;
    }
  }

  async listExperiments(params?: ExperimentQueryParams): Promise<PaginatedExperiments> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.listExperiments(params);
    }

    const queryParts: string[] = [];
    if (params?.page) queryParts.push(`page=${params.page}`);
    if (params?.pageSize) queryParts.push(`page_size=${params.pageSize}`);
    if (params?.investigation && params.investigation !== 'ALL') {
      // Map frontend chip IDs to backend names if needed
      const invName = params.investigation === 'PSI-69' ? 'FLEX' : params.investigation === 'PSI-25' ? 'BASS-II' : params.investigation;
      queryParts.push(`investigation=${encodeURIComponent(invName)}`);
    }
    if (params?.fuel && params.fuel !== 'ALL') {
      queryParts.push(`fuel=${encodeURIComponent(params.fuel)}`);
    }
    if (params?.q && params.q.trim()) {
      queryParts.push(`q=${encodeURIComponent(params.q.trim())}`);
    }
    if (params?.pressureMin !== undefined) queryParts.push(`pressure_min=${params.pressureMin}`);
    if (params?.pressureMax !== undefined) queryParts.push(`pressure_max=${params.pressureMax}`);
    if (params?.o2Min !== undefined) queryParts.push(`o2_min=${params.o2Min}`);
    if (params?.o2Max !== undefined) queryParts.push(`o2_max=${params.o2Max}`);
    if (params?.sortBy) queryParts.push(`sort_by=${params.sortBy}`);
    if (params?.sortOrder) queryParts.push(`sort_order=${params.sortOrder}`);

    const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    try {
      const data = await apiRequest<any>(`/api/experiments${qs}`, 'GET');
      return transformPaginatedExperiments(data);
    } catch (err) {
      if (mode === 'api') throw err;
      throw err;
    }
  }

  async getExperiment(id: string): Promise<Experiment> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.getExperiment(id);
    }

    try {
      const data = await apiRequest<any>(`/api/experiments/${encodeURIComponent(id)}`, 'GET');
      return transformBackendDetail(data);
    } catch (err) {
      if (mode === 'api') throw err;
      throw err;
    }
  }

  /**
   * Retrieves a curated, scientifically diverse sample of authentic NASA experiments
   * representing both FLEX (liquid droplets) and BASS-II (solid fuels) across varied materials.
   * Every record is fetched directly from GET /api/experiments/{id}.
   */
  async getFeaturedExperiments(): Promise<Experiment[]> {
    const featuredIds = [
      'FLEX-1',       // FLEX: Methanol (Disruption) -> SVS S3 ignition flame
      'BASS-II-B1',   // BASS-II: PMMA Film -> Expedition 38 / Rick Mastracchio MSG
      'FLEX-12',      // FLEX: Heptane (Disruption) -> SVS S2 pre-ignition droplet
      'BASS-II-B11',  // BASS-II: PMMA Film (reduced O2) -> Expedition 46 / Tim Kopra
      'FLEX-2',       // FLEX: Methanol (Extinction) -> SVS S4 soot luminescence
      'BASS-II-F1',   // BASS-II: Nomex Fabric -> Expedition 35 Hardware Setup
    ];

    try {
      const results = await Promise.all(
        featuredIds.map(async (id) => {
          try {
            return await this.getExperiment(id);
          } catch {
            return null;
          }
        })
      );
      return results.filter((r): r is Experiment => r !== null);
    } catch (err) {
      return [];
    }
  }

  async compareExperiments(ids: string[]): Promise<ComparisonViewModel> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.compareExperiments(ids);
    }

    try {
      const data = await apiRequest<any>('/api/compare', 'POST', {
        experiment_ids: ids,
      });
      return transformCompareResponse(data);
    } catch (err) {
      if (mode === 'api') throw err;
      throw err;
    }
  }

  async getInsights(category?: string): Promise<InsightViewModel[]> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.getInsights(category);
    }

    try {
      const endpoint = category && category !== 'ALL'
        ? `/api/insights?category=${encodeURIComponent(category)}`
        : '/api/insights';
      const data = await apiRequest<any>(endpoint, 'GET');
      return transformInsightsResponse(data);
    } catch (err) {
      if (mode === 'api') throw err;
      throw err;
    }
  }

  async predictScenario(inputs: PredictionInputs): Promise<PredictionResult> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.predictScenario(inputs);
    }

    const payload = buildPredictionPayload(inputs);
    try {
      const data = await apiRequest<any>('/api/predict', 'POST', payload);
      return transformPredictionResponse(data);
    } catch (err) {
      if (mode === 'api') throw err;
      throw err;
    }
  }

  async getAnalytics(investigation?: string, fuel?: string): Promise<AnalyticsViewModel> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.getAnalytics(investigation, fuel);
    }

    const queryParts: string[] = [];
    if (investigation && investigation !== 'ALL') {
      const invName = investigation === 'PSI-69' ? 'FLEX' : investigation === 'PSI-25' ? 'BASS-II' : investigation;
      queryParts.push(`investigation=${encodeURIComponent(invName)}`);
    }
    if (fuel && fuel !== 'ALL') {
      queryParts.push(`fuel=${encodeURIComponent(fuel)}`);
    }
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    try {
      const data = await apiRequest<any>(`/api/analytics${queryString}`, 'GET');
      return transformAnalyticsResponse(data);
    } catch (err) {
      if (mode === 'api') throw err;
      return fixtureAdapter.getAnalytics(investigation, fuel);
    }
  }

  async getHealth(): Promise<HealthViewModel> {
    const mode = this.getMode();
    if (mode === 'mock') {
      return fixtureAdapter.getHealth();
    }

    try {
      const data = await apiRequest<any>('/api/health', 'GET');
      return transformHealthResponse(data);
    } catch (err) {
      if (mode === 'api') throw err;
      return fixtureAdapter.getHealth();
    }
  }
}

export const dataSource = new DataSourceManager();
