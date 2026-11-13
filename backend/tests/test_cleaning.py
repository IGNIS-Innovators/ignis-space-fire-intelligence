"""
IGNIS — Space Fire Intelligence
Unit Tests for NASA Data Cleaning Pipelines (FLEX & BASS-II)
Uses standard library unittest for zero-dependency execution.
"""

import unittest
from pathlib import Path
import pandas as pd

from backend.app.services.data.clean_flex import clean_flex_dataset
from backend.app.services.data.clean_bass import clean_bass_dataset


class TestDataCleaning(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.flex_df = clean_flex_dataset(output_csv_path=None)
        cls.bass_df = clean_bass_dataset(output_csv_path=None)

    def test_flex_row_and_column_integrity(self):
        """Verify FLEX row counts and original column retention."""
        self.assertEqual(len(self.flex_df), 274)
        original_cols = [
            "FLEX Test #",
            "FLEX Identifier",
            "Test Date",
            "Test GMT",
            "Fuel",
            "Ambient pressure; mmHg",
            "O initial ambient composition; mole fraction",
            "N initial ambient composition; mole fraction",
            "CO initial ambient composition; mole fraction",
            "He initial ambient composition; mole fraction",
            "Droplet initial diameter; mm",
            "Visible flame extinction diameter; mm",
            "Burning rate; mm",
            "Burn time; s",
            "Test end",
        ]
        for col in original_cols:
            self.assertIn(col, self.flex_df.columns)

    def test_flex_primary_key_and_duplicate_flag(self):
        """Verify unique test_id and duplicate flex_identifier flagging."""
        self.assertEqual(self.flex_df["test_id"].nunique(), 274)
        dup_tests = self.flex_df[self.flex_df["flag_duplicate_identifier"]]["test_id"].tolist()
        self.assertEqual(sorted(dup_tests), [70, 73])

    def test_flex_physical_flags(self):
        """Verify sensor failure and approximation flagging."""
        zero_p = self.flex_df[self.flex_df["flag_zero_ambient_pressure"]]["test_id"].tolist()
        self.assertEqual(zero_p, [114])
        approx_burn = self.flex_df["flag_approximate_burn_time"].sum()
        self.assertEqual(approx_burn, 2)

    def test_flex_burning_rate_target(self):
        """Verify burning rate constant parsed distribution."""
        valid_br = self.flex_df["burning_rate_mm2_s"].dropna()
        self.assertEqual(len(valid_br), 258)
        self.assertAlmostEqual(valid_br.mean(), 0.5019, places=3)
        self.assertGreaterEqual(valid_br.min(), 0.05)
        self.assertLessEqual(valid_br.max(), 1.06)

    def test_bass_row_and_column_integrity(self):
        """Verify BASS-II row counts and original column retention."""
        self.assertEqual(len(self.bass_df), 129)
        self.assertEqual(self.bass_df["test_id"].nunique(), 129)
        self.assertIn("Fuel Sample Material", self.bass_df.columns)
        self.assertIn("PI", self.bass_df.columns)

    def test_bass_gas_flags(self):
        """Verify negative initial CO drift and sensor saturation flags."""
        neg_co = self.bass_df["flag_initial_co_negative"].sum()
        self.assertEqual(neg_co, 13)
        sat_co = self.bass_df["flag_final_co_sensor_saturation"].sum()
        self.assertEqual(sat_co, 4)

    def test_bass_material_parsing(self):
        """Verify solid fuel materials categorization."""
        materials = set(self.bass_df["fuel_base_material"].unique())
        self.assertTrue({"PMMA", "SIBAL", "Nomex", "Wax"}.issubset(materials))


if __name__ == "__main__":
    unittest.main()

