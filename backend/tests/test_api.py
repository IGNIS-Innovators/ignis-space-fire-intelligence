"""
IGNIS — Space Fire Intelligence
Automated Integration Tests for FastAPI Backend Endpoints
"""

import unittest
from starlette.testclient import TestClient
from backend.app.main import app
from backend.app.services.prediction.predict_flex import FlexPredictionService


class TestIgnisApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # -------------------------------------------------------------------------
    # 1. Health & Readiness
    # -------------------------------------------------------------------------
    def test_health_endpoint(self):
        """Verify health check returns service readiness without leaking internal paths."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["datasets_loaded"])
        self.assertEqual(data["experiments_count"], 403)
        self.assertIn("FLEX", data["investigations_loaded"])
        self.assertIn("BASS-II", data["investigations_loaded"])
        self.assertTrue(data["model_ready"])
        # Ensure no private paths or secrets are leaked
        self.assertNotIn("password", str(data).lower())
        self.assertNotIn("secret", str(data).lower())
        self.assertNotIn("c:\\", str(data).lower())

    # -------------------------------------------------------------------------
    # 2. Mission Overview & Aggregations
    # -------------------------------------------------------------------------
    def test_overview_endpoint(self):
        """Verify overview statistics match authentic NASA datasets."""
        response = self.client.get("/api/overview")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_experiments"], 403)
        self.assertEqual(data["total_investigations"], 2)

        # Check investigation breakdown
        inv_counts = {i["name"]: i["experiment_count"] for i in data["investigations"]}
        self.assertEqual(inv_counts["FLEX"], 274)
        self.assertEqual(inv_counts["BASS-II"], 129)

        # Check fuel distribution
        fuels = data["fuel_distribution"]
        self.assertEqual(fuels["Methanol"], 157)
        self.assertEqual(fuels["Heptane"], 117)
        self.assertIn("PMMA", fuels)

        # Check outcomes
        outcomes = data["flex_outcomes"]
        self.assertEqual(outcomes["Extinction"], 186)
        self.assertEqual(outcomes["Disruption"], 61)
        self.assertEqual(outcomes["Completion"], 27)

    # -------------------------------------------------------------------------
    # 3. Experiment Search, Filtering & Pagination
    # -------------------------------------------------------------------------
    def test_experiments_pagination(self):
        """Verify pagination mechanics and page size limits."""
        response = self.client.get("/api/experiments?page=1&page_size=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total"], 403)
        self.assertEqual(data["page"], 1)
        self.assertEqual(data["page_size"], 10)
        self.assertEqual(len(data["results"]), 10)
        self.assertEqual(data["total_pages"], 41)

    def test_experiments_investigation_filter(self):
        """Verify filtering by investigation strictly separates FLEX and BASS-II."""
        res_flex = self.client.get("/api/experiments?investigation=FLEX")
        self.assertEqual(res_flex.status_code, 200)
        self.assertEqual(res_flex.json()["total"], 274)

        res_bass = self.client.get("/api/experiments?investigation=BASS-II")
        self.assertEqual(res_bass.status_code, 200)
        self.assertEqual(res_bass.json()["total"], 129)

    def test_experiments_fuel_filter(self):
        """Verify fuel search filtering."""
        res = self.client.get("/api/experiments?fuel=Methanol")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["total"], 157)

    def test_experiments_text_query(self):
        """Verify text query matching run identifiers and duplicate cameras."""
        res = self.client.get("/api/experiments?q=193F001")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total"], 2)
        matched_ids = {r["id"] for r in data["results"]}
        self.assertEqual(matched_ids, {"FLEX-70", "FLEX-73"})

    # -------------------------------------------------------------------------
    # 4. Detail Lookup & Missing Measurement Handling
    # -------------------------------------------------------------------------
    def test_experiment_detail_flex(self):
        """Verify detailed record lookup and provenance for FLEX."""
        res = self.client.get("/api/experiments/FLEX-70")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["id"], "FLEX-70")
        self.assertEqual(data["investigation"], "FLEX")
        self.assertEqual(data["fuel_name"], "Heptane")
        self.assertEqual(data["provenance"], "NASA Physical Sciences Informatics (PSI-69)")
        self.assertEqual(data["chamber_parameters"]["flow_type"], "quiescent")
        self.assertAlmostEqual(data["chamber_parameters"]["pressure_kpa"], 101.46, places=1)

    def test_experiment_detail_bass(self):
        """Verify detailed record lookup and provenance for BASS-II."""
        res = self.client.get("/api/experiments/BASS-II-B1")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["id"], "BASS-II-B1")
        self.assertEqual(data["investigation"], "BASS-II")
        self.assertEqual(data["fuel_name"], "PMMA")
        self.assertEqual(data["provenance"], "NASA Physical Sciences Informatics (PSI-25)")
        # In BASS-II, burning_rate_constant_mm2_s is None (null), NOT 0.0
        self.assertIsNone(data["measurements"]["burning_rate_constant_mm2_s"])

    def test_experiment_detail_case_insensitivity(self):
        """Verify case-insensitive lookup."""
        res = self.client.get("/api/experiments/flex-70")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["id"], "FLEX-70")

    def test_experiment_detail_not_found(self):
        """Verify 404 response for non-existent IDs."""
        res = self.client.get("/api/experiments/NONEXISTENT-999")
        self.assertEqual(res.status_code, 404)
        self.assertIn("not found", res.json()["detail"].lower())

    # -------------------------------------------------------------------------
    # 5. Experiment Comparison Matrix
    # -------------------------------------------------------------------------
    def test_compare_experiments_homogeneous(self):
        """Verify side-by-side comparison for same-investigation trials."""
        payload = {"experiment_ids": ["FLEX-1", "FLEX-2", "FLEX-3"]}
        res = self.client.post("/api/compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["investigation_homogeneity"])
        self.assertEqual(data["matched_ids"], ["FLEX-1", "FLEX-2", "FLEX-3"])
        self.assertEqual(len(data["matrix"]), 16)
        self.assertIn("burning_rate_series", data["chart_series"])

    def test_compare_experiments_heterogeneous(self):
        """Verify scientific notice when comparing FLEX with BASS-II."""
        payload = {"experiment_ids": ["FLEX-1", "BASS-II-B1"]}
        res = self.client.post("/api/compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["investigation_homogeneity"])
        self.assertIn("SCIENTIFIC NOTICE", data["comparability_notice"])

    def test_compare_missing_ids_handling(self):
        """Verify comparison handles partial missing IDs without crashing."""
        payload = {"experiment_ids": ["FLEX-1", "FAKE-999"]}
        res = self.client.post("/api/compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["matched_ids"], ["FLEX-1"])
        self.assertEqual(data["missing_ids"], ["FAKE-999"])

    # -------------------------------------------------------------------------
    # 6. ML Prediction Service
    # -------------------------------------------------------------------------
    def test_predict_valid_request(self):
        """Verify ML prediction produces valid rate, units, and cross-validation justification."""
        payload = {
            "fuel": "Methanol",
            "ambient_pressure_kpa": 101.3,
            "o2_mole_fraction": 0.21,
            "n2_mole_fraction": 0.79,
            "co2_mole_fraction": 0.0,
            "he_mole_fraction": 0.0,
            "droplet_initial_diameter_mm": 2.5,
            "model_choice": "ridge",
        }
        res = self.client.post("/api/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["predicted_burning_rate_constant"], 0.0)
        self.assertEqual(data["units"], "mm2/s")
        self.assertEqual(data["model_name"], "Ridge Regression (Tuned)")
        self.assertIn("cross-validation evidence", data["model_selection_basis"].lower())
        self.assertIn("EXPERIMENTAL RESEARCH PROTOTYPE", data["scientific_disclaimer"])
        self.assertFalse(data["is_extrapolation"])

    def test_predict_validation_errors(self):
        """Verify rejection of invalid fuels and unphysical parameters."""
        # Unsupported fuel
        res_fuel = self.client.post("/api/predict", json={
            "fuel": "Ethanol",
            "ambient_pressure_kpa": 101.3,
            "o2_mole_fraction": 0.21,
            "n2_mole_fraction": 0.79,
            "droplet_initial_diameter_mm": 2.5,
        })
        self.assertEqual(res_fuel.status_code, 422)

        # Negative pressure
        res_press = self.client.post("/api/predict", json={
            "fuel": "Methanol",
            "ambient_pressure_kpa": -10.0,
            "o2_mole_fraction": 0.21,
            "n2_mole_fraction": 0.79,
            "droplet_initial_diameter_mm": 2.5,
        })
        self.assertEqual(res_press.status_code, 422)

    def test_predict_extrapolation_detection(self):
        """Verify extrapolation warning when input exceeds experimental bounds."""
        payload = {
            "fuel": "Methanol",
            "ambient_pressure_kpa": 600.0,  # Training max is ~309 kPa
            "o2_mole_fraction": 0.21,
            "n2_mole_fraction": 0.79,
            "co2_mole_fraction": 0.0,
            "he_mole_fraction": 0.0,
            "droplet_initial_diameter_mm": 2.5,
        }
        res = self.client.post("/api/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_extrapolation"])
        self.assertTrue(any("Pressure" in w for w in data["extrapolation_warnings"]))

    # -------------------------------------------------------------------------
    # 7. AI & Scientific Insights
    # -------------------------------------------------------------------------
    def test_insights_endpoint(self):
        """Verify deterministic insights with verified experiment IDs."""
        res = self.client.get("/api/insights")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_experiments_analyzed"], 403)
        self.assertGreaterEqual(len(data["insights"]), 5)
        # Check first insight has real supporting IDs
        ins1 = data["insights"][0]
        self.assertIn("FLEX-1", ins1["supporting_experiment_ids"])
        self.assertIn("r = +0.5485", ins1["statistical_basis"])

    # -------------------------------------------------------------------------
    # 8. CORS Headers
    # -------------------------------------------------------------------------
    def test_cors_headers_development(self):
        """Verify CORS allows Vite frontend on port 5173."""
        headers = {"Origin": "http://localhost:5173"}
        res = self.client.get("/api/health", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), "http://localhost:5173")

    # -------------------------------------------------------------------------
    # 9. Scientific Data Analytics
    # -------------------------------------------------------------------------
    def test_analytics_all_endpoint(self):
        """Verify comprehensive analytics across all 403 NASA flight trials."""
        res = self.client.get("/api/analytics")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_records_analyzed"], 403)
        self.assertIsNotNone(data["flex"])
        self.assertIsNotNone(data["bass"])

        # FLEX charts integrity
        flex = data["flex"]
        self.assertEqual(flex["total_records"], 274)
        self.assertEqual(flex["o2_vs_burning_rate"]["sample_count"], 258)
        self.assertEqual(flex["o2_vs_burning_rate"]["y_unit"], "mm²/s")
        self.assertGreater(len(flex["o2_vs_burning_rate"]["points"]), 200)
        self.assertEqual(len(flex["outcomes"]["items"]), 3)
        self.assertEqual(len(flex["fuels"]["items"]), 2)

        # BASS-II charts integrity
        bass = data["bass"]
        self.assertEqual(bass["total_records"], 129)
        self.assertEqual(bass["initial_o2_distribution"]["sample_count"], 129)
        self.assertGreater(len(bass["material_distribution"]["items"]), 0)
        self.assertGreater(len(bass["o2_consumption_scatter"]["points"]), 100)

    def test_analytics_investigation_filter(self):
        """Verify analytics filters strictly by investigation."""
        res_flex = self.client.get("/api/analytics?investigation=FLEX")
        self.assertEqual(res_flex.status_code, 200)
        data_flex = res_flex.json()
        self.assertEqual(data_flex["total_records_analyzed"], 274)
        self.assertIsNotNone(data_flex["flex"])
        self.assertIsNone(data_flex["bass"])

        res_bass = self.client.get("/api/analytics?investigation=BASS-II")
        self.assertEqual(res_bass.status_code, 200)
        data_bass = res_bass.json()
        self.assertEqual(data_bass["total_records_analyzed"], 129)
        self.assertIsNone(data_bass["flex"])
        self.assertIsNotNone(data_bass["bass"])


if __name__ == "__main__":
    unittest.main()

