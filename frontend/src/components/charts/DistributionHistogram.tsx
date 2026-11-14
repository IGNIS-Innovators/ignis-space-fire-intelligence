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
import { DistributionChartData } from '../../types/analytics';

interface DistributionHistogramProps {
  data: DistributionChartData;
  height?: number;
}

export const DistributionHistogram: React.FC<DistributionHistogramProps> = ({
  data,
  height = 340,
}) => {
  return (
    <div className="w-full space-y-3 font-mono">
      {/* Header bar with metadata & statistical parameters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E3252]/60 text-xs">
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">{data.title}</h4>
          <span className="text-[11px] text-[#9FB0C8]">
            {data.metric_label} ({data.unit}) · n = {data.sample_count} trials analyzed
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#0B1528] border border-[#1E3252] text-gray-300">
            Min: <strong className="text-white">{data.stats.min}</strong>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#0B1528] border border-[#1E3252] text-gray-300">
            Mean: <strong className="text-cyan-300">{data.stats.mean}</strong>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#0B1528] border border-[#1E3252] text-gray-300">
            Median: <strong className="text-white">{data.stats.median}</strong>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#0B1528] border border-[#1E3252] text-gray-300">
            Max: <strong className="text-orange-300">{data.stats.max}</strong>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#0B1528] border border-[#1E3252] text-gray-300">
            σ: <strong className="text-gray-300">{data.stats.std}</strong>
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.bins} margin={{ top: 15, right: 20, bottom: 25, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162338" vertical={false} />
            <XAxis
              dataKey="bin_range"
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              label={{
                value: `Bin Range (${data.unit})`,
                position: 'insideBottom',
                offset: -12,
                fill: '#9FB0C8',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              label={{
                value: 'Number of Experiments',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                fill: '#9FB0C8',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const b = payload[0].payload;
                  return (
                    <div className="bg-[#0B1528]/95 border border-[#1E3252] p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono">
                      <div className="font-bold text-white mb-1 border-b border-[#1E3252] pb-1">
                        Range: {b.bin_range} {data.unit}
                      </div>
                      <div className="text-ignis-orange font-bold text-sm">
                        {b.count} trials ({b.percentage}%)
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        Fraction of active {data.investigation} dataset
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.bins.map((_, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={idx % 2 === 0 ? '#40C9FF' : '#FF6B35'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.notes && (
        <div className="p-2.5 rounded-lg bg-[#070D1B]/80 border border-[#1E3252]/50 text-[11px] text-[#9FB0C8] leading-relaxed">
          <strong className="text-white">Scientific Context:</strong> {data.notes}
        </div>
      )}
    </div>
  );
};
