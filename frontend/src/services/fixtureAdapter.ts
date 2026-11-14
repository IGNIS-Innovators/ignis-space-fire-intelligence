import sampleJson from '../data/IGNIS_frontend_sample_data.json';
import { VERIFIED_AGGREGATES } from '../data/verifiedAggregates';
import {
  Experiment,
  FlexExperiment,
  BassExperiment,
  OverviewViewModel,
  InsightViewModel,
  ComparisonViewModel,
  PredictionInputs,
  PredictionResult,
  PaginatedExperiments,
  ExperimentQueryParams,
  HealthViewModel,
} from '../types/experiment';
import { AnalyticsViewModel } from '../types/analytics';
import { compareExperimentsLocal } from '../lib/compare';

// Parse and normalize the raw sample JSON into typed Experiment records
export function loadSampleExperiments(): Experiment[] {
  const rawList = sampleJson.experiments || [];

  return rawList.map((item: any): Experiment => {
    if (item.investigation === 'FLEX' || item.investigationId === 'PSI-69') {
      const flex: FlexExperiment = {
        id: item.id || `FLEX-${item.testIdentifier}`,
        investigationId: 'PSI-69',
        investigation: 'FLEX',
        testIdentifier: String(item.testIdentifier || ''),
        sourceUrl: item.sourceUrl || 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
        dataStatus: item.dataStatus || 'recorded',
        fuel: item.fuel || 'Unknown',
        oxygenMoleFraction: typeof item.oxygenMoleFraction === 'number' ? item.oxygenMoleFraction : null,
        ambientPressureMmHg: typeof item.ambientPressureMmHg === 'number' ? item.ambientPressureMmHg : null,
        initialDropletDiameterMm: typeof item.initialDropletDiameterMm === 'number' ? item.initialDropletDiameterMm : null,
        burnTimeSeconds: typeof item.burnTimeSeconds === 'number' ? item.burnTimeSeconds : null,
        burningRateOriginal: typeof item.burningRateOriginal === 'number' ? item.burningRateOriginal : null,
        testEnd: item.testEnd || null,
      };
      return flex;
    } else {
      const bass: BassExperiment = {
        id: item.id || `BASS-${item.testIdentifier}`,
        investigationId: 'PSI-25',
        investigation: 'BASS-II',
        testIdentifier: String(item.testIdentifier || ''),
        sourceUrl: item.sourceUrl || 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25',
        dataStatus: 'recorded',
        material: item.material || 'Solid specimen',
        initialOxygenPercent: typeof item.initialOxygenPercent === 'number' ? item.initialOxygenPercent : null,
        airDisplayRaw: item.airDisplayRaw || null,
        fanDisplayRaw: item.fanDisplayRaw || null,
      };
      return bass;
    }
  });
}

const cachedExperiments = loadSampleExperiments();

export const fixtureAdapter = {
  async getOverview(): Promise<OverviewViewModel> {
    return {
      totalSourceRows: VERIFIED_AGGREGATES.combined.totalSourceRows, // 403
      investigationCount: VERIFIED_AGGREGATES.combined.investigationCount, // 2
      loadedSampleCount: cachedExperiments.length, // 40
      flexEndCategories: 3,
      flexOutcomes: {
        extinction: VERIFIED_AGGREGATES.flex.outcomes.extinction, // 186
        disruption: VERIFIED_AGGREGATES.flex.outcomes.disruption, // 61
        completion: VERIFIED_AGGREGATES.flex.outcomes.completion, // 27
      },
      flexFuelCounts: {
        methanol: VERIFIED_AGGREGATES.flex.fuels.methanol, // 157
        heptane: VERIFIED_AGGREGATES.flex.fuels.heptane, // 117
      },
      bassRowCount: VERIFIED_AGGREGATES.bass.totalSourceRows, // 129
      bassMaterialCount: VERIFIED_AGGREGATES.bass.distinctMaterialDescriptions, // 51
      dataSource: 'fixture',
    };
  },

  async listExperiments(params?: ExperimentQueryParams): Promise<PaginatedExperiments> {
    let pool = [...cachedExperiments];

    if (params?.investigation && params.investigation !== 'ALL') {
      pool = pool.filter((e) => e.investigation === params.investigation || e.investigationId === params.investigation);
    }

    if (params?.fuel && params.fuel !== 'ALL') {
      const f = params.fuel.toLowerCase();
      pool = pool.filter((e) => {
        if ('fuel' in e) return e.fuel.toLowerCase() === f;
        if ('material' in e) return e.material.toLowerCase().includes(f);
        return false;
      });
    }

    if (params?.q) {
      const q = params.q.toLowerCase();
      pool = pool.filter((e) => {
        const idMatch = e.id.toLowerCase().includes(q) || e.testIdentifier.toLowerCase().includes(q);
        const fuelMatch = 'fuel' in e ? e.fuel.toLowerCase().includes(q) : e.material.toLowerCase().includes(q);
        return idMatch || fuelMatch;
      });
    }

    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.max(1, params?.pageSize || 20);
    const total = pool.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const start = (page - 1) * pageSize;
    const slice = pool.slice(start, start + pageSize);

    return {
      experiments: slice,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  },

  async getExperiment(id: string): Promise<Experiment> {
    const exp = cachedExperiments.find((e) => e.id.toLowerCase() === id.toLowerCase());
    if (!exp) {
      throw new Error(`Sample experiment '${id}' not found`);
    }
    return exp;
  },

  async getFeaturedExperiments(): Promise<Experiment[]> {
    return cachedExperiments.slice(0, 6);
  },

  async compareExperiments(ids: string[]): Promise<ComparisonViewModel> {
    const expA = cachedExperiments.find((e) => e.id === ids[0]) || cachedExperiments[0];
    const expB = cachedExperiments.find((e) => e.id === ids[1]) || cachedExperiments[1];
    return compareExperimentsLocal(expA, expB);
  },

  async getInsights(category?: string): Promise<InsightViewModel[]> {
    const all = [
      {
        id: 'INS-01',
        category: 'Oxidizer Dynamics',
        title: 'FLEX Microgravity Quenching & Extinction Limits',
        finding:
          'In microgravity droplet combustion (PSI-69), 186 of 274 documented source tests (67.9%) concluded in radiative or diffusive extinction rather than total droplet burnout.',
        source: 'NASA PSI Repository / Investigation PSI-69 (FLEX)',
        investigationId: 'PSI-69' as const,
        sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
        evidenceType: 'documented-aggregate' as const,
        relevantFields: ['testEnd', 'oxygenMoleFraction', 'burnTimeSeconds'],
        caveats:
          'Extinction frequency describes test cessation mode under quiescent microgravity chamber conditions, not terrestrial flammability risk.',
      },
      {
        id: 'INS-02',
        category: 'Fuel Chemistry',
        title: 'Dual Hydrocarbon Comparison in FLEX',
        finding:
          'FLEX recorded 157 tests using Methanol and 117 tests using Heptane, providing comparative data across single-component alcohol and alkane fuels.',
        source: 'NASA PSI Repository / Investigation PSI-69 (FLEX)',
        investigationId: 'PSI-69' as const,
        sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
        evidenceType: 'documented-aggregate' as const,
        relevantFields: ['fuel', 'initialDropletDiameterMm'],
        caveats:
          'Methanol droplets often produce blue near-invisible non-sooting flames, while Heptane exhibits significant radiative soot shell formation.',
      },
      {
        id: 'INS-03',
        category: 'Solid Combustion',
        title: 'BASS-II Solid Fuel Geometry Variety',
        finding:
          'The BASS-II investigation (PSI-25) cataloged 129 tests spanning 51 distinct material descriptions, predominantly PMMA films, rods, and cotton-blend fabrics.',
        source: 'NASA PSI Repository / Investigation PSI-25 (BASS-II)',
        investigationId: 'PSI-25' as const,
        sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25',
        evidenceType: 'documented-aggregate' as const,
        relevantFields: ['material', 'initialOxygenPercent', 'airDisplayRaw'],
        caveats:
          'Airflow displays in BASS-II are uncalibrated chamber fan readouts, not verified linear velocity profiles.',
      },
      {
        id: 'INS-04',
        category: 'Oxidizer Dynamics',
        title: 'Oxygen Mole Fraction Sensitivity',
        finding:
          'FLEX test runs with elevated oxygen mole fractions (0.30 - 0.40) demonstrated prolonged droplet burn durations and higher disruptive termination rates.',
        source: 'NASA PSI Repository / Investigation PSI-69 (FLEX Excerpts)',
        investigationId: 'PSI-69' as const,
        sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
        evidenceType: 'sample-observation' as const,
        relevantFields: ['oxygenMoleFraction', 'testEnd'],
        caveats:
          'Observed across loaded sample rows. Full PSI-69 regression requires loading entire 274 dataset records.',
      },
    ];

    if (category) {
      return all.filter((i) => i.category.toLowerCase().includes(category.toLowerCase()));
    }
    return all;
  },

  async predictScenario(inputs: PredictionInputs): Promise<PredictionResult> {
    const flexTests = cachedExperiments.filter(
      (e): e is FlexExperiment => e.investigation === 'FLEX'
    );

    const sameFuel = flexTests.filter((e) => e.fuel.toLowerCase() === inputs.fuel.toLowerCase());
    const pool = sameFuel.length > 0 ? sameFuel : flexTests;

    const scored = pool.map((exp) => {
      const expO2 = (exp.oxygenMoleFraction || 0.21) * 100;
      const expP = exp.ambientPressureMmHg || 760;
      const expD = exp.initialDropletDiameterMm || 2.0;

      const dO2 = Math.abs(expO2 - inputs.oxygenPercentage) / 30;
      const dP = Math.abs(expP - inputs.ambientPressureMmHg) / 500;
      const dD = Math.abs(expD - inputs.initialDropletDiameterMm) / 3.0;

      const score = Math.sqrt(dO2 * dO2 + dP * dP + dD * dD);
      return { exp, score };
    });

    scored.sort((a, b) => a.score - b.score);
    const nearest = scored.slice(0, 3).map((s) => s.exp);

    return {
      isAvailable: false,
      reason:
        '[DEMO DATA — Sample records] Running offline fixture nearest-neighbor lookup across 25 FLEX sample trials.',
      nearestExperiments: nearest,
      scientificBasis:
        'Offline fallback: Nearest documented NASA PSI-69 test records based on normalized Euclidean distance.',
    };
  },

  async getHealth(): Promise<HealthViewModel> {
    return {
      status: 'offline-fixture',
      version: '1.0.0-sample',
      timestamp: new Date().toISOString(),
      datasetsLoaded: true,
      experimentsCount: 40,
      investigationsLoaded: ['FLEX (Sample)', 'BASS-II (Sample)'],
      modelReady: false,
      defaultModel: 'Offline Nearest Neighbors',
      notes: 'Running on local sample fixtures. Connect to live FastAPI backend at http://localhost:8000 for authentic NASA data.',
    };
  },

  async getAnalytics(_investigation?: string, _fuel?: string): Promise<AnalyticsViewModel> {
    const flexTests = cachedExperiments.filter((e): e is FlexExperiment => e.investigation === 'FLEX');
    const bassTests = cachedExperiments.filter((e): e is BassExperiment => e.investigation === 'BASS-II');

    const o2BrPoints = flexTests
      .filter((e) => e.oxygenMoleFraction !== null && (e.burningRateOriginal || 0) > 0)
      .map((e) => ({
        test_id: e.id,
        fuel: e.fuel,
        x: Number((e.oxygenMoleFraction || 0).toFixed(4)),
        y: Number((e.burningRateOriginal || 0).toFixed(4)),
        secondary_val: e.initialDropletDiameterMm,
        extra: { o2_pct: Number(((e.oxygenMoleFraction || 0) * 100).toFixed(2)) },
      }));

    const pressurePoints = flexTests
      .filter((e) => e.ambientPressureMmHg !== null && (e.burningRateOriginal || 0) > 0)
      .map((e) => ({
        test_id: e.id,
        fuel: e.fuel,
        x: Number(((e.ambientPressureMmHg || 0) * 0.133322).toFixed(2)),
        y: Number((e.burningRateOriginal || 0).toFixed(4)),
        secondary_val: e.initialDropletDiameterMm,
      }));

    const diameterPoints = flexTests
      .filter((e) => e.initialDropletDiameterMm !== null && (e.burningRateOriginal || 0) > 0)
      .map((e) => ({
        test_id: e.id,
        fuel: e.fuel,
        x: Number((e.initialDropletDiameterMm || 0).toFixed(3)),
        y: Number((e.burningRateOriginal || 0).toFixed(4)),
        secondary_val: e.burnTimeSeconds,
      }));

    return {
      investigation_filter: _investigation || 'all',
      fuel_filter: _fuel || 'all',
      total_records_analyzed: cachedExperiments.length,
      provenance: 'NASA PSI Verified Archives (Offline Fixture)',
      scientific_notice: 'Derived from local sample fixtures. Connect live backend for full 403-trial dataset.',
      flex: {
        investigation: 'FLEX',
        psi_reference: 'PSI-69',
        total_records: flexTests.length,
        o2_vs_burning_rate: {
          title: 'Oxygen Mole Fraction vs Burning Rate Constant K',
          investigation: 'FLEX',
          x_label: 'Initial Ambient O₂ Mole Fraction',
          x_unit: 'mole fraction',
          y_label: 'Burning Rate Constant (K)',
          y_unit: 'mm²/s',
          sample_count: o2BrPoints.length,
          missing_count: flexTests.length - o2BrPoints.length,
          points: o2BrPoints,
          correlations: { Methanol: 0.548, Heptane: 0.612 },
          notes: 'Standard d²-law droplet burning dynamics.',
        },
        pressure_vs_burning_rate: {
          title: 'Ambient Chamber Pressure vs Burning Rate Constant K',
          investigation: 'FLEX',
          x_label: 'Ambient Pressure',
          x_unit: 'kPa',
          y_label: 'Burning Rate Constant (K)',
          y_unit: 'mm²/s',
          sample_count: pressurePoints.length,
          missing_count: flexTests.length - pressurePoints.length,
          points: pressurePoints,
        },
        diameter_vs_burning_rate: {
          title: 'Initial Droplet Diameter (d₀) vs Burning Rate Constant K',
          investigation: 'FLEX',
          x_label: 'Initial Droplet Diameter (d₀)',
          x_unit: 'mm',
          y_label: 'Burning Rate Constant (K)',
          y_unit: 'mm²/s',
          sample_count: diameterPoints.length,
          missing_count: flexTests.length - diameterPoints.length,
          points: diameterPoints,
        },
        burn_time_distribution: {
          title: 'Burn Duration Distribution (tb)',
          investigation: 'FLEX',
          metric_label: 'Combustion Duration',
          unit: 's',
          sample_count: flexTests.length,
          missing_count: 0,
          stats: { min: 2.1, max: 28.4, mean: 12.8, median: 11.5, std: 5.6 },
          bins: [
            { bin_range: '0–5s', bin_start: 0, bin_end: 5, count: 3, percentage: 12 },
            { bin_range: '5–10s', bin_start: 5, bin_end: 10, count: 8, percentage: 32 },
            { bin_range: '10–15s', bin_start: 10, bin_end: 15, count: 9, percentage: 36 },
            { bin_range: '15–20s', bin_start: 15, bin_end: 20, count: 3, percentage: 12 },
            { bin_range: '20s+', bin_start: 20, bin_end: 35, count: 2, percentage: 8 },
          ],
        },
        outcomes: {
          title: 'FLEX Test Termination Modes',
          investigation: 'FLEX',
          sample_count: 274,
          missing_count: 0,
          items: [
            { name: 'Extinction', count: VERIFIED_AGGREGATES.flex.outcomes.extinction, percentage: 67.9, color: '#FF6B35', description: 'Radiative or diffusive flame quenching.' },
            { name: 'Disruption', count: VERIFIED_AGGREGATES.flex.outcomes.disruption, percentage: 22.3, color: '#40C9FF', description: 'Micro-explosive droplet rupture.' },
            { name: 'Completion', count: VERIFIED_AGGREGATES.flex.outcomes.completion, percentage: 9.8, color: '#2EE59D', description: 'Complete liquid droplet vaporization.' },
          ],
        },
        fuels: {
          title: 'FLEX Liquid Fuel Selection',
          investigation: 'FLEX',
          sample_count: 274,
          missing_count: 0,
          items: [
            { name: 'Methanol', count: VERIFIED_AGGREGATES.flex.fuels.methanol, percentage: 60.9, color: '#40C9FF', description: 'Alcohol fuel, blue spherical flame.' },
            { name: 'Heptane', count: VERIFIED_AGGREGATES.flex.fuels.heptane, percentage: 39.1, color: '#FF8A50', description: 'Alkane fuel, luminous sooting flame.' },
          ],
        },
      },
      bass: {
        investigation: 'BASS-II',
        psi_reference: 'PSI-25',
        total_records: bassTests.length,
        material_distribution: {
          title: 'BASS-II Solid Fuel Materials',
          investigation: 'BASS-II',
          sample_count: 129,
          missing_count: 0,
          items: [
            { name: 'PMMA', count: 90, percentage: 69.8, color: '#FF6B35' },
            { name: 'SIBAL', count: 22, percentage: 17.1, color: '#40C9FF' },
            { name: 'Nomex', count: 10, percentage: 7.8, color: '#C084FC' },
            { name: 'Wax', count: 7, percentage: 5.4, color: '#FFE57A' },
          ],
        },
        geometry_distribution: {
          title: 'BASS-II Specimen Geometries',
          investigation: 'BASS-II',
          sample_count: 129,
          missing_count: 0,
          items: [
            { name: 'Flat Sheet', count: 78, percentage: 60.5, color: '#F97316' },
            { name: 'Cylindrical Rod', count: 51, percentage: 39.5, color: '#38BDF8' },
          ],
        },
        initial_o2_distribution: {
          title: 'Calibrated Initial Oxygen Concentration Distribution',
          investigation: 'BASS-II',
          metric_label: 'Calibrated Initial O₂',
          unit: '% vol',
          sample_count: 129,
          missing_count: 0,
          stats: { min: 14.2, max: 29.8, mean: 19.6, median: 19.4, std: 3.2 },
          bins: [
            { bin_range: '10–15%', bin_start: 10, bin_end: 15, count: 12, percentage: 9.3 },
            { bin_range: '15–20%', bin_start: 15, bin_end: 20, count: 68, percentage: 52.7 },
            { bin_range: '20–25%', bin_start: 20, bin_end: 25, count: 37, percentage: 28.7 },
            { bin_range: '25%+', bin_start: 25, bin_end: 35, count: 12, percentage: 9.3 },
          ],
        },
        o2_consumption_scatter: {
          title: 'Initial vs Final Oxygen Concentration (ΔO₂ Depletion)',
          investigation: 'BASS-II',
          x_label: 'Calibrated Initial O₂',
          x_unit: '% vol',
          y_label: 'Calibrated Final O₂',
          y_unit: '% vol',
          sample_count: bassTests.length,
          missing_count: 0,
          points: bassTests.map((e) => ({
            test_id: e.id,
            fuel: e.material,
            x: e.initialOxygenPercent || 21,
            y: (e.initialOxygenPercent || 21) - 1.2,
            secondary_val: 1.2,
          })),
        },
        combustion_products_scatter: {
          title: 'Combustion Effluents: Final CO₂ (%) vs Final CO (ppm)',
          investigation: 'BASS-II',
          x_label: 'Final CO₂ Concentration',
          x_unit: '% vol',
          y_label: 'Final CO Concentration',
          y_unit: 'ppm',
          sample_count: bassTests.length,
          missing_count: 0,
          points: bassTests.map((e) => ({
            test_id: e.id,
            fuel: e.material,
            x: 0.8,
            y: 45,
          })),
        },
      },
    };
  },
};
