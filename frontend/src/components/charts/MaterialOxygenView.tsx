import React from 'react';
import { Experiment, isBassExperiment } from '../../types/experiment';

export const MaterialOxygenView: React.FC<{ experiments: Experiment[] }> = ({
  experiments,
}) => {
  const bassTests = experiments.filter(isBassExperiment);

  return (
    <div className="w-full font-mono text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400">BASS-II Sample Specimens & Oxygen Environment</span>
        <span className="text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          PSI-25 Sample · n = {bassTests.length} of 129
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#213047] bg-[#0A1322]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#213047] bg-[#0E1A2C] text-gray-400 text-[11px] uppercase tracking-wider">
              <th className="p-3">Test ID</th>
              <th className="p-3">Material Description</th>
              <th className="p-3">Initial O₂ (%)</th>
              <th className="p-3">Air Display (Raw)</th>
              <th className="p-3">Fan Display</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#18263A] text-gray-300">
            {bassTests.map((t) => (
              <tr key={t.id} className="hover:bg-[#122035] transition-colors">
                <td className="p-3 font-semibold text-ignis-cyan">{t.testIdentifier}</td>
                <td className="p-3 max-w-xs truncate text-white">{t.material}</td>
                <td className="p-3 text-ignis-orange font-semibold">
                  {t.initialOxygenPercent !== null ? `${t.initialOxygenPercent}%` : '—'}
                </td>
                <td className="p-3 text-gray-400">{t.airDisplayRaw || '—'}</td>
                <td className="p-3 text-gray-400">{t.fanDisplayRaw || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] text-gray-500">
        Note: BASS-II initialOxygenPercent is already a percentage in the NASA table. Air and fan readouts are raw uncalibrated chamber displays.
      </p>
    </div>
  );
};
