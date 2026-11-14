import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
  hasGlow: boolean;
  glowColor: string;
}

// Deterministic seeded PRNG — stable positions on every render
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const GalaxyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rng = createSeededRandom(99731);

    // ── Extended color palette matching the reference astrophotography image ──
    // Dominant: white, blue-white, pale blue
    // Notable:  pink-red, warm yellow, golden amber, vivid violet/purple, cyan
    const starColors: Array<{ color: string; glow: string; weight: number }> = [
      { color: '#FFFFFF',  glow: '#FFFFFF',  weight: 28 }, // pure white — most common
      { color: '#EAF2FF',  glow: '#C8E6FF',  weight: 20 }, // pale blue-white
      { color: '#B8D5FF',  glow: '#90BFFF',  weight: 12 }, // soft ice blue
      { color: '#40C9FF',  glow: '#00AAFF',  weight:  8 }, // electric cyan
      { color: '#A8E6FF',  glow: '#40C9FF',  weight:  6 }, // sky blue
      { color: '#FFD0DC',  glow: '#FF6BA0',  weight:  7 }, // rosy pink (like ref image pink dots)
      { color: '#FF8FAB',  glow: '#FF3366',  weight:  5 }, // vibrant coral-red
      { color: '#FF4D6A',  glow: '#CC0033',  weight:  3 }, // deep red star
      { color: '#FFE57A',  glow: '#FFD000',  weight:  4 }, // bright yellow
      { color: '#FFC947',  glow: '#FF9900',  weight:  3 }, // golden amber
      { color: '#E0C0FF',  glow: '#9B59FF',  weight:  5 }, // soft violet
      { color: '#C084FC',  glow: '#7C3AED',  weight:  4 }, // vivid purple
      { color: '#A855F7',  glow: '#6D28D9',  weight:  3 }, // deep purple
      { color: '#67E8F9',  glow: '#06B6D4',  weight:  2 }, // teal-cyan
    ];

    // Build weighted lookup table
    const totalWeight = starColors.reduce((s, c) => s + c.weight, 0);
    const colorTable: Array<{ color: string; glow: string }> = [];
    for (const entry of starColors) {
      const count = Math.round((entry.weight / totalWeight) * 1000);
      for (let k = 0; k < count; k++) colorTable.push({ color: entry.color, glow: entry.glow });
    }

    const stars: Star[] = [];
    const STAR_COUNT = 700; // Dense, rich starfield

    for (let i = 0; i < STAR_COUNT; i++) {
      const x = rng();
      const y = rng();

      // Size distribution:
      // ~70% = tiny micro-stars  0.4 – 1.0px
      // ~22% = medium stars      1.0 – 1.8px
      //  ~6% = bright stars      1.8 – 2.8px  (get a glow)
      //  ~2% = superstars        2.8 – 3.8px  (prominent glow)
      const sizeRoll = rng();
      let size: number;
      let hasGlow = false;

      if (sizeRoll < 0.70) {
        size = 0.4 + rng() * 0.6;
      } else if (sizeRoll < 0.92) {
        size = 1.0 + rng() * 0.8;
      } else if (sizeRoll < 0.98) {
        size = 1.8 + rng() * 1.0;
        hasGlow = true;
      } else {
        size = 2.8 + rng() * 1.0;
        hasGlow = true;
      }

      // Pick color from weighted table
      const ci = Math.floor(rng() * colorTable.length);
      const { color, glow } = colorTable[Math.min(ci, colorTable.length - 1)];

      stars.push({
        x,
        y,
        size,
        baseAlpha: 0.3 + rng() * 0.65,
        color,
        twinkleSpeed: 0.3 + rng() * 1.8,
        twinklePhase: rng() * Math.PI * 2,
        hasGlow,
        glowColor: glow,
      });
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const sx = star.x * width;
        const sy = star.y * height;

        let alpha = star.baseAlpha;
        if (!prefersReducedMotion) {
          const twinkle = Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase);
          alpha = Math.max(0.1, Math.min(1, star.baseAlpha + twinkle * 0.28));
        }

        // Outer diffuse glow (only bright stars)
        if (star.hasGlow) {
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 5);
          grad.addColorStop(0, star.glowColor);
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.globalAlpha = alpha * 0.22;
          ctx.fill();
        }

        // Inner soft bloom (medium+ stars)
        if (star.size > 1.0) {
          const bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 2.2);
          bloom.addColorStop(0, star.color);
          bloom.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = bloom;
          ctx.globalAlpha = alpha * 0.35;
          ctx.fill();
        }

        // Star core (sharp bright dot)
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render(performance.now());
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ background: '#020710' }}
    >
      {/* ── Layer 1: Deep space astrophotography base (blue-violet nebula photo) ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url('/assets/cinematic-deep-space-nebula.jpg')`,
          opacity: 0.55,
          mixBlendMode: 'screen',
        }}
      />

      {/* ── Layer 2: Violet / indigo nebula cloud — upper left cluster (matches ref) ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-5%', left: '-8%',
          width: '60vw', height: '60vw',
          borderRadius: '50%',
          filter: 'blur(130px)',
          opacity: 0.38,
          mixBlendMode: 'screen',
          background: 'radial-gradient(circle, rgba(110, 40, 200, 0.75) 0%, rgba(60, 20, 160, 0.4) 40%, transparent 70%)',
        }}
      />

      {/* ── Layer 3: Bright cyan nebula — upper center (blue cloud from reference) ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%', left: '20%',
          width: '50vw', height: '45vw',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.32,
          mixBlendMode: 'screen',
          background: 'radial-gradient(circle, rgba(0, 180, 255, 0.65) 0%, rgba(0, 100, 220, 0.3) 45%, transparent 70%)',
        }}
      />

      {/* ── Layer 4: Softer violet cloud — right side center ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%', right: '-10%',
          width: '55vw', height: '55vw',
          borderRadius: '50%',
          filter: 'blur(120px)',
          opacity: 0.28,
          mixBlendMode: 'screen',
          background: 'radial-gradient(circle, rgba(80, 30, 180, 0.6) 0%, rgba(40, 80, 200, 0.3) 50%, transparent 72%)',
        }}
      />

      {/* ── Layer 5: Warm red-orange nebula filament — mid-left (fire accretion accent) ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%', left: '5%',
          width: '40vw', height: '30vw',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.22,
          mixBlendMode: 'screen',
          background: 'radial-gradient(ellipse, rgba(220, 50, 20, 0.55) 0%, rgba(255, 100, 30, 0.25) 45%, transparent 70%)',
        }}
      />

      {/* ── Layer 6: Purple-pink cloud — lower center ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-5%', left: '30%',
          width: '50vw', height: '40vw',
          borderRadius: '50%',
          filter: 'blur(115px)',
          opacity: 0.20,
          mixBlendMode: 'screen',
          background: 'radial-gradient(ellipse, rgba(150, 50, 200, 0.5) 0%, rgba(80, 20, 150, 0.25) 50%, transparent 72%)',
        }}
      />

      {/* ── Layer 7: Teal-cyan subtle accent — bottom right ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '0%', right: '5%',
          width: '35vw', height: '30vw',
          borderRadius: '50%',
          filter: 'blur(90px)',
          opacity: 0.18,
          mixBlendMode: 'screen',
          background: 'radial-gradient(circle, rgba(0, 220, 200, 0.45) 0%, rgba(0, 150, 180, 0.2) 50%, transparent 72%)',
        }}
      />

      {/* ── Layer 8: Canvas starfield — 700 stars, full color palette ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* ── Layer 9: Readability veil — softens the glow without killing contrast ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(2, 7, 16, 0.42)',
          backdropFilter: 'brightness(0.90)',
        }}
      />
    </div>
  );
};
