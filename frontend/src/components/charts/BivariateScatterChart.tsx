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
  Legend,
} from 'recharts';
import { ScatterChartData } from '../../types/analytics';

interface BivariateScatterChartProps {
  data: ScatterChartData;
  height?: number;
}

const FUEL_COLORS: Record<string, string> = {
  Methanol: '#40C9FF',
  Heptane: '#FF6B35',
  PMMA: '#FF8A50',
  SIBAL: '#38BDF8',
  Nomex: '#C084FC',
  Wax: '#FFE57A',
};

export const BivariateScatterChart: React.FC<BivariateScatterChartProps> = ({
  data,
  height = 360,
}) => {
  // Group points by fuel/material
  const groups: Record<string, typeof data.points> = {};
  data.points.forEach((pt) => {
    const f = pt.fuel || 'Unknown';
    if (!groups[f]) groups[f] = [];
    groups[f].push(pt);
  });

  const fuelNames = Object.keys(groups);

  return (
    <div className="w-full space-y-3 font-mono">
      {/* Header bar with metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E3252]/60 text-xs">
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">{data.title}</h4>
          <span className="text-[11px] text-[#9FB0C8]">
            Source: NASA {data.investigation} ({data.points.length > 0 ? data.points[0].test_id.split('-')[0] : ''}) · Real flight measurements
          </span>
        </div>
        <div className="flex items-center gap-2">
          {data.correlations && Object.entries(data.correlations).map(([fuel, r]) => (
            <span
              key={fuel}
              className="px-2 py-0.5 rounded text-[10px] bg-[#0B1528] border border-[#1E3252] text-[#40C9FF]"
            >
              {fuel} Pearson r: <strong className="text-white">{r > 0 ? `+${r}` : r}</strong>
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-md text-[11px] bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
            n = {data.sample_count} valid
          </span>
          {data.missing_count > 0 && (
            <span className="px-2.5 py-1 rounded-md text-[11px] bg-amber-950/40 border border-amber-800/40 text-amber-300">
              {data.missing_count} unmeasured / N/A
            </span>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 25, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162338" />
            <XAxis
              type="number"
              dataKey="x"
              name={data.x_label}
              unit={` ${data.x_unit}`}
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              label={{
                value: `${data.x_label} (${data.x_unit})`,
                position: 'insideBottom',
                offset: -12,
                fill: '#9FB0C8',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={data.y_label}
              unit={` ${data.y_unit}`}
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              label={{
                value: `${data.y_label} (${data.y_unit})`,
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#9FB0C8',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
            <ZAxis type="number" dataKey="secondary_val" range={[35, 120]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#40C9FF', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload;
                  return (
                    <div className="bg-[#0B1528]/95 border border-[#1E3252] p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono max-w-xs">
                      <div className="flex items-center justify-between border-b border-[#1E3252] pb-1.5 mb-2">
                        <span className="font-bold text-white text-sm text-[#40C9FF]">{pt.test_id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-gray-300 border border-slate-700">
                          {pt.fuel}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">{data.x_label}:</span>
                          <span className="text-white font-semibold">{pt.x} {data.x_unit}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">{data.y_label}:</span>
                          <span className="text-ignis-orange font-bold">{pt.y} {data.y_unit}</span>
                        </div>
                        {pt.secondary_val !== undefined && pt.secondary_val !== null && (
                          <div className="flex justify-between gap-4 text-[11px] text-gray-300 pt-1 border-t border-[#1E3252]/60">
                            <span>Secondary param:</span>
                            <span className="text-cyan-300">{pt.secondary_val}</span>
                          </div>
                        )}
                        {pt.extra && Object.entries(pt.extra).map(([k, v]) => (
                          v !== null && (
                            <div key={k} className="flex justify-between gap-4 text-[10px] text-gray-400">
                              <span className="capitalize">{k.replace(/_/g, ' ')}:</span>
                              <span className="text-gray-200">{String(v)}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            />
            {fuelNames.map((fuel) => (
              <Scatter
                key={fuel}
                name={fuel}
                data={groups[fuel]}
                fill={FUEL_COLORS[fuel] || '#38BDF8'}
                stroke="#030712"
                strokeWidth={1}
                shape="circle"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Physics note */}
      {data.notes && (
        <div className="p-2.5 rounded-lg bg-[#070D1B]/80 border border-[#1E3252]/50 text-[11px] text-[#9FB0C8] leading-relaxed">
          <strong className="text-white">Physical Mechanism:</strong> {data.notes}
        </div>
      )}
    </div>
  );
};
