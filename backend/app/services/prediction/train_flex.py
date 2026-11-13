"""
IGNIS — Space Fire Intelligence
Module: backend.app.services.prediction.train_flex

Scientific Machine Learning Training Pipeline for NASA PSI-69 FLEX:
Predicting Microgravity Droplet Burning Rate Constant K (mm²/s).

Enforces strict zero data leakage by utilizing solely pre-ignition chamber
and droplet parameters. Evaluates standard CV, grouped CV, and untouched
held-out test set performance against a Dummy baseline.
"""

from pathlib import Path
from typing import Any, Dict, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
from sklearn.model_selection import GroupKFold, KFold, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Canonical pre-ignition features available prior to ignition
PRE_IGNITION_FEATURES = [
    "fuel",
    "ambient_pressure_kpa",
    "o2_mole_fraction",
    "n2_mole_fraction",
    "co2_mole_fraction",
    "he_mole_fraction",
    "droplet_initial_diameter_mm",
]

TARGET_COLUMN = "burning_rate_mm2_s"


def load_and_validate_dataset(
    csv_path: str | Path = "data/processed/FLEX_cleaned.csv",
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads FLEX cleaned data and applies physically motivated sample filtering.

    Returns
    -------
    Tuple[pd.DataFrame, Dict[str, Any]]
        Cleaned modeling dataframe and auditing metadata on inclusions/exclusions.
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"Cleaned FLEX dataset not found at {path.resolve()}")

    df = pd.read_csv(path)
    total_raw = len(df)

    # 1. Exclude observations where ground-truth target was not measured
    target_missing_mask = df[TARGET_COLUMN].isnull()
    n_target_missing = int(target_missing_mask.sum())
    df_with_target = df[~target_missing_mask].copy()

    # 2. Exclude known physical sensor failures (Test #114: ambient pressure = 0.0 kPa)
    zero_pressure_mask = df_with_target["ambient_pressure_kpa"] <= 0.0
    n_zero_pressure = int(zero_pressure_mask.sum())
    df_valid = df_with_target[~zero_pressure_mask].copy()

    audit_info = {
        "total_raw_records": total_raw,
        "excluded_target_missing": n_target_missing,
        "excluded_zero_pressure_anomaly": n_zero_pressure,
        "total_modeling_records": len(df_valid),
        "fuel_distribution": df_valid["fuel"].value_counts().to_dict(),
    }

    return df_valid, audit_info


def build_model_pipelines() -> Dict[str, Pipeline]:
    """
    Constructs scikit-learn Pipelines with preprocessors fitted strictly on training data.
    """
    cat_cols = ["fuel"]
    num_cols = [c for c in PRE_IGNITION_FEATURES if c != "fuel"]

    preprocessor_linear = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(drop="first", sparse_output=False), cat_cols),
            ("num", StandardScaler(), num_cols),
        ]
    )

    preprocessor_tree = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(drop="first", sparse_output=False), cat_cols),
            ("num", "passthrough", num_cols),
        ]
    )

    dummy_pipe = Pipeline([
        ("pre", preprocessor_linear),
        ("reg", DummyRegressor(strategy="mean")),
    ])

    ridge_pipe = Pipeline([
        ("pre", preprocessor_linear),
        ("reg", RidgeCV(alphas=np.logspace(-2, 3, 25))),
    ])

    rf_pipe = Pipeline([
        ("pre", preprocessor_tree),
        ("reg", RandomForestRegressor(
            n_estimators=100,
            max_depth=6,
            min_samples_leaf=2,
            random_state=42,
        )),
    ])

    return {
        "Dummy (Mean Baseline)": dummy_pipe,
        "Ridge Regression (Tuned)": ridge_pipe,
        "Random Forest (max_depth=6)": rf_pipe,
    }


def train_and_evaluate_models(
    csv_path: str | Path = "data/processed/FLEX_cleaned.csv",
    models_dir: str | Path = "models",
    test_size: float = 0.20,
    random_state: int = 42,
) -> Dict[str, Any]:
    """
    Orchestrates the scientific ML training and evaluation workflow.
    """
    df_valid, audit_info = load_and_validate_dataset(csv_path)

    X = df_valid[PRE_IGNITION_FEATURES]
    y = df_valid[TARGET_COLUMN]
    fuel_strat = df_valid["fuel"]
    test_dates = df_valid["test_date"]

    # Stratified train/test partition (80% train, 20% held-out test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=fuel_strat
    )

    pipelines = build_model_pipelines()
    scoring = {
        "mae": "neg_mean_absolute_error",
        "rmse": "neg_root_mean_squared_error",
        "r2": "r2",
    }

    # 1. 5-Fold Standard Cross-Validation on Training Data
    cv_std = KFold(n_splits=5, shuffle=True, random_state=random_state)
    std_cv_results = {}
    for name, pipe in pipelines.items():
        res = cross_validate(pipe, X_train, y_train, cv=cv_std, scoring=scoring)
        std_cv_results[name] = {
            "cv_mae_mean": float(-res["test_mae"].mean()),
            "cv_mae_std": float(res["test_mae"].std()),
            "cv_rmse_mean": float(-res["test_rmse"].mean()),
            "cv_rmse_std": float(res["test_rmse"].std()),
            "cv_r2_mean": float(res["test_r2"].mean()),
            "cv_r2_std": float(res["test_r2"].std()),
        }

    # 2. 5-Fold Grouped Cross-Validation by Test Date on Training Data
    cv_grp = GroupKFold(n_splits=5)
    train_groups = test_dates.loc[X_train.index]
    grp_cv_results = {}
    for name, pipe in pipelines.items():
        res = cross_validate(pipe, X_train, y_train, groups=train_groups, cv=cv_grp, scoring=scoring)
        grp_cv_results[name] = {
            "grp_cv_mae_mean": float(-res["test_mae"].mean()),
            "grp_cv_mae_std": float(res["test_mae"].std()),
            "grp_cv_rmse_mean": float(-res["test_rmse"].mean()),
            "grp_cv_rmse_std": float(res["test_rmse"].std()),
            "grp_cv_r2_mean": float(res["test_r2"].mean()),
            "grp_cv_r2_std": float(res["test_r2"].std()),
        }

    # 3. Final Evaluation on Untouched Held-Out Test Set
    test_results = {}
    fitted_models = {}

    for name, pipe in pipelines.items():
        pipe.fit(X_train, y_train)
        fitted_models[name] = pipe
        y_pred = pipe.predict(X_test)

        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(root_mean_squared_error(y_test, y_pred))
        r2 = float(r2_score(y_test, y_pred))

        # Subgroup evaluations by Fuel
        test_df = X_test.copy()
        test_df["y_true"] = y_test
        test_df["y_pred"] = y_pred

        subgroup_perf = {}
        for fuel_type in ["Methanol", "Heptane"]:
            sub = test_df[test_df["fuel"] == fuel_type]
            subgroup_perf[fuel_type] = {
                "n_samples": len(sub),
                "mae": float(mean_absolute_error(sub["y_true"], sub["y_pred"])),
                "rmse": float(root_mean_squared_error(sub["y_true"], sub["y_pred"])),
                "r2": float(r2_score(sub["y_true"], sub["y_pred"])),
            }

        test_results[name] = {
            "test_mae": mae,
            "test_rmse": rmse,
            "test_r2": r2,
            "subgroups": subgroup_perf,
        }

    # 4. Save trained production artifacts and domain boundaries
    models_path = Path(models_dir)
    models_path.mkdir(parents=True, exist_ok=True)

    # Compute operational feature bounding box for out-of-distribution detection
    feature_bounds = {}
    for col in PRE_IGNITION_FEATURES:
        if col != "fuel":
            feature_bounds[col] = {
                "min": float(X_train[col].min()),
                "max": float(X_train[col].max()),
                "mean": float(X_train[col].mean()),
                "std": float(X_train[col].std()),
            }

    metadata = {
        "model_target": TARGET_COLUMN,
        "target_units": "mm2/s",
        "pre_ignition_features": PRE_IGNITION_FEATURES,
        "feature_bounds": feature_bounds,
        "audit_info": audit_info,
        "standard_cv": std_cv_results,
        "grouped_cv": grp_cv_results,
        "test_results": test_results,
        "n_train": len(X_train),
        "n_test": len(X_test),
        "random_state": random_state,
    }

    # Save artifacts
    rf_artifact_path = models_path / "flex_burning_rate_rf.joblib"
    ridge_artifact_path = models_path / "flex_burning_rate_ridge.joblib"
    meta_path = models_path / "flex_model_metadata.joblib"

    joblib.dump({"pipeline": fitted_models["Random Forest (max_depth=6)"], "metadata": metadata}, rf_artifact_path)
    joblib.dump({"pipeline": fitted_models["Ridge Regression (Tuned)"], "metadata": metadata}, ridge_artifact_path)
    joblib.dump(metadata, meta_path)

    print(f"[Model Training] Complete. Saved model artifacts to: {models_path.resolve()}")
    return metadata


if __name__ == "__main__":
    meta = train_and_evaluate_models()
    print("\n--- Model Training Summary ---")
    print(f"Training Samples: {meta['n_train']} | Test Samples: {meta['n_test']}")
    for name, res in meta["test_results"].items():
        print(f"\n{name}:")
        print(f"  Test MAE:  {res['test_mae']:.4f} mm2/s")
        print(f"  Test RMSE: {res['test_rmse']:.4f} mm2/s")
        print(f"  Test R2:   {res['test_r2']:.4f}")
        for fuel, s in res["subgroups"].items():
            print(f"    -> [{fuel} (n={s['n_samples']})]: MAE={s['mae']:.4f}, RMSE={s['rmse']:.4f}, R2={s['r2']:.4f}")

