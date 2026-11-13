"""
IGNIS — Space Fire Intelligence
Module: backend.app.services.data.clean_bass

NASA Physical Sciences Informatics (PSI) Dataset Cleaner for:
PSI-25 (Burning and Suppression of Solids - II: BASS-II)

Preserves all original NASA observations, headers, units, and identifiers,
while providing normalized numerical companion columns, parsed sample geometries,
and data quality / sensor saturation flags.
"""

from pathlib import Path
import re
import numpy as np
import pandas as pd


def clean_bass_dataset(
    raw_csv_path: str | Path = "data/raw/BASS-II/PSI-25_Experimental table_BASS-II.csv",
    output_csv_path: str | Path | None = "data/processed/BASS-II_cleaned.csv",
) -> pd.DataFrame:
    """
    Ingests and cleans the NASA PSI-25 BASS-II experimental dataset.

    Parameters
    ----------
    raw_csv_path : str | Path
        Path to raw CSV file encoded with utf-8-sig (UTF-8 with BOM).
    output_csv_path : str | Path | None
        Destination path for cleaned CSV. If None, does not write to disk.

    Returns
    -------
    pd.DataFrame
        Cleaned and normalized DataFrame containing original NASA data plus
        standardized companion columns and data quality flags.
    """
    raw_path = Path(raw_csv_path)
    if not raw_path.exists():
        raise FileNotFoundError(f"NASA raw dataset not found at: {raw_path.resolve()}")

    # Read original CSV using utf-8-sig to automatically strip the byte-order mark (BOM)
    df_raw = pd.read_csv(raw_path, encoding="utf-8-sig")
    df = df_raw.copy()

    # -------------------------------------------------------------------------
    # Helper: Parsing gas concentration numerics and non-numeric sensor tokens
    # -------------------------------------------------------------------------
    def parse_gas_numeric(val: object) -> float:
        if pd.isnull(val):
            return np.nan
        s = str(val).strip()
        # NASA PSI conventions: 'none' = not recorded; 'OR' = Out of Range; '>500'/'over' = saturation
        if s.lower() in ["none", "or", "over", "n/a", "nan", ""] or s.startswith(">"):
            return np.nan
        try:
            return float(s)
        except ValueError:
            return np.nan

    # -------------------------------------------------------------------------
    # Standardized Identifiers & Metadata
    # -------------------------------------------------------------------------
    df["test_id"] = df["Test #"].astype(str).str.strip()
    df["pi"] = df["PI"].astype(str).str.strip()
    df["test_date"] = df["Date"].astype(str).str.strip()
    df["gmt"] = df["GMT"].astype(int)
    df["sample_id"] = df["Sample #"].astype(str).str.strip()
    df["fuel_material_raw"] = df["Fuel Sample Material"].astype(str).str.strip()

    # -------------------------------------------------------------------------
    # Fuel Sample Material & Geometry Classification
    # -------------------------------------------------------------------------
    def parse_base_material(desc: str) -> str:
        s = str(desc).strip().upper()
        if any(k in s for k in ["PMMA", "ROD", "SLAB", "FILM", "SPHERICAL"]):
            return "PMMA"
        elif "SIBAL" in s:
            return "SIBAL"
        elif "NOMEX" in s:
            return "Nomex"
        elif "WAX" in s or "CANDLE" in s:
            return "Wax"
        return "Other"

    def parse_geometry(desc: str) -> str:
        s = str(desc).strip().lower()
        if "film" in s:
            return "film"
        elif "rod" in s:
            return "rod"
        elif "slab" in s:
            return "slab"
        elif "sibal" in s:
            return "fabric"
        elif "candle" in s or "wax" in s:
            return "candle"
        elif "spherical" in s:
            return "spherical"
        return "unspecified"

    df["fuel_base_material"] = df["Fuel Sample Material"].apply(parse_base_material)
    df["fuel_geometry"] = df["Fuel Sample Material"].apply(parse_geometry)
    df["flow_restrictor"] = df["Flow restrictor"].astype(int)

    # -------------------------------------------------------------------------
    # Radiometer Gain & Camera Frame Metadata
    # -------------------------------------------------------------------------
    def parse_initial_gain(val: object) -> float:
        m = re.search(r"\b(1000|250|50|10)\b", str(val))
        return float(m.group(1)) if m else np.nan

    df["radiometer_gain_initial"] = df[
        "Radiometer gain   (1000   250   50   10)"
    ].apply(parse_initial_gain)

    def parse_frames(val: object) -> tuple[float, str]:
        s = str(val).strip()
        if s.isdigit():
            return float(s), "valid_numeric"
        elif s.lower() == "none":
            return np.nan, "missing_none"
        elif s.lower() == "video":
            return np.nan, "video_only"
        elif "postburn" in s.lower():
            return 10.0, "postburn_only"
        elif "+" in s:
            return np.nan, "multi_segment_unparsed"
        return np.nan, "other_text"

    frames_parsed = df["Total Frames Shot"].apply(parse_frames)
    df["total_frames_numeric"] = [p[0] for p in frames_parsed]
    df["total_frames_status"] = [p[1] for p in frames_parsed]

    # -------------------------------------------------------------------------
    # Atmospheric & Combustion Product Gas Concentrations
    # -------------------------------------------------------------------------
    df["calibrated_initial_o2_pct"] = df["Calibrated  initial O2 % by vol "].apply(parse_gas_numeric)
    df["calibrated_final_o2_pct"] = df["Calibrated final O2 % by vol"].apply(parse_gas_numeric)
    df["initial_co2_pct"] = df["Initial CO2 % by vol"].apply(parse_gas_numeric)
    df["final_co2_pct"] = df["Final CO2 % by vol"].apply(parse_gas_numeric)
    df["initial_co_ppm"] = df["Initial CO (ppm)"].apply(parse_gas_numeric)
    df["final_co_ppm"] = df["Final CO (ppm)"].apply(parse_gas_numeric)

    # -------------------------------------------------------------------------
    # Data Quality & Operational Anomaly Flags
    # -------------------------------------------------------------------------
    # Electrochemical sensor zero calibration offset leading to negative reading
    df["flag_initial_co_negative"] = df["initial_co_ppm"] < 0.0

    # Sensor saturation (>500 ppm, 'over', or 'OR')
    final_co_raw = df["Final CO (ppm)"].astype(str).str.lower().str.strip()
    df["flag_final_co_sensor_saturation"] = final_co_raw.isin([">500", "over", "or"])

    # Multi-step fan and flow operational adjustment notes in display columns
    df["flag_fan_display_operational_note"] = df["Fan display"].astype(str).str.contains(
        r"[a-zA-Z\(\);]", regex=True, na=False
    )
    df["flag_air_display_operational_note"] = df["Air display"].astype(str).str.contains(
        r"[a-zA-Z\(\);<>]", regex=True, na=False
    )

    # Missing gas channels
    df["flag_missing_gas_measurement"] = (
        df["calibrated_final_o2_pct"].isnull()
        | df["initial_co2_pct"].isnull()
        | df["final_co2_pct"].isnull()
        | df["initial_co_ppm"].isnull()
        | df["final_co_ppm"].isnull()
    )

    # -------------------------------------------------------------------------
    # Save output if path specified
    # -------------------------------------------------------------------------
    if output_csv_path:
        out_path = Path(output_csv_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(out_path, index=False, encoding="utf-8")
        print(f"[BASS-II Clean] Processed {len(df)} records -> {out_path.resolve()}")

    return df


if __name__ == "__main__":
    clean_bass_dataset()

