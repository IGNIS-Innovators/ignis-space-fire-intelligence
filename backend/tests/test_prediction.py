"""
IGNIS — Space Fire Intelligence
Unit Tests for Machine Learning Prediction Services (NASA PSI-69 FLEX)
Zero-dependency execution using standard library unittest.
"""

import unittest
from pathlib import Path
import numpy as np
import pandas as pd

from backend.app.services.prediction.train_flex import (
    PRE_IGNITION_FEATURES,
    TARGET_COLUMN,
    load_and_validate_dataset,
    train_and_evaluate_models,
)
from backend.app.services.prediction.predict_flex import (
    predict_droplet_burning_rate,
    FlexPredictionService,
)


class TestFlexPrediction(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure model artifacts exist or train lightweight instance
        models_dir = Path("models")
        rf_path = models_dir / "flex_burning_rate_rf.joblib"
        if not rf_path.exists():
            train_and_evaluate_models(models_dir=models_dir)
        cls.service = FlexPredictionService(model_path=rf_path)

    def test_pre_ignition_features_leakage_prevention(self):
        """Verify strict exclusion of post-ignition variables from input feature list."""
        forbidden_leakage_features = {
            "burn_time_s",
            "Burn time; s",
            "extinction_diameter_mm",
            "Visible flame extinction diameter; mm",
            "test_end",
            "Test end",
            "burning_rate_mm2_s",
            "Burning rate; mm",
            "flag_duplicate_identifier",
            "flag_zero_ambient_pressure",
            "flag_approximate_burn_time",
            "flag_missing_extinction_diameter",
            "flag_zero_extinction_diameter",
        }
        for forbidden in forbidden_leakage_features:
            self.assertNotIn(
                forbidden,
                PRE_IGNITION_FEATURES,
                f"Data leakage detected: {forbidden} is present in predictor list!",
            )

    def test_dataset_audit_filtering(self):
        """Verify explicit accounting of missing target and unphysical sensor values."""
        df_valid, audit = load_and_validate_dataset()
        self.assertEqual(audit["total_raw_records"], 274)
        self.assertEqual(audit["excluded_target_missing"], 16)
        self.assertEqual(audit["excluded_zero_pressure_anomaly"], 1)
        self.assertEqual(audit["total_modeling_records"], 257)
        self.assertEqual(len(df_valid), 257)

    def test_prediction_output_structure(self):
        """Verify prediction payload schema, units, and positive rate."""
        res = predict_droplet_burning_rate(
            fuel="Methanol",
            ambient_pressure_kpa=101.3,
            o2_mole_fraction=0.21,
            n2_mole_fraction=0.79,
            co2_mole_fraction=0.0,
            he_mole_fraction=0.0,
            droplet_initial_diameter_mm=2.5,
        )
        self.assertIn("predicted_burning_rate_constant", res)
        self.assertEqual(res["units"], "mm2/s")
        self.assertGreater(res["predicted_burning_rate_constant"], 0.0)
        self.assertFalse(res["is_extrapolation"])
        self.assertIn("scientific_reliability", res)

    def test_input_validation_rejections(self):
        """Verify rejection of invalid fuels and unphysical inputs."""
        # Unsupported fuel
        with self.assertRaises(ValueError):
            predict_droplet_burning_rate(
                fuel="Ethanol",
                ambient_pressure_kpa=101.3,
                o2_mole_fraction=0.21,
                n2_mole_fraction=0.79,
                co2_mole_fraction=0.0,
                he_mole_fraction=0.0,
                droplet_initial_diameter_mm=2.5,
            )

        # Negative pressure
        with self.assertRaises(ValueError):
            predict_droplet_burning_rate(
                fuel="Methanol",
                ambient_pressure_kpa=-10.0,
                o2_mole_fraction=0.21,
                n2_mole_fraction=0.79,
                co2_mole_fraction=0.0,
                he_mole_fraction=0.0,
                droplet_initial_diameter_mm=2.5,
            )

        # Zero initial diameter
        with self.assertRaises(ValueError):
            predict_droplet_burning_rate(
                fuel="Methanol",
                ambient_pressure_kpa=101.3,
                o2_mole_fraction=0.21,
                n2_mole_fraction=0.79,
                co2_mole_fraction=0.0,
                he_mole_fraction=0.0,
                droplet_initial_diameter_mm=0.0,
            )

    def test_extrapolation_detection(self):
        """Verify out-of-distribution pressure triggers warning flag."""
        res = predict_droplet_burning_rate(
            fuel="Methanol",
            ambient_pressure_kpa=650.0,  # Far above max training pressure (~309 kPa)
            o2_mole_fraction=0.21,
            n2_mole_fraction=0.79,
            co2_mole_fraction=0.0,
            he_mole_fraction=0.0,
            droplet_initial_diameter_mm=2.5,
        )
        self.assertTrue(res["is_extrapolation"])
        self.assertTrue(any("Pressure" in w for w in res["extrapolation_warnings"]))

    def test_physical_trend_oxygen_sensitivity(self):
        """Verify that increasing oxygen fraction monotonically increases predicted rate."""
        low_o2 = predict_droplet_burning_rate(
            fuel="Methanol",
            ambient_pressure_kpa=101.3,
            o2_mole_fraction=0.15,
            n2_mole_fraction=0.85,
            co2_mole_fraction=0.0,
            he_mole_fraction=0.0,
            droplet_initial_diameter_mm=3.0,
        )["predicted_burning_rate_constant"]

        high_o2 = predict_droplet_burning_rate(
            fuel="Methanol",
            ambient_pressure_kpa=101.3,
            o2_mole_fraction=0.30,
            n2_mole_fraction=0.70,
            co2_mole_fraction=0.0,
            he_mole_fraction=0.0,
            droplet_initial_diameter_mm=3.0,
        )["predicted_burning_rate_constant"]

        self.assertGreater(
            high_o2,
            low_o2,
            "Physical violation: Burning rate did not increase with elevated oxygen!",
        )


if __name__ == "__main__":
    unittest.main()

