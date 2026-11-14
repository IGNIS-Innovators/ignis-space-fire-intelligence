import React from 'react';

export interface InteractiveFlameProps {
  /**
   * Visual scaling factor for the flame animation (default 1.0).
   * Mapped smoothly to predicted burning rate constant K.
   */
  scale?: number;
  /**
   * Glow multiplier for ambient and drop shadows (default 1.0).
   */
  glowIntensity?: number;
  /**
   * Optional custom CSS class name.
   */
  className?: string;
  /**
   * Optional inline styles.
   */
  style?: React.CSSProperties;
}

/**
 * InteractiveFlame
 * Renders the authentic animated microgravity flame asset with dynamic scaling
 * and thermal radiance responding smoothly to machine-learning predictions.
 */
export const InteractiveFlame: React.FC<InteractiveFlameProps> = ({
  scale = 1.0,
  glowIntensity = 1.0,
  className = '',
  style = {},
}) => {
  // Clamped bounds for visual integrity
  const safeScale = Math.min(Math.max(scale, 0.65), 1.6);
  const safeGlow = Math.min(Math.max(glowIntensity, 0.7), 1.8);

  return (
    <div
      className={`relative inline-flex items-center justify-center pointer-events-none select-none transition-transform duration-700 ease-out ${className}`}
      style={{
        transform: `scale(${safeScale})`,
        transformOrigin: 'center center',
        ...style,
      }}
      aria-label="Microgravity flame animation"
    >
      {/* Dynamic ambient thermal halo */}
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 ease-out pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255,140,50,${0.35 * safeGlow}) 0%, rgba(255,90,30,${0.15 * safeGlow}) 50%, transparent 75%)`,
          transform: 'scale(1.25)',
        }}
        aria-hidden="true"
      />

      {/* Core animated flame asset with responsive box shadow and drop filter */}
      <img
        src="/images/animated-flame.gif"
        alt="Animated combustion flame"
        className="relative z-10 w-full h-auto object-contain rounded-lg transition-all duration-700 ease-out"
        style={{
          boxShadow: `0 0 ${Math.round(70 * safeGlow)}px rgba(255, 140, 90, ${0.28 * safeGlow})`,
          filter: `drop-shadow(0 0 ${Math.round(24 * safeGlow)}px rgba(255, 105, 45, ${0.45 * safeGlow}))`,
        }}
        draggable={false}
      />
    </div>
  );
};
