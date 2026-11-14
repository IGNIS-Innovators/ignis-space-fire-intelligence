// IGNIS Experiment Types — discriminated union for FLEX and BASS-II

export type InvestigationId = 'PSI-69' | 'PSI-25';
export type InvestigationName = 'FLEX' | 'BASS-II';

export interface BaseExperiment {
  id: string;
  investigationId: InvestigationId;
  investigation: InvestigationName;
  testIdentifier: string;
  sourceUrl: string;
  dataStatus: string;
  date?: string | null;
  pi?: string | null;
  apparatus?: string | null;
  dataQualityFlags?: Record<string, boolean>;
  sourceFile?: string;
  chamberParameters?: Record<string, any>;
  measurements?: Record<string, any>;
}

export interface FlexExperiment extends BaseExperiment {
  investigation: 'FLEX';
  investigationId: 'PSI-69';
  fuel: string;
  oxygenMoleFraction: number | null;
  ambientPressureMmHg: number | null;
  initialDropletDiameterMm: number | null;
  burnTimeSeconds: number | null;
  burningRateOriginal: number | null;
  testEnd: string | null;
}

export interface BassExperiment extends BaseExperiment {
  investigation: 'BASS-II';
  investigationId: 'PSI-25';
  material: string;
  initialOxygenPercent: number | null;
  airDisplayRaw: string | null;
  fanDisplayRaw: string | null;
}

export type Experiment = FlexExperiment | BassExperiment;

export function isFlexExperiment(exp: Experiment): exp is FlexExperiment {
  return exp.investigation === 'FLEX';
}

export function isBassExperiment(exp: Experiment): exp is BassExperiment {
  return exp.investigation === 'BASS-II';
}

export interface DatasetDescriptor {
  id: InvestigationId;
  name: InvestigationName;
  rowCount: number;
  domain: string;
}

export interface IgnisFixture {
  notice: string;
  datasets: DatasetDescriptor[];
  experiments: Array<Record<string, unknown>>;
}

// Pagination & Query Types
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedExperiments {
  experiments: Experiment[];
  pagination: PaginationMeta;
}

export interface ExperimentQueryParams {
  page?: number;
  pageSize?: number;
  investigation?: string;
  fuel?: string;
  q?: string;
  pressureMin?: number;
  pressureMax?: number;
  o2Min?: number;
  o2Max?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// View Models for UI
export interface OverviewViewModel {
  totalSourceRows: number;
  investigationCount: number;
  loadedSampleCount: number;
  flexEndCategories: number;
  flexOutcomes: {
    extinction: number;
    disruption: number;
    completion: number;
  };
  flexFuelCounts: {
    methanol: number;
    heptane: number;
  };
  bassRowCount: number;
  bassMaterialCount: number;
  dataSource: 'api' | 'fixture';
  lastUpdated?: string;
  numericSummaries?: Record<string, any>;
}

export interface InsightViewModel {
  id: string;
  category?: string;
  title: string;
  finding: string;
  evidenceSummary?: string;
  supportingExperimentIds?: string[];
  statisticalBasis?: string;
  scientificImplication?: string;
  dataType?: string;
  source: string;
  investigationId: InvestigationId;
  sourceUrl: string;
  evidenceType: 'documented-aggregate' | 'sample-observation' | 'source-metadata';
  relevantFields: string[];
  caveats: string;
  confidenceScore?: number;
}

export interface NumericDelta {
  field: string;
  label: string;
  unit: string;
  valA: number | null;
  valB: number | null;
  delta: number | null;
  deltaPercent: number | null;
  note?: string;
}

export interface ComparisonViewModel {
  experimentA: Experiment;
  experimentB: Experiment;
  isCompatible: boolean;
  compatibilityReason?: string;
  numericDeltas: NumericDelta[];
  qualitativeDifferences: Array<{
    property: string;
    valueA: string;
    valueB: string;
  }>;
  dataSource: 'api' | 'local';
  matrix?: Array<{
    parameter: string;
    category: string;
    unit: string;
    values: Record<string, any>;
  }>;
  chartSeries?: Record<string, any>;
}

export interface PredictionInputs {
  fuel: 'Methanol' | 'Heptane';
  oxygenPercentage: number; // 15 to 40%
  ambientPressureMmHg: number; // 400 to 1000 mmHg
  initialDropletDiameterMm: number; // 1.0 to 4.0 mm
  modelChoice?: 'ridge' | 'random_forest';
  n2MoleFraction?: number;
  co2MoleFraction?: number;
  heMoleFraction?: number;
}

export interface PredictionResult {
  isAvailable: boolean;
  reason?: string;
  predictedBurningRateConstant?: number;
  units?: string;
  modelName?: string;
  modelVersion?: string;
  modelSelectionBasis?: string;
  isExtrapolation?: boolean;
  extrapolationWarnings?: string[];
  scientificDisclaimer?: string;
  scientificNotes?: string;
  physicalDomain?: string;
  nearestExperiments: FlexExperiment[];
  validatedModelVersion?: string;
  scientificBasis?: string;
  simulatedSpreadRateMmS?: number | null;
  extinctionTimeS?: number | null;
}

export interface HealthViewModel {
  status: string;
  version: string;
  timestamp: string;
  datasetsLoaded: boolean;
  experimentsCount: number;
  investigationsLoaded: string[];
  modelReady: boolean;
  defaultModel: string;
  notes?: string;
}

export interface SubmissionPayload {
  submitterName: string;
  institution: string;
  contactEmail: string;
  experimentTitle: string;
  investigationType: 'FLEX-Droplet' | 'BASS-Solid' | 'Other-Microgravity';
  fuelOrMaterial: string;
  ambientPressureKpa?: number;
  oxygenPercentage?: number;
  notes: string;
  fileName?: string;
  fileData?: string;
}
