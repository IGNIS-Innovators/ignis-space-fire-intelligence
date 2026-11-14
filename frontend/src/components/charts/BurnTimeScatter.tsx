import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Experiment, isFlexExperiment } from '../../types/experiment';

interface BurnTimeScatterProps {
  experiments: Experiment[];
  height?: number;
}

export const BurnTimeScatter: React.FC<BurnTimeScatterProps> = ({
  experiments,
  height = 280,
}) => {
  // Filter for FLEX experiments with valid burnTimeSeconds and initialDropletDiameterMm
  const flexData = experiments
    .filter(isFlexExperiment)
    .filter((e) => e.burnTimeSeconds !== null && e.burnTimeSeconds > 0)
    .map((e, index) => ({
      index: index + 1,
      testId: e.testIdentifier,
      fuel: e.fuel,
      burnTime: e.burnTimeSeconds,
      diameter: e.initialDropletDiameterMm || 2.0,
      pressure: e.ambientPressureMmHg,
      testEnd: e.testEnd,
    }));

  const methanolPoints = flexData.filter((d) => d.fuel.toLowerCase() === 'methanol');
  const heptanePoints = flexData.filter((d) => d.fuel.toLowerCase() === 'heptane');

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <span className="text-gray-400">Burn Time Duration (s) vs Test Index</span>
        <span className="text-amber-400/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
          Sample records only · n = {flexData.length}
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162338" />
            <XAxis
              type="number"
              dataKey="index"
              name="Sample Test #"
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
            />
            <YAxis
              type="number"
              dataKey="burnTime"
              name="Burn Time"
              unit="s"
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
            />
            <ZAxis type="number" dataKey="diameter" range={[40, 160]} name="Droplet Diameter" unit="mm" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0B1526] border border-[#213047] p-3 rounded-lg shadow-xl font-mono text-xs">
                      <div className="font-bold text-white mb-1">
                        Test {d.testId} ({d.fuel})
                      </div>
                      <div className="text-ignis-orange font-semibold">
                        Burn Time: {d.burnTime} seconds
                      </div>
                      <div className="text-gray-300 mt-1">
                        Droplet Ø: {d.diameter} mm · Termination: {d.testEnd || '—'}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Methanol" data={methanolPoints} fill="#36B8FF" shape="circle" />
            <Scatter name="Heptane" data={heptanePoints} fill="#FF8D36" shape="triangle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2 border-t border-[#162338] flex items-center justify-between text-[11px] font-mono text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#36B8FF]" /> Methanol
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8D36]" /> Heptane
          </span>
        </div>
        <span>Point size indicates initial droplet diameter (mm)</span>
      </div>
    </div>
  );
};
