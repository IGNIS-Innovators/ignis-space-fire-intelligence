# IGNIS API Contract & Specification

**Service**: IGNIS — Space Fire Intelligence Backend  
**Version**: `v1`  
**Base URL**: `http://localhost:8000/api/v1`  
**Format**: JSON (`Content-Type: application/json`)

---

## 1. Overview & Architecture Boundary

IGNIS utilizes a clean separation of concerns:
- **Laptop 1 (Backend & AI)**: Implements these API endpoints using FastAPI, handles genuine NASA microgravity datasets (e.g., BASS, FLEX, ACME, CIR), coordinates data parsing, intelligent semantic search, AI telemetry insights, and predictive combustion algorithms.
- **Laptop 2 (Frontend)**: Consumes these endpoints via Axios/Fetch in React. While Laptop 1 develops endpoints, Laptop 2 develops UI dashboards against this explicit contract using temporary typed mock adapters.

---

## 2. Real Implementation vs. UI Prototype Status Matrix

| Endpoint | Method | Responsibility | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | Backend (Laptop 1) | **Backend Target** | Heartbeat & service readiness check. |
| `/search/experiments` | `GET` | Backend (Laptop 1) | **Backend Target** | Filter & semantic search across ingested NASA combustion trials. |
| `/experiments/{id}` | `GET` | Backend (Laptop 1) | **Backend Target** | Fetch verified metadata, environmental parameters, and sensor logs. |
| `/insights/analyze` | `POST` | AI & Backend (Laptop 1) | **Backend Target** | Telemetry interpretation & microgravity flammability insights. |
| `/prediction/combustion`| `POST` | AI & Backend (Laptop 1) | **Backend Target** | Predictive combustion modeling based on environmental variables. |
| `/experiments/submit` | `POST` | Backend (Laptop 1) | **Backend Target** | Ingest new experiment configurations submitted by researchers. |
| *2D Fire Visualization* | Client | Frontend (Laptop 2) | **UI Interactive Prototype** | Client-side Canvas/SVG rendering for flame geometry. |
| *Experiment Comparison* | Client | Frontend (Laptop 2) | **UI Interactive Prototype** | Multi-experiment diffing and comparison tables. |

> **Scientific Integrity Notice**: Neither synthetic scientific numbers nor falsified NASA sensor records are accepted or generated. Endpoints are strictly specified by their parameter schemas and type definitions.

---

## 3. Endpoints Specification

### 3.1 System Health

#### `GET /health`
Validates that the API server and database/cache connections are operational.

- **Request**: No parameters.
- **Response** (`200 OK`):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-11-13T13:50:00Z"
}
```

---

### 3.2 Experiment Search & Retrieval

#### `GET /search/experiments`
Query ingested NASA experiments (e.g., BASS, FLEX) by fuel type, oxidizer concentration, atmospheric pressure, and ambient microgravity parameters.

- **Query Parameters**:
  - `q` (string, optional): Keyword query (e.g., `"polymethyl methacrylate"`).
  - `fuel_type` (string, optional): Solid, liquid, or gaseous fuel designation.
  - `oxygen_percentage_min` (float, optional): Minimum O2 molar concentration.
  - `oxygen_percentage_max` (float, optional): Maximum O2 molar concentration.
  - `limit` (integer, default: 20): Number of records per page.
  - `offset` (integer, default: 0): Pagination offset.

- **Response** (`200 OK`):
```json
{
  "total": 0,
  "limit": 20,
  "offset": 0,
  "results": [
    {
      "experiment_id": "string",
      "mission": "string",
      "fuel_name": "string",
      "fuel_state": "solid | liquid | gas",
      "ambient_pressure_kpa": 101.3,
      "oxygen_percentage": 21.0,
      "extinction_observed": true,
      "has_telemetry": true
    }
  ]
}
```

#### `GET /experiments/{experiment_id}`
Retrieve complete detail and verified sensor time-series references for a single experiment.

- **Path Parameter**: `experiment_id` (string, required).
- **Response** (`200 OK`):
```json
{
  "experiment_id": "string",
  "title": "string",
  "description": "string",
  "mission": "string",
  "apparatus": "string",
  "parameters": {
    "pressure_kpa": 0.0,
    "oxygen_percentage": 0.0,
    "flow_velocity_cm_s": 0.0,
    "radiation_environment": "string"
  },
  "metrics": {
    "burn_duration_s": 0.0,
    "flame_spread_rate_mm_s": 0.0,
    "peak_temperature_k": 0.0
  },
  "raw_data_uri": "string"
}
```

---

### 3.3 AI Insights & Analysis

#### `POST /insights/analyze`
Generates scientific summarization and anomalous flame behavior detection using verified experiment logs.

- **Request Body**:
```json
{
  "experiment_id": "string",
  "telemetry_channel": "temperature | flame_spread | soot_concentration",
  "focus_area": "extinction_limits | flame_geometry | radiation_loss"
}
```

- **Response** (`200 OK`):
```json
{
  "experiment_id": "string",
  "summary": "string",
  "anomalies_detected": [
    {
      "timestamp_s": 0.0,
      "parameter": "string",
      "description": "string"
    }
  ],
  "combustion_behavior_assessment": "string",
  "confidence_score": 0.0
}
```

---

### 3.4 Predictive Combustion Modeling

#### `POST /prediction/combustion`
Predicts flame spread rates, radiative extinction probabilities, and quench distances given environmental parameters in microgravity.

- **Request Body**:
```json
{
  "fuel_name": "string",
  "fuel_state": "solid | liquid | gas",
  "ambient_pressure_kpa": 101.3,
  "oxygen_percentage": 21.0,
  "forced_flow_velocity_cm_s": 0.0,
  "gravity_level_g": 0.0
}
```

- **Response** (`200 OK`):
```json
{
  "predicted_flame_spread_rate_mm_s": 0.0,
  "predicted_extinction_time_s": 0.0,
  "soot_formation_index": 0.0,
  "flammability_risk_category": "LOW | MEDIUM | HIGH | CRITICAL",
  "model_version": "string",
  "scientific_basis": "string"
}
```

---

### 3.5 Researcher Experiment Submission

#### `POST /experiments/submit`
Enables external or mission researchers to submit proposed or executed microgravity burn configurations for validation and modeling.

- **Request Body**:
```json
{
  "submitter_name": "string",
  "institution": "string",
  "experiment_title": "string",
  "fuel_specifications": {
    "name": "string",
    "state": "solid | liquid | gas",
    "thickness_or_diameter_mm": 0.0
  },
  "chamber_conditions": {
    "pressure_kpa": 0.0,
    "oxygen_percentage": 0.0,
    "inert_gas": "nitrogen | argon | helium",
    "flow_velocity_cm_s": 0.0
  },
  "notes": "string"
}
```

- **Response** (`201 Created`):
```json
{
  "submission_id": "string",
  "status": "pending_validation",
  "message": "Experiment parameters successfully queued for ingestion.",
  "submitted_at": "2026-11-13T13:50:00Z"
}
```

---

## 4. Error Response Envelope

All error responses adhere to RFC 7807 problem details:

```json
{
  "detail": [
    {
      "loc": ["body", "oxygen_percentage"],
      "msg": "Input should be greater than or equal to 0",
      "type": "greater_than_equal"
    }
  ]
}
```

