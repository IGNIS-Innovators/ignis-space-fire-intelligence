import React, { useState } from 'react';
import {
  FlaskConical,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { HybridCombustionChamber } from '../components/visuals/HybridCombustionChamber';
import { dataSource } from '../services/dataSource';
import { PredictionInputs, PredictionResult } from '../types/experiment';
import { mmhgToKpa, percentToMoleFraction } from '../services/apiAdapter';

export const PredictiveLab: React.FC = () => {
  const [inputs, setInputs] = useState<PredictionInputs>({
    fuel: 'Methanol',
    oxygenPercentage: 21,
    ambientPressureMmHg: 760,
    initialDropletDiameterMm: 2.5,
    modelChoice: 'ridge',
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataSource.predictScenario(inputs);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to compute burning rate prediction via backend ML service.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputs({
      fuel: 'Methanol',
      oxygenPercentage: 21,
      ambientPressureMmHg: 760,
      initialDropletDiameterMm: 2.5,
      modelChoice: 'ridge',
    });
    setResult(null);
    setError(null);
  };

  const pressureKpa = mmhgToKpa(inputs.ambientPressureMmHg);
  const o2MoleFrac = percentToMoleFraction(inputs.oxygenPercentage);
  const n2MoleFrac = Math.max(0, 1.0 - o2MoleFrac);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PREDICTION MATRIX / 06"
        title="Predictive Combustion Lab"
        subtitle="Estimate microgravity liquid droplet burning rate constant K using pre-ignition conditions evaluated by trained NASA PSI-69 regression pipelines."
        actions={
          <StatusBadge tone="cyan">
            Trained Regression · PSI-69 FLEX
          </StatusBadge>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleSimulate}
            className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Main 3-Column Lab Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulation Parameters Form */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#213047]">
              <div className="flex items-center gap-2">
                <Sliders size={17} className="text-ignis-orange" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Pre-Ignition Parameters
                </h3>
              </div>
              <button
                onClick={handleReset}
                title="Reset default parameters"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Fuel Compound */}
              <div>
                <label className="text-gray-400 block mb-1.5 uppercase text-[11px]">
                  Fuel Compound (NASA PSI-69 Tested)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Methanol', 'Heptane'] as const).map((fuel) => (
                    <button
                      key={fuel}
                      type="button"
                      onClick={() => setInputs({ ...inputs, fuel })}
                      className={`py-2 px-3 rounded-lg border text-center transition-all ${inputs.fuel === fuel
                        ? 'bg-ignis-orange text-white border-ignis-orange font-bold shadow-[0_0_10px_rgba(255,100,28,0.3)]'
                        : 'bg-[#0E1726] text-gray-300 border-[#213047] hover:border-gray-500'
                        }`}
                    >
                      {fuel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Choice Selector */}
              <div>
                <label className="text-gray-400 block mb-1.5 uppercase text-[11px] flex items-center gap-1">
                  <Cpu size={12} className="text-ignis-cyan" />
                  <span>ML Architecture Checkpoint</span>
                </label>
                <select
                  value={inputs.modelChoice || 'ridge'}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      modelChoice: e.target.value as 'ridge' | 'random_forest',
                    })
                  }
                  className="w-full bg-[#0E1726] border border-[#213047] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-ignis-cyan"
                >
                  <option value="ridge">Ridge Regression (Tuned, CV R²=0.732) [Default]</option>
                  <option value="random_forest">Random Forest Regressor (CV R²=0.687)</option>
                </select>
              </div>

              {/* Oxygen Percentage Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-400 uppercase text-[11px]">Chamber Oxygen (O₂)</span>
                  <span className="text-ignis-cyan font-bold">
                    {inputs.oxygenPercentage}% ({o2MoleFrac.toFixed(3)} mole frac)
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="40"
                  step="1"
                  value={inputs.oxygenPercentage}
                  onChange={(e) =>
                    setInputs({ ...inputs, oxygenPercentage: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-ignis-cyan bg-slate-800"
                />
                <span className="text-[10px] text-gray-500 block mt-1 font-sans">
                  FLEX historical range: 12% to 34% (Standard Air = 21%)
                </span>
              </div>

              {/* Ambient Pressure (mmHg & kPa) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-400 uppercase text-[11px]">Ambient Pressure</span>
                  <span className="text-white font-bold">
                    {inputs.ambientPressureMmHg} mmHg ({pressureKpa.toFixed(1)} kPa)
                  </span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1200"
                  step="10"
                  value={inputs.ambientPressureMmHg}
                  onChange={(e) =>
                    setInputs({ ...inputs, ambientPressureMmHg: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-ignis-orange bg-slate-800"
                />
                <span className="text-[10px] text-gray-500 block mt-1 font-sans">
                  FLEX chamber range: 530 to 2320 mmHg (70 to 309 kPa)
                </span>
              </div>

              {/* Droplet Initial Diameter (mm) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-400 uppercase text-[11px]">Initial Droplet Diameter (d₀)</span>
                  <span className="text-white font-bold">
                    {inputs.initialDropletDiameterMm.toFixed(2)} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.05"
                  value={inputs.initialDropletDiameterMm}
                  onChange={(e) =>
                    setInputs({ ...inputs, initialDropletDiameterMm: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-400 bg-slate-800"
                />
                <span className="text-[10px] text-gray-500 block mt-1 font-sans">
                  FLEX droplet fiber supports: 1.13 mm to 4.67 mm
                </span>
              </div>

              {/* Inert Gas Mixture Indicator */}
              <div className="pt-2 p-2.5 rounded-lg bg-[#08111E] border border-[#1A2A42] text-[10px]">
                <div className="flex items-center gap-1.5 text-gray-300 font-bold mb-1">
                  <Layers size={11} className="text-cyan-400" />
                  <span>Gas Mixture Balance (Physical Law)</span>
                </div>
                <div className="text-gray-400 flex justify-between">
                  <span>Nitrogen Balance (N₂):</span>
                  <span className="text-white font-semibold">{(n2MoleFrac * 100).toFixed(1)}%</span>
                </div>
                <div className="text-gray-400 flex justify-between mt-0.5">
                  <span>Diluents (CO₂ / He):</span>
                  <span className="text-white">0.0% (Quiescent Standard)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full mt-6 btn-primary text-xs py-3 rounded-xl flex items-center justify-center gap-2 font-mono"
          >
            <Sparkles size={15} />
            <span>{loading ? 'Evaluating ML Regression Pipeline...' : 'Predict Burning Rate K →'}</span>
          </button>
        </div>

        {/* Center Column: Hybrid Combustion Chamber (Chamber Photo + Animated Flame mapped to ML K) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 flex flex-col justify-between min-h-[460px]">
          <HybridCombustionChamber
            predictedK={result?.predictedBurningRateConstant ?? null}
            fuel={inputs.fuel}
            oxygenLevel={inputs.oxygenPercentage}
            dropletDiameter={inputs.initialDropletDiameterMm}
            loading={loading}
          />
        </div>

        {/* Right Column: Real ML Prediction Output Panel */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#213047]">
              <div className="flex items-center gap-2">
                <FlaskConical size={17} className="text-ignis-cyan" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Model Prediction Output
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                Live Backend ML
              </span>
            </div>

            {result ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Primary Metric: Predicted Burning Rate Constant K */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#0C1A30] to-[#081220] border border-cyan-500/40 shadow-[0_0_20px_rgba(54,184,255,0.15)]">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                    <span>Droplet Burning Rate Constant K</span>
                    <span className="text-cyan-400 font-bold">{result.units || 'mm²/s'}</span>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono tracking-tight text-cyan-300 drop-shadow-[0_0_12px_rgba(54,184,255,0.5)]">
                    {result.predictedBurningRateConstant !== undefined
                      ? `${result.predictedBurningRateConstant.toFixed(4)}`
                      : '—'}{' '}
                    <span className="text-base text-gray-400 font-normal">mm²/s</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2 border-t border-[#1C2C44] pt-1.5 flex justify-between">
                    <span>Model: {result.modelName || 'Ridge Regression'}</span>
                    <span>v{result.modelVersion || '1.0.0-flex'}</span>
                  </div>
                </div>

                {/* Extrapolation Alert Box */}
                {result.isExtrapolation ? (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-200">
                    <div className="flex items-center gap-2 mb-1.5 font-bold text-amber-300">
                      <AlertTriangle size={15} className="shrink-0 text-amber-400" />
                      <span>Boundary Extrapolation Detected</span>
                    </div>
                    <p className="text-[11px] text-gray-300 font-sans mb-2">
                      Input parameters exceed the training conditions observed in historical NASA PSI-69 tests. Predictions in this domain carry elevated uncertainty:
                    </p>
                    <ul className="space-y-1 text-[10px] font-mono text-amber-300/90 list-disc list-inside">
                      {result.extrapolationWarnings?.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Within historical NASA training bounds (interpolation regime; bound-check does not guarantee model accuracy or flight clearance).</span>
                  </div>
                )}

                {/* Scientific Notes on Fuel */}
                {result.scientificNotes && (
                  <div className="p-3 rounded-xl bg-[#091322] border border-[#213047] text-xs">
                    <span className="text-ignis-orange font-bold text-[11px] uppercase tracking-wider block mb-1">
                      Combustion Regime Notes
                    </span>
                    <p className="text-gray-300 font-sans text-[11px] leading-relaxed">
                      {result.scientificNotes}
                    </p>
                  </div>
                )}

                {/* Model Evaluation Metric */}
                {result.modelSelectionBasis && (
                  <div className="p-2.5 rounded-lg bg-[#08111E] border border-[#1A2A42] text-[10px] text-gray-400">
                    <strong className="text-gray-300 block mb-0.5">Model Evaluation Metric (Training Cross-Validation R²):</strong>
                    <span>{result.modelSelectionBasis}</span>
                    <span className="block mt-1 text-[9px] text-gray-500">Note: Cross-validation R² is an aggregate offline evaluation of model training stability, not an individualized per-prediction confidence or probability score.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-xs font-mono">
                <FlaskConical size={32} className="mx-auto mb-3 text-gray-600 opacity-60" />
                <span>Adjust pre-ignition parameters and click "Predict Burning Rate K" to query the trained NASA regression model.</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#213047] text-[10px] font-mono text-gray-500">
            {result?.scientificDisclaimer ||
              'RESEARCH PROTOTYPE: Quasi-steady regression model trained on NASA PSI-69. Not certified for flight safety.'}
          </div>
        </div>
      </div>
    </div>
  );
};
