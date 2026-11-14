# IGNIS — Space Fire Intelligence: API Contract & Integration Guide

**Service**: IGNIS — Space Fire Intelligence Backend  
**Version**: `1.0.0`  
**Base URL**: `http://localhost:8000/api` (also available via alias `http://localhost:8000/api/v1`)  
**Format**: JSON (`Content-Type: application/json`)  
**Interactive Docs**: `http://localhost:8000/docs` (Swagger UI) & `http://localhost:8000/redoc` (ReDoc)  

---

## 1. System Architecture & Dual-Laptop Workflow

IGNIS utilizes an API-first distributed architecture:
- **Laptop 1 (AI & Backend)**: FastAPI server on port `8000`. Ingests, normalizes, and indexes authentic NASA Physical Sciences Informatics (PSI-69 FLEX & PSI-25 BASS-II) datasets, executes scientific search, generates statistical AI insights, and runs trained regression pipelines for microgravity droplet combustion modeling.
- **Laptop 2 (Frontend)**: React 18+ and Vite on port `5173`. Consumes these endpoints across the five primary dashboard modules:
  1. **Mission Control**: Consumes `GET /api/overview` and `GET /api/health`.
  2. **Experiment Explorer**: Consumes `GET /api/experiments` and `GET /api/experiments/{experiment_id}`.
  3. **Compare Experiments**: Consumes `POST /api/compare`.
  4. **Predictive Lab**: Consumes `POST /api/predict`.
  5. **AI Insights**: Consumes `GET /api/insights`.

### CORS Configuration
CORS is pre-configured to allow:
- `http://localhost:5173` (Vite dev server default)
- `http://127.0.0.1:5173`
- `http://localhost:3000`

---

## 2. Scientific Data Integrity & Null-Handling Principles

1. **Missing Values Are `null`, Never `0`**:
   - If an observation was unmeasured or not applicable (e.g. burning rate in BASS-II solid flame spread, or unmeasured extinction diameter in FLEX), the API returns JSON `null`.
   - The frontend must never treat missing fields as zero.
2. **Standardized Experiment IDs**:
   - NASA PSI-69 FLEX trials: `FLEX-1` through `FLEX-274`.
   - NASA PSI-25 BASS-II trials: `BASS-II-B1` through `BASS-II-B129`.
   - Lookups are case-insensitive (`flex-70` resolves to `FLEX-70`).
3. **Cross-Investigation Comparability**:
   - FLEX (quiescent liquid droplet spherical combustion) and BASS-II (forced convection solid flame spread over PMMA/SIBAL) operate under distinct transport physics. When comparing experiments across investigations, the API returns `investigation_homogeneity: false` with an advisory notice.

---

## 3. API Endpoints Specification

### 3.1 Health Check

#### `GET /api/health`
Validates backend service operational state, dataset readiness, and ML model availability without exposing secrets or filesystem paths.

- **Request**: No parameters.
- **Response** (`200 OK`):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-11-13T18:00:00Z",
  "datasets_loaded": true,
  "experiments_count": 403,
  "investigations_loaded": ["FLEX", "BASS-II"],
  "model_ready": true,
  "default_model": "Ridge Regression (Tuned)",
  "notes": "NASA PSI-69 (FLEX) and PSI-25 (BASS-II) verified and ready for research."
}
```

---

### 3.2 Mission Control Overview

#### `GET /api/overview`
Returns authentic statistical aggregations, investigation breakdowns, fuel distributions, and numeric measurement summaries derived directly from NASA records.

- **Request**: No parameters.
- **Response** (`200 OK`):
```json
{
  "total_experiments": 403,
  "total_investigations": 2,
  "investigations": [
    {
      "name": "FLEX",
      "full_name": "Flame Extinction Experiment",
      "psi_reference": "PSI-69",
      "mission": "ISS CIR (Combustion Integrated Rack)",
      "apparatus": "Multi-user Droplet Combustion Apparatus (MDCA)",
      "experiment_count": 274,
      "physical_regime": "Isolated Liquid Droplet Spherical Combustion",
      "fuel_states": ["liquid"],
      "fuels": ["Methanol", "Heptane"]
    },
    {
      "name": "BASS-II",
      "full_name": "Burning and Suppression of Solids - II",
      "psi_reference": "PSI-25",
      "mission": "ISS MSG (Microgravity Science Glovebox)",
      "apparatus": "BASS Hardware Flow Duct",
      "experiment_count": 129,
      "physical_regime": "Forced Convection Solid Flame Spread & Suppression",
      "fuel_states": ["solid"],
      "fuels": ["PMMA", "SIBAL", "Nomex", "Wax"]
    }
  ],
  "fuel_distribution": {
    "Methanol": 157,
    "Heptane": 117,
    "PMMA": 98,
    "SIBAL": 27,
    "Nomex": 3,
    "Wax": 1
  },
  "flex_outcomes": {
    "Extinction": 186,
    "Disruption": 61,
    "Completion": 27
  },
  "numeric_summaries": {
    "flex_ambient_pressure": {
      "count": 274,
      "min": 0.0,
      "max": 309.2946,
      "mean": 95.5532,
      "median": 101.2717,
      "std": 36.6783,
      "unit": "kPa"
    },
    "flex_burning_rate_constant": {
      "count": 258,
      "min": 0.05,
      "max": 1.06,
      "mean": 0.5019,
      "median": 0.5,
      "std": 0.1376,
      "unit": "mm2/s"
    }
  },
  "scientific_notice": "All metrics derived directly from authentic NASA Physical Sciences Informatics (PSI) archives."
}
```

---

### 3.3 Experiment Explorer

#### `GET /api/experiments`
Query and filter experiments with pagination, free-text search, and numerical parameter ranges.

- **Query Parameters**:
  - `investigation` (string, optional): `"FLEX"`, `"BASS-II"`, or `"all"`.
  - `fuel` (string, optional): Fuel name (e.g. `"Methanol"`, `"PMMA"`).
  - `q` (string, optional): Text query matching experiment ID, run identifier, PI, or fuel.
  - `pressure_min` / `pressure_max` (float, optional): Chamber pressure bounds in kPa.
  - `o2_min` / `o2_max` (float, optional): Oxygen percentage bounds (% vol).
  - `sort_by` (string, default: `"id"`): Sort column (`"id"`, `"ambient_pressure_kpa"`, `"oxygen_percentage"`, `"burning_rate_mm2_s"`, `"burn_time_s"`).
  - `sort_order` (string, default: `"asc"`): `"asc"` or `"desc"`.
  - `page` (integer, default: `1`): 1-indexed page.
  - `page_size` (integer, default: `20`, max: `100`): Results per page.

- **Response** (`200 OK`):
```json
{
  "total": 403,
  "page": 1,
  "page_size": 2,
  "total_pages": 202,
  "investigation_filter": null,
  "fuel_filter": null,
  "query": null,
  "results": [
    {
      "id": "FLEX-1",
      "investigation": "FLEX",
      "mission": "ISS CIR (Combustion Integrated Rack)",
      "test_number": "1",
      "run_identifier": "20CAL08",
      "date": "3/5/2009",
      "fuel_name": "Methanol",
      "fuel_type": "liquid",
      "fuel_geometry": "spherical droplet",
      "ambient_pressure_kpa": 101.0184,
      "oxygen_percentage": 21.0,
      "burning_rate_mm2_s": 0.52,
      "burn_time_s": 4.3,
      "extinction_observed": false,
      "outcome": "Disruption",
      "source_reference": "NASA PSI-69"
    },
    {
      "id": "BASS-II-B1",
      "investigation": "BASS-II",
      "mission": "ISS MSG (Microgravity Science Glovebox)",
      "test_number": "B1",
      "run_identifier": "147",
      "date": "2/19/2014",
      "fuel_name": "PMMA",
      "fuel_type": "solid",
      "fuel_geometry": "film",
      "ambient_pressure_kpa": 101.3,
      "oxygen_percentage": 22.2,
      "burning_rate_mm2_s": null,
      "burn_time_s": null,
      "extinction_observed": true,
      "outcome": "Extinction / Quench",
      "source_reference": "NASA PSI-25"
    }
  ]
}
```

---

#### `GET /api/experiments/{experiment_id}`
Retrieves complete normalized parameters, verified sensor metrics, data quality flags, and source provenance for a single experiment.

- **Path Parameter**: `experiment_id` (string, required, e.g. `"FLEX-70"` or `"BASS-II-B1"`).
- **Response** (`200 OK`):
```json
{
  "id": "FLEX-70",
  "investigation": "FLEX",
  "mission": "ISS CIR (Combustion Integrated Rack)",
  "apparatus": "Multi-user Droplet Combustion Apparatus (MDCA)",
  "title": "FLEX Droplet Combustion Trial #70 (Heptane)",
  "test_number": "70",
  "run_identifier": "193F001",
  "date": "3/23/2010",
  "gmt": "7:25:43",
  "pi": "Forman A. Williams / Vedha Nayagam",
  "fuel_name": "Heptane",
  "fuel_material_raw": "Heptane",
  "fuel_type": "liquid",
  "fuel_geometry": "spherical droplet",
  "chamber_parameters": {
    "pressure_kpa": 101.4583,
    "pressure_mmhg": 761.0,
    "o2_mole_fraction": 0.15,
    "n2_mole_fraction": 0.84,
    "co2_mole_fraction": 0.0,
    "he_mole_fraction": 0.0,
    "flow_velocity_cm_s": 0.0,
    "gravity_level_g": 0.0,
    "flow_type": "quiescent"
  },
  "measurements": {
    "initial_diameter_mm": 4.67,
    "extinction_diameter_mm": 4.6,
    "burning_rate_constant_mm2_s": 0.41,
    "burn_duration_s": 1.6,
    "total_frames_shot": null
  },
  "outcome": "Extinction",
  "extinction_observed": true,
  "data_quality_flags": {
    "flag_duplicate_identifier": true,
    "flag_zero_ambient_pressure": false,
    "flag_approximate_burn_time": false,
    "flag_missing_extinction_diameter": false,
    "flag_zero_extinction_diameter": false,
    "flag_gas_composition_sum_deviation": true
  },
  "source_file": "PSI-69_Experimental table_FLEX.csv",
  "provenance": "NASA Physical Sciences Informatics (PSI-69)",
  "scientific_regime": "Quiescent Microgravity Droplet Combustion"
}
```

- **Error Response** (`404 Not Found`):
```json
{
  "detail": "Experiment 'UNKNOWN-999' not found. Examples of valid IDs: 'FLEX-70', 'BASS-II-B1'."
}
```

---

### 3.4 Multi-Experiment Comparison

#### `POST /api/compare`
Produces side-by-side variable alignments and structured chart series for 1 to 10 selected experiments.

- **Request Body**:
```json
{
  "experiment_ids": ["FLEX-1", "FLEX-2", "FLEX-70"]
}
```

- **Response** (`200 OK`):
```json
{
  "requested_ids": ["FLEX-1", "FLEX-2", "FLEX-70"],
  "matched_ids": ["FLEX-1", "FLEX-2", "FLEX-70"],
  "missing_ids": [],
  "investigation_homogeneity": true,
  "comparability_notice": "Experiments originate from the same investigation regime and share common measurement frameworks.",
  "experiments": [...],
  "matrix": [
    {
      "parameter": "Fuel Material",
      "category": "Fuel Properties",
      "unit": "-",
      "values": {
        "FLEX-1": "Methanol",
        "FLEX-2": "Methanol",
        "FLEX-70": "Heptane"
      }
    },
    {
      "parameter": "Burning Rate Constant K",
      "category": "Combustion Metrics",
      "unit": "mm2/s",
      "values": {
        "FLEX-1": 0.52,
        "FLEX-2": 0.6,
        "FLEX-70": 0.41
      }
    }
  ],
  "chart_series": {
    "experiment_labels": ["FLEX-1", "FLEX-2", "FLEX-70"],
    "burning_rate_series": [0.52, 0.6, 0.41],
    "burn_duration_series": [4.3, 5.0, 1.6],
    "oxygen_series": [21.0, 21.0, 15.0],
    "pressure_series": [101.0184, 101.5916, 101.4583]
  }
}
```

---

### 3.5 Predictive Combustion Lab

#### `POST /api/predict`
Executes real-time inference using the verified machine learning regression service trained on NASA PSI-69 FLEX.

- **Pre-Ignition Features Only**: Strictly validated against initial boundary conditions.
- **Model Selection**: Deploys `Ridge Regression (Tuned)` by default based on training cross-validation evidence (CV $R^2 = 0.7321 \pm 0.0657$ vs Random Forest $0.6873 \pm 0.0449$). Supports user override via `model_choice: "random_forest"`.
- **Extrapolation Detection**: Flags inputs outside experimental bounds (pressure $71.5 - 309.3\text{ kPa}$, $O_2$ $0.12 - 0.34$, $d_0$ $1.1 - 4.7\text{ mm}$).

- **Request Body**:
```json
{
  "fuel": "Methanol",
  "ambient_pressure_kpa": 101.3,
  "o2_mole_fraction": 0.21,
  "n2_mole_fraction": 0.79,
  "co2_mole_fraction": 0.0,
  "he_mole_fraction": 0.0,
  "droplet_initial_diameter_mm": 2.5,
  "model_choice": "ridge"
}
```

- **Response** (`200 OK`):
```json
{
  "predicted_burning_rate_constant": 0.5347,
  "units": "mm2/s",
  "model_name": "Ridge Regression (Tuned)",
  "model_version": "1.0.0-flex",
  "model_selection_basis": "Selected as default deployed model based on training cross-validation evidence: Ridge Regression achieved higher CV R² (0.7321 ± 0.0657 vs RF 0.6873) and higher stability under Grouped Date CV (R² = 0.7437 vs RF 0.6371).",
  "input_parameters": {
    "fuel": "Methanol",
    "ambient_pressure_kpa": 101.3,
    "o2_mole_fraction": 0.21,
    "n2_mole_fraction": 0.79,
    "co2_mole_fraction": 0.0,
    "he_mole_fraction": 0.0,
    "droplet_initial_diameter_mm": 2.5
  },
  "is_extrapolation": false,
  "extrapolation_warnings": [],
  "scientific_disclaimer": "EXPERIMENTAL RESEARCH PROTOTYPE: This prediction is generated by a statistical regression model trained on historical NASA PSI-69 FLEX microgravity droplet data. It estimates the quasi-steady droplet burning rate constant K (mm²/s) in quiescent microgravity. It DOES NOT provide certified spacecraft fire safety ratings, ignition probability estimates, or structural flammability clearance for human spaceflight missions.",
  "scientific_notes": "Methanol burns with clean, soot-free blue diffusion flames. Combustion adheres closely to the classical d²-law with low radiative heat loss.",
  "physical_domain": "NASA PSI-69 Quiescent Microgravity Droplet Combustion"
}
```

- **Validation Error Response** (`422 Unprocessable Entity`):
```json
{
  "detail": "Fuel 'Ethanol' not supported. Allowed fuels: 'Methanol', 'Heptane'"
}
```

- **Service Unavailable Response** (`503 Service Unavailable`):
```json
{
  "detail": "Predictive combustion ML model is not loaded. Ensure model artifacts exist in 'models/' by running 'python backend/app/services/prediction/train_flex.py'."
}
```

---

### 3.6 AI Scientific Insights

#### `GET /api/insights`
Returns deterministic, evidence-based research findings synthesized from NASA PSI-69 and PSI-25 records with supporting experimental IDs and correlation proofs.

- **Query Parameters**:
  - `category` (string, optional): Filter by category (`"oxidizer"`, `"diluent"`, `"soot"`, `"solid"`, `"scale"`).

- **Response** (`200 OK`):
```json
{
  "generated_at": "2026-11-13T18:00:00Z",
  "investigations_covered": ["FLEX (PSI-69)", "BASS-II (PSI-25)"],
  "total_experiments_analyzed": 403,
  "insights": [
    {
      "id": "INS-01",
      "category": "Oxidizer Dynamics",
      "title": "Oxygen Mole Fraction Directly Drives Microgravity Fuel Burning Rate",
      "finding": "Ambient oxygen concentration is the single strongest positive physical driver of liquid droplet burning rates in quiescent microgravity...",
      "evidence_summary": "Across 258 valid NASA PSI-69 FLEX experiments, increasing initial ambient oxygen mole fraction from 0.12 to 0.34 increases the burning rate constant K from 0.20 mm²/s to 1.06 mm²/s. Pearson correlation is r = +0.5485 (p < 10⁻¹⁵).",
      "supporting_experiment_ids": ["FLEX-1", "FLEX-4", "FLEX-69", "FLEX-265"],
      "statistical_basis": "Pearson r = +0.5485; Ordinary Least Squares slope = +1.571 (mm²/s) / mole-fraction; R² = 0.301.",
      "scientific_implication": "Spacecraft atmospheric design directly determines fire propagation intensity: reducing cabin O2 from 30% to 15% reduces liquid fuel mass consumption rates by more than 50%.",
      "data_type": "empirical_correlation"
    }
  ],
  "scientific_methodology": "Deterministic scientific synthesis combining Pearson/Spearman multivariate correlation matrices, standardized linear regularized coefficients, and verified NASA physical test logs. Zero fabricated results."
}
```

---

## 4. Frontend Integration Guide (Laptop 2 Handoff)

### Quick Start for Frontend Developers
In `frontend/src/services/api.ts` (or client module), set your Axios/Fetch base URL:

```typescript
// frontend/src/services/api.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Dashboard Mapping

| Dashboard Section | Endpoint to Call | Key UI Elements |
| :--- | :--- | :--- |
| **1. Mission Control** | `GET /api/overview`<br>`GET /api/health` | KPI count cards (403 trials), Fuel donut chart, Outcome status breakdown |
| **2. Experiment Explorer** | `GET /api/experiments?...`<br>`GET /api/experiments/:id` | Filterable experiment table, text search bar, modal for full sensor detail |
| **3. Data Analytics** | `GET /api/analytics?...` | Bivariate scatter charts, burn duration distribution, test outcomes, material matrices |
| **4. Compare Experiments** | `POST /api/compare` | Multi-select experiment chip list (up to 10), aligned variable table, bar charts |
| **5. Predictive Lab** | `POST /api/predict` | Fuel toggle, Pressure/O2 sliders, Diameter slider, Rate output card, Extrapolation alert banner |
| **6. AI Insights** | `GET /api/insights` | Cards displaying findings, correlation proofs, and clickable supporting trial pills |

---

## 5. Dataset Reproducibility & Local Setup

The repository protects scientific datasets and binary model weights using `.gitignore`. To reproduce the backend on another workstation:

```bash
# 1. Ensure raw NASA datasets are present in data/raw/:
# data/raw/FLEX/PSI-69_Experimental table_FLEX.csv
# data/raw/BASS-II/PSI-25_Experimental table_BASS-II.csv

# 2. Run data cleaning pipeline to generate data/processed/:
python backend/app/services/data/clean_flex.py
python backend/app/services/data/clean_bass.py

# 3. Train ML models and generate models/ artifacts:
python backend/app/services/prediction/train_flex.py

# 4. Launch FastAPI server:
uvicorn backend.app.main:app --reload --port 8000
```
