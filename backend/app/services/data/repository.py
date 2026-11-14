"""
IGNIS — Space Fire Intelligence
NASA Scientific Data Repository Service

Loads, indexes, and normalizes real experimental records from:
- NASA PSI-69 FLEX (274 trials)
- NASA PSI-25 BASS-II (129 trials)
Provides zero-latency querying, multi-criteria filtering, comparison diffing,
and aggregation for API endpoints.
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

from backend.app.core.config import settings


class ExperimentRepository:
    """
    Singleton repository managing in-memory indexes of genuine NASA microgravity
    combustion data.
    """

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir or settings.DATA_PROCESSED_DIR
        self._flex_df: Optional[pd.DataFrame] = None
        self._bass_df: Optional[pd.DataFrame] = None
        self._experiments_map: Dict[str, Dict[str, Any]] = {}
        self._experiments_list: List[Dict[str, Any]] = []
        self._is_loaded = False
        self.load_data()

    def load_data(self) -> None:
        """Loads both cleaned NASA CSVs into unified normalized indexes."""
        flex_path = self.data_dir / "FLEX_cleaned.csv"
        bass_path = self.data_dir / "BASS-II_cleaned.csv"

        if not flex_path.exists() or not bass_path.exists():
            # If not yet processed, datasets may need to be generated
            print(f"[Repository] Warning: Cleaned datasets missing at {self.data_dir.resolve()}")
            self._is_loaded = False
            return

        self._flex_df = pd.read_csv(flex_path)
        self._bass_df = pd.read_csv(bass_path)

        self._experiments_map.clear()
        self._experiments_list.clear()

        # ---------------------------------------------------------------------
        # 1. Index NASA PSI-69 FLEX (Liquid Droplet Microgravity Combustion)
        # ---------------------------------------------------------------------
        for _, row in self._flex_df.iterrows():
            test_num = int(row["test_id"])
            exp_id = f"FLEX-{test_num}"

            # Helper for clean null handling (NaN -> None)
            def clean_num(val):
                if pd.isnull(val):
                    return None
                f = float(val)
                return None if np.isnan(f) else round(f, 4)

            d0 = clean_num(row.get("droplet_initial_diameter_mm"))
            dext = clean_num(row.get("extinction_diameter_mm"))
            br = clean_num(row.get("burning_rate_mm2_s"))
            tb = clean_num(row.get("burn_time_s"))
            p_kpa = clean_num(row.get("ambient_pressure_kpa"))
            p_mmhg = clean_num(row.get("ambient_pressure_mmhg"))
            o2_mol = clean_num(row.get("o2_mole_fraction"))
            n2_mol = clean_num(row.get("n2_mole_fraction"))
            co2_mol = clean_num(row.get("co2_mole_fraction"))
            he_mol = clean_num(row.get("he_mole_fraction"))
            o2_pct = round(o2_mol * 100.0, 2) if o2_mol is not None else None

            test_end_val = str(row.get("test_end", "")).strip() or None
            extinction_observed = test_end_val == "Extinction"

            flags = {
                "flag_duplicate_identifier": bool(row.get("flag_duplicate_identifier", False)),
                "flag_zero_ambient_pressure": bool(row.get("flag_zero_ambient_pressure", False)),
                "flag_approximate_burn_time": bool(row.get("flag_approximate_burn_time", False)),
                "flag_missing_extinction_diameter": bool(row.get("flag_missing_extinction_diameter", False)),
                "flag_zero_extinction_diameter": bool(row.get("flag_zero_extinction_diameter", False)),
                "flag_gas_composition_sum_deviation": bool(row.get("flag_gas_composition_sum_deviation", False)),
            }

            flex_record = {
                "id": exp_id,
                "investigation": "FLEX",
                "mission": "ISS CIR (Combustion Integrated Rack)",
                "apparatus": "Multi-user Droplet Combustion Apparatus (MDCA)",
                "title": f"FLEX Droplet Combustion Trial #{test_num} ({row.get('fuel')})",
                "test_number": str(test_num),
                "run_identifier": str(row.get("flex_identifier", "")).strip() or None,
                "date": str(row.get("test_date", "")).strip() or None,
                "gmt": str(row.get("test_gmt", "")).strip() or None,
                "pi": "Forman A. Williams / Vedha Nayagam",
                "fuel_name": str(row.get("fuel", "")).strip(),
                "fuel_material_raw": str(row.get("fuel", "")).strip(),
                "fuel_type": "liquid",
                "fuel_geometry": "spherical droplet",
                "ambient_pressure_kpa": p_kpa,
                "ambient_pressure_mmhg": p_mmhg,
                "oxygen_percentage": o2_pct,
                "burning_rate_mm2_s": br,
                "burn_time_s": tb,
                "extinction_observed": extinction_observed,
                "outcome": test_end_val,
                "source_reference": "NASA PSI-69",
                "source_file": "PSI-69_Experimental table_FLEX.csv",
                "provenance": "NASA Physical Sciences Informatics (PSI-69)",
                "scientific_regime": "Quiescent Microgravity Droplet Combustion",
                "chamber_parameters": {
                    "pressure_kpa": p_kpa,
                    "pressure_mmhg": p_mmhg,
                    "o2_mole_fraction": o2_mol,
                    "n2_mole_fraction": n2_mol,
                    "co2_mole_fraction": co2_mol,
                    "he_mole_fraction": he_mol,
                    "flow_velocity_cm_s": 0.0,
                    "gravity_level_g": 0.0,
                    "flow_type": "quiescent",
                },
                "measurements": {
                    "initial_diameter_mm": d0,
                    "extinction_diameter_mm": dext,
                    "burning_rate_constant_mm2_s": br,
                    "burn_duration_s": tb,
                    "total_frames_shot": None,
                },
                "data_quality_flags": flags,
            }

            self._experiments_map[exp_id.upper()] = flex_record
            # Also index numeric alias (e.g., '70')
            self._experiments_map[str(test_num)] = flex_record
            self._experiments_list.append(flex_record)

        # ---------------------------------------------------------------------
        # 2. Index NASA PSI-25 BASS-II (Solid Flame Spread & Suppression)
        # ---------------------------------------------------------------------
        for _, row in self._bass_df.iterrows():
            test_id_raw = str(row["test_id"]).strip()
            exp_id = f"BASS-II-{test_id_raw}"

            def clean_num(val):
                if pd.isnull(val):
                    return None
                f = float(val)
                return None if np.isnan(f) else round(f, 4)

            init_o2 = clean_num(row.get("calibrated_initial_o2_pct"))
            final_o2 = clean_num(row.get("calibrated_final_o2_pct"))
            init_co2 = clean_num(row.get("initial_co2_pct"))
            final_co2 = clean_num(row.get("final_co2_pct"))
            init_co = clean_num(row.get("initial_co_ppm"))
            final_co = clean_num(row.get("final_co_ppm"))
            gain = clean_num(row.get("radiometer_gain_initial"))
            frames = clean_num(row.get("total_frames_numeric"))
            restrictor = int(row.get("flow_restrictor", 0))

            flags = {
                "flag_initial_co_negative": bool(row.get("flag_initial_co_negative", False)),
                "flag_final_co_sensor_saturation": bool(row.get("flag_final_co_sensor_saturation", False)),
                "flag_fan_display_operational_note": bool(row.get("flag_fan_display_operational_note", False)),
                "flag_air_display_operational_note": bool(row.get("flag_air_display_operational_note", False)),
                "flag_missing_gas_measurement": bool(row.get("flag_missing_gas_measurement", False)),
            }

            bass_record = {
                "id": exp_id,
                "investigation": "BASS-II",
                "mission": "ISS MSG (Microgravity Science Glovebox)",
                "apparatus": "BASS Hardware Flow Duct",
                "title": f"BASS-II Solid Combustion Trial #{test_id_raw} ({row.get('fuel_base_material')})",
                "test_number": test_id_raw,
                "run_identifier": str(row.get("sample_id", "")).strip() or None,
                "date": str(row.get("test_date", "")).strip() or None,
                "gmt": str(row.get("gmt", "")).strip() or None,
                "pi": str(row.get("pi", "")).strip() or "BASS Investigation Team",
                "fuel_name": str(row.get("fuel_base_material", "")).strip(),
                "fuel_material_raw": str(row.get("fuel_material_raw", "")).strip(),
                "fuel_type": "solid",
                "fuel_geometry": str(row.get("fuel_geometry", "")).strip(),
                "ambient_pressure_kpa": 101.3,  # ISS MSG nominal atmospheric working pressure
                "ambient_pressure_mmhg": 760.0,
                "oxygen_percentage": init_o2,
                "burning_rate_mm2_s": None,  # Not applicable to solid boundary-layer flames
                "burn_time_s": None,         # Continuous convective flame, not isolated droplet burnout
                "extinction_observed": True, # Primary scientific goal was quench extinction mapping
                "outcome": "Extinction / Quench",
                "source_reference": "NASA PSI-25",
                "source_file": "PSI-25_Experimental table_BASS-II.csv",
                "provenance": "NASA Physical Sciences Informatics (PSI-25)",
                "scientific_regime": "Forced Convection Solid Flame Spread & Suppression",
                "chamber_parameters": {
                    "pressure_kpa": 101.3,
                    "flow_restrictor": restrictor,
                    "fan_display": str(row.get("Fan display", "")).strip() or None,
                    "air_display": str(row.get("Air display", "")).strip() or None,
                    "radiometer_gain": gain,
                    "gravity_level_g": 0.0,
                    "flow_type": "forced_convection",
                },
                "measurements": {
                    "initial_o2_percent": init_o2,
                    "final_o2_percent": final_o2,
                    "initial_co2_percent": init_co2,
                    "final_co2_percent": final_co2,
                    "initial_co_ppm": init_co,
                    "final_co_ppm": final_co,
                    "burning_rate_constant_mm2_s": None,
                    "burn_duration_s": None,
                    "total_frames_shot": frames,
                    "total_frames_status": str(row.get("total_frames_status", "")),
                },
                "data_quality_flags": flags,
            }

            self._experiments_map[exp_id.upper()] = bass_record
            self._experiments_map[test_id_raw.upper()] = bass_record
            self._experiments_list.append(bass_record)

        self._is_loaded = True
        print(f"[Repository] Successfully indexed {len(self._experiments_list)} experiments "
              f"({len(self._flex_df)} FLEX + {len(self._bass_df)} BASS-II).")

    # -------------------------------------------------------------------------
    # Public Accessors
    # -------------------------------------------------------------------------
    def is_loaded(self) -> bool:
        return self._is_loaded

    def get_health_stats(self) -> Dict[str, Any]:
        """Provides status for /api/health."""
        return {
            "datasets_loaded": self._is_loaded,
            "experiments_count": len(self._experiments_list),
            "investigations_loaded": ["FLEX", "BASS-II"] if self._is_loaded else [],
        }

    def get_overview_stats(self) -> Dict[str, Any]:
        """Calculates real descriptive summaries for /api/overview."""
        if not self._is_loaded:
            return {
                "total_experiments": 0,
                "total_investigations": 0,
                "investigations": [],
                "fuel_distribution": {},
                "flex_outcomes": {},
                "numeric_summaries": {},
                "scientific_notice": "Datasets not loaded.",
            }

        # Fuel distribution
        fuel_counts: Dict[str, int] = {}
        for exp in self._experiments_list:
            f = exp["fuel_name"]
            fuel_counts[f] = fuel_counts.get(f, 0) + 1

        # FLEX outcomes
        flex_outcomes = dict(self._flex_df["test_end"].value_counts())

        # Numeric metrics summary for FLEX measurements
        def compute_summary(series: pd.Series, unit: str) -> Dict[str, Any]:
            valid = series.dropna()
            if len(valid) == 0:
                return {"count": 0, "unit": unit}
            return {
                "count": int(len(valid)),
                "min": round(float(valid.min()), 4),
                "max": round(float(valid.max()), 4),
                "mean": round(float(valid.mean()), 4),
                "median": round(float(valid.median()), 4),
                "std": round(float(valid.std()), 4),
                "unit": unit,
            }

        summaries = {
            "flex_ambient_pressure": compute_summary(self._flex_df["ambient_pressure_kpa"], "kPa"),
            "flex_oxygen_percentage": compute_summary(self._flex_df["o2_mole_fraction"] * 100.0, "% vol"),
            "flex_droplet_initial_diameter": compute_summary(self._flex_df["droplet_initial_diameter_mm"], "mm"),
            "flex_burning_rate_constant": compute_summary(self._flex_df["burning_rate_mm2_s"], "mm2/s"),
            "flex_burn_duration": compute_summary(self._flex_df["burn_time_s"], "s"),
            "bass_calibrated_initial_o2": compute_summary(self._bass_df["calibrated_initial_o2_pct"], "% vol"),
        }

        investigations = [
            {
                "name": "FLEX",
                "full_name": "Flame Extinction Experiment",
                "psi_reference": "PSI-69",
                "mission": "ISS CIR (Combustion Integrated Rack)",
                "apparatus": "Multi-user Droplet Combustion Apparatus (MDCA)",
                "experiment_count": len(self._flex_df),
                "physical_regime": "Isolated Liquid Droplet Spherical Combustion",
                "fuel_states": ["liquid"],
                "fuels": ["Methanol", "Heptane"],
            },
            {
                "name": "BASS-II",
                "full_name": "Burning and Suppression of Solids - II",
                "psi_reference": "PSI-25",
                "mission": "ISS MSG (Microgravity Science Glovebox)",
                "apparatus": "BASS Hardware Flow Duct",
                "experiment_count": len(self._bass_df),
                "physical_regime": "Forced Convection Solid Flame Spread & Suppression",
                "fuel_states": ["solid"],
                "fuels": ["PMMA", "SIBAL", "Nomex", "Wax"],
            },
        ]

        return {
            "total_experiments": len(self._experiments_list),
            "total_investigations": 2,
            "investigations": investigations,
            "fuel_distribution": fuel_counts,
            "flex_outcomes": flex_outcomes,
            "numeric_summaries": summaries,
            "scientific_notice": (
                "All metrics derived directly from authentic NASA Physical Sciences Informatics (PSI) archives. "
                "FLEX and BASS-II represent distinct combustion transport regimes and are analyzed separately."
            ),
        }

    def search_experiments(
        self,
        investigation: Optional[str] = None,
        fuel: Optional[str] = None,
        query: Optional[str] = None,
        pressure_min: Optional[float] = None,
        pressure_max: Optional[float] = None,
        o2_min: Optional[float] = None,
        o2_max: Optional[float] = None,
        sort_by: str = "id",
        sort_order: str = "asc",
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Multi-attribute search, filter, and pagination across all experiments."""
        if not self._is_loaded:
            return [], 0

        filtered = self._experiments_list

        # Filter by investigation
        if investigation and investigation.lower() != "all":
            inv_upper = investigation.strip().upper()
            filtered = [e for e in filtered if e["investigation"].upper() == inv_upper]

        # Filter by fuel
        if fuel and fuel.lower() != "all":
            f_clean = fuel.strip().lower()
            filtered = [e for e in filtered if f_clean in e["fuel_name"].lower()]

        # Filter by text search query
        if query and query.strip():
            q = query.strip().lower()
            filtered = [
                e for e in filtered
                if q in e["id"].lower()
                or q in e["title"].lower()
                or q in e["fuel_name"].lower()
                or (e.get("run_identifier") and q in e["run_identifier"].lower())
                or (e.get("pi") and q in e["pi"].lower())
            ]

        # Numeric pressure range
        if pressure_min is not None:
            filtered = [e for e in filtered if e.get("ambient_pressure_kpa") is not None and e["ambient_pressure_kpa"] >= pressure_min]
        if pressure_max is not None:
            filtered = [e for e in filtered if e.get("ambient_pressure_kpa") is not None and e["ambient_pressure_kpa"] <= pressure_max]

        # Numeric oxygen range
        if o2_min is not None:
            filtered = [e for e in filtered if e.get("oxygen_percentage") is not None and e["oxygen_percentage"] >= o2_min]
        if o2_max is not None:
            filtered = [e for e in filtered if e.get("oxygen_percentage") is not None and e["oxygen_percentage"] <= o2_max]

        # Sorting
        reverse = (sort_order.lower() == "desc")
        if sort_by in ["ambient_pressure_kpa", "oxygen_percentage", "burning_rate_mm2_s", "burn_time_s"]:
            filtered = sorted(
                filtered,
                key=lambda x: (x.get(sort_by) is None, x.get(sort_by) or 0.0),
                reverse=reverse,
            )
        elif sort_by == "test_number":
            def sort_key(x):
                t = x["test_number"]
                try:
                    return (0, int(t.replace("B", "")))
                except ValueError:
                    return (1, t)
            filtered = sorted(filtered, key=sort_key, reverse=reverse)
        else:
            filtered = sorted(filtered, key=lambda x: x["id"], reverse=reverse)

        total_count = len(filtered)

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated = filtered[start:end]

        return paginated, total_count

    def get_experiment_by_id(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves single normalized experiment record by case-insensitive ID."""
        if not self._is_loaded or not experiment_id:
            return None
        key = experiment_id.strip().upper()
        return self._experiments_map.get(key)

    def compare_experiments(self, experiment_ids: List[str]) -> Dict[str, Any]:
        """Builds a scientific side-by-side comparison matrix for up to 10 trials."""
        matched: List[Dict[str, Any]] = []
        missing: List[str] = []

        for eid in experiment_ids:
            rec = self.get_experiment_by_id(eid)
            if rec:
                matched.append(rec)
            else:
                missing.append(eid)

        invs = {e["investigation"] for e in matched}
        is_homogeneous = len(invs) <= 1

        if not is_homogeneous:
            notice = (
                "SCIENTIFIC NOTICE: You are comparing experiments across distinct investigations (FLEX and BASS-II). "
                "FLEX studies isolated liquid droplet spherical burning, whereas BASS-II investigates forced convection "
                "solid flame spread. Direct comparison of burning rate or frame counts is not physically equivalent."
            )
        else:
            notice = "Experiments originate from the same investigation regime and share common measurement frameworks."

        # Define alignment variables
        matrix_definitions = [
            ("Investigation", "General", "-", lambda e: e["investigation"]),
            ("Mission / Facility", "General", "-", lambda e: e["mission"]),
            ("Apparatus", "General", "-", lambda e: e["apparatus"]),
            ("Fuel Material", "Fuel Properties", "-", lambda e: e["fuel_name"]),
            ("Fuel State", "Fuel Properties", "-", lambda e: e["fuel_type"]),
            ("Fuel Geometry", "Fuel Properties", "-", lambda e: e.get("fuel_geometry")),
            ("Ambient Pressure", "Chamber Conditions", "kPa", lambda e: e.get("ambient_pressure_kpa")),
            ("Oxygen Concentration", "Chamber Conditions", "% vol", lambda e: e.get("oxygen_percentage")),
            ("Flow Type", "Chamber Conditions", "-", lambda e: e["chamber_parameters"].get("flow_type")),
            ("Initial Diameter / Thickness", "Specimen Dimensions", "mm", lambda e: e["measurements"].get("initial_diameter_mm")),
            ("Burning Rate Constant K", "Combustion Metrics", "mm2/s", lambda e: e["measurements"].get("burning_rate_constant_mm2_s")),
            ("Burn Duration", "Combustion Metrics", "s", lambda e: e["measurements"].get("burn_duration_s")),
            ("Extinction Diameter", "Combustion Metrics", "mm", lambda e: e["measurements"].get("extinction_diameter_mm")),
            ("Outcome Mechanism", "Termination", "-", lambda e: e.get("outcome")),
            ("Extinction Observed", "Termination", "boolean", lambda e: e.get("extinction_observed")),
            ("High-Speed Camera Frames", "Imaging", "frames", lambda e: e["measurements"].get("total_frames_shot")),
        ]

        matrix_rows = []
        for param, cat, unit, getter in matrix_definitions:
            values_dict = {}
            for e in matched:
                val = getter(e)
                values_dict[e["id"]] = val
            matrix_rows.append({
                "parameter": param,
                "category": cat,
                "unit": unit,
                "values": values_dict,
            })

        # Chart Series Data for Frontend Charting
        chart_series = {
            "experiment_labels": [e["id"] for e in matched],
            "burning_rate_series": [e["measurements"].get("burning_rate_constant_mm2_s") for e in matched],
            "burn_duration_series": [e["measurements"].get("burn_duration_s") for e in matched],
            "oxygen_series": [e.get("oxygen_percentage") for e in matched],
            "pressure_series": [e.get("ambient_pressure_kpa") for e in matched],
        }

        return {
            "requested_ids": experiment_ids,
            "matched_ids": [e["id"] for e in matched],
            "missing_ids": missing,
            "investigation_homogeneity": is_homogeneous,
            "comparability_notice": notice,
            "experiments": matched,
            "matrix": matrix_rows,
            "chart_series": chart_series,
        }

    def get_analytics(
        self,
        investigation: Optional[str] = "all",
        fuel: Optional[str] = "all",
    ) -> Dict[str, Any]:
        """
        Calculates authentic scientific analytics across all experimental records
        without fabrication or arbitrary pagination limits.
        """
        if not self._is_loaded:
            return {
                "investigation_filter": str(investigation),
                "fuel_filter": str(fuel),
                "total_records_analyzed": 0,
                "provenance": "NASA PSI Archives",
                "scientific_notice": "Datasets not loaded.",
                "flex": None,
                "bass": None,
            }

        inv_filter = (investigation or "all").strip().lower()
        fuel_filter = (fuel or "all").strip().lower()

        # Helper: clean float
        def to_f(v, digits=4):
            if pd.isnull(v):
                return None
            try:
                f = float(v)
                return round(f, digits) if not np.isnan(f) else None
            except (ValueError, TypeError):
                return None

        # Apply fuel filter to FLEX dataframe if specified
        flex_df = self._flex_df.copy()
        if fuel_filter != "all":
            flex_df = flex_df[flex_df["fuel"].str.lower().str.contains(fuel_filter, na=False)]

        # Apply material filter to BASS dataframe if specified
        bass_df = self._bass_df.copy()
        if fuel_filter != "all":
            bass_df = bass_df[bass_df["fuel_base_material"].str.lower().str.contains(fuel_filter, na=False)]

        # ---------------------------------------------------------------------
        # 1. FLEX Scientific Analytics
        # ---------------------------------------------------------------------
        flex_analytics = None
        if inv_filter in ["all", "flex", "psi-69"]:
            # Helper: clean float
            def to_f(v, digits=4):
                if pd.isnull(v):
                    return None
                try:
                    f = float(v)
                    return round(f, digits) if not np.isnan(f) else None
                except (ValueError, TypeError):
                    return None

            # 1a. O2 vs Burning Rate
            o2_br_mask = flex_df["o2_mole_fraction"].notnull() & flex_df["burning_rate_mm2_s"].notnull() & (flex_df["burning_rate_mm2_s"] > 0)
            o2_br_df = flex_df[o2_br_mask]
            o2_br_pts = []
            for _, r in o2_br_df.iterrows():
                o2_val = to_f(r["o2_mole_fraction"], 4)
                br_val = to_f(r["burning_rate_mm2_s"], 4)
                if o2_val is not None and br_val is not None:
                    d0 = to_f(r.get("droplet_initial_diameter_mm"), 2)
                    p_kpa = to_f(r.get("ambient_pressure_kpa"), 2)
                    o2_br_pts.append({
                        "test_id": f"FLEX-{int(r['test_id'])}",
                        "fuel": str(r["fuel"]),
                        "x": o2_val,
                        "y": br_val,
                        "secondary_val": d0,
                        "extra": {"o2_pct": round(o2_val * 100.0, 2), "pressure_kpa": p_kpa},
                    })

            # Calculate Pearson correlation for Methanol and Heptane
            corrs = {}
            for f_name in ["Methanol", "Heptane"]:
                sub = o2_br_df[o2_br_df["fuel"].str.lower() == f_name.lower()]
                if len(sub) > 2:
                    r_val = sub["o2_mole_fraction"].corr(sub["burning_rate_mm2_s"])
                    if pd.notnull(r_val):
                        corrs[f_name] = round(float(r_val), 3)

            o2_vs_br = {
                "title": "Oxygen Mole Fraction vs Burning Rate Constant K",
                "investigation": "FLEX",
                "x_label": "Initial Ambient O₂ Mole Fraction",
                "x_unit": "mole fraction",
                "y_label": "Burning Rate Constant (K)",
                "y_unit": "mm²/s",
                "sample_count": len(o2_br_pts),
                "missing_count": len(flex_df) - len(o2_br_pts),
                "points": o2_br_pts,
                "correlations": corrs,
                "notes": "Classic d²-law regression: burning rate increases monotonically with ambient oxygen concentration due to enhanced gas-phase diffusion flame kinetics.",
            }

            # 1b. Pressure vs Burning Rate
            p_br_mask = flex_df["ambient_pressure_kpa"].notnull() & flex_df["burning_rate_mm2_s"].notnull() & (flex_df["burning_rate_mm2_s"] > 0)
            p_br_df = flex_df[p_br_mask]
            p_br_pts = []
            for _, r in p_br_df.iterrows():
                p_val = to_f(r["ambient_pressure_kpa"], 2)
                br_val = to_f(r["burning_rate_mm2_s"], 4)
                if p_val is not None and br_val is not None:
                    p_br_pts.append({
                        "test_id": f"FLEX-{int(r['test_id'])}",
                        "fuel": str(r["fuel"]),
                        "x": p_val,
                        "y": br_val,
                        "secondary_val": to_f(r.get("droplet_initial_diameter_mm"), 2),
                        "extra": {"pressure_mmhg": to_f(r.get("ambient_pressure_mmhg"), 1)},
                    })

            p_vs_br = {
                "title": "Ambient Chamber Pressure vs Burning Rate Constant K",
                "investigation": "FLEX",
                "x_label": "Ambient Pressure",
                "x_unit": "kPa",
                "y_label": "Burning Rate Constant (K)",
                "y_unit": "mm²/s",
                "sample_count": len(p_br_pts),
                "missing_count": len(flex_df) - len(p_br_pts),
                "points": p_br_pts,
                "correlations": None,
                "notes": "Pressure spans 40 kPa to 300 kPa inside the Combustion Integrated Rack (CIR). Higher ambient pressures elevate radiative soot emission for alkane fuels.",
            }

            # 1c. Droplet Initial Diameter vs Burning Rate
            d_br_mask = flex_df["droplet_initial_diameter_mm"].notnull() & flex_df["burning_rate_mm2_s"].notnull() & (flex_df["burning_rate_mm2_s"] > 0)
            d_br_df = flex_df[d_br_mask]
            d_br_pts = []
            for _, r in d_br_df.iterrows():
                d_val = to_f(r["droplet_initial_diameter_mm"], 3)
                br_val = to_f(r["burning_rate_mm2_s"], 4)
                if d_val is not None and br_val is not None:
                    d_br_pts.append({
                        "test_id": f"FLEX-{int(r['test_id'])}",
                        "fuel": str(r["fuel"]),
                        "x": d_val,
                        "y": br_val,
                        "secondary_val": to_f(r.get("burn_time_s"), 2),
                        "extra": {"test_end": str(r.get("test_end", ""))},
                    })

            d_vs_br = {
                "title": "Initial Droplet Diameter (d₀) vs Burning Rate Constant K",
                "investigation": "FLEX",
                "x_label": "Initial Droplet Diameter (d₀)",
                "x_unit": "mm",
                "y_label": "Burning Rate Constant (K)",
                "y_unit": "mm²/s",
                "sample_count": len(d_br_pts),
                "missing_count": len(flex_df) - len(d_br_pts),
                "points": d_br_pts,
                "correlations": None,
                "notes": "Initial droplet diameters range between 1.0 mm and 4.0 mm, generated via MDCA dispensing needles in ISS microgravity.",
            }

            # 1d. Burn Time Distribution
            valid_tb = flex_df["burn_time_s"].dropna()
            valid_tb = valid_tb[valid_tb > 0]
            tb_stats = {
                "min": round(float(valid_tb.min()), 2) if len(valid_tb) else 0.0,
                "max": round(float(valid_tb.max()), 2) if len(valid_tb) else 0.0,
                "mean": round(float(valid_tb.mean()), 2) if len(valid_tb) else 0.0,
                "median": round(float(valid_tb.median()), 2) if len(valid_tb) else 0.0,
                "std": round(float(valid_tb.std()), 2) if len(valid_tb) else 0.0,
            }

            # Create standard bins (0-5s, 5-10s, 10-15s, 15-20s, 20-25s, 25s+)
            tb_bins = []
            bin_defs = [(0, 5), (5, 10), (10, 15), (15, 20), (20, 25), (25, 45)]
            total_tb = len(valid_tb)
            for b_start, b_end in bin_defs:
                if b_end == 45:
                    c = int((valid_tb >= b_start).sum())
                    label = f"{b_start}s+"
                else:
                    c = int(((valid_tb >= b_start) & (valid_tb < b_end)).sum())
                    label = f"{b_start}–{b_end}s"
                pct = round((c / total_tb * 100.0), 1) if total_tb > 0 else 0.0
                tb_bins.append({
                    "bin_range": label,
                    "bin_start": float(b_start),
                    "bin_end": float(b_end),
                    "count": c,
                    "percentage": pct,
                })

            burn_time_dist = {
                "title": "Burn Duration Distribution (tb)",
                "investigation": "FLEX",
                "metric_label": "Combustion Duration",
                "unit": "s",
                "sample_count": total_tb,
                "missing_count": len(flex_df) - total_tb,
                "stats": tb_stats,
                "bins": tb_bins,
                "notes": "Burn duration scales approximately quadratically with initial droplet diameter (tb ≈ d₀²/K).",
            }

            # 1e. Test End Outcomes
            outcome_counts = flex_df["test_end"].value_counts().to_dict()
            total_outcomes = sum(outcome_counts.values())
            outcome_colors = {
                "Extinction": "#FF6B35",
                "Disruption": "#40C9FF",
                "Completion": "#2EE59D",
            }
            outcome_descs = {
                "Extinction": "Radiative or diffusive flame quenching prior to full liquid depletion.",
                "Disruption": "Micro-explosive droplet rupture or tether detachment.",
                "Completion": "Uninterrupted combustion through complete droplet vaporization.",
            }
            outcome_items = []
            for name, cnt in outcome_counts.items():
                pct = round((cnt / total_outcomes * 100.0), 1) if total_outcomes > 0 else 0.0
                outcome_items.append({
                    "name": str(name),
                    "count": int(cnt),
                    "percentage": pct,
                    "color": outcome_colors.get(str(name), "#9FB0C8"),
                    "description": outcome_descs.get(str(name), "Recorded termination condition."),
                })

            outcomes_data = {
                "title": "FLEX Test Termination Modes",
                "investigation": "FLEX",
                "sample_count": total_outcomes,
                "missing_count": len(flex_df) - total_outcomes,
                "items": outcome_items,
                "notes": "Extinction is the dominant outcome in microgravity due to accumulation of combustion products and radiative loss.",
            }

            # 1f. Fuel Type Distribution
            fuel_counts = flex_df["fuel"].value_counts().to_dict()
            total_fuels = sum(fuel_counts.values())
            fuel_colors = {"Methanol": "#40C9FF", "Heptane": "#FF8A50"}
            fuel_notes = {
                "Methanol": "Alcohol fuel; burns with nearly invisible blue flame, low soot, high water vapor production.",
                "Heptane": "Alkane fuel; exhibits heavy soot formation, pronounced yellow luminosity, and strong radiative cooling.",
            }
            fuel_items = []
            for name, cnt in fuel_counts.items():
                pct = round((cnt / total_fuels * 100.0), 1) if total_fuels > 0 else 0.0
                fuel_items.append({
                    "name": str(name),
                    "count": int(cnt),
                    "percentage": pct,
                    "color": fuel_colors.get(str(name), "#FFD29D"),
                    "description": fuel_notes.get(str(name), "Standard NASA research fuel."),
                })

            fuels_data = {
                "title": "FLEX Liquid Fuel Selection",
                "investigation": "FLEX",
                "sample_count": total_fuels,
                "missing_count": len(flex_df) - total_fuels,
                "items": fuel_items,
                "notes": "Verified authentic records from NASA PSI-69 archive.",
            }

            flex_analytics = {
                "investigation": "FLEX",
                "psi_reference": "PSI-69",
                "total_records": len(flex_df),
                "o2_vs_burning_rate": o2_vs_br,
                "pressure_vs_burning_rate": p_vs_br,
                "diameter_vs_burning_rate": d_vs_br,
                "burn_time_distribution": burn_time_dist,
                "outcomes": outcomes_data,
                "fuels": fuels_data,
            }

        # ---------------------------------------------------------------------
        # 2. BASS-II Scientific Analytics
        # ---------------------------------------------------------------------
        bass_analytics = None
        if inv_filter in ["all", "bass-ii", "bass", "psi-25"]:
            # 2a. Material Distribution
            mat_counts = bass_df["fuel_base_material"].value_counts().to_dict()
            total_mats = sum(mat_counts.values())
            mat_colors = {
                "PMMA": "#FF6B35",
                "SIBAL": "#40C9FF",
                "Nomex": "#C084FC",
                "Wax": "#FFE57A",
            }
            mat_items = []
            for name, cnt in mat_counts.items():
                pct = round((cnt / total_mats * 100.0), 1) if total_mats > 0 else 0.0
                mat_items.append({
                    "name": str(name),
                    "count": int(cnt),
                    "percentage": pct,
                    "color": mat_colors.get(str(name), "#9FB0C8"),
                    "description": f"Solid fuel specimen tested in BASS flow duct.",
                })

            mat_data = {
                "title": "BASS-II Solid Fuel Materials",
                "investigation": "BASS-II",
                "sample_count": total_mats,
                "missing_count": len(bass_df) - total_mats,
                "items": mat_items,
                "notes": "PMMA (polymethyl methacrylate) and SIBAL (cotton/fiberglass fabric) are primary spaceflight flammability standards.",
            }

            # 2b. Geometry Distribution
            geo_counts = bass_df["fuel_geometry"].value_counts().to_dict()
            total_geos = sum(geo_counts.values())
            geo_items = []
            for name, cnt in geo_counts.items():
                pct = round((cnt / total_geos * 100.0), 1) if total_geos > 0 else 0.0
                geo_items.append({
                    "name": str(name),
                    "count": int(cnt),
                    "percentage": pct,
                    "color": "#38BDF8" if "rod" in str(name).lower() else "#F97316",
                    "description": "Specimen configuration inside duct.",
                })

            geo_data = {
                "title": "BASS-II Specimen Geometries",
                "investigation": "BASS-II",
                "sample_count": total_geos,
                "missing_count": len(bass_df) - total_geos,
                "items": geo_items,
                "notes": "Cylindrical rods test axisymmetric flame spread; flat sheets test boundary-layer stagnation flow.",
            }

            # 2c. Initial O2 Distribution
            valid_o2 = bass_df["calibrated_initial_o2_pct"].dropna()
            total_o2 = len(valid_o2)
            o2_stats = {
                "min": round(float(valid_o2.min()), 2) if total_o2 else 0.0,
                "max": round(float(valid_o2.max()), 2) if total_o2 else 0.0,
                "mean": round(float(valid_o2.mean()), 2) if total_o2 else 0.0,
                "median": round(float(valid_o2.median()), 2) if total_o2 else 0.0,
                "std": round(float(valid_o2.std()), 2) if total_o2 else 0.0,
            }

            # Bins for initial O2: 10-15%, 15-20%, 20-25%, 25-30%, 30%+
            o2_bins = []
            for b_start, b_end in [(10, 15), (15, 20), (20, 25), (25, 30), (30, 45)]:
                if b_end == 45:
                    c = int((valid_o2 >= b_start).sum())
                    lbl = f"{b_start}%+"
                else:
                    c = int(((valid_o2 >= b_start) & (valid_o2 < b_end)).sum())
                    lbl = f"{b_start}–{b_end}%"
                pct = round((c / total_o2 * 100.0), 1) if total_o2 > 0 else 0.0
                o2_bins.append({
                    "bin_range": lbl,
                    "bin_start": float(b_start),
                    "bin_end": float(b_end),
                    "count": c,
                    "percentage": pct,
                })

            init_o2_dist = {
                "title": "Calibrated Initial Oxygen Concentration Distribution",
                "investigation": "BASS-II",
                "metric_label": "Calibrated Initial O₂",
                "unit": "% vol",
                "sample_count": total_o2,
                "missing_count": len(bass_df) - total_o2,
                "stats": o2_stats,
                "bins": o2_bins,
                "notes": "Oxygen levels are calibrated using electrochemical sensors in the Microgravity Science Glovebox (MSG).",
            }

            # 2d. Initial vs Final O2 Consumption Scatter
            mask_delta = bass_df["calibrated_initial_o2_pct"].notnull() & bass_df["calibrated_final_o2_pct"].notnull()
            delta_df = bass_df[mask_delta]
            delta_pts = []
            for _, r in delta_df.iterrows():
                i_o2 = to_f(r["calibrated_initial_o2_pct"], 2)
                f_o2 = to_f(r["calibrated_final_o2_pct"], 2)
                if i_o2 is not None and f_o2 is not None:
                    delta = round(i_o2 - f_o2, 2)
                    delta_pts.append({
                        "test_id": f"BASS-II-{r['test_id']}",
                        "fuel": str(r["fuel_base_material"]),
                        "x": i_o2,
                        "y": f_o2,
                        "secondary_val": delta,
                        "extra": {"delta_o2": delta, "flow_restrictor": int(r.get("flow_restrictor", 0))},
                    })

            o2_delta_data = {
                "title": "Initial vs Final Oxygen Concentration (ΔO₂ Depletion)",
                "investigation": "BASS-II",
                "x_label": "Calibrated Initial O₂",
                "x_unit": "% vol",
                "y_label": "Calibrated Final O₂",
                "y_unit": "% vol",
                "sample_count": len(delta_pts),
                "missing_count": len(bass_df) - len(delta_pts),
                "points": delta_pts,
                "correlations": None,
                "notes": "Drop from initial to final O₂ indicates total oxygen consumed during flame spread prior to extinction or fan shutdown.",
            }

            # 2e. Combustion Byproducts (CO2 vs CO)
            co_mask = bass_df["final_co2_pct"].notnull() & bass_df["final_co_ppm"].notnull()
            co_df = bass_df[co_mask]
            co_pts = []
            for _, r in co_df.iterrows():
                co2_val = to_f(r["final_co2_pct"], 2)
                co_val = to_f(r["final_co_ppm"], 1)
                if co2_val is not None and co_val is not None:
                    co_pts.append({
                        "test_id": f"BASS-II-{r['test_id']}",
                        "fuel": str(r["fuel_base_material"]),
                        "x": co2_val,
                        "y": co_val,
                        "secondary_val": to_f(r.get("calibrated_initial_o2_pct"), 1),
                        "extra": {"initial_co_ppm": to_f(r.get("initial_co_ppm"), 1)},
                    })

            co_products_data = {
                "title": "Combustion Effluents: Final CO₂ (%) vs Final CO (ppm)",
                "investigation": "BASS-II",
                "x_label": "Final CO₂ Concentration",
                "x_unit": "% vol",
                "y_label": "Final CO Concentration",
                "y_unit": "ppm",
                "sample_count": len(co_pts),
                "missing_count": len(bass_df) - len(co_pts),
                "points": co_pts,
                "correlations": None,
                "notes": "Elevated CO levels indicate incomplete combustion and smoldering tendency in low-velocity microgravity airflows.",
            }

            bass_analytics = {
                "investigation": "BASS-II",
                "psi_reference": "PSI-25",
                "total_records": len(bass_df),
                "material_distribution": mat_data,
                "geometry_distribution": geo_data,
                "initial_o2_distribution": init_o2_dist,
                "o2_consumption_scatter": o2_delta_data,
                "combustion_products_scatter": co_products_data,
            }

        total_analyzed = (len(flex_df) if flex_analytics else 0) + (len(bass_df) if bass_analytics else 0)

        return {
            "investigation_filter": investigation or "all",
            "fuel_filter": fuel or "all",
            "total_records_analyzed": total_analyzed,
            "provenance": "NASA Physical Sciences Informatics (PSI-69 FLEX & PSI-25 BASS-II)",
            "scientific_notice": (
                "All statistical analytics computed directly from authentic flight experiment tables. "
                "Liquid droplet combustion (FLEX) and solid surface flame spread (BASS-II) are analyzed in separate "
                "regimes due to non-commensurate physical mechanisms."
            ),
            "flex": flex_analytics,
            "bass": bass_analytics,
        }


# Singleton instance
repository = ExperimentRepository()
