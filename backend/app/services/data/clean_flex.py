"""
IGNIS — Space Fire Intelligence
Module: backend.app.services.data.clean_flex

NASA Physical Sciences Informatics (PSI) Dataset Cleaner for:
PSI-69 (Flame Extinction Experiment - FLEX)

Preserves all original NASA observations, headers, units, and identifiers,
while providing normalized numerical companion columns, SI conversions,
and data quality / scientific anomaly flags.
"""

from pathlib import Path
import re
import numpy as np
import pandas as pd


def clean_flex_dataset(
    raw_csv_path: str | Path = "data/raw/FLEX/PSI-69_Experimental table_FLEX.csv",
    output_csv_path: str | Path | None = "data/processed/FLEX_cleaned.csv",
) -> pd.DataFrame:
    """
    Ingests and cleans the NASA PSI-69 FLEX experimental dataset.

    Parameters
    ----------
    raw_csv_path : str | Path
        Path to raw CSV file encoded with cp1252 / Windows-1252.
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

    # Read original CSV using Windows-1252 encoding (handles byte 0x96 en-dash)
    df_raw = pd.read_csv(raw_path, encoding="cp1252")
    df = df_raw.copy()

    # -------------------------------------------------------------------------
    # Helper: Robust float conversion handling NASA missing-value tokens
    # -------------------------------------------------------------------------
    def parse_numeric(val: object) -> float:
        if pd.isnull(val):
            return np.nan
        s = str(val).strip()
        # NASA PSI conventions for unmeasured / missing / not applicable
        if s in ["–", "-", "—", "none", "None", "N/A", "nan", ""]:
            return np.nan
        # Strip approximation prefix for numerical analysis while flagging
        if s.startswith("~"):
            s = s[1:].strip()
        try:
            return float(s)
        except ValueError:
            return np.nan

    # -------------------------------------------------------------------------
    # Standardized Identifiers & Metadata
    # -------------------------------------------------------------------------
    df["test_id"] = df["FLEX Test #"].astype(int)
    df["flex_identifier"] = df["FLEX Identifier"].astype(str).str.strip()
    df["test_date"] = df["Test Date"].astype(str).str.strip()
    df["test_gmt"] = df["Test GMT"].apply(
        lambda x: str(x).strip() if pd.notnull(x) and str(x).strip() != "" else None
    )
    df["fuel"] = df["Fuel"].astype(str).str.strip()

    # -------------------------------------------------------------------------
    # Pressure & Gas Composition
    # -------------------------------------------------------------------------
    # Ambient pressure in original mmHg and SI equivalent kPa
    # 1 mmHg = 133.3223684 Pascals = 0.1333223684 kPa
    df["ambient_pressure_mmhg"] = df["Ambient pressure; mmHg"].astype(float)
    df["ambient_pressure_kpa"] = (df["ambient_pressure_mmhg"] * 0.1333223684).round(4)

    # Initial ambient molar fractions
    df["o2_mole_fraction"] = df["O initial ambient composition; mole fraction"].astype(float)
    df["n2_mole_fraction"] = df["N initial ambient composition; mole fraction"].astype(float)
    df["co2_mole_fraction"] = df["CO initial ambient composition; mole fraction"].astype(float)
    df["he_mole_fraction"] = df["He initial ambient composition; mole fraction"].astype(float)

    # -------------------------------------------------------------------------
    # Combustion & Extinction Measurements
    # -------------------------------------------------------------------------
    df["droplet_initial_diameter_mm"] = df["Droplet initial diameter; mm"].apply(parse_numeric)
    df["extinction_diameter_mm"] = df["Visible flame extinction diameter; mm"].apply(parse_numeric)
    
    # Burning rate constant K (-d(d^2)/dt) reported in mm^2/s (table header says mm)
    df["burning_rate_mm2_s"] = df["Burning rate; mm"].apply(parse_numeric)
    df["burn_time_s"] = df["Burn time; s"].apply(parse_numeric)
    df["test_end"] = df["Test end"].astype(str).str.strip()

    # -------------------------------------------------------------------------
    # Data Quality & Scientific Anomaly Flags
    # -------------------------------------------------------------------------
    # Flag duplicate camera / identifier codes (e.g., 193F001 appearing twice on tests #70 and #73)
    df["flag_duplicate_identifier"] = df["flex_identifier"].duplicated(keep=False)

    # Flag unphysical sensor values (e.g. Test #114 reporting 0.0 mmHg ambient pressure)
    df["flag_zero_ambient_pressure"] = df["ambient_pressure_mmhg"] <= 0.0

    # Flag approximate values noted by researchers (e.g., '~6', '~9')
    df["flag_approximate_burn_time"] = df["Burn time; s"].astype(str).str.contains("~", na=False)

    # Flag missing or unmeasured extinction diameters (en-dash '–' or null)
    df["flag_missing_extinction_diameter"] = df["extinction_diameter_mm"].isnull()

    # Flag zero extinction diameters (droplet burned to completion or disrupted without flame extinction)
    df["flag_zero_extinction_diameter"] = df["extinction_diameter_mm"] == 0.0

    # Verify gas mixture conservation: mole fraction sum deviation > 1%
    mole_sum = (
        df["o2_mole_fraction"]
        + df["n2_mole_fraction"]
        + df["co2_mole_fraction"]
        + df["he_mole_fraction"]
    )
    df["mole_fraction_sum"] = mole_sum.round(4)
    df["flag_gas_composition_sum_deviation"] = (mole_sum - 1.0).abs() > 0.01

    # Missing burn rate flag
    df["flag_missing_burning_rate"] = df["burning_rate_mm2_s"].isnull()

    # Missing initial droplet diameter flag
    df["flag_missing_initial_diameter"] = df["droplet_initial_diameter_mm"].isnull()

    # -------------------------------------------------------------------------
    # Save output if path specified
    # -------------------------------------------------------------------------
    if output_csv_path:
        out_path = Path(output_csv_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(out_path, index=False, encoding="utf-8")
        print(f"[FLEX Clean] Processed {len(df)} records -> {out_path.resolve()}")

    return df


if __name__ == "__main__":
    clean_flex_dataset()

