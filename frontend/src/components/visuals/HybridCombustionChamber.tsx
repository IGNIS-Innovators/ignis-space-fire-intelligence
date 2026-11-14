import React, { useMemo, useState } from 'react';
import { Eye, Flame, Activity, Zap, ZoomIn, ZoomOut } from 'lucide-react';
import { InteractiveFlame } from './InteractiveFlame';

export interface HybridCombustionChamberProps {
  /**
   * The predicted droplet burning rate constant K from backend ML (mm²/s),
   * or null if no prediction has been executed yet.
   */
  predictedK?: number | null;
  /**
   * Fuel name (e.g. 'Methanol' | 'Heptane') for chamber metadata readout.
   */
  fuel?: string;
  /**
   * Chamber oxygen percentage (vol %).
   */
  oxygenLevel?: number;
  /**
   * Initial droplet diameter in mm.
   */
  dropletDiameter?: number;
  /**
   * Whether an ML inference request is currently executing.
   */
  loading?: boolean;
  /**
   * Optional custom CSS class name.
   */
  className?: string;
  /**
   * Included for compatibility with previous 3D canvas signature.
   */
  interactive?: boolean;
  /**
   * Default zoom mode (true: 1.38x zoomed-in view, false: 1.0x wide view).
   */
  defaultZoomed?: boolean;
}

/**
 * HybridCombustionChamber
 * Integrates a high-resolution, static futuristic microgravity combustion chamber
 * with an interactive animated flame whose scale and thermal radiance smoothly
 * reflect authentic NASA PSI-69 regression predictions.
 *
 * Supports zoomed-in close-up view with seamless extended studio backdrop.
 */
export const HybridCombustionChamber: React.FC<HybridCombustionChamberProps> = ({
  predictedK = null,
  fuel = 'Methanol',
  oxygenLevel = 21,
  dropletDiameter = 2.5,
  loading = false,
  className = '',
  defaultZoomed = true,
}) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(defaultZoomed);

  // Map predicted K (mm²/s) smoothly to visual scale and glow
  // NASA PSI-69 FLEX historical range: ~0.20 mm²/s to ~1.80 mm²/s
  const { flameScale, glowIntensity, scaleLabel } = useMemo(() => {
    if (predictedK === null || predictedK === undefined || Number.isNaN(predictedK)) {
      return {
        flameScale: 1.0,
        glowIntensity: 1.0,
        scaleLabel: '1.00× (Neutral)',
      };
    }

    const minK = 0.2;
    const maxK = 1.8;
    const clampedK = Math.max(minK, Math.min(maxK, predictedK));
    const t = (clampedK - minK) / (maxK - minK); // 0.0 to 1.0

    // Smooth linear mapping from 0.75x to 1.35x
    const scale = 0.75 + t * 0.6;
    const glow = 0.85 + t * 0.45;

    return {
      flameScale: scale,
      glowIntensity: glow,
      scaleLabel: `${scale.toFixed(2)}× (K=${predictedK.toFixed(3)})`,
    };
  }, [predictedK]);

  return (
    <div
      className={`relative w-full h-full min-h-[480px] flex flex-col justify-between rounded-xl overflow-hidden bg-[#070D1A] border border-[#213047] shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* 1. Top HUD Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-[#0B1526]/90 backdrop-blur-md border-b border-[#1C2C44]">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-md bg-[#0F1D33] border border-cyan-500/30 text-cyan-400">
            <Eye size={13} />
            <span
              className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                loading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
          </div>
          <div className="font-mono leading-none">
            <span className="text-[11px] font-bold text-white tracking-wider uppercase block">
              Optical Chamber Bay
            </span>
            <span className="text-[9px] text-gray-400">
              PSI-69 Quiescent Microgravity
            </span>
          </div>
        </div>

        {/* Dynamic controls and status pills */}
        <div className="flex items-center gap-2">
          {/* Zoom Toggle Button */}
          <button
            type="button"
            onClick={() => setIsZoomed((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#0E1A2D] hover:bg-[#162744] text-cyan-300 border border-cyan-500/30 transition-colors shadow-sm"
            title={isZoomed ? 'Switch to Wide Angle View (1.00×)' : 'Zoom in to Combustion Core (1.38×)'}
          >
            {isZoomed ? <ZoomOut size={10} className="text-cyan-400" /> : <ZoomIn size={10} className="text-cyan-400" />}
            <span>{isZoomed ? '1.38× Zoom' : '1.00× Wide'}</span>
          </button>

          {/* ML Status pill */}
          {loading ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <Activity size={10} className="animate-spin" />
              <span>Evaluating ML...</span>
            </span>
          ) : predictedK !== null ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
              <Zap size={10} className="text-cyan-400" />
              <span>{scaleLabel}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 border border-slate-700 text-gray-400">
              <Flame size={10} className="text-gray-400" />
              <span>Standby · 1.00×</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Main Visual Stage: Extended Studio White/Gray Space + Zoomed Chamber & Animated Flame */}
      <div
        className="relative flex-1 flex items-center justify-center select-none overflow-hidden transition-all duration-700"
        style={{
          // Seamless studio backdrop extending the white/light-gray space of the chamber
          background: 'linear-gradient(180deg, #9ba2ae 0%, #87888e 45%, #7a7c82 100%)',
          boxShadow: 'inset 0 16px 28px rgba(3, 7, 18, 0.65), inset 0 -16px 28px rgba(3, 7, 18, 0.65)',
        }}
      >
        {/* Subtle high-tech chamber alignment crosshairs & diagnostic grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.25) 0%, transparent 70%),
                             linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 28px 28px, 28px 28px',
          }}
        />

        {/* Scalable Chamber Container */}
        <div
          className="relative w-full max-w-[440px] aspect-[1024/878] flex items-center justify-center transition-transform duration-700 ease-out will-change-transform"
          style={{
            transform: isZoomed ? 'scale(1.38)' : 'scale(1.0)',
          }}
        >
          {/* Static high-resolution chamber image */}
          <img
            src="/images/combustion-chamber.png"
            alt="Microgravity Combustion Chamber"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0 filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            draggable={false}
          />

          {/* Optical chamber alignment crosshairs (subtle diagnostic marker) */}
          <div
            className="absolute pointer-events-none z-5 opacity-25 border border-dashed border-cyan-400/50 rounded-full"
            style={{
              top: '52%',
              left: '50%',
              width: '42%',
              height: '42%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Centered animated flame positioned precisely in the hollow observation bay */}
          <div
            className="absolute z-10 flex items-center justify-center pointer-events-none"
            style={{
              top: '52%',
              left: '50%',
              width: '38%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <InteractiveFlame
              scale={flameScale}
              glowIntensity={glowIntensity}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Telemetry & Scientific Disclaimer */}
      <div className="relative z-20 px-4 py-2.5 bg-[#08111E]/95 backdrop-blur-md border-t border-[#1C2C44] space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 uppercase">Target:</span>
            <span className="text-white font-semibold">{fuel}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">O₂:</span>
            <span className="text-cyan-400">{oxygenLevel}%</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">d₀:</span>
            <span className="text-emerald-400">{dropletDiameter.toFixed(2)}mm</span>
          </div>

          <div className="text-[9px] text-gray-400">
            {predictedK !== null ? (
              <span className="text-cyan-300 font-semibold">
                K = {predictedK.toFixed(4)} mm²/s
              </span>
            ) : (
              <span className="text-gray-500">Awaiting inference</span>
            )}
          </div>
        </div>

        {/* Required Scientific Disclaimer */}
        <p className="text-[9.5px] font-mono text-gray-400/80 tracking-tight text-center pt-0.5">
          Illustrative flame animation · visual scale mapped to predicted K, not actual flame diameter
        </p>
      </div>
    </div>
  );
};
