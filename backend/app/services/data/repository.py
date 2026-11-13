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


# Singleton instance
repository = ExperimentRepository()
