import React, { useState } from 'react';
import {
  FlaskConical,
  Sliders,
  AlertTriangle,
  Flame,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConceptFlameLab3D } from '../components/visuals/ConceptFlameLab3D';
import { dataSource } from '../services/dataSource';
import { PredictionInputs, PredictionResult } from '../types/experiment';
import { formatPressure, formatDiameter, formatBurnTime, formatOxygen } from '../lib/formatters';

export const PredictiveLab: React.FC = () => {
  const [inputs, setInputs] = useState<PredictionInputs>({
    fuel: 'Methanol',
    oxygenPercentage: 21,
    ambientPressureMmHg: 760,
    initialDropletDiameterMm: 2.0,
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await dataSource.predictScenario(inputs);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputs({
      fuel: 'Methanol',
      oxygenPercentage: 21,
      ambientPressureMmHg: 760,
      initialDropletDiameterMm: 2.0,
    });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PREDICTION MATRIX / 06"
        title="Predictive Combustion Lab"
        subtitle="Explore microgravity droplet scenario boundaries and query nearest documented NASA PSI-69 benchmark tests."
        actions={<StatusBadge tone="orange">Concept Preview · Validated Model Gated</StatusBadge>}
      />

      {/* Main 3-Column Lab Workspace matching the reference collage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulation Parameters Form */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#213047]">
              <div className="flex items-center gap-2">
                <Sliders size={17} className="text-ignis-orange" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Simulation Parameters
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
                  Fuel Compound
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Methanol', 'Heptane'] as const).map((fuel) => (
                    <button
                      key={fuel}
                      type="button"
                      onClick={() => setInputs({ ...inputs, fuel })}
                      className={`py-2 px-3 rounded-lg border text-center transition-all ${
                        inputs.fuel === fuel
                          ? 'bg-ignis-orange text-white border-ignis-orange font-bold shadow-[0_0_10px_rgba(255,100,28,0.3)]'
                          : 'bg-[#0E1726] text-gray-300 border-[#213047] hover:border-gray-500'
                      }`}
                    >
                      {fuel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Oxygen Percentage Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-400 uppercase text-[11px]">Chamber Oxygen Level</span>
                  <span className="text-ignis-cyan font-bold">{inputs.oxygenPercentage}% O₂</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  step="1"
                  value={inputs.oxygenPercentage}
                  onChange={(e) =>
                    setInputs({ ...inputs, oxygenPercentage: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-ignis-cyan bg-slate-800"
                />
                <span className="text-[10px] text-gray-500 block mt-1 font-sans">
                  Typical NASA chamber ranges: 18% to 35%
                </span>
              </div>

              {/* Ambient Pressure (mmHg) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-400 uppercase text-[11px]">Ambient Pressure</span>
                  <span className="text-white font-bold">{inputs.ambientPressureMmHg} mmHg</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1000"
                  step="10"
                  value={inputs.ambientPressureMmHg}
                  onChange={(e) =>
                    setInputs({ ...inputs, ambientPressureMmHg: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-ignis-orange bg-slate-800"
                />
                <span className="text-[10px] text-gray-500 block mt-1 font-sans">
                  Standard sea-level: 760 mmHg (~101.3 kPa)
                </span>
              </div>

              {/* Droplet Initial Diameter (mm) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-400 uppercase text-[11px]">Initial Droplet Diameter</span>
                  <span className="text-white font-bold">
                    {inputs.initialDropletDiameterMm.toFixed(2)} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.5"
                  step="0.05"
                  value={inputs.initialDropletDiameterMm}
                  onChange={(e) =>
                    setInputs({ ...inputs, initialDropletDiameterMm: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-400 bg-slate-800"
                />
                <span className="text-[10px] text-gray-500 block mt-1 font-sans">
                  FLEX droplet fiber supports: 1.50 mm – 3.00 mm
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full mt-6 btn-primary text-xs py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Sparkles size={15} />
            <span>{loading ? 'Querying Empirical Benchmarks...' : 'Explore Similar Tests →'}</span>
          </button>
        </div>

        {/* Center Column: 3D Interactive Combustion Chamber */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 flex flex-col justify-between min-h-[460px]">
          <div className="h-full relative rounded-xl overflow-hidden bg-[#070D1A] border border-[#213047]">
            <ConceptFlameLab3D
              oxygenLevel={inputs.oxygenPercentage}
              dropletDiameter={inputs.initialDropletDiameterMm}
              interactive
            />
          </div>
        </div>

        {/* Right Column: Prediction Result / Empirical Similarity Panel */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#213047]">
              <div className="flex items-center gap-2">
                <FlaskConical size={17} className="text-ignis-cyan" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Prediction Result
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                Gated
              </span>
            </div>

            {/* Model Validation Gate Notice */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 flex gap-2.5 mb-4">
              <AlertTriangle size={17} className="shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">
                  Validated Prediction Unavailable
                </span>
                <p className="text-gray-300 font-sans text-[11px] leading-relaxed">
                  Automated numerical ML predictions are disabled until an evaluated checkpoint and verified confidence intervals are authorized via <code>POST /api/predict</code>. Showing empirical nearest neighbors below.
                </p>
              </div>
            </div>

            {/* Empirical Nearest Tests */}
            {result && result.nearestExperiments.length > 0 ? (
              <div className="space-y-3 font-mono">
                <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold block">
                  Nearest Documented NASA Tests
                </span>
                {result.nearestExperiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl bg-[#091322] border border-[#213047] hover:border-cyan-500/40 transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-white">Test {exp.testIdentifier}</strong>
                      <span className="text-[10px] text-ignis-orange">{exp.fuel}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 grid grid-cols-2 gap-1 mt-1">
                      <span>O₂: {formatOxygen(exp.oxygenMoleFraction, false)}</span>
                      <span>P: {formatPressure(exp.ambientPressureMmHg)}</span>
                      <span>Ø: {formatDiameter(exp.initialDropletDiameterMm)}</span>
                      <span>Burn: {formatBurnTime(exp.burnTimeSeconds)}</span>
                    </div>
                    <div className="mt-2 pt-1 border-t border-[#1C2C44] flex justify-between items-center text-[10px]">
                      <span className="text-emerald-400">Outcome: {exp.testEnd || '—'}</span>
                      <a
                        href={exp.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>PSI Source</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 text-xs font-mono">
                Adjust simulation parameters on the left and click "Explore Similar Tests" to match documented NASA combustion trials.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#213047] text-[10px] font-mono text-gray-500">
            Scientific Truth Rule: Empirical nearest-neighbor retrieval without synthetic interpolation.
          </div>
        </div>
      </div>
    </div>
  );
};
