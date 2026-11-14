import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Info,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MetricValue } from '../components/ui/MetricValue';
import { dataSource } from '../services/dataSource';
import { Experiment, ComparisonViewModel, isFlexExperiment, isBassExperiment } from '../types/experiment';
import { formatOxygen, formatPressure, formatDiameter, formatBurnTime } from '../lib/formatters';

export const Comparison: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedIdA, setSelectedIdA] = useState<string>('');
  const [selectedIdB, setSelectedIdB] = useState<string>('');
  const [comparison, setComparison] = useState<ComparisonViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dataSource.listExperiments({ pageSize: 100 }).then((res) => {
      const list = res.experiments;
      setExperiments(list);

      const paramA = searchParams.get('idA');
      const paramB = searchParams.get('idB');

      const idA = paramA && list.some((e) => e.id === paramA) ? paramA : list[0]?.id || 'FLEX-1';
      const idB = paramB && list.some((e) => e.id === paramB) ? paramB : list[1]?.id || list[0]?.id || 'FLEX-70';

      setSelectedIdA(idA);
      setSelectedIdB(idB);

      if (idA && idB) {
        runComparison(idA, idB);
      }
    });
  }, []);

  const runComparison = async (idA: string, idB: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataSource.compareExperiments([idA, idB]);
      setComparison(res);
      setSearchParams({ idA, idB });
    } catch (err: any) {
      setError(err?.message || `Failed to compare ${idA} and ${idB}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareClick = () => {
    if (selectedIdA && selectedIdB) {
      runComparison(selectedIdA, selectedIdB);
    }
  };

  const expA = comparison?.experimentA;
  const expB = comparison?.experimentB;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DIFF MATRIX / 04"
        title="Compare Experiments"
        subtitle="Compare verified parameters and observed endpoints across authentic NASA microgravity combustion trials with automated scientific compatibility evaluation."
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => runComparison(selectedIdA, selectedIdB)}
            className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Select Experiments Bar */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase text-gray-400 block mb-1.5">
                Experiment A (Reference Record)
              </label>
              <select
                value={selectedIdA}
                onChange={(e) => setSelectedIdA(e.target.value)}
                className="w-full bg-[#0E1929] border border-[#213047] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-ignis-orange"
              >
                {experiments.map((e) => (
                  <option key={e.id} value={e.id}>
                    [{e.investigation}] Test {e.testIdentifier} —{' '}
                    {isFlexExperiment(e) ? e.fuel : e.material.slice(0, 20)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-gray-400 block mb-1.5">
                Experiment B (Comparison Subject)
              </label>
              <select
                value={selectedIdB}
                onChange={(e) => setSelectedIdB(e.target.value)}
                className="w-full bg-[#0E1929] border border-[#213047] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-ignis-orange"
              >
                {experiments.map((e) => (
                  <option key={e.id} value={e.id}>
                    [{e.investigation}] Test {e.testIdentifier} —{' '}
                    {isFlexExperiment(e) ? e.fuel : e.material.slice(0, 20)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCompareClick}
            disabled={loading}
            className="btn-primary text-xs px-6 py-3 rounded-xl lg:self-end flex items-center justify-center gap-2 font-mono"
          >
            <GitCompare size={15} />
            <span>{loading ? 'Evaluating Alignment...' : 'Compare Tests'}</span>
          </button>
        </div>
      </div>

      {/* Compatibility Banner */}
      {comparison && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            comparison.isCompatible
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          }`}
        >
          {comparison.isCompatible ? (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs font-mono">
            <span className="font-bold block mb-0.5">
              {comparison.isCompatible ? 'Tests are Scientifically Comparable' : 'Incompatible Scientific Domains'}
            </span>
            <p className="text-gray-300 font-sans">{comparison.compatibilityReason}</p>
          </div>
        </div>
      )}

      {/* Side-by-side Experiment Cards */}
      {expA && expB && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A */}
          <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#213047]">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Reference Record (A)
                </span>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5">
                  Test {expA.testIdentifier}
                </h3>
              </div>
              <StatusBadge tone={isFlexExperiment(expA) ? 'orange' : 'cyan'}>
                {expA.investigation} ({expA.investigationId})
              </StatusBadge>
            </div>

            <div className="space-y-4">
              {isFlexExperiment(expA) ? (
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <MetricValue label="Fuel Compound" value={expA.fuel} highlight />
                  <MetricValue
                    label="Initial Oxygen"
                    value={formatOxygen(expA.oxygenMoleFraction, false)}
                  />
                  <MetricValue
                    label="Chamber Pressure"
                    value={formatPressure(expA.ambientPressureMmHg)}
                  />
                  <MetricValue
                    label="Droplet Diameter"
                    value={formatDiameter(expA.initialDropletDiameterMm)}
                  />
                  <MetricValue
                    label="Total Burn Duration"
                    value={formatBurnTime(expA.burnTimeSeconds)}
                  />
                  <MetricValue
                    label="Test Outcome"
                    value={expA.testEnd || '—'}
                  />
                </div>
              ) : isBassExperiment(expA) ? (
                <div className="space-y-3 text-xs font-mono">
                  <MetricValue label="Specimen Material" value={expA.material} highlight />
                  <MetricValue
                    label="Chamber Oxygen"
                    value={formatOxygen(expA.initialOxygenPercent, true)}
                  />
                  <MetricValue label="Air Flow Readout" value={expA.airDisplayRaw || '—'} />
                  <MetricValue label="Fan Display" value={expA.fanDisplayRaw || '—'} />
                </div>
              ) : null}

              <div className="pt-3 border-t border-[#213047] flex justify-end">
                <a
                  href={expA.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Open PSI Archive</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Card B */}
          <div className="glass-panel rounded-2xl p-6 border-orange-500/30 relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#213047]">
              <div>
                <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider block">
                  Comparison Subject (B)
                </span>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5">
                  Test {expB.testIdentifier}
                </h3>
              </div>
              <StatusBadge tone={isFlexExperiment(expB) ? 'orange' : 'cyan'}>
                {expB.investigation} ({expB.investigationId})
              </StatusBadge>
            </div>

            <div className="space-y-4">
              {isFlexExperiment(expB) ? (
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <MetricValue label="Fuel Compound" value={expB.fuel} highlight />
                  <MetricValue
                    label="Initial Oxygen"
                    value={formatOxygen(expB.oxygenMoleFraction, false)}
                  />
                  <MetricValue
                    label="Chamber Pressure"
                    value={formatPressure(expB.ambientPressureMmHg)}
                  />
                  <MetricValue
                    label="Droplet Diameter"
                    value={formatDiameter(expB.initialDropletDiameterMm)}
                  />
                  <MetricValue
                    label="Total Burn Duration"
                    value={formatBurnTime(expB.burnTimeSeconds)}
                  />
                  <MetricValue
                    label="Test Outcome"
                    value={expB.testEnd || '—'}
                  />
                </div>
              ) : isBassExperiment(expB) ? (
                <div className="space-y-3 text-xs font-mono">
                  <MetricValue label="Specimen Material" value={expB.material} highlight />
                  <MetricValue
                    label="Chamber Oxygen"
                    value={formatOxygen(expB.initialOxygenPercent, true)}
                  />
                  <MetricValue label="Air Flow Readout" value={expB.airDisplayRaw || '—'} />
                  <MetricValue label="Fan Display" value={expB.fanDisplayRaw || '—'} />
                </div>
              ) : null}

              <div className="pt-3 border-t border-[#213047] flex justify-end">
                <a
                  href={expB.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Open PSI Archive</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Computed Key Differences Matrix */}
      {comparison && comparison.isCompatible && comparison.numericDeltas.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-base font-bold text-white font-mono mb-4 flex items-center gap-2">
            <Info size={17} className="text-ignis-cyan" />
            <span>Key Quantitative Deltas (Test B − Test A)</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-[#213047] bg-[#0A1220]">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#213047] bg-[#0E1A2C] text-gray-400 uppercase text-[11px]">
                  <th className="p-3.5">Environmental Parameter</th>
                  <th className="p-3.5">Test A Value</th>
                  <th className="p-3.5">Test B Value</th>
                  <th className="p-3.5">Computed Delta (B − A)</th>
                  <th className="p-3.5">Percentage Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18263A] text-gray-300">
                {comparison.numericDeltas.map((row, i) => (
                  <tr key={i} className="hover:bg-[#122035] transition-colors">
                    <td className="p-3.5 font-semibold text-white">{row.label}</td>
                    <td className="p-3.5">
                      {row.valA !== null ? `${row.valA.toFixed(2)} ${row.unit}` : '—'}
                    </td>
                    <td className="p-3.5">
                      {row.valB !== null ? `${row.valB.toFixed(2)} ${row.unit}` : '—'}
                    </td>
                    <td className="p-3.5">
                      {row.delta !== null ? (
                        <span
                          className={`font-bold ${
                            row.delta > 0
                              ? 'text-emerald-400'
                              : row.delta < 0
                              ? 'text-rose-400'
                              : 'text-gray-300'
                          }`}
                        >
                          {row.delta > 0 ? `+${row.delta.toFixed(2)}` : row.delta.toFixed(2)}{' '}
                          {row.unit}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3.5 text-gray-400">
                      {row.deltaPercent !== null ? (
                        <span>
                          {row.deltaPercent > 0
                            ? `+${row.deltaPercent.toFixed(1)}%`
                            : `${row.deltaPercent.toFixed(1)}%`}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
