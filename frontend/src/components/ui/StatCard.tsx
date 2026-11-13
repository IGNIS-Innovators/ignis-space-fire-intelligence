import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  tone?: 'orange' | 'cyan' | 'green' | 'neutral';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  tone = 'orange',
  onClick,
}) => {
  const toneClasses = {
    orange: 'text-ignis-orange border-ignis-orange/20 bg-ignis-orange/10',
    cyan: 'text-ignis-cyan border-ignis-cyan/20 bg-ignis-cyan/10',
    green: 'text-ignis-green border-ignis-green/20 bg-ignis-green/10',
    neutral: 'text-gray-300 border-gray-700/40 bg-gray-800/20',
  }[tone];

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-xl p-5 flex items-start gap-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-ignis-orange/50 hover:translate-y-[-2px]' : ''
      }`}
    >
      {Icon && (
        <div className={`p-3 rounded-lg border ${toneClasses} shrink-0`}>
          <Icon size={22} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs uppercase font-mono tracking-wider text-ignis-muted block mb-1">
          {label}
        </span>
        <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-ignis-text font-mono">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-gray-400 mt-1 truncate font-sans">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
