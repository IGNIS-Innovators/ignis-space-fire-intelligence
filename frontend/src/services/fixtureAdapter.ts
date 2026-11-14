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
};
