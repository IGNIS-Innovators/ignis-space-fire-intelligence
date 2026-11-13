import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <span className="text-[11px] font-mono uppercase tracking-widest text-ignis-orange font-semibold block mb-1">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-sans">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-ignis-muted mt-1 max-w-2xl font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
