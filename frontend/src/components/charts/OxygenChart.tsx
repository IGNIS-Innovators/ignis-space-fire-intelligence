import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Experiment, isFlexExperiment } from '../../types/experiment';

export const OxygenChart: React.FC<{ experiments: Experiment[]; height?: number }> = ({
  experiments,
  height = 260,
}) => {
  // Aggregate initial oxygen ranges across loaded FLEX sample
  const flexTests = experiments.filter(isFlexExperiment);

  const buckets: Record<string, number> = {
    '15% - 20%': 0,
    '21% (Standard Air)': 0,
    '22% - 29%': 0,
    '30% - 39%': 0,
    '40%+': 0,
  };

  flexTests.forEach((e) => {
    if (e.oxygenMoleFraction === null) return;
    const pct = e.oxygenMoleFraction * 100;
    if (pct < 20.5) buckets['15% - 20%']++;
    else if (Math.abs(pct - 21.0) <= 0.5) buckets['21% (Standard Air)']++;
    else if (pct < 30) buckets['22% - 29%']++;
    else if (pct < 40) buckets['30% - 39%']++;
    else buckets['40%+']++;
  });

  const data = Object.entries(buckets).map(([range, count]) => ({
    range,
    count,
  }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <span className="text-gray-400">Sample Initial Oxygen Mole Fraction (%)</span>
        <span className="text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          FLEX Sample · n = {flexTests.length}
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162338" vertical={false} />
            <XAxis
              dataKey="range"
              stroke="#64748b"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0B1526] border border-[#213047] p-2.5 rounded-lg shadow-xl font-mono text-xs">
                      <div className="font-semibold text-white">{d.range}</div>
                      <div className="text-ignis-cyan font-bold">{d.count} sample experiments</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#36B8FF" radius={[5, 5, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === 1 ? '#FF8D36' : '#36B8FF'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2 border-t border-[#162338] text-[11px] font-mono text-gray-400">
        Explicit conversion: oxygenMoleFraction × 100% · Orange indicates sea-level baseline
      </div>
    </div>
  );
};
