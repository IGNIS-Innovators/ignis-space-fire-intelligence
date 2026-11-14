/**
 * IGNIS — Scientific API Adapter
 * Translates between FastAPI backend Pydantic schemas and frontend React view models.
 * Handles snake_case <-> camelCase, SI unit conversions, paginated envelopes,
 * and scientific validation constraints.
 */

import {
  Experiment,
  FlexExperiment,
  BassExperiment,
  isFlexExperiment,
  isBassExperiment,
  OverviewViewModel,
  InsightViewModel,
  ComparisonViewModel,
  NumericDelta,
  PredictionInputs,
  PredictionResult,
  PaginatedExperiments,
  HealthViewModel,
} from '../types/experiment';
import { AnalyticsViewModel } from '../types/analytics';

// ============================================================================
// Unit Conversion Constants (SI <-> NASA PSI Traditional Units)
// ============================================================================
export const MMHG_TO_KPA = 0.133322368;
export const KPA_TO_MMHG = 7.50061683;

export function mmhgToKpa(mmhg: number): number {
  return mmhg * MMHG_TO_KPA;
}

export function kpaToMmhg(kpa: number): number {
  return kpa * KPA_TO_MMHG;
}

export function percentToMoleFraction(pct: number): number {
  return pct / 100.0;
}

export function moleFractionToPercent(mf: number): number {
  return mf * 100.0;
}

// ============================================================================
// 1. Overview Adapter
// ============================================================================
export function transformOverviewResponse(data: any): OverviewViewModel {
  const outcomes = data.flex_outcomes || {};
  const fuels = data.fuel_distribution || {};

  return {
    totalSourceRows: Number(data.total_experiments || 403),
    investigationCount: Number(data.total_investigations || 2),
    loadedSampleCount: Number(data.total_experiments || 403),
    flexEndCategories: 3,
    flexOutcomes: {
      extinction: Number(outcomes.Extinction || outcomes.extinction || 186),
      disruption: Number(outcomes.Disruption || outcomes.disruption || 61),
      completion: Number(outcomes.Completion || outcomes.completion || 27),
    },
    flexFuelCounts: {
      methanol: Number(fuels.Methanol || fuels.methanol || 157),
      heptane: Number(fuels.Heptane || fuels.heptane || 117),
    },
    bassRowCount: 129,
    bassMaterialCount: 51,
    dataSource: 'api',
    lastUpdated: new Date().toISOString(),
    numericSummaries: data.numeric_summaries || {},
  };
}

// ============================================================================
// 2. Experiment Summary & Detail Adapters
// ============================================================================
export function transformBackendSummary(item: any): Experiment {
  const isFlex =
    item.investigation === 'FLEX' ||
    item.investigation_id === 'PSI-69' ||
    String(item.id).startsWith('FLEX');

  if (isFlex) {
    const rawPressure = item.ambient_pressure_kpa;
    const rawO2 = item.oxygen_percentage;
    const testNum = item.test_number || String(item.id).replace('FLEX-', '');

    const flex: FlexExperiment = {
      id: item.id,
      investigationId: 'PSI-69',
      investigation: 'FLEX',
      testIdentifier: String(testNum),
      sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
      dataStatus: 'recorded',
      fuel: item.fuel_name || item.fuel || 'Unknown',
      oxygenMoleFraction: typeof rawO2 === 'number' ? percentToMoleFraction(rawO2) : null,
      ambientPressureMmHg: typeof rawPressure === 'number' ? Math.round(kpaToMmhg(rawPressure) * 10) / 10 : null,
      initialDropletDiameterMm: null, // populated by detail
      burnTimeSeconds: typeof item.burn_time_s === 'number' ? item.burn_time_s : null,
      burningRateOriginal: typeof item.burning_rate_mm2_s === 'number' ? item.burning_rate_mm2_s : null,
      testEnd: item.outcome || (item.extinction_observed ? 'Extinction' : null),
      date: item.date || null,
    };
    return flex;
  } else {
    const rawO2 = item.oxygen_percentage;
    const testNum = item.test_number || String(item.id).replace('BASS-II-', '');

    const bass: BassExperiment = {
      id: item.id,
      investigationId: 'PSI-25',
      investigation: 'BASS-II',
      testIdentifier: String(testNum),
      sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25',
      dataStatus: 'recorded',
      material: item.fuel_name || item.material || 'Solid specimen',
      initialOxygenPercent: typeof rawO2 === 'number' ? rawO2 : null,
      airDisplayRaw: null,
      fanDisplayRaw: null,
      date: item.date || null,
    };
    return bass;
  }
}

export function transformBackendDetail(item: any): Experiment {
  const base = transformBackendSummary(item);
  const chamber = item.chamber_parameters || {};
  const measurements = item.measurements || {};

  base.date = item.date || null;
  base.pi = item.pi || null;
  base.apparatus = item.apparatus || null;
  base.dataQualityFlags = item.data_quality_flags || {};
  base.sourceFile = item.source_file || null;
  base.chamberParameters = chamber;
  base.measurements = measurements;

  if (isFlexExperiment(base)) {
    if (typeof chamber.pressure_mmhg === 'number') {
      base.ambientPressureMmHg = chamber.pressure_mmhg;
    }
    if (typeof chamber.o2_mole_fraction === 'number') {
      base.oxygenMoleFraction = chamber.o2_mole_fraction;
    }
    if (typeof measurements.initial_diameter_mm === 'number') {
      base.initialDropletDiameterMm = measurements.initial_diameter_mm;
    }
    if (typeof measurements.burn_duration_s === 'number') {
      base.burnTimeSeconds = measurements.burn_duration_s;
    }
    if (typeof measurements.burning_rate_constant_mm2_s === 'number') {
      base.burningRateOriginal = measurements.burning_rate_constant_mm2_s;
    }
    if (item.outcome) {
      base.testEnd = item.outcome;
    }
  } else if (isBassExperiment(base)) {
    if (typeof chamber.o2_percentage === 'number') {
      base.initialOxygenPercent = chamber.o2_percentage;
    }
    if (chamber.flow_velocity_cm_s !== undefined && chamber.flow_velocity_cm_s !== null) {
      base.airDisplayRaw = `${chamber.flow_velocity_cm_s} cm/s`;
    }
    if (item.fuel_material_raw) {
      base.material = item.fuel_material_raw;
    }
  }

  return base;
}

export function transformPaginatedExperiments(data: any): PaginatedExperiments {
  const rawList = Array.isArray(data) ? data : data?.results || [];
  const total = Number(data?.total ?? rawList.length);
  const page = Number(data?.page ?? 1);
  const pageSize = Number(data?.page_size ?? (rawList.length || 20));
  const totalPages = Number(data?.total_pages ?? Math.max(1, Math.ceil(total / (pageSize || 1))));

  const experiments = rawList.map((item: any) =>
    item.chamber_parameters ? transformBackendDetail(item) : transformBackendSummary(item)
  );

  return {
    experiments,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

// ============================================================================
// 3. Comparison Adapter
// ============================================================================
function computeDelta(
  field: string,
  label: string,
  unit: string,
  valA: number | null,
  valB: number | null,
  note?: string
): NumericDelta {
  let delta: number | null = null;
  let deltaPercent: number | null = null;

  if (valA !== null && valB !== null && !isNaN(valA) && !isNaN(valB)) {
    delta = valB - valA;
    if (valA !== 0) {
      deltaPercent = (delta / valA) * 100;
    }
  }

  return {
    field,
    label,
    unit,
    valA,
    valB,
    delta,
    deltaPercent,
    note,
  };
}

export function transformCompareResponse(res: any): ComparisonViewModel {
  const exps = (res.experiments || []).map(transformBackendDetail);
  const expA = exps[0] || ({} as Experiment);
  const expB = exps[1] || exps[0] || ({} as Experiment);

  const isCompatible = Boolean(res.investigation_homogeneity);
  const compatibilityReason =
    res.comparability_notice ||
    (isCompatible
      ? 'Experiments originate from compatible scientific investigations.'
      : 'Incompatible physical regimes: Liquid droplet combustion vs solid material combustion.');

  // Build numeric deltas from backend matrix or computed from exps
  const numericDeltas: NumericDelta[] = [];
  const qualitativeDifferences: Array<{ property: string; valueA: string; valueB: string }> = [];

  if (Array.isArray(res.matrix)) {
    for (const row of res.matrix) {
      const valA = row.values?.[res.requested_ids?.[0] || expA.id];
      const valB = row.values?.[res.requested_ids?.[1] || expB.id];

      if (typeof valA === 'number' || typeof valB === 'number') {
        numericDeltas.push(
          computeDelta(
            row.parameter.toLowerCase().replace(/\s+/g, '_'),
            row.parameter,
            row.unit || '',
            typeof valA === 'number' ? valA : null,
            typeof valB === 'number' ? valB : null
          )
        );
      } else if (valA !== undefined || valB !== undefined) {
        qualitativeDifferences.push({
          property: row.parameter,
          valueA: String(valA ?? '—'),
          valueB: String(valB ?? '—'),
        });
      }
    }
  }

  // Fallback deltas if matrix is empty
  if (numericDeltas.length === 0 && isCompatible && isFlexExperiment(expA) && isFlexExperiment(expB)) {
    numericDeltas.push(
      computeDelta('oxygenMoleFraction', 'Chamber Oxygen', 'mole frac', expA.oxygenMoleFraction, expB.oxygenMoleFraction),
      computeDelta('ambientPressureMmHg', 'Chamber Pressure', 'mmHg', expA.ambientPressureMmHg, expB.ambientPressureMmHg),
      computeDelta('initialDropletDiameterMm', 'Droplet Diameter', 'mm', expA.initialDropletDiameterMm, expB.initialDropletDiameterMm),
      computeDelta('burnTimeSeconds', 'Burn Duration', 's', expA.burnTimeSeconds, expB.burnTimeSeconds),
      computeDelta('burningRateOriginal', 'Burning Rate Constant', 'mm²/s', expA.burningRateOriginal, expB.burningRateOriginal)
    );
  }

  return {
    experimentA: expA,
    experimentB: expB,
    isCompatible,
    compatibilityReason,
    numericDeltas,
    qualitativeDifferences,
    dataSource: 'api',
    matrix: res.matrix,
    chartSeries: res.chart_series,
  };
}

// ============================================================================
// 4. ML Prediction Adapter
// ============================================================================
export function buildPredictionPayload(inputs: PredictionInputs) {
  const o2Fraction = percentToMoleFraction(inputs.oxygenPercentage);
  const pressureKpa = mmhgToKpa(inputs.ambientPressureMmHg);

  // Validate and balance inert diluents
  const co2 = inputs.co2MoleFraction ?? 0.0;
  const he = inputs.heMoleFraction ?? 0.0;
  const specifiedInerts = co2 + he;
  const remaining = Math.max(0, 1.0 - o2Fraction - specifiedInerts);
  const n2 = inputs.n2MoleFraction !== undefined ? inputs.n2MoleFraction : remaining;

  return {
    fuel: inputs.fuel,
    ambient_pressure_kpa: Math.round(pressureKpa * 1000) / 1000,
    o2_mole_fraction: Math.round(o2Fraction * 1000) / 1000,
    n2_mole_fraction: Math.round(n2 * 1000) / 1000,
    co2_mole_fraction: Math.round(co2 * 1000) / 1000,
    he_mole_fraction: Math.round(he * 1000) / 1000,
    droplet_initial_diameter_mm: inputs.initialDropletDiameterMm,
    model_choice: inputs.modelChoice || 'ridge',
  };
}

export function transformPredictionResponse(res: any): PredictionResult {
  return {
    isAvailable: true,
    predictedBurningRateConstant: res.predicted_burning_rate_constant,
    units: res.units || 'mm2/s',
    modelName: res.model_name,
    modelVersion: res.model_version || '1.0.0-flex',
    modelSelectionBasis: res.model_selection_basis,
    isExtrapolation: Boolean(res.is_extrapolation),
    extrapolationWarnings: Array.isArray(res.extrapolation_warnings) ? res.extrapolation_warnings : [],
    scientificDisclaimer: res.scientific_disclaimer,
    scientificNotes: res.scientific_notes,
    physicalDomain: res.physical_domain,
    nearestExperiments: [],
    scientificBasis:
      res.model_selection_basis ||
      'Trained scikit-learn regression pipeline evaluated via 5-fold cross-validation on authentic NASA PSI-69 experiments.',
  };
}

// ============================================================================
// 5. AI Insights Adapter
// ============================================================================
export function transformInsightsResponse(res: any): InsightViewModel[] {
  const rawList = Array.isArray(res) ? res : res?.insights || [];

  return rawList.map((item: any): InsightViewModel => {
    const isBass = item.id === 'INS-04' || (item.category && item.category.toLowerCase().includes('solid'));
    const invId = isBass ? 'PSI-25' : 'PSI-69';
    const sourceUrl = isBass
      ? 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25'
      : 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69';

    return {
      id: item.id,
      category: item.category || 'Combustion Physics',
      title: item.title || 'Microgravity Combustion Insight',
      finding: item.finding || '',
      evidenceSummary: item.evidence_summary || '',
      supportingExperimentIds: Array.isArray(item.supporting_experiment_ids) ? item.supporting_experiment_ids : [],
      statisticalBasis: item.statistical_basis || '',
      scientificImplication: item.scientific_implication || '',
      dataType: item.data_type || 'empirical_correlation',
      source: `NASA Physical Sciences Informatics (${invId})`,
      investigationId: invId,
      sourceUrl,
      evidenceType: 'documented-aggregate',
      relevantFields: ['oxygenMoleFraction', 'ambientPressureKpa', 'burningRateConstant'],
      caveats:
        item.scientific_implication ||
        'Derived from quiescent microgravity experiments; flammability boundaries require cabin flow considerations.',
    };
  });
}

// ============================================================================
// 6. Health Adapter
// ============================================================================
export function transformHealthResponse(res: any): HealthViewModel {
  return {
    status: res.status || 'unknown',
    version: res.version || '1.0.0',
    timestamp: res.timestamp || new Date().toISOString(),
    datasetsLoaded: Boolean(res.datasets_loaded),
    experimentsCount: Number(res.experiments_count || 0),
    investigationsLoaded: Array.isArray(res.investigations_loaded) ? res.investigations_loaded : [],
    modelReady: Boolean(res.model_ready),
    defaultModel: res.default_model || 'Ridge Regression (Tuned)',
    notes: res.notes,
  };
}

// ============================================================================
// 7. Analytics Adapter
// ============================================================================
export function transformAnalyticsResponse(res: any): AnalyticsViewModel {
  return {
    investigation_filter: res.investigation_filter || 'all',
    fuel_filter: res.fuel_filter || 'all',
    total_records_analyzed: Number(res.total_records_analyzed || 0),
    provenance: res.provenance || 'NASA PSI Archives',
    scientific_notice: res.scientific_notice || '',
    flex: res.flex || null,
    bass: res.bass || null,
  };
}
