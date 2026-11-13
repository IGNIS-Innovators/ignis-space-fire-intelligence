import React from 'react';

interface ScientificCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverGlow?: 'orange' | 'cyan' | 'none';
}

export const ScientificCard: React.FC<ScientificCardProps> = ({
  children,
  className = '',
  onClick,
  hoverGlow = 'orange',
}) => {
  const glowClass = {
    orange: 'hover:border-ignis-orange/50 hover:shadow-[0_4px_25px_rgba(255,100,28,0.15)]',
    cyan: 'hover:border-ignis-cyan/50 hover:shadow-[0_4px_25px_rgba(54,184,255,0.15)]',
    none: '',
  }[hoverGlow];

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-xl p-5 transition-all duration-200 ${glowClass} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
