# IGNIS — Space Fire Intelligence 🔥🚀

> **NASA Space Apps Challenge**  
> *Intelligent combustion diagnostics, historical microgravity experiment search, and predictive flame dynamics for space exploration safety.*

---

## 1. Project Overview

Fire behaves fundamentally differently in microgravity. Without buoyant natural convection, flames become spherical, soot dynamics diverge, and extinction limits become non-intuitive. Understanding microgravity combustion is mission-critical for crew safety aboard spacecraft, space stations, and lunar/Martian habitats.

**IGNIS** is an intelligence platform designed to:
1. Index and process genuine NASA combustion experiment data (such as BASS, FLEX, and CIR archives).
2. Enable intelligent, parameter-driven search across decades of space fire experiments.
3. Deliver AI-assisted combustion telemetry insights and anomaly detection.
4. Model predictive flame behavior under variable atmospheric and gravitational conditions.
5. Provide space researchers with an interactive 2D visualization lab and experiment submission workflow.

---

## 2. Real Functionality vs. UI Prototype Status

To ensure scientific integrity throughout development, the project maintains a strict boundary between real implemented functionality and prototype UI layers:

| Capability / Module | Layer | Status | Description |
| :--- | :--- | :--- | :--- |
| **NASA Data Pipeline** | Backend | Planned Implementation | Ingestion & normalization of real NASA microgravity burn records. |
| **Experiment Search API** | Backend | Planned Implementation | Multi-parameter filtering (pressure, O2%, fuel type) with FastAPI. |
| **Combustion Telemetry Analysis**| Backend | Planned Implementation | Telemetry interpretation and extinction limit identification. |
| **Predictive Combustion Modeling**| Backend | Planned Implementation | Physics-informed and empirical models for flame spread & extinction. |
| **Interactive 2D Flame Canvas** | Frontend | Planned UI Prototype | Visual representation of spherical microgravity flames & spread vectors. |
| **Multi-Experiment Comparison UI**| Frontend | Planned UI Prototype | Side-by-side telemetry diffing, parameter tables, and visual overlays. |
| **Predictive Lab Simulation UI** | Frontend | Planned UI Prototype | Reactive control sliders and visual parameter space charts. |
| **Researcher Submission Portal** | Frontend | Planned UI Prototype | Guided form interface to configure and submit experiment protocols. |

> ⚠️ **Scientific Integrity Standard**: No synthetic NASA data or fabricated prediction values are permitted. UI prototypes will display explicit placeholder indicators until live backend services are connected.

---

## 3. Two-Laptop Architecture & Collaboration Workflow

Development is distributed across two dedicated Windows laptops operating in a single shared GitHub repository:

```
┌────────────────────────────────────────────────────────┐
│                   SHARED REPOSITORY                    │
│        https://github.com/NASA-SpaceApps/ignis         │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
 ┌─────────────────────────┐ ┌─────────────────────────┐
 │        LAPTOP 1         │ │        LAPTOP 2         │
 │     AI & Backend        │ │        Frontend         │
 │                         │ │                         │
 │ • Python 3.10+ / FastAPI│ │ • React / Vite          │
 │ • NASA Data Processing  │ │ • Interactive 2D Canvas │
 │ • Search Services       │ │ • Comparison UI         │
 │ • Predictive Modeling   │ │ • Predictive Lab UI     │
 │ • Port: 8000            │ │ • Port: 5173            │
 └─────────────────────────┘ └─────────────────────────┘
```

### Laptop 1: AI & Backend
- **Focus Area**: `backend/`, `data/`, `docs/api/`, `docs/architecture/`
- **Responsibilities**:
  - FastAPI REST service (`backend/app/api/`)
  - NASA data ingestion & parsing (`data/raw/` -> `data/processed/`)
  - Intelligent search engine (`backend/app/services/search/`)
  - AI telemetry insights (`backend/app/services/insights/`)
  - Predictive combustion modeling (`backend/app/services/prediction/`)

### Laptop 2: Frontend
- **Focus Area**: `frontend/`, `design/`, `docs/demo/`
- **Responsibilities**:
  - React + Vite development setup (`frontend/`)
  - Interactive 2D fire visualization dashboard
  - Comparative experiment matrix & charting
  - Predictive laboratory user interface
  - Researcher experiment proposal and submission portal
  - API client adapters (`frontend/src/services/`)

---

## 4. Repository Structure

```text
ignis-space-fire-intelligence/
├── frontend/                     # Laptop 2: React + Vite application
│   ├── public/                   # Static assets, favicons, manifests
│   └── src/
│       ├── assets/               # Images, icons, SVGs
│       ├── components/           # Reusable UI components
│       ├── pages/                # Page views (Dashboard, Lab, Search, Submit)
│       ├── services/             # API client services & contract adapters
│       ├── hooks/                # Custom React hooks
│       └── styles/               # CSS modules & global stylesheets
│
├── backend/                      # Laptop 1: Python FastAPI application
│   ├── app/
│   │   ├── api/                  # API routers & endpoint handlers
│   │   ├── core/                 # App configuration, security, CORS, settings
│   │   ├── schemas/              # Pydantic models & validation schemas
│   │   └── services/
│   │       ├── search/           # Experiment query & retrieval engine
│   │       ├── insights/         # AI analysis & anomaly detection
│   │       └── prediction/       # Microgravity combustion modeling
│   ├── tests/                    # Unit, integration, and schema tests
│   └── requirements.txt          # Python dependencies specification
│
├── data/                         # NASA datasets & schemas (Laptop 1)
│   ├── raw/                      # Unprocessed NASA source records (gitignored)
│   ├── processed/                # Normalized structured datasets (gitignored)
│   └── samples/                  # Lightweight data schemas & sample records
│
├── docs/                         # Documentation & specifications
│   ├── architecture/             # System diagrams, data pipeline docs
│   ├── api/                      # REST API contract & endpoint schemas
│   └── demo/                     # Presentation notes, screenshots, demo scripts
│
├── design/                       # UI/UX & Brand Identity (Laptop 2)
│   └── branding/                 # Logos, color palettes, wireframes
│
├── README.md                     # Project overview and run guides
├── AGENTS.md                     # Collaboration conventions & responsibilities
├── .gitignore                    # Python, Node, data, and environment rules
└── .env.example                  # Environment configuration template
```

---

## 5. Getting Started

### Prerequisites
- **Git**
- **Laptop 1**: Python 3.10+
- **Laptop 2**: Node.js 18+ & npm/pnpm

### Clone Repository
```bash
git clone https://github.com/NASA-SpaceApps/ignis-space-fire-intelligence.git
cd ignis-space-fire-intelligence
```

### Laptop 1 Setup (AI & Backend)
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate

# Install dependencies (when ready to begin feature work)
pip install -r requirements.txt

# Configure environment
cp ../.env.example ../.env

# Launch FastAPI server
uvicorn app.api.main:app --reload --port 8000
```
Interactive API documentation will be available at: `http://localhost:8000/docs`

### Laptop 2 Setup (Frontend)
```bash
cd frontend

# Initialize dependencies (when ready to begin feature work)
npm install

# Start Vite development server
npm run dev
```
The frontend interface will be available at: `http://localhost:5173`

---

## 6. API Contract

The communication contract between Frontend and Backend is formally documented in:  
[docs/api/contract.md](file:///docs/api/contract.md)

---

## 7. Collaboration Guidelines

Please review [AGENTS.md](file:///AGENTS.md) for branch naming strategies, commit conventions, scientific data rules, and cross-laptop synchronization protocols.

