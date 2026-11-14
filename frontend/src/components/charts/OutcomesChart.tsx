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
import { VERIFIED_AGGREGATES } from '../../data/verifiedAggregates';

interface OutcomesChartProps {
  height?: number;
  outcomes?: {
    extinction: number;
    disruption: number;
    completion: number;
  };
  total?: number;
}

export const OutcomesChart: React.FC<OutcomesChartProps> = ({
  height = 240,
  outcomes = VERIFIED_AGGREGATES.flex.outcomes,
  total = VERIFIED_AGGREGATES.flex.totalSourceRows,
}) => {
  const extinctionCount = outcomes.extinction;
  const disruptionCount = outcomes.disruption;
  const completionCount = outcomes.completion;
  const flexTotal = extinctionCount + disruptionCount + completionCount || total || 274;

  const data = [
    {
      name: 'Extinction',
      count: extinctionCount,
      percentage: ((extinctionCount / flexTotal) * 100).toFixed(1),
      color: '#FF641C',
      description: 'Radiative or diffusive flame quenching prior to full burnout',
    },
    {
      name: 'Disruption',
      count: disruptionCount,
      percentage: ((disruptionCount / flexTotal) * 100).toFixed(1),
      color: '#36B8FF',
      description: 'Micro-explosive droplet shattering or tether detachment',
    },
    {
      name: 'Completion',
      count: completionCount,
      percentage: ((completionCount / flexTotal) * 100).toFixed(1),
      color: '#35D2A0',
      description: 'Uninterrupted combustion through complete droplet vaporization',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <span className="text-gray-400">Recorded Test End Modes</span>
        <span className="text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          PSI-69 · n = {flexTotal} documented tests
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162338" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
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
                    <div className="bg-[#0B1526] border border-[#213047] p-3 rounded-lg shadow-xl font-mono text-xs">
                      <div className="font-bold text-white mb-1">{d.name}</div>
                      <div className="text-ignis-orange font-bold text-sm">
                        {d.count} tests ({d.percentage}%)
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1 max-w-xs font-sans">
                        {d.description}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2 border-t border-[#162338] flex items-center justify-between text-[11px] font-mono text-gray-400">
        <span>FLEX termination distributions</span>
        <span>Extinction: {((extinctionCount / flexTotal) * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};
