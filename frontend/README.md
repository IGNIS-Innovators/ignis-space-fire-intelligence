# IGNIS — Space Fire Intelligence (Frontend)

**NASA Space Apps Challenge** · Physical Sciences Informatics (PSI) Microgravity Combustion Dashboard

---

## 1. Overview & Architecture

IGNIS is a cinematic, 3D-animated research dashboard for exploring, comparing, and analyzing microgravity combustion investigations from NASA's Physical Sciences Informatics repository.

### Key Capabilities & Status Hierarchy
- **Mission Control (`/` or `/dashboard`)** — *Working MVP*: verified PSI KPIs (403 source rows, 2 investigations), animated real-time 3D microgravity spherical flame with Earth limb arc, FLEX 186/61/27 outcome distribution, and deterministic evidence cards.
- **Experiment Explorer (`/research`)** — *Working MVP*: multi-parameter search, investigation tabs (PSI-69 FLEX & PSI-25 BASS-II), fuel/material/termination filters, responsive card grid with 3D flame markers, and full detail slide-out drawer with direct NASA PSI links.
- **Interactive Visualization (`/visualization`)** — *Working MVP*: 2D charts (FLEX outcomes bar chart, fuel distribution, sample burn time vs droplet diameter scatter, oxygen mole fraction) alongside an interactive 3D transparent combustion chamber cube with OrbitControls.
- **Experiment Comparison (`/comparison`)** — *Working MVP*: side-by-side test diffing with automated scientific domain compatibility checks (blocks invalid droplet vs solid comparisons), quantitative delta calculations, and percentage shifts.
- **AI Research Insights (`/insights`)** — *Limited Demo / Source-grounded*: deterministic empirical findings backed by NASA PSI table citations, animated cyan 3D neural network sculpture, and local query assistant.
- **Predictive Combustion Lab (`/predictive-lab`)** — *Concept Preview*: interactive 3D flame chamber responsive to parameter sliders, automated empirical nearest-neighbor retrieval from NASA benchmark trials, gated against unvalidated predictions.
- **Submit New Experiment (`/submit-experiment`)** — *Concept Preview*: drag-and-drop CSV/JSON telemetry upload, form validation, and local pending review preview (no mock HTTP submissions).
- **Settings (`/settings`) & Help (`/help`)** — Theme preferences, Reduce 3D Motion toggle, 2D chart transition controls, data mode switcher, scientific glossary, and PSI source documentation.

---

## 2. Windows Quickstart & Run Instructions

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies (Node.js 18+ required)
npm install

# 3. Start local development server (runs on http://localhost:5173)
npm run dev

# 4. Compile production build & TypeScript validation
npm run build

# 5. Preview production build locally
npm run preview
```

---

## 3. Two-Laptop Local Network Integration (API Contract)

IGNIS follows an API-first contract between **Laptop 1 (FastAPI Backend)** and **Laptop 2 (React Frontend)**.

### Environment Configuration (`.env`)
Copy `.env.example` to `.env`:
```env
# URL of Laptop 1's FastAPI server (use LAN IP when developing over Wi-Fi/Ethernet)
VITE_API_BASE_URL=http://localhost:8000

# Data Mode: 'auto' (tries API, falls back to local NASA fixture), 'api', or 'mock'
VITE_DATA_MODE=auto
```

### Approved 5-Endpoint API Contract

| Endpoint | Method | Frontend Service | Description | Fallback Behavior |
| :--- | :---: | :--- | :--- | :--- |
| `/api/overview` | `GET` | `dataSource.getOverview()` | Verified research counts & outcomes | Local verified NASA PSI aggregates (403 rows, 186/61/27) |
| `/api/experiments` | `GET` | `dataSource.listExperiments()` | Excerpted experiment test records | 40 real NASA fixture records (25 FLEX, 15 BASS-II) |
| `/api/compare` | `POST` | `dataSource.compareExperiments(ids)` | Calculated diff matrix for 2 tests | Client-side scientific compatibility & delta logic |
| `/api/predict` | `POST` | `dataSource.predictScenario(inputs)` | Numerical ML combustion simulation | Gated; displays empirical nearest PSI neighbors |
| `/api/insights` | `GET` | `dataSource.getInsights()` | Cited AI flammability findings | Deterministic source-grounded evidence cards |

---

## 4. Scientific Truth Rules & Data Integrity

1. **Zero Falsified Data:** Never displays fabricated temperature curves, fake time series, or phantom accuracy scores.
2. **Proper Units:**
   - FLEX reports `oxygenMoleFraction` (e.g. `0.21` displayed explicitly as `21.0%`).
   - BASS-II reports `initialOxygenPercent` which is already a percentage.
   - Chamber pressure in `mmHg`, droplet diameter in `mm`, burn time in `seconds`.
3. **Cross-Investigation Safeguards:** FLEX (liquid droplets) and BASS-II (solid fuels) are evaluated for scientific compatibility; cross-investigation delta charts are prevented.
4. **Artistic 3D Disclaimer:** All Three.js / React Three Fiber scenes carry clear conceptual disclaimers indicating they are real-time artistic visual representations, not measured NASA CFD simulations.
