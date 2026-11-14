# IGNIS — Space Fire Intelligence
## Phase 4A: Comprehensive Frontend–Backend Integration Audit

**Date**: November 13, 2026  
**Branch**: `feature/full-dashboard`  
**Target Repository**: `ignis-space-fire-intelligence`  
**Purpose**: Complete architectural, scientific, and technical audit of the React/Vite frontend against the live FastAPI scientific backend, real NASA Physical Sciences Informatics (PSI-69 FLEX & PSI-25 BASS-II) datasets, and trained machine learning prediction pipelines.

---

## 1. Executive Summary

| Area | Status | Critical Finding |
| :--- | :---: | :--- |
| **Backend State (Laptop 1)** | **100% Operational** | FastAPI server running on port 8000; all 403 authentic NASA experiments loaded (274 FLEX + 129 BASS-II); Ridge Regression & Random Forest models loaded and inferring; 5 evidence-based AI insights available. |
| **Frontend State (Laptop 2)** | **Compiling & Rendering** | React 18 / Vite 6 compiles cleanly with zero TypeScript errors; dev server active on port 5173. |
| **Frontend-Backend Link** | **DISCONNECTED (Silent Fallback)** | **Every single API call from the frontend currently fails with schema/format mismatches**, causing `dataSource.ts` to silently catch errors and fall back to the 40-record sample fixture (`fixtureAdapter.ts`). |
| **Data Scope Discrepancy** | **403 vs 40 records** | The UI displays "403 Source Table Rows" (from static aggregate constants) while Explorer and Charts only operate on 40 hardcoded fixture rows. |
| **Predictive Lab** | **Artificially Gated** | The frontend gates prediction as "Validated Prediction Unavailable" and runs a mock Euclidean distance formula, while the backend has a fully trained, cross-validated Ridge model ready at `POST /api/predict`. |
| **Units & Formats** | **Multiple Inconsistencies** | Pressure: Frontend uses `mmHg`, backend expects `kPa`. Oxygen: Frontend slider uses `%`, backend prediction expects mole fraction `[0.0, 1.0]`. Request payload keys: Frontend uses camelCase, backend expects snake_case. |
| **Navigation Scope** | **Sprawling (10 routes)** | Navigation contains 10 routes with redundant sub-pages (`/visualization`, `/submit-experiment`). Needs streamlining to the 5 designated core research modules. |

---

## 2. Real API vs. Fixture vs. Hardcoded Inventory

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND DATA FLOW                               │
│                                                                             │
│   Component Calls ──> dataSource.ts                                         │
│                              │                                              │
│               Mode = 'auto'  ▼                                              │
│               Try apiRequest<T> ──> HTTP 422/404 or Schema Mismatch         │
│                              │      (Payloads & Envelope Shapes Differ)     │
│                              ▼                                              │
│                     catch (err) ──> Silent Fallback to fixtureAdapter.ts     │
│                                            │                                │
│                     ┌──────────────────────┴──────────────────────┐         │
│                     ▼                                             ▼         │
│       IGNIS_frontend_sample_data.json             verifiedAggregates.ts     │
│         (Only 40 NASA Excerpt Rows)            (Static Documented Totals)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Endpoint-by-Endpoint Data Source Audit

| Frontend Feature | File Location | Intended Endpoint | Actual Data Source Running | Why It Doesn't Hit Live Backend |
| :--- | :--- | :--- | :--- | :--- |
| **Mission Control KPI Cards** | `src/pages/Dashboard.tsx` | `GET /api/overview` | `verifiedAggregates.ts` via `fixtureAdapter.getOverview()` | Schema mismatch: Backend returns `total_experiments`, `total_investigations`; frontend expects `totalSourceRows`, `loadedSampleCount`. |
| **Outcomes Distribution** | `src/components/charts/OutcomesChart.tsx` | `GET /api/overview` | Hardcoded static import `VERIFIED_AGGREGATES.flex.outcomes` | Component does not even receive data props; hardcoded to static constants. |
| **Fuel Distribution** | `src/components/charts/FuelChart.tsx` | `GET /api/overview` | Hardcoded static import `VERIFIED_AGGREGATES.flex.fuels` | Hardcoded to static constants. |
| **Research Explorer Grid** | `src/pages/ResearchExplorer.tsx` | `GET /api/experiments` | 40-record sample JSON (`IGNIS_frontend_sample_data.json`) | Backend returns `{ total, page, results: [...] }`; frontend expects raw array `Experiment[]`. Response parsing throws $\rightarrow$ falls back. |
| **Detail Drawer** | `src/components/ui/DetailDrawer.tsx` | `GET /api/experiments/{id}` | In-memory object from the 40-record sample list | Frontend never calls the single-experiment detail endpoint; uses shallow record already in memory. |
| **Side-by-Side Comparison** | `src/pages/Comparison.tsx` | `POST /api/compare` | Local computation (`compareExperimentsLocal` in `compare.ts`) | Frontend sends `{ ids: [idA, idB] }`; backend requires `{ experiment_ids: [...] }`. Request fails with HTTP 422 Unprocessable Entity $\rightarrow$ falls back. |
| **Predictive Combustion Lab** | `src/pages/PredictiveLab.tsx` | `POST /api/predict` | Local Euclidean distance search in 25 sample FLEX rows | Frontend sends camelCase `{ oxygenPercentage, ambientPressureMmHg, initialDropletDiameterMm }`; backend requires `{ ambient_pressure_kpa, o2_mole_fraction, n2_mole_fraction, droplet_initial_diameter_mm }`. Fails with HTTP 422 $\rightarrow$ falls back. |
| **AI Insights Cards** | `src/pages/Insights.tsx` | `GET /api/insights` | 4 hardcoded cards in `fixtureAdapter.ts` | Backend returns object `{ insights: [...] }` with statistical fields; frontend expects array `InsightViewModel[]`. Fails with type error $\rightarrow$ falls back. |
| **System Health / Provenance Pill**| `src/components/layout/TopBar.tsx` | `GET /api/health` | Static text `"PSI Data Feed"` | No network request implemented in TopBar. |

---

## 3. Detailed Component & Feature Mapping

| Page / Component | Source File | Claimed Behavior | Current Data Source | Backend Endpoint Available | Schema Match? | Working Today? | Unit / Scientific Issues | Action Recommendation |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **App Navigation / Sidebar** | `components/layout/Sidebar.tsx` | Main navigation menu | Static array `navItems` | N/A | N/A | Yes | Sprawling navigation (10 routes); contains redundant `/visualization` and prototype `/submit-experiment`. | **FIX**: Consolidate to 5 core routes. |
| **TopBar Search & User** | `components/layout/TopBar.tsx` | Global search, live data indicator, researcher profile | Static hardcoded | `GET /api/health` | No | Partial | Researcher hardcoded to "Mohammed Magdy"; Data feed indicator is static text, not bound to `/api/health`. | **CONNECT**: Bind status pill to `/api/health`; make profile neutral. |
| **Mission Control: Hero** | `pages/Dashboard.tsx` | Introduction banner & 3D flame | Static text & Three.js canvas | N/A | N/A | Yes | 3D flame is an artistic sine-wave sphere, not a scientific simulation. | **KEEP**: Has proper conceptual disclaimer. |
| **Mission Control: 4 KPI Cards** | `pages/Dashboard.tsx` | 403 rows, 2 investigations, 40 sample records, 3 outcomes | `verifiedAggregates.ts` | `GET /api/overview` | **No** (Key mismatch) | Partial | "40 loaded sample records" is confusing to users since full dataset has 403 rows. | **CONNECT**: Map to live `/api/overview` properties. Display total 403 records. |
| **Mission Control: Outcomes Panel** | `components/charts/OutcomesChart.tsx` | Distribution of 274 FLEX endings | `VERIFIED_AGGREGATES` constant | `GET /api/overview` (`flex_outcomes`) | Partial | Yes | Static data; doesn't dynamically update if backend dataset changes. | **CONNECT**: Pass backend overview `flex_outcomes` prop. |
| **Mission Control: Combustion Overview** | `pages/Dashboard.tsx` | Microgravity physics summary | Static JSX | N/A | N/A | Yes | Scientifically accurate summary of FLEX vs BASS-II transport physics. | **KEEP** |
| **Mission Control: Latest Evidence** | `pages/Dashboard.tsx` | Documented NASA findings | Static JSX | `GET /api/insights` | N/A | Yes | Displays 3 static cards instead of dynamic insights from backend. | **CONNECT**: Pull top 3 insights from `GET /api/insights`. |
| **Explorer: Search & Filters** | `components/research/ExperimentFilters.tsx` | Text query, investigation chips, fuel & outcome dropdowns | In-memory filter on 40 items (`search.ts`) | `GET /api/experiments` | **No** (Pagination missing) | Client-side only | Filters only run over 40 sample items in browser memory; cannot search the full 403 NASA trials. | **CONNECT**: Pass query params (`q`, `investigation`, `fuel`, `page`) to `GET /api/experiments`. |
| **Explorer: Experiment Cards** | `components/research/ExperimentCard.tsx` | Render experiment summary card | 40 items in memory | `GET /api/experiments` (`results`) | **No** (Field mismatch) | Yes (local) | Uses camelCase `oxygenMoleFraction`, `burnTimeSeconds`; backend returns `oxygen_percentage`, `burn_time_s`. | **CONNECT**: Update adapter to transform backend `ExperimentSummary` $\rightarrow$ UI card props. |
| **Explorer: Detail Drawer** | `components/ui/DetailDrawer.tsx` | Slide-out with full metadata & metrics | Selected card from local array | `GET /api/experiments/{id}` | **No** (Unused endpoint) | Partial | Missing data quality flags, apparatus, PI names, and full chamber gas fractions ($N_2, CO_2, He$). | **CONNECT**: Call `GET /api/experiments/{id}` on card click to show rich verified metadata. |
| **Compare: Experiment Selector** | `pages/Comparison.tsx` | Select 2 tests for comparison | Filtered list from local memory | `POST /api/compare` | **No** (422 payload error) | Yes (local) | Frontend sends `{ ids: [idA, idB] }`; backend expects `{ experiment_ids: [...] }`. | **CONNECT**: Fix request payload to match backend schema. |
| **Compare: Compatibility Banner** | `pages/Comparison.tsx` | Scientific warning when comparing FLEX vs BASS-II | Computed in `compare.ts` | `POST /api/compare` (`comparability_notice`) | Matches logic | Yes | Both client and backend correctly enforce cross-investigation incomparability. | **CONNECT**: Display backend `comparability_notice` and `investigation_homogeneity`. |
| **Compare: Deltas Table** | `pages/Comparison.tsx` | Difference matrix ($B - A$) | Computed in `compare.ts` | `POST /api/compare` (`matrix`) | Partial | Yes (local) | Backend returns pre-aligned multi-parameter matrix for up to 10 trials; frontend only handles 2. | **CONNECT**: Consume backend `matrix` and `chart_series`. |
| **Predictive Lab: Sliders Form** | `pages/PredictiveLab.tsx` | Simulation parameter inputs (fuel, $O_2$, pressure, diameter) | Local state | `POST /api/predict` | **No** (Unit & key mismatch) | Yes | Pressure slider in `mmHg` (400-1000), backend expects `kPa`. $O_2$ in `%` (15-40), backend expects mole fraction. | **FIX & CONNECT**: Convert units before sending request. Expose model choice (`ridge` vs `random_forest`). |
| **Predictive Lab: 3D Chamber** | `components/visuals/ConceptFlameLab3D.tsx` | Interactive 3D combustion preview | Three.js canvas | N/A | N/A | Yes | Has disclaimer "3D conceptual visualization · not experimental measurement". | **KEEP**: Visual aid for droplet suspension geometry. |
| **Predictive Lab: Results Card** | `pages/PredictiveLab.tsx` | Predicted burning rate $K$ & nearest neighbors | Euclidean distance on 25 FLEX samples | `POST /api/predict` | **No** (Bypassed) | **Gated Mock** | UI displays "Validated Prediction Unavailable" despite backend having a real, validated Ridge model! | **CONNECT**: Wire live backend predictions, display actual $K$ ($mm^2/s$), model CV $R^2$, and extrapolation warnings. |
| **AI Insights: Ask Bar** | `pages/Insights.tsx` | Free-text AI query input | Hardcoded response string | `GET /api/insights?category=` | No | Mock only | Clicking "Query" just renders a static explanatory string. | **LABEL AS PROTOTYPE** or replace with category filter tabs. |
| **AI Insights: Evidence Cards** | `pages/Insights.tsx` | 4 research findings with caveats | Hardcoded in `fixtureAdapter.ts` | `GET /api/insights` (`insights`) | **No** (Shape mismatch) | Yes (local) | Missing backend's statistical correlation proofs ($r$, OLS slope), supporting trial IDs, and spacecraft safety implications. | **CONNECT**: Map to backend `InsightsResponse` with all 5 verified statistical insights. |
| **Visualization Page** | `pages/Visualization.tsx` | 2D charts + 3D split view | Hybrid (static aggregates + 40 sample items) | N/A | N/A | Redundant | Duplicates charts already present on Dashboard and 3D chamber from Predictive Lab. | **MOVE / MERGE**: Merge unique charts into Explorer/Mission Control; eliminate standalone route. |
| **Submit Experiment Page** | `pages/SubmitExperiment.tsx` | Form to upload new microgravity data | Local component state only | None (No backend ingest endpoint) | N/A | Mock preview | No backend endpoint exists for uploading datasets. | **LABEL AS PROTOTYPE** / Move to secondary tools. |
| **Settings Page** | `pages/Settings.tsx` | Accessibility & data mode toggles | Local state | N/A | N/A | Partial | `VITE_DATA_MODE` toggle is useful for demoing offline vs live API. | **KEEP**: Retain in sidebar footer as secondary utility. |
| **Help Page** | `pages/Help.tsx` | Scientific reference & provenance | Static documentation | N/A | N/A | Yes | Excellent scientific documentation of FLEX and BASS-II physics. | **KEEP**: Retain in sidebar footer as secondary reference. |

---

## 4. Backend Features Missing from the Frontend

The FastAPI backend has several advanced scientific features that are currently **invisible** in the UI:

### 1. Full Dataset Pagination & Total Count
- **Backend**: `GET /api/experiments?page=1&page_size=20` returns `total: 403`, `total_pages: 21`, with fast indexed pagination.
- **Frontend**: Loads only 40 items in one hardcoded JSON array; has **no pagination controls** (page numbers, next/prev buttons, or page size selector). 363 authentic NASA experiments are inaccessible to the user!

### 2. Multi-Attribute Numerical Range Filtering
- **Backend**: Supports `pressure_min`, `pressure_max`, `o2_min`, `o2_max`, and sorting (`sort_by=burning_rate_mm2_s&sort_order=desc`).
- **Frontend**: Only has text search, investigation filter chips, and fuel/outcome dropdowns. Numerical range sliders and sorting dropdowns are missing.

### 3. Data Quality & Anomaly Flags
- **Backend**: Every experiment in `GET /api/experiments/{id}` returns `data_quality_flags`:
  - `flag_duplicate_identifier`: boolean
  - `flag_zero_ambient_pressure`: boolean
  - `flag_approximate_burn_time`: boolean
  - `flag_missing_extinction_diameter`: boolean
  - `flag_zero_extinction_diameter`: boolean
  - `flag_gas_composition_sum_deviation`: boolean
- **Frontend**: The `DetailDrawer` displays zero quality flags, hiding critical scientific caveats from researchers.

### 4. Live ML Inference & Extrapolation Warnings
- **Backend**: `POST /api/predict` executes the trained scikit-learn Ridge/RF pipeline, returns:
  - Exact burning rate constant $K$ ($mm^2/s$)
  - Model selection justification (e.g., CV $R^2 = 0.7321$ on training folds)
  - `is_extrapolation: boolean`
  - Explicit list of `extrapolation_warnings` (e.g., *"Pressure 500 kPa is outside training bounds [70.2, 309.3 kPa]"*)
  - Full scientific disclaimer regarding spaceflight certification limits
- **Frontend**: Completely hides this live capability behind a static "Validated Prediction Unavailable" banner!

### 5. Multi-Model Architecture Selection
- **Backend**: Supports `model_choice: "ridge"` (default, higher CV $R^2$) and `model_choice: "random_forest"`.
- **Frontend**: Has no UI toggle or dropdown to compare Ridge vs Random Forest predictions.

### 6. Full Chamber Atmosphere Composition ($N_2, CO_2, He$)
- **Backend**: Ingestion scripts extracted and normalized mole fractions for Nitrogen, Carbon Dioxide, and Helium. Both the prediction service and detail endpoints utilize these.
- **Frontend**: Sliders only allow adjusting Oxygen ($O_2$), ignoring diluent gases entirely.

### 7. Evidence Citations & Trial Links for AI Insights
- **Backend**: `GET /api/insights` provides `supporting_experiment_ids: ["FLEX-12", "FLEX-45", ...]`, Pearson correlation coefficients ($r = +0.5485$), and OLS slope values.
- **Frontend**: Cards only show a generic finding text without clickable supporting trial links or statistical proof metrics.

### 8. System Health & Readiness Verification
- **Backend**: `GET /api/health` reports dataset availability, loaded count (403), active investigations, and ML model readiness.
- **Frontend**: TopBar has a static badge `"PSI Data Feed"` that never checks whether the backend is actually reachable.

---

## 5. Extra Frontend Features Unsupported by the Backend

1. **Researcher Experiment Submission (`/submit-experiment`)**:
   - The UI includes a full form for researchers to submit new experimental CSVs, claiming to validate against schema.
   - **Backend Reality**: There is **no backend endpoint** for ingesting user-submitted experiments (`POST /api/submissions` does not exist).
   - **Recommendation**: Retain in secondary navigation or modal, explicitly labeled with badge `[PROTOTYPE WORKFLOW — LOCAL ONLY]`.

2. **Interactive 3D Flame Deformation in Visualizer**:
   - The UI has sliders titled "Artistic Flame Scale" and "Flame Chemiluminescence Accent" that scale Three.js mesh geometry.
   - **Backend Reality**: These are pure visual aesthetic manipulations, not backed by physical equations or NASA sensor data.
   - **Recommendation**: Keep the conceptual 3D chamber view, but preserve the existing disclaimer badge: `[3D Conceptual Geometry · Not Experimental Telemetry]`.

3. **Natural Language "Ask About This Research" Query**:
   - In `pages/Insights.tsx`, a search bar allows users to "Ask about microgravity quenching...". Submitting returns a static text explanation.
   - **Backend Reality**: No LLM chat or semantic embedding endpoint is deployed on Laptop 1.
   - **Recommendation**: Replace the pseudo-chat input with interactive category filter chips (`Oxidizer Dynamics`, `Diluents`, `Soot Chemistry`, `Solid Flame Spread`) that map directly to `GET /api/insights?category=...`.

---

## 6. API Schema Mismatches (Root Causes of Silent Fallback)

### Mismatch 1: `GET /api/overview`
| Field | Backend Schema (`OverviewResponse`) | Frontend Expectation (`OverviewViewModel`) | Resolution Needed |
| :--- | :--- | :--- | :--- |
| **Total Rows** | `total_experiments: int` (403) | `totalSourceRows: number` | Map `total_experiments` $\rightarrow$ `totalSourceRows` in adapter. |
| **Investigation Count** | `total_investigations: int` (2) | `investigationCount: number` | Map `total_investigations` $\rightarrow$ `investigationCount`. |
| **Loaded Sample Count** | Not in backend (backend loads ALL 403) | `loadedSampleCount: number` (40) | Set `loadedSampleCount: total_experiments` (403). |
| **Outcomes Dict** | `flex_outcomes: {"Extinction": 186, "Disruption": 61, "Completion": 27}` | `flexOutcomes: { extinction: 186, disruption: 61, completion: 27 }` | Normalize outcome keys to lowercase in adapter. |
| **Fuel Distribution** | `fuel_distribution: {"Methanol": 157, "Heptane": 117, ...}` | `flexFuelCounts: { methanol: 157, heptane: 117 }` | Normalize fuel keys in adapter. |

### Mismatch 2: `GET /api/experiments`
| Field | Backend Schema (`ExperimentListResponse`) | Frontend Expectation (`Experiment[]`) | Resolution Needed |
| :--- | :--- | :--- | :--- |
| **Envelope** | `{ total: 403, page: 1, page_size: 20, results: [...] }` | `Experiment[]` (Raw Array) | Adapter must unwrap `.results` and store pagination metadata. |
| **Item ID** | `id: "FLEX-70"` | `id: "FLEX-70"` | Matches. |
| **Test Identifier** | `test_number: "70"` | `testIdentifier: "70"` | Map `test_number` $\rightarrow$ `testIdentifier`. |
| **Fuel Name** | `fuel_name: "Heptane"` | `fuel: "Heptane"` (FLEX) or `material` (BASS) | Map based on `investigation`. |
| **Chamber Pressure** | `ambient_pressure_kpa: 101.46` | `ambientPressureMmHg: number` | Convert $\text{kPa} \times 7.50062 \rightarrow \text{mmHg}$, or update UI to display $\text{kPa}$. |
| **Oxygen** | `oxygen_percentage: 15.0` | `oxygenMoleFraction: 0.15` (FLEX) | Convert $\% / 100 \rightarrow$ mole fraction for FLEX. |
| **Burning Rate** | `burning_rate_mm2_s: 0.41` | `burningRateOriginal: 0.41` | Map `burning_rate_mm2_s` $\rightarrow$ `burningRateOriginal`. |
| **Burn Time** | `burn_time_s: 1.6` | `burnTimeSeconds: 1.6` | Map `burn_time_s` $\rightarrow$ `burnTimeSeconds`. |

### Mismatch 3: `POST /api/compare`
| Field | Backend Schema (`CompareRequest` / `CompareResponse`) | Frontend Expectation (`ComparisonViewModel`) | Resolution Needed |
| :--- | :--- | :--- | :--- |
| **Request Payload** | `{"experiment_ids": ["FLEX-1", "FLEX-70"]}` | `{"ids": ["FLEX-1", "FLEX-70"]}` | Send `{ experiment_ids }` instead of `{ ids }`. |
| **Response Homogeneity**| `investigation_homogeneity: boolean` | `isCompatible: boolean` | Map `investigation_homogeneity` $\rightarrow$ `isCompatible`. |
| **Notice** | `comparability_notice: string` | `compatibilityReason?: string` | Map `comparability_notice` $\rightarrow$ `compatibilityReason`. |
| **Experiments List** | `experiments: List[ExperimentDetail]` | `experimentA: Experiment`, `experimentB: Experiment` | Assign `experiments[0]` and `experiments[1]`. |
| **Comparison Deltas** | `matrix: List[ComparisonMatrixRow]`, `chart_series` | `numericDeltas: NumericDelta[]`, `qualitativeDifferences` | Transform backend `matrix` rows into `NumericDelta` records for rendering. |

### Mismatch 4: `POST /api/predict`
| Field | Backend Schema (`PredictionRequest`) | Frontend Expectation (`PredictionInputs`) | Resolution Needed |
| :--- | :--- | :--- | :--- |
| **Fuel** | `fuel: "Methanol"` | `fuel: "Methanol"` | Matches. |
| **Pressure** | `ambient_pressure_kpa: float` (e.g. 101.3) | `ambientPressureMmHg: number` (e.g. 760) | Convert: $\text{kpa} = \text{mmHg} \times 0.133322$. |
| **Oxygen** | `o2_mole_fraction: float` (e.g. 0.21) | `oxygenPercentage: number` (e.g. 21) | Convert: $\text{o2\_mole\_fraction} = \text{percentage} / 100$. |
| **Nitrogen** | `n2_mole_fraction: float` (e.g. 0.79) | Missing from frontend payload | Compute: $1.0 - \text{o2\_mole\_fraction}$ (or allow inert gas adjustment). |
| **Diameter** | `droplet_initial_diameter_mm: float` | `initialDropletDiameterMm: number` | Map camelCase $\rightarrow$ snake_case. |
| **Model Choice** | `model_choice: "ridge" \| "random_forest"` | Missing from frontend | Add model toggle to UI (default: `"ridge"`). |
| **Response Value** | `predicted_burning_rate_constant: float` | `simulatedSpreadRateMmS?: number` | Display `predicted_burning_rate_constant` as $K$ ($mm^2/s$). |
| **Disclaimers & Extrap.**| `is_extrapolation`, `extrapolation_warnings` | Missing from frontend view model | Add alert banner rendering extrapolation warnings. |

### Mismatch 5: `GET /api/insights`
| Field | Backend Schema (`InsightsResponse`) | Frontend Expectation (`InsightViewModel[]`) | Resolution Needed |
| :--- | :--- | :--- | :--- |
| **Envelope** | `{ total_experiments_analyzed: 403, insights: [...] }` | `InsightViewModel[]` (Array) | Unwrap `res.insights` in adapter. |
| **Insight Item** | `id, category, title, finding, evidence_summary, supporting_experiment_ids, statistical_basis, scientific_implication` | `id, title, finding, source, investigationId, caveats` | Transform backend fields to UI model: Map `evidence_summary` + `statistical_basis` $\rightarrow$ finding evidence; `scientific_implication` $\rightarrow$ operational context; display supporting IDs as clickable pills. |

---

## 7. Scientific & Unit Consistency Audit

### 1. Pressure Units: mmHg vs. kPa
- **NASA PSI Original**: FLEX raw tables report pressure in `mmHg` (e.g., $760.0\text{ mmHg}$); BASS-II reports atmospheric pressure (~$101.3\text{ kPa}$).
- **Backend Implementation**: Normalized all internal records to SI standard `kPa` (`ambient_pressure_kpa`). The single-experiment endpoint provides both (`pressure_kpa` and `pressure_mmhg`).
- **Frontend Current State**: Uses `mmHg` exclusively in `PredictiveLab` and `formatters.ts`.
- **Recommendation**:
  - Keep display in dual format: e.g. `101.3 kPa (760 mmHg)`.
  - In `apiAdapter.ts`, ensure conversion: $\text{kPa} = \text{mmHg} \times 0.133322368$ when calling `/api/predict`.

### 2. Oxygen Normalization: Mole Fraction vs. Percentage
- **NASA PSI Original**:
  - FLEX (PSI-69) records oxygen as **mole fraction** ($y_{O_2} \in [0.12, 0.35]$).
  - BASS-II (PSI-25) records oxygen as calibrated **percentage** ($O_2\% \in [15.0, 30.0]$).
- **Backend Implementation**: Stores `oxygen_percentage` (% vol) in summaries and `o2_mole_fraction` in detail/prediction models.
- **Frontend Current State**: Correctly distinguished in `formatters.ts` (`formatOxygen(val, isPercent)`), but `PredictiveLab` passes percentage (21) directly where backend `/api/predict` requires mole fraction (0.21).
- **Recommendation**: Enforce explicit conversion before submitting prediction payload: `o2_mole_fraction = oxygenPercentage / 100`.

### 3. Burn Rate vs. Flame Spread Rate
- **Scientific Fact**:
  - FLEX measures liquid droplet **burning rate constant** $K = -d(d^2)/dt$ with units $mm^2/s$ (area consumption per second).
  - BASS-II measures solid specimen **linear flame spread rate** with units $cm/s$ or $mm/s$.
- **Frontend Terminology**: `PredictionResult` has a field `simulatedSpreadRateMmS`. Calling droplet burning rate a "spread rate" is scientifically incorrect.
- **Recommendation**: Rename UI display metric strictly to **Droplet Burning Rate Constant $K$ ($mm^2/s$)**.

### 4. BASS-II Airflow Velocity Clarification
- **Scientific Fact**: The raw column `Air Display` in BASS-II is an uncalibrated chamber fan readout indicator, NOT a measured parabolic linear airflow profile ($cm/s$).
- **Frontend Status**: `DetailDrawer` and `Comparison` have honest tooltips acknowledging this limitation.
- **Recommendation**: Maintain this scientific distinction.

---

## 8. Target Navigation Architecture & Page Consolidation

The project specification requires consolidating the current sprawling 10-route tree into **exactly five core research modules**, with secondary utilities preserved in the footer:

```
┌────────────────────────────────────────────────────────┐
│            TARGET NAVIGATION ARCHITECTURE              │
└──────────────────────────┬─────────────────────────────┘
                           │
 ┌─────────────────────────┴─────────────────────────┐
 │ PRIMARY RESEARCH WORKSPACE (Sidebar Main Menu)    │
 │                                                   │
 │ 1. Mission Control       ('/')                    │
 │    - System Health & Dataset KPIs (403 rows)      │
 │    - Macro Scientific Outcomes & Fuel Charts      │
 │    - Microgravity Physics Orientation             │
 │                                                   │
 │ 2. Experiment Explorer   ('/research')            │
 │    - Full 403-trial paginated query table/grid    │
 │    - Advanced filters & search                    │
 │    - Slide-out Detail Drawer (verified provenance)│
 │                                                   │
 │ 3. Compare Experiments   ('/comparison')          │
 │    - Multi-trial side-by-side metric alignment    │
 │    - Quantitative deltas matrix (Test B - Test A) │
 │    - Cross-investigation incompatibility gating   │
 │                                                   │
 │ 4. Predictive Lab        ('/predictive-lab')      │
 │    - Live ML regression inference (Ridge & RF)    │
 │    - Atmosphere & chamber parameter sliders       │
 │    - Extrapolation boundary detection & alerts    │
 │    - Interactive 3D microgravity chamber geometry │
 │                                                   │
 │ 5. AI Insights           ('/insights')            │
 │    - 5 statistically grounded research insights   │
 │    - Pearson correlations & OLS slope evidence    │
 │    - Supporting trial ID citations                │
 │    - Spacecraft fire safety implications          │
 └───────────────────────────────────────────────────┘
                           │
 ┌─────────────────────────┴─────────────────────────┐
 │ SECONDARY UTILITIES (Sidebar Footer / Secondary)  │
 │                                                   │
 │ • Settings               ('/settings')            │
 │ • Help & Provenance      ('/help')                │
 │ • Submit Experiment      (Action Modal in Explorer│
 │                           labeled [PROTOTYPE])    │
 └───────────────────────────────────────────────────┘
```

### Action for Non-Core Pages:
1. **`/visualization` (Interactive Visualization)**:
   - **Recommendation**: Remove from main sidebar. Its unique charts (`BurnTimeScatter`, `OxygenChart`, `MaterialOxygenView`) are better embedded directly as analytics tabs inside **Experiment Explorer** (`/research`) and **Mission Control** (`/`), avoiding fragmented redundant views.
2. **`/submit-experiment` (Submit New Experiment)**:
   - **Recommendation**: Remove from top-level sidebar navigation. Reposition as an `"Ingest Dataset"` button inside the **Experiment Explorer** header, opening the submission form as a clean modal or sub-view explicitly labeled `[CONCEPT PREVIEW — LOCAL VALIDATION]`.
3. **`/settings` and `/help`**:
   - **Recommendation**: Keep in sidebar bottom footer (already correctly positioned).

---

## 9. 3D Visuals & Performance Audit

The application contains three Three.js / WebGL canvases powered by `@react-three/fiber` and `@react-three/drei`:

1. **`FlameHero3D.tsx` (Dashboard Hero Banner)**:
   - *Behavior*: Spherical blue chemiluminescent flame shell with an inner amber reaction zone and orbiting ring.
   - *Performance*: Uses `useFrame` with 4 mesh scale/rotation updates every tick.
   - *Scientific Evaluation*: Artistic representation of a non-buoyant spherical diffusion flame. Correctly captures microgravity blue chemiluminescence, but does not represent actual telemetry.
   - *Audit Verdict*: Keep; well-isolated inside `ThreeCanvasBoundary` with fallback.

2. **`ConceptFlameLab3D.tsx` (Chamber Geometry in Predictive Lab & Visualizer)**:
   - *Behavior*: Microgravity combustion chamber wireframe box, grid floor, suspended flame droplet, and OrbitControls.
   - *Performance*: Smooth on modern GPUs. Includes a "Reset Orbit" button.
   - *Scientific Evaluation*: High visual value for demonstrating how liquid fuel droplets are anchored on quartz tethers inside the ISS CIR chamber. Clearly labeled: `"3D conceptual visualization · not experimental measurement"`.
   - *Audit Verdict*: Keep inside `PredictiveLab.tsx`.

3. **`NeuralInsight3D.tsx` (AI Insights Sculpture)**:
   - *Behavior*: Rotating 3D node-and-edge network sculpture.
   - *Performance*: Minimal overhead; 24 nodes with line geometry.
   - *Audit Verdict*: Keep inside `Insights.tsx` banner.

**Global 3D Recommendation**:
- Ensure all 3D canvases respect the `reduceMotion` toggle already present in `Settings.tsx` to prevent CPU/battery drain on lower-spec machines during live demonstrations.

---

## 10. Prioritized Integration Implementation Plan

To connect the frontend to the backend cleanly without breaking UI rendering or introducing regressions, the implementation should proceed in **five structured phases**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   IMPLEMENTATION ROADMAP (PHASE 4B)                    │
├───────────────┬────────────────────────────┬───────────────────────────┤
│ Step 1 (P0)   │ API Adapter Layer          │ frontend/src/services/    │
│               │ (Transform schemas & units)│ apiAdapter.ts             │
├───────────────┼────────────────────────────┼───────────────────────────┤
│ Step 2 (P0)   │ Live Prediction Lab Wireup │ pages/PredictiveLab.tsx   │
│               │ (Enable Ridge/RF & alerts) │                           │
├───────────────┼────────────────────────────┼───────────────────────────┤
│ Step 3 (P0)   │ Explorer 403 Pagination    │ pages/ResearchExplorer.tsx│
│               │ (Expose all NASA trials)   │ components/research/      │
├───────────────┼────────────────────────────┼───────────────────────────┤
│ Step 4 (P1)   │ Dynamic Overview, Compare, │ pages/Dashboard.tsx       │
│               │ & AI Insights Wireup       │ pages/Comparison.tsx      │
│               │                            │ pages/Insights.tsx        │
├───────────────┼────────────────────────────┼───────────────────────────┤
│ Step 5 (P1)   │ Navigation Consolidation   │ components/layout/        │
│               │ & Polish (5 core routes)   │ routes.tsx, Sidebar.tsx   │
└───────────────┴────────────────────────────┴───────────────────────────┘
```

### Step 1: Create a Robust API Adapter Layer (`frontend/src/services/apiAdapter.ts`)
- **Priority**: P0 (Blocking)
- **Effort**: Low (1 file)
- **Objective**: Build bidirectional mappers between backend snake_case schemas and frontend types:
  - Transform `GET /api/overview` $\rightarrow$ `OverviewViewModel`
  - Transform `GET /api/experiments` paginated envelope $\rightarrow$ `{ experiments: Experiment[], pagination: PaginationMeta }`
  - Transform `GET /api/experiments/{id}` $\rightarrow$ full `ExperimentDetail` with quality flags
  - Map `POST /api/compare` with `{ experiment_ids }` $\rightarrow$ `ComparisonViewModel`
  - Map `POST /api/predict` with unit conversions ($mmHg \rightarrow kPa$, $\% \rightarrow \text{mole frac}$) $\rightarrow$ `PredictionResult` with live model statistics
  - Transform `GET /api/insights` $\rightarrow$ `InsightViewModel[]` with statistical proof strings and trial citations
- **Benefit**: Keeps UI components clean; fixes all silent fallback errors instantly.

### Step 2: Connect Live ML Prediction in `PredictiveLab.tsx`
- **Priority**: P0
- **Effort**: Low
- **Objective**:
  - Remove the artificial "Validated Prediction Unavailable" gate.
  - Wire the form directly to `POST /api/predict`.
  - Add a model architecture selector toggle: `Ridge Regression (Default, CV R²=0.732)` vs. `Random Forest (CV R²=0.687)`.
  - Display the real predicted burning rate constant $K$ ($mm^2/s$), training selection basis, and dynamic **Extrapolation Warning Alerts** when chamber parameters exceed NASA historical envelopes.

### Step 3: Implement Full 403-Record Pagination in `ResearchExplorer.tsx`
- **Priority**: P0
- **Effort**: Medium
- **Objective**:
  - Connect search and filter controls directly to backend query parameters (`investigation`, `fuel`, `q`, `page`, `page_size`).
  - Add pagination footer (`Page X of 21 · Showing 20 of 403 records`) with Previous/Next controls.
  - Connect card clicks to `GET /api/experiments/{id}` to populate `DetailDrawer` with authentic NASA data quality flags, apparatus info, and PI citations.

### Step 4: Wire Mission Control, Comparison, and Insights
- **Priority**: P1
- **Effort**: Medium
- **Objective**:
  - **Mission Control**: Bind `Dashboard.tsx` KPI cards and `OutcomesChart.tsx` to live `GET /api/overview`. Connect TopBar indicator to `GET /api/health`.
  - **Comparison**: Update `Comparison.tsx` to consume backend multi-experiment matrix and comparability warnings.
  - **AI Insights**: Update `Insights.tsx` to display all 5 statistically proven insights, with category filter tabs matching backend categories.

### Step 5: Clean Up Navigation to Exactly Five Core Modules
- **Priority**: P1
- **Effort**: Low
- **Objective**:
  - Update `Sidebar.tsx` to feature exactly the 5 core routes:
    1. Mission Control (`/`)
    2. Experiment Explorer (`/research`)
    3. Compare Experiments (`/comparison`)
    4. Predictive Lab (`/predictive-lab`)
    5. AI Insights (`/insights`)
  - Embed secondary actions (Submit Experiment modal) within Explorer.
  - Retain Settings and Help in the sidebar footer.

---

## 11. Proposed Files to Modify During Implementation

| File Path | Type | Action to Take |
| :--- | :---: | :--- |
| `frontend/src/services/apiAdapter.ts` | **New** | Implement response transformers and request converters (units, casing, envelopes). |
| `frontend/src/services/dataSource.ts` | **Edit** | Update `DataSourceManager` to delegate to `apiAdapter` rather than raw untransformed JSON. |
| `frontend/src/types/experiment.ts` | **Edit** | Augment view models with backend pagination, quality flags, and extrapolation metadata. |
| `frontend/src/pages/PredictiveLab.tsx` | **Edit** | Remove mock gate; connect live $K$ prediction, model toggle, and extrapolation warning banner. |
| `frontend/src/pages/ResearchExplorer.tsx`| **Edit** | Add pagination controls (Page X of Y); connect server-side filtering; wire `DetailDrawer` to `/api/experiments/{id}`. |
| `frontend/src/pages/Comparison.tsx` | **Edit** | Pass `{ experiment_ids }` payload; render backend comparability notice and aligned matrix. |
| `frontend/src/pages/Insights.tsx` | **Edit** | Render 5 rich backend insights with statistical correlations, trial citations, and category tabs. |
| `frontend/src/pages/Dashboard.tsx` | **Edit** | Bind KPI values and outcome distributions directly to live `GET /api/overview` data. |
| `frontend/src/components/layout/TopBar.tsx`| **Edit** | Wire data status badge to live `GET /api/health` check; make user profile neutral. |
| `frontend/src/components/layout/Sidebar.tsx`| **Edit** | Consolidate navigation to the 5 core modules. |
| `frontend/src/app/routes.tsx` | **Edit** | Align route definitions with the 5 core pages. |

