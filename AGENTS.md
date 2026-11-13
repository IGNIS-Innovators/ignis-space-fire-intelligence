# IGNIS — Agent & Contributor Collaboration Guide (`AGENTS.md`)

This document defines the conventions, boundaries, and operational guidelines for both AI coding agents and human team members collaborating on **IGNIS — Space Fire Intelligence** (NASA Space Apps Challenge).

---

## 1. Team & Machine Responsibilities

The project is split across two dedicated Windows development laptops operating on a single shared Git repository:

```
┌────────────────────────────────────────────────────────┐
│            SHARED GITHUB REPOSITORY                     │
│    (ignis-space-fire-intelligence / main + branches)   │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
 ┌─────────────────────────┐ ┌─────────────────────────┐
 │        LAPTOP 1         │ │        LAPTOP 2         │
 │     AI & Backend        │ │        Frontend         │
 │                         │ │                         │
 │ • Python 3.10+ & FastAPI│ │ • React 18+ & Vite      │
 │ • NASA Data Processing  │ │ • Interactive 2D Canvas │
 │ • Experiment Search     │ │ • Comparison Matrix UI  │
 │ • Telemetry Insights    │ │ • Predictive Lab UI     │
 │ • Combustion Models     │ │ • Submission Portal     │
 └─────────────────────────┘ └─────────────────────────┘
```

### Laptop 1: AI & Backend
- **Workspace scope**: `backend/`, `data/`, `docs/api/`, `docs/architecture/`
- **Stack**: Python, FastAPI, Pydantic, scientific computing (NumPy/Pandas/SciPy).
- **Core Responsibilities**:
  1. Ingestion, cleaning, and indexing of real NASA microgravity combustion datasets (e.g., BASS, FLEX, CIR).
  2. Search service implementation (`backend/app/services/search/`).
  3. AI telemetry insights generation (`backend/app/services/insights/`).
  4. Predictive combustion modeling algorithms (`backend/app/services/prediction/`).
  5. Maintaining and adhering to the API contract in [contract.md](file:///docs/api/contract.md).

### Laptop 2: Frontend
- **Workspace scope**: `frontend/`, `design/`, `docs/demo/`
- **Stack**: React (TypeScript/JavaScript), Vite, Tailwind/CSS modules, Canvas/SVG charting.
- **Core Responsibilities**:
  1. Responsive dashboard for space fire intelligence monitoring.
  2. Interactive 2D fire visualization dashboard (flame spread, spherical microgravity flame geometry).
  3. Experiment comparison tool (side-by-side telemetry diffing).
  4. Predictive combustion lab UI (interactive parameter sliders and extinction zone charts).
  5. Researcher experiment submission portal.
  6. Maintaining client-side API services (`frontend/src/services/`) conforming strictly to the API contract.

---

## 2. Core Scientific Integrity Principles

1. **Zero Falsified NASA Data**:
   - Never generate fake NASA telemetry, falsified mission IDs, or synthetic sensor records.
   - All analytical features must consume genuine NASA archives or transparent, validated physical models.
2. **Transparent Prototype Labeling**:
   - Clearly delineate in the UI and documentation what is backed by live backend computation vs. what is a prototype/mock visual representation.
   - Frontend mock data must be explicitly flagged as `[PROTOTYPE MOCK]` in code comments and UI badge indicators until connected to live backend endpoints.
3. **No Phantom Scientific Predictions**:
   - Combustion modeling outputs must document the underlying physical/empirical equations or ML model checkpoints utilized, never fabricated numerical outputs.

---

## 3. Git & Branching Strategy

- **Default / Base Branch**: `main` (kept deployable and clean).
- **Feature Branches**:
  - Backend features: `backend/<feature-name>` (e.g. `backend/fastapi-setup`, `backend/nasa-bass-parser`)
  - Frontend features: `frontend/<feature-name>` (e.g. `frontend/vite-init`, `frontend/2d-flame-canvas`)
- **Avoid Cross-Laptop Merge Conflicts**:
  - Laptop 1 strictly limits edits to `backend/`, `data/`, and API documentation.
  - Laptop 2 strictly limits edits to `frontend/` and `design/`.
  - Shared files (`README.md`, `AGENTS.md`, `.env.example`, `docs/api/`) are modified through agreed-upon PRs or coordinated updates.
- **Commit Message Convention**:
  - `feat(backend): ...` or `feat(frontend): ...`
  - `fix(backend): ...` or `fix(frontend): ...`
  - `docs: ...` or `chore: ...`

---

## 4. API-First Communication Contract

- Any change to endpoint routes, request schemas, or response payloads **must** be updated in `docs/api/contract.md` before implementation.
- Frontend developers on Laptop 2 should mock API responses locally in `frontend/src/services/` based on `docs/api/contract.md` to avoid blocking on backend readiness.
- Backend developers on Laptop 1 must provide FastAPI automated Swagger docs (`/docs`) matching `contract.md`.

---

## 5. Environment & Security Rules

- **Never commit `.env` files**: All secrets, local paths, and API keys must remain inside local `.env` files.
- **Never commit massive datasets**: Raw NASA datasets exceeding 50 MB should be placed in `data/raw/` (ignored by Git) and downloaded via reproducible ingestion scripts.
- **Cross-Origin Resource Sharing (CORS)**: Backend must allow `http://localhost:5173` (Vite's default port) in development.

