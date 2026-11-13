import React from 'react';

export type BadgeTone = 'orange' | 'cyan' | 'green' | 'red' | 'purple' | 'gray';

interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  tone = 'orange',
  size = 'sm',
  className = '',
}) => {
  const toneStyles: Record<BadgeTone, string> = {
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    red: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    gray: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${toneStyles[tone]} ${sizeStyles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {children}
    </span>
  );
};
