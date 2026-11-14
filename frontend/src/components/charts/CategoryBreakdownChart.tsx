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
import { CategoryChartData } from '../../types/analytics';

interface CategoryBreakdownChartProps {
  data: CategoryChartData;
  height?: number;
  layout?: 'horizontal' | 'vertical';
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  data,
  height = 340,
  layout = 'vertical',
}) => {
  return (
    <div className="w-full space-y-3 font-mono">
      {/* Header bar with metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E3252]/60 text-xs">
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">{data.title}</h4>
          <span className="text-[11px] text-[#9FB0C8]">
            Source: NASA {data.investigation} · n = {data.sample_count} documented trials
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[11px] bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
            {data.items.length} Distinct Categories
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {layout === 'vertical' ? (
            <BarChart
              data={data.items}
              layout="vertical"
              margin={{ top: 15, right: 30, left: 35, bottom: 10 }}
            >
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
                      <div className="bg-[#0B1528]/95 border border-[#1E3252] p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono max-w-xs">
                        <div className="font-bold text-white mb-1 border-b border-[#1E3252] pb-1">
                          {d.name}
                        </div>
                        <div className="text-ignis-cyan font-bold text-sm">
                          {d.count} trials ({d.percentage}%)
                        </div>
                        {d.description && (
                          <div className="text-[11px] text-gray-300 mt-1.5 font-sans leading-tight">
                            {d.description}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.items.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || (index % 2 === 0 ? '#40C9FF' : '#FF6B35')}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={data.items}
              margin={{ top: 15, right: 20, left: -10, bottom: 20 }}
            >
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
                      <div className="bg-[#0B1528]/95 border border-[#1E3252] p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono max-w-xs">
                        <div className="font-bold text-white mb-1">{d.name}</div>
                        <div className="text-ignis-orange font-bold text-sm">
                          {d.count} trials ({d.percentage}%)
                        </div>
                        {d.description && (
                          <div className="text-[11px] text-gray-300 mt-1">
                            {d.description}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.items.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || (index % 2 === 0 ? '#40C9FF' : '#FF6B35')}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {data.notes && (
        <div className="p-2.5 rounded-lg bg-[#070D1B]/80 border border-[#1E3252]/50 text-[11px] text-[#9FB0C8] leading-relaxed">
          <strong className="text-white">Research Significance:</strong> {data.notes}
        </div>
      )}
    </div>
  );
};
