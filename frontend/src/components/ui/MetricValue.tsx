import React from 'react';

interface MetricValueProps {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  fallback?: string;
  note?: string;
  highlight?: boolean;
}

export const MetricValue: React.FC<MetricValueProps> = ({
  label,
  value,
  unit,
  fallback = '—',
  note,
  highlight = false,
}) => {
  const displayVal = value !== null && value !== undefined && value !== '' ? value : fallback;

  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span
          className={`font-mono text-base font-semibold ${
            highlight ? 'text-ignis-orange' : 'text-ignis-text'
          }`}
        >
          {displayVal}
        </span>
        {unit && displayVal !== fallback && (
          <span className="text-xs text-ignis-muted font-mono">{unit}</span>
        )}
      </div>
      {note && <span className="text-[10px] text-gray-500 mt-0.5">{note}</span>}
    </div>
  );
};
