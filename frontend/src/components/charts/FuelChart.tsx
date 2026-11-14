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

interface FuelChartProps {
  height?: number;
  fuels?: {
    methanol: number;
    heptane: number;
  };
  total?: number;
}

export const FuelChart: React.FC<FuelChartProps> = ({
  height = 240,
  fuels = VERIFIED_AGGREGATES.flex.fuels,
  total = VERIFIED_AGGREGATES.flex.totalSourceRows,
}) => {
  const methanolCount = fuels.methanol;
  const heptaneCount = fuels.heptane;
  const totalCount = methanolCount + heptaneCount || total || 274;

  const data = [
    {
      name: 'Methanol',
      count: methanolCount,
      percentage: ((methanolCount / totalCount) * 100).toFixed(1),
      color: '#36B8FF',
      notes: 'Alcohol fuel; low-soot blue spherical flame envelope',
    },
    {
      name: 'Heptane',
      count: heptaneCount,
      percentage: ((heptaneCount / totalCount) * 100).toFixed(1),
      color: '#FF8D36',
      notes: 'Alkane fuel; pronounced soot shell and radiative loss',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <span className="text-gray-400">Tested Fuel Distribution</span>
        <span className="text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          PSI-69 · n = {totalCount}
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162338" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#64748b"
              fontSize={12}
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
                      <div className="text-ignis-cyan font-bold text-sm">
                        {d.count} tests ({d.percentage}%)
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1 max-w-xs font-sans">
                        {d.notes}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2 border-t border-[#162338] flex items-center justify-between text-[11px] font-mono text-gray-400">
        <span>FLEX PSI-69 verified source aggregate</span>
        <span>Methanol {methanolCount} · Heptane {heptaneCount}</span>
      </div>
    </div>
  );
};
