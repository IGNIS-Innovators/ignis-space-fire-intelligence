# NASA Microgravity Combustion Data Exploration & Cleaning Report

**Project**: IGNIS — Space Fire Intelligence  
**Challenge**: NASA Space Apps Challenge 2026  
**Document**: `docs/architecture/data_analysis.md`  
**Branch**: `feature/ai-backend`  
**Datasets Analyzed**:
1. NASA PSI-69: *Flame Extinction Experiment (FLEX)* (`data/raw/FLEX/PSI-69_Experimental table_FLEX.csv`)
2. NASA PSI-25: *Burning and Suppression of Solids - II (BASS-II)* (`data/raw/BASS-II/PSI-25_Experimental table_BASS-II.csv`)

---

## 1. Executive Summary

This report establishes the empirical foundation for **IGNIS — Space Fire Intelligence**. We conducted deep exploratory data analysis (EDA), data cleaning, encoding resolution, and target feasibility investigations on two authentic NASA Physical Sciences Informatics (PSI) microgravity combustion repositories:

- **FLEX (PSI-69)**: 274 experimental trials conducted inside the Combustion Integrated Rack (CIR) aboard the International Space Station (ISS), focusing on isolated liquid hydrocarbon droplets burning in quiescent microgravity environments under varied ambient pressures, oxygen concentrations, and diluent atmospheres ($N_2, CO_2, He$).
- **BASS-II (PSI-25)**: 129 experimental trials conducted inside the Microgravity Science Glovebox (MSG) aboard the ISS, investigating forced-convection flame spread and extinction limits over solid polymer fuels (PMMA rods, films, slabs) and fabric materials (SIBAL, Nomex) across varied flow restrictors, fan velocities, and oxygen levels.

### Key Decisions & Scientific Principles
1. **Physical Segregation (No Cross-Dataset Merging)**: FLEX and BASS-II represent fundamentally distinct combustion regimes—isolated liquid droplet spherical diffusion flames in quiescent conditions vs. boundary-layer convective flame spread over solid surfaces. In accordance with microgravity transport physics, they are maintained as separate datasets and must never be combined into a single training matrix.
2. **Zero Falsified Data**: Missing sensor records, unmeasured extinction points, and operational notes are flagged with explicit boolean and categorization columns rather than imputed with fabricated numerical values.
3. **ML Target Recommendation**: **Burning Rate Constant $K$ (`burning_rate_mm2_s`)** in FLEX is recommended as the primary machine learning prediction target. It represents an intrinsic thermodynamic property of steady-state droplet combustion, has zero post-ignition data leakage when predicted from initial chamber conditions, exhibits a well-behaved normal distribution ($0.502 \pm 0.138\text{ mm}^2/\text{s}$), and avoids the severe event-truncation censoring that invalidates raw burn times.

---

## 2. Ingestion & File Architecture Findings

| Metric / Attribute | NASA PSI-69 (FLEX) | NASA PSI-25 (BASS-II) |
| :--- | :--- | :--- |
| **Raw File Path** | `data/raw/FLEX/PSI-69_Experimental table_FLEX.csv` | `data/raw/BASS-II/PSI-25_Experimental table_BASS-II.csv` |
| **Cleaned File Path**| `data/processed/FLEX_cleaned.csv` | `data/processed/BASS-II_cleaned.csv` |
| **File Size (Raw)** | 24,776 bytes | 16,590 bytes |
| **File Size (Clean)**| 67,636 bytes | 36,338 bytes |
| **Detected Encoding**| `cp1252` (Windows-1252) | `utf-8-sig` (UTF-8 with Byte-Order Mark) |
| **Encoding Hazard** | Byte `0x96` (en-dash `–`) fails standard UTF-8 decoders | Leading BOM (`\xef\xbb\xbf`) corrupts column 0 name if decoded as UTF-8 |
| **Delimiter** | Comma (`,`) | Comma (`,`) |
| **Raw Shape** | 274 rows × 15 columns | 129 rows × 17 columns |
| **Cleaned Shape** | 274 rows × 38 columns (15 raw + 23 normalized/flags)| 129 rows × 40 columns (17 raw + 23 normalized/flags)|
| **Missing Tokens** | `–` (en-dash), `~` (approximation prefix), blank | `'none'`, `'OR'` (Out of Range), `'>500'`, `'over'`, `'-1'` |
| **Primary Key** | `FLEX Test #` (Integer 1..274, 100% unique) | `Test #` (String `B1`..`B129`, 100% unique) |

---

## 3. Exploratory Data Analysis: NASA PSI-69 (FLEX)

### 3.1 Record Counts & Primary Identifier
- **Total Trials**: 274 records.
- **Identifier Anomaly**: `FLEX Identifier` contains 273 unique values. An identical identifier string (`193F001`) appears in both **Test #70** and **Test #73** (both performed on 3/23/2010 at 7:25:43 GMT with Heptane). However, physical measurements differ (Test #70: $d_0 = 4.67\text{ mm}$, $K = 0.41$; Test #73: $d_0 = 4.64\text{ mm}$, $K = 0.56$). Therefore, `FLEX Test #` is the sole true primary key. The duplicate identifier is flagged as `flag_duplicate_identifier = True`.

### 3.2 Numerical Distributions & Physical Quantities

The table below summarizes the quantitative measurements in FLEX after parsing NASA missing value tokens:

| Column | Unit | Count | Missing (%) | Mean | Std | Min | 25% | Median | 75% | Max | IQR | Skewness |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Ambient pressure` | $\text{mmHg}$ | 274 | 0.0% | 716.71 | 275.11 | 0.00 | 536.30 | 759.60 | 765.68 | 2319.90 | 229.38 | +3.97 |
| `Ambient pressure (SI)`| $\text{kPa}$ | 274 | 0.0% | 95.55 | 36.68 | 0.00 | 71.50 | 101.27 | 102.08 | 309.29 | 30.58 | +3.97 |
| $O_2$ mole fraction | molar | 274 | 0.0% | 0.2007 | 0.0480 | 0.1200 | 0.1700 | 0.2000 | 0.2100 | 0.3400 | 0.0400 | +0.92 |
| $N_2$ mole fraction | molar | 274 | 0.0% | 0.6301 | 0.1758 | 0.0900 | 0.5200 | 0.6600 | 0.7900 | 0.8800 | 0.2700 | -0.87 |
| $CO_2$ mole fraction | molar | 274 | 0.0% | 0.1203 | 0.1744 | 0.0000 | 0.0000 | 0.0000 | 0.2000 | 0.7000 | 0.2000 | +1.60 |
| $He$ mole fraction | molar | 274 | 0.0% | 0.0478 | 0.1121 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.4500 | 0.0000 | +2.27 |
| Initial Droplet $d_0$ | $\text{mm}$ | 262 | 4.4% | 3.0017 | 0.6954 | 1.1000 | 2.5825 | 3.0150 | 3.5275 | 4.6700 | 0.9450 | -0.27 |
| Extinction $d_{\text{ext}}$ | $\text{mm}$ | 197 | 28.1% | 1.9096 | 1.0351 | 0.0000 | 1.1900 | 1.7700 | 2.6100 | 4.6000 | 1.4200 | +0.27 |
| Burning Rate $K$ | $\text{mm}^2/\text{s}$ | 258 | 5.8% | 0.5019 | 0.1376 | 0.0500 | 0.4000 | 0.5000 | 0.5800 | 1.0600 | 0.1800 | +0.59 |
| Burn Time $t_b$ | $\text{s}$ | 268 | 2.2% | 11.1818| 7.5816 | 0.3000 | 5.2750 | 9.6000 | 15.6000| 39.2000 | 10.3250| +0.93 |

### 3.3 Physical Anomalies & Critical EDA Insights
1. **Unphysical Pressure Anomaly (Test #114)**:
   - Test #114 reports `Ambient pressure; mmHg = 0.00` while burning Methanol for $18.9\text{ s}$ with $K = 0.46$. Combustion cannot occur in a vacuum. This is a logging/sensor failure and is flagged as `flag_zero_ambient_pressure = True`.
2. **Gas Conservation & Diluents**:
   - The gas phase components sum to $1.00 \pm 0.01$ in 245 of 274 rows (mean sum: 0.9988). 29 rows exhibit minor rounding discrepancies ($\Delta > 0.01$, max deviation $0.02$). These are flagged with `flag_gas_composition_sum_deviation = True`.
   - Note on chemistry: The raw column labeled `CO initial ambient composition` denotes **Carbon Dioxide ($CO_2$)**, the standard inert diluent used in FLEX CIR chamber tests alongside Nitrogen and Helium.
3. **Physical Dimension of Burning Rate**:
   - Although the raw NASA column header reads `Burning rate; mm`, theoretical and empirical verification demonstrates this is the classical $d^2$-law burning rate constant $K = -d(d^2)/dt$ ($\text{mm}^2/\text{s}$). Empirical correlation between `Burning rate` and $(d_0^2 - d_{\text{ext}}^2)/t_b$ is **$r = 0.912$** ($p < 10^{-15}$).
4. **Extinction Diameter of Zero**:
   - Exactly 8 rows record `Visible flame extinction diameter; mm = 0.00`. Crucially, **none** of these 8 tests ended in Extinction: 5 ended in Disruption and 3 ended in Completion. When a droplet disrupts or burns completely to burnout, no residual extinction diameter exists.

---

## 4. Exploratory Data Analysis: NASA PSI-25 (BASS-II)

### 4.1 Record Counts & Investigators
- **Total Trials**: 129 records.
- **Principal Investigators**: T'ien (29), Olson (27), Fernandez-Pello (27), Bhattacharjee (22), Miller (20), Ferkul (4).
- **All 129 test IDs (`B1` through `B129`) are unique**.

### 4.2 Fuel Materials & Form Factors
BASS-II evaluated solid fuel combustion across four primary material classes:
- **PMMA (Polymethyl Methacrylate)** (98 tests, 76.0%):
  - Cast cylindrical rods: $1/4''$, $3/8''$, $1/2''$, black and clear formulations (54 tests).
  - Cast thin films: $100\ \mu\text{m}$, $200\ \mu\text{m}$, $300\ \mu\text{m}$, $400\ \mu\text{m}$ thick, $1\text{ cm}$ or $2\text{ cm}$ wide (13 tests).
  - Thick flat slabs: $1\text{ mm}$, $2\text{ mm}$, $3\text{ mm}$, $4\text{ mm}$, $5\text{ mm}$ thick (29 tests).
  - Spherical PMMA segments (2 tests).
- **SIBAL Fabric** (27 tests, 20.9%): Standard cotton/fiberglass blend fabric strip ($1\text{ cm}$ and $2\text{ cm}$ widths).
- **Nomex III Fabric** (3 tests, 2.3%): Aramid thermal protection textile.
- **Japan Wax Candle** (1 test, 0.8%): Solid paraffin/wax candle geometry.

### 4.3 Operational Complexity in Fan and Air Flow Logs
Unlike static numerical tables, `Fan display` and `Air display` in BASS-II represent **dynamic operational event logs**:
- **Multi-Step Potentiometer Adjustments**: 65 tests in `Fan display` and 61 tests in `Air display` record operational step-downs (e.g. `'57.5 42 41 40 (2.3 0.5 0.35 ...)'`, `'Fan pot 1.1 (5cm/s) 0.4 0.36 0.32 ext'`).
- Researchers deliberately decreased fan speed in discrete steps during microgravity burns to determine the low-speed **quench extinction limit**.
- These operational logs cannot be cast to a single scalar float without losing the time sequence of flow adjustments. They are preserved in `Fan display` / `Air display` and categorized with `flag_fan_display_operational_note` and `flag_air_display_operational_note`.

### 4.4 Gas Sensor Behaviors & Anomalies
- **Calibrated Oxygen**: Initial $O_2$ ranges from $13.6\%$ to $22.2\%$ by volume (mean: $18.57\%$). Final $O_2$ was unrecorded (`'none'`) in 2 tests.
- **Negative Carbon Monoxide (Sensor Drift)**: 13 tests record negative initial CO concentrations (e.g., $-1\text{ ppm}$, min: $-3\text{ ppm}$). In electrochemical sensors, zero-point thermal drift produces minor negative offsets; these are flagged as `flag_initial_co_negative = True`.
- **Sensor Saturation**: Final CO exceeded sensor thresholds in 4 tests, recorded as `>500` (1 test), `over` (1 test), and `OR` (Out of Range, 2 tests). These are flagged as `flag_final_co_sensor_saturation = True`.

---

## 5. Investigation of FLEX Machine Learning Prediction Targets

We evaluated the three candidate prediction targets specified for FLEX:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FLEX CANDIDATE PREDICTION TARGETS                   │
├──────────────────────┬──────────────────────┬──────────────────────────┤
│ 1. Test End          │ 2. Burn Time         │ 3. Burning Rate Constant │
│ (Categorical)        │ (Regression, s)      │ (Regression, mm²/s)      │
│                      │                      │                          │
│ • Severe class bias  │ • Right-censored     │ • Intrinsic physics      │
│ • Post-burn leakage  │ • Truncated by ext.  │ • Clean Gaussian dist.   │
│ • Small sample (274) │ • Confounded metrics │ • Zero data leakage      │
│ ❌ HIGH RISK          │ ⚠️ METHOD CAVEATS    │ ✅ RECOMMENDED TARGET    │
└──────────────────────┴──────────────────────┴──────────────────────────┘
```

### 5.1 Target 1: `Test end` (Classification)

#### Class Distribution & Imbalance
- `Extinction`: 186 samples (67.9%)
- `Disruption`: 61 samples (22.3%)
- `Completion`: 27 samples (9.9%)

```
Extinction  ████████████████████████████████ 67.9% (186)
Disruption  ███████████ 22.3% (61)
Completion  █████ 9.9% (27)
```

#### Assessment & Limitations
1. **Severe Class Imbalance**: The minority class `Completion` comprises only 27 instances. Under standard 5-fold stratified cross-validation, each evaluation fold contains only ~5 completion events, creating high variance in model evaluation.
2. **Catastrophic Data Leakage Hazard**:
   - `Visible flame extinction diameter`: If included as a feature, the model trivializes classification: whenever extinction diameter is 0 or unrecorded, the trial is virtually guaranteed to be `Disruption` or `Completion`.
   - `Burn time` and `Burning rate`: Both are post-ignition observations that leak the outcome of the burn.
3. **Boundary Physics Stochasticity**: When restricted strictly to pre-ignition features (fuel chemistry, pressure, gas mole fractions, initial diameter), droplet disruption is driven by micro-bubble nucleation and soot-shell dynamics. With only 274 total trials, training a 3-class classifier yields low statistical power.

---

### 5.2 Target 2: `Burn time; s` (Regression)

#### Empirical Distribution
- Samples: 268 valid, 6 missing (2.2%). 2 values contain researcher approximation prefixes (`~6`, `~9`).
- Range: $0.30\text{ s}$ to $39.20\text{ s}$ (Mean: $11.18\text{ s}$, Median: $9.60\text{ s}$, Std: $7.58\text{ s}$).

#### Scientific Caveat: Event Truncation & Right-Censoring
In classical droplet combustion theory, burn time to complete consumption is:
$$t_{\text{burn}} \approx \frac{d_0^2}{K}$$
However, in the FLEX dataset:
- **186 tests (67.9%)** terminated prematurely due to radiative/convective flame **Extinction**.
- **61 tests (22.3%)** terminated prematurely due to violent droplet **Disruption**.
- Only **27 tests (9.9%)** burned to complete burnout (`Completion`).

Therefore, for **90.1% of all trials (247 / 274)**, the recorded `Burn time` is **not** the true physical combustion lifetime—it is an arbitrary truncation timestamp caused by an extinction or disruption event. Modeling `Burn time` with standard Mean Squared Error (MSE) regression conflates intrinsic fuel consumption rates with premature termination triggers.

---

### 5.3 Target 3: `Burning rate; mm` (Regression of Burning Rate Constant $K$)

#### Empirical Distribution
- Samples: 258 non-null valid records (5.8% missing).
- Mean: $0.5019\text{ mm}^2/\text{s}$
- Median: $0.5000\text{ mm}^2/\text{s}$
- Standard Deviation: $0.1376\text{ mm}^2/\text{s}$
- Range: $0.0500$ to $1.0600\text{ mm}^2/\text{s}$
- Skewness: $+0.5862$ (nearly symmetric, ideal Gaussian bell shape)
- Kurtosis: $+1.1887$ (light tails, minimal extreme outlier distortion)

```
0.05 ┤ *
0.20 ┤ ****
0.35 ┤ *******************
0.50 ┤ ****************************** (Peak at 0.50)
0.65 ┤ ********************
0.80 ┤ *******
0.95 ┤ **
1.06 ┤ *
```

#### Physical Interpretability & Thermodynamic Alignment
The quasi-steady burning rate constant $K = -d(d^2)/dt$ is the foundational physical rate parameter of droplet combustion (Spalding, 1953; Law, 1982). Crucially, $K$ is measured during the stable quasi-steady burning period **prior** to any extinction or disruption event.

Correlation analysis with initial pre-ignition conditions confirms strong alignment with combustion physics:

| Pre-Ignition Feature | Correlation with $K$ ($r$) | Physical Combustion Mechanism |
| :--- | :--- | :--- |
| **$O_2$ mole fraction** | **$+0.5485$** | Higher ambient oxidizer accelerates chemical reaction rates and flame temperature. |
| **$CO_2$ mole fraction**| **$-0.4031$** | $CO_2$ diluent acts as a thermal ballast with high heat capacity, retarding mass burning rate. |
| **$He$ mole fraction** | **$+0.4136$** | Helium has exceptionally high thermal conductivity, increasing conductive heat feedback to droplet. |
| **Initial diameter $d_0$**| **$-0.2946$** | Larger droplets suffer greater radiative heat loss from accumulated soot shells, reducing $K$. |
| **Ambient pressure** | **$-0.1138$** | Secondary pressure sensitivity in diffusion-controlled regimes. |
| **Fuel type** | Heptane: $0.545\text{ mm}^2/\text{s}$<br>Methanol: $0.472\text{ mm}^2/\text{s}$ | Higher heat of combustion and volatility of Heptane vs. Methanol. |

#### Complete Elimination of Data Leakage
Predicting $K$ requires **only** pre-ignition chamber inputs:
$$\hat{K} = f(\text{Fuel}, P_{\text{ambient}}, X_{O_2}, X_{N_2}, X_{CO_2}, X_{He}, d_0)$$
None of the post-ignition observational features (`extinction_diameter_mm`, `burn_time_s`, `test_end`) are required, guaranteeing zero data leakage.

---

## 6. Scientific Recommendation

### Primary ML Target: `burning_rate_mm2_s` (Burning Rate Constant $K$)
**Recommendation**: The IGNIS AI backend should adopt the **Burning Rate Constant $K$** as its primary supervised learning benchmark.

**Justification Summary**:
1. **Zero Data Leakage**: Governed strictly by initial experimental conditions.
2. **Physical Validity**: Intrinsic steady-state combustion rate uncorrupted by premature extinction or disruption truncation.
3. **Statistical Superiority**: Unimodal, Gaussian distribution ($0.502 \pm 0.138\text{ mm}^2/\text{s}$), with 258 high-quality training instances.
4. **Mission Relevance**: Accurate prediction of microgravity fuel consumption rates is directly required for spacecraft fire safety containment calculations.

### Secondary Auxiliary Target: Binary Extinction Classifier
For classification workflows, predict **Binary Extinction Risk** (`flag_extinction_event`: True if `test_end == 'Extinction'`, False if `Disruption` or `Completion`), conditioned strictly on pre-ignition variables ($X_{O_2}$, diluent ratios, pressure, and droplet diameter).

---

## 7. Data Dictionaries

### 7.1 NASA PSI-69 FLEX Data Dictionary

| Original Column Header | Cleaned Field Name | Data Type | Units / Format | Missing | Valid Range | Description & Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `FLEX Test #` | `test_id` | Integer | - | 0 (0.0%) | 1 .. 274 | Primary key for experimental run. Strictly unique. |
| `FLEX Identifier` | `flex_identifier` | String | Alphanumeric | 0 (0.0%) | - | Run code. Duplicate `193F001` on tests #70 and #73. |
| `Test Date` | `test_date` | String | MM/DD/YYYY | 0 (0.0%) | 2009-2011 | Calendar date of execution aboard the ISS. |
| `Test GMT` | `test_gmt` | String | HH:MM:SS | 1 (0.4%) | - | Execution time in GMT. Null in Test #9. |
| `Fuel` | `fuel` | String | Categorical | 0 (0.0%) | Methanol, Heptane | Hydrocarbon fuel (157 Methanol, 117 Heptane). |
| `Ambient pressure; mmHg` | `ambient_pressure_mmhg` | Float | $\text{mmHg}$ | 0 (0.0%) | 0.0 .. 2319.9 | Chamber pressure. Test #114 has sensor failure (0.0). |
| - | `ambient_pressure_kpa` | Float | $\text{kPa}$ | 0 (0.0%) | 0.0 .. 309.29 | Converted SI pressure ($P_{\text{mmHg}} \times 0.133322$). |
| `O initial ambient composition; mole fraction` | `o2_mole_fraction` | Float | Molar ratio | 0 (0.0%) | 0.12 .. 0.34 | Ambient oxidizer mole fraction. |
| `N initial ambient composition; mole fraction` | `n2_mole_fraction` | Float | Molar ratio | 0 (0.0%) | 0.09 .. 0.88 | Nitrogen diluent mole fraction. |
| `CO initial ambient composition; mole fraction`| `co2_mole_fraction` | Float | Molar ratio | 0 (0.0%) | 0.00 .. 0.70 | Carbon Dioxide ($CO_2$) diluent mole fraction. |
| `He initial ambient composition; mole fraction`| `he_mole_fraction` | Float | Molar ratio | 0 (0.0%) | 0.00 .. 0.45 | Helium diluent mole fraction. |
| `Droplet initial diameter; mm` | `droplet_initial_diameter_mm` | Float | $\text{mm}$ | 12 (4.4%) | 1.10 .. 4.67 | Initial suspended droplet diameter. |
| `Visible flame extinction diameter; mm` | `extinction_diameter_mm` | Float | $\text{mm}$ | 77 (28.1%) | 0.00 .. 4.60 | Diameter at extinction. 0.0 for completion/disruption. |
| `Burning rate; mm` | `burning_rate_mm2_s` | Float | $\text{mm}^2/\text{s}$ | 16 (5.8%) | 0.05 .. 1.06 | $d^2$-law burning rate constant $K$. |
| `Burn time; s` | `burn_time_s` | Float | Seconds | 6 (2.2%) | 0.30 .. 39.20 | Burn duration until extinction/disruption/burnout. |
| `Test end` | `test_end` | String | Categorical | 0 (0.0%) | Extinction, Disruption, Completion | Termination mechanism. |
| - | `flag_duplicate_identifier` | Boolean | - | 0 | True/False | True for tests #70 and #73 (`193F001`). |
| - | `flag_zero_ambient_pressure` | Boolean | - | 0 | True/False | True for Test #114 ($P = 0.0\text{ mmHg}$). |
| - | `flag_approximate_burn_time` | Boolean | - | 0 | True/False | True for values marked with `~` prefix (`~6`, `~9`). |
| - | `flag_missing_extinction_diameter`| Boolean | - | 0 | True/False | True if extinction diameter is unrecorded / dash. |
| - | `flag_zero_extinction_diameter` | Boolean | - | 0 | True/False | True if extinction diameter equals 0.00. |
| - | `flag_gas_composition_sum_deviation` | Boolean | - | 0 | True/False | True if mole fraction sum deviates from 1.0 by $> 0.01$. |

---

### 7.2 NASA PSI-25 BASS-II Data Dictionary

| Original Column Header | Cleaned Field Name | Data Type | Units / Format | Missing | Valid Range | Description & Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PI` | `pi` | String | Name | 0 (0.0%) | 6 PIs | Principal Investigator leading trial. |
| `Test #` | `test_id` | String | Alphanumeric | 0 (0.0%) | `B1` .. `B129` | Unique experiment run ID. |
| `Date` | `test_date` | String | MM/DD/YYYY | 0 (0.0%) | 2014-2015 | Date of execution in ISS MSG. |
| `GMT` | `gmt` | Integer | Timestamp | 0 (0.0%) | - | Execution timestamp. |
| `Sample #` | `sample_id` | String | Alphanumeric | 0 (0.0%) | - | Fuel sample inventory code. |
| `Fuel Sample Material` | `fuel_material_raw` | String | Text | 0 (0.0%) | - | Raw verbatim NASA sample description. |
| - | `fuel_base_material` | String | Categorical | 0 (0.0%) | PMMA, SIBAL, Nomex, Wax | Standardized polymer / fabric classification. |
| - | `fuel_geometry` | String | Categorical | 0 (0.0%) | rod, film, slab, fabric, candle, spherical | Physical specimen geometry. |
| `Flow restrictor` | `flow_restrictor` | Integer | Discrete | 0 (0.0%) | 0, 1, 2 | Chamber duct flow restrictor setting. |
| `Fan display` | `Fan display` | String | Log Notes | 13 (10.1%) | - | Multi-step potentiometer / velocity sequence. |
| `Air display` | `Air display` | String | Log Notes | 4 (3.1%) | - | Flow display & step-down operational notes. |
| `Radiometer gain (1000 250 50 10)`| `radiometer_gain_initial`| Float | Gain factor | 0 (0.0%) | 10, 50, 250, 1000 | Initial radiometer amplifier gain. |
| `Total Frames Shot` | `total_frames_numeric` | Float | Integer count | 6 (4.7%) | 0 .. 420 | High-speed camera frame count. |
| - | `total_frames_status` | String | Categorical | 0 (0.0%) | valid, video, missing, postburn | Flag for video-only or unparsed frame entries. |
| `Calibrated initial O2 % by vol` | `calibrated_initial_o2_pct` | Float | % by volume | 0 (0.0%) | 13.6 .. 22.2 | Initial chamber oxygen concentration. |
| `Calibrated final O2 % by vol` | `calibrated_final_o2_pct` | Float | % by volume | 2 (1.6%) | 0.6 .. 40.4 | Final chamber oxygen post-combustion. |
| `Initial CO2 % by vol` | `initial_co2_pct` | Float | % by volume | 2 (1.6%) | 0.00 .. 1.85 | Pre-ignition $CO_2$ concentration. |
| `Final CO2 % by vol` | `final_co2_pct` | Float | % by volume | 6 (4.7%) | 0.20 .. 3.22 | Post-combustion $CO_2$ concentration. |
| `Initial CO (ppm)` | `initial_co_ppm` | Float | ppm | 3 (2.3%) | -3.0 .. 950.0 | Pre-ignition $CO$. Negative values denote zero drift. |
| `Final CO (ppm)` | `final_co_ppm` | Float | ppm | 9 (7.0%) | 0.3 .. 950.0 | Post-combustion $CO$. Out of range / >500 flagged. |
| - | `flag_initial_co_negative` | Boolean | - | 0 | True/False | True for 13 baseline zero-drift readings. |
| - | `flag_final_co_sensor_saturation`| Boolean | - | 0 | True/False | True for `>500`, `over`, or `OR` saturation readings. |
| - | `flag_fan_display_operational_note`| Boolean | - | 0 | True/False | True if fan display contains multi-step sequence notes. |
| - | `flag_air_display_operational_note`| Boolean | - | 0 | True/False | True if air display contains multi-step sequence notes. |

---

## 8. Reproducibility & Pipeline Usage

The data cleaning pipeline is implemented in modular, tested Python modules within the backend:

```bash
# Clean NASA PSI-69 FLEX dataset
python backend/app/services/data/clean_flex.py

# Clean NASA PSI-25 BASS-II dataset
python backend/app/services/data/clean_bass.py
```

Both scripts can also be imported programmatically into API ingestion routes and research services:

```python
from backend.app.services.data.clean_flex import clean_flex_dataset
from backend.app.services.data.clean_bass import clean_bass_dataset

df_flex = clean_flex_dataset()
df_bass = clean_bass_dataset()
```

