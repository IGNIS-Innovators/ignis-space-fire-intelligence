import React from 'react';

interface StaticFallbackProps {
  type: 'flame-hero' | 'lab-cube' | 'neural' | 'atmosphere';
  className?: string;
  label?: string;
}

export const StaticSceneFallback: React.FC<StaticFallbackProps> = ({
  type,
  className = '',
  label,
}) => {
  if (type === 'flame-hero') {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#050914] ${className}`}>
        {/* Deep space radial background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-[#070D1C] to-[#050914]" />

        {/* Orbit arc */}
        <svg className="absolute w-[120%] h-[120%] pointer-events-none opacity-40 animate-spin" style={{ animationDuration: '60s' }} viewBox="0 0 400 400">
          <ellipse cx="200" cy="200" rx="180" ry="80" fill="none" stroke="#36B8FF" strokeWidth="1" strokeDasharray="4 8" />
        </svg>

        {/* Conceptual microgravity flame */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Outer blue rim (characteristic of microgravity flames) */}
            <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-cyan-500/30 via-blue-600/20 to-cyan-400/30 blur-xl animate-pulse" />
            <div className="absolute w-28 h-28 rounded-full border border-cyan-400/50 shadow-[0_0_30px_rgba(54,184,255,0.4)]" />
            {/* Orange glowing core */}
            <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 shadow-[0_0_40px_rgba(255,100,28,0.7)] blur-sm" />
            <div className="absolute w-16 h-16 rounded-full bg-gradient-to-t from-white via-amber-200 to-orange-500 shadow-[0_0_20px_#FFFFFF]" />
          </div>
          {label && (
            <span className="mt-3 text-[11px] font-mono text-cyan-400/80 bg-blue-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
              {label}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (type === 'lab-cube') {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-[#08101E] border border-[#213047] ${className}`}>
        <div className="text-center p-6">
          <div className="w-20 h-20 mx-auto mb-3 rounded-xl border border-dashed border-orange-500/50 flex items-center justify-center bg-orange-500/10">
            <div className="w-8 h-8 rounded-full bg-orange-500 shadow-[0_0_20px_#FF641C]" />
          </div>
          <span className="text-xs text-gray-400 font-mono">Microgravity Combustion Chamber View</span>
        </div>
      </div>
    );
  }

  if (type === 'neural') {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-[#070E1A] border border-cyan-900/40 ${className}`}>
        <div className="text-center p-6">
          <div className="w-24 h-24 mx-auto mb-3 rounded-full border border-cyan-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(54,184,255,0.2)]">
            <div className="w-12 h-12 rounded-full border border-cyan-400/60 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <span className="text-xs text-cyan-400 font-mono">Neural Evidence Synthesis Visualization</span>
        </div>
      </div>
    );
  }

  return <div className={`bg-[#050914] ${className}`} />;
};
