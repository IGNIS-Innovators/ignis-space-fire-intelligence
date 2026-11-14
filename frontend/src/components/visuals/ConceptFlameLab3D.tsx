import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeCanvasBoundary } from './ThreeCanvasBoundary';

export interface ConceptFlameLab3DProps {
  className?: string;
  oxygenLevel?: number; // 15 to 40% (visual illustrative accent only)
  dropletDiameter?: number; // 0.5 to 5.0 mm
  interactive?: boolean;
}

// ---------------------------------------------------------------------------
// Scientific Chamber Structural Frame, Reticles, and Optical Base
// ---------------------------------------------------------------------------
function ScientificChamber() {
  const chamberSize = 2.2;
  const half = chamberSize / 2;

  // Luminous cyan edge lines for the observation chamber frame
  const edgeLinePositions = useMemo(() => {
    // 12 edges of the chamber cube
    const pts: THREE.Vector3[] = [];
    const corners = [
      [-half, -half, -half],
      [half, -half, -half],
      [half, -half, half],
      [-half, -half, half],
      [-half, half, -half],
      [half, half, -half],
      [half, half, half],
      [-half, half, half],
    ];

    // Bottom square
    pts.push(new THREE.Vector3(...corners[0]), new THREE.Vector3(...corners[1]));
    pts.push(new THREE.Vector3(...corners[1]), new THREE.Vector3(...corners[2]));
    pts.push(new THREE.Vector3(...corners[2]), new THREE.Vector3(...corners[3]));
    pts.push(new THREE.Vector3(...corners[3]), new THREE.Vector3(...corners[0]));

    // Top square
    pts.push(new THREE.Vector3(...corners[4]), new THREE.Vector3(...corners[5]));
    pts.push(new THREE.Vector3(...corners[5]), new THREE.Vector3(...corners[6]));
    pts.push(new THREE.Vector3(...corners[6]), new THREE.Vector3(...corners[7]));
    pts.push(new THREE.Vector3(...corners[7]), new THREE.Vector3(...corners[4]));

    // Vertical pillars
    pts.push(new THREE.Vector3(...corners[0]), new THREE.Vector3(...corners[4]));
    pts.push(new THREE.Vector3(...corners[1]), new THREE.Vector3(...corners[5]));
    pts.push(new THREE.Vector3(...corners[2]), new THREE.Vector3(...corners[6]));
    pts.push(new THREE.Vector3(...corners[3]), new THREE.Vector3(...corners[7]));

    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    return geometry;
  }, [half]);

  // Calibration tick geometry on the horizontal plane
  const reticleTicksGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const radii = [0.55, 0.9, 1.25];
    const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

    radii.forEach((r) => {
      angles.forEach((deg) => {
        const rad = (deg * Math.PI) / 180;
        const tickLength = deg % 90 === 0 ? 0.05 : 0.025;
        const x1 = Math.cos(rad) * (r - tickLength);
        const z1 = Math.sin(rad) * (r - tickLength);
        const x2 = Math.cos(rad) * (r + tickLength);
        const z2 = Math.sin(rad) * (r + tickLength);
        pts.push(new THREE.Vector3(x1, -0.02, z1));
        pts.push(new THREE.Vector3(x2, -0.02, z2));
      });
    });

    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  // Fiber line holding the droplet in NASA FLEX/BASS fashion
  const fiberLineGeometry = useMemo(() => {
    const pts = [
      new THREE.Vector3(-half, 0, 0),
      new THREE.Vector3(half, 0, 0),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [half]);

  return (
    <group>
      {/* ── 1. Metallic Corner Pillars (Aerospace Grade Anodized Titanium) ── */}
      {[
        [-half, -half],
        [half, -half],
        [half, half],
        [-half, half],
      ].map(([x, z], idx) => (
        <group key={`pillar-${idx}`} position={[x, 0, z]}>
          <mesh>
            <cylinderGeometry args={[0.022, 0.022, chamberSize, 16]} />
            <meshStandardMaterial
              color="#1E2A38"
              roughness={0.25}
              metalness={0.85}
              envMapIntensity={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* ── 2. Subtle Metallic Corner Brackets (8 Vertices) ── */}
      {[
        [-half, -half, -half],
        [half, -half, -half],
        [half, -half, half],
        [-half, -half, half],
        [-half, half, -half],
        [half, half, -half],
        [half, half, half],
        [-half, half, half],
      ].map(([x, y, z], idx) => (
        <mesh key={`bracket-${idx}`} position={[x, y, z]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial
            color="#2B3E55"
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* ── 3. Thin Luminous Cyan Edge Lines (Illuminated Structural Perimeter) ── */}
      <lineSegments geometry={edgeLinePositions}>
        <lineBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.38}
          linewidth={1}
        />
      </lineSegments>

      {/* ── 4. Observation Bay Windows (Dark Tinted Aerospace Borosilicate Glass) ── */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[chamberSize - 0.02, chamberSize - 0.02, chamberSize - 0.02]} />
        <meshPhysicalMaterial
          color="#06121E"
          transparent
          opacity={0.12}
          roughness={0.15}
          metalness={0.1}
          transmission={0.85}
          ior={1.45}
          depthWrite={false}
        />
      </mesh>

      {/* ── 5. NASA FLEX/BASS Droplet Retention Fiber (Ultra-fine 14µm SiC Thread) ── */}
      <lineSegments geometry={fiberLineGeometry}>
        <lineBasicMaterial
          color="#64748B"
          transparent
          opacity={0.55}
          linewidth={1}
        />
      </lineSegments>

      {/* ── 6. Scientific Measurement Reticles (Concentric Coordinate Rings) ── */}
      <group position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Ring 1: Near-field droplet boundary (r = 0.55) */}
        <mesh>
          <ringGeometry args={[0.546, 0.554, 64]} />
          <meshBasicMaterial
            color="#0284C7"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Ring 2: Primary flame reaction envelope (r = 0.90) */}
        <mesh>
          <ringGeometry args={[0.895, 0.905, 64]} />
          <meshBasicMaterial
            color="#38BDF8"
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Ring 3: Far-field thermal boundary (r = 1.25) */}
        <mesh>
          <ringGeometry args={[1.246, 1.254, 64]} />
          <meshBasicMaterial
            color="#0284C7"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ── 7. Radial Calibration Ticks ── */}
      <lineSegments geometry={reticleTicksGeometry}>
        <lineBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.4}
        />
      </lineSegments>

      {/* ── 8. Optical Diagnostic Breadboard Base (Bottom Flange) ── */}
      <group position={[0, -half, 0]}>
        {/* Circular anodized baseplate */}
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 0.04, 32]} />
          <meshStandardMaterial
            color="#09131F"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        {/* Concentric diagnostic ring on baseplate */}
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.98, 1.0, 32]} />
          <meshBasicMaterial
            color="#0369A1"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ── 9. Top Sensor/Exhaust Collar (Top Flange) ── */}
      <group position={[0, half, 0]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.04, 32]} />
          <meshStandardMaterial
            color="#0E1E30"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.44, 32]} />
          <meshBasicMaterial
            color="#38BDF8"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Microgravity Spherical Diffusion Flame Model
// ---------------------------------------------------------------------------
function MicrogravitySphericalFlame({
  oxygenLevel = 21,
  dropletDiameter = 2.0,
  prefersReducedMotion = false,
}: {
  oxygenLevel?: number;
  dropletDiameter?: number;
  prefersReducedMotion?: boolean;
}) {
  const flameGroupRef = useRef<THREE.Group>(null!);
  const flameLightRef = useRef<THREE.PointLight>(null!);
  const reactionZoneMatRef = useRef<THREE.ShaderMaterial>(null!);
  const chemiluminescentMatRef = useRef<THREE.ShaderMaterial>(null!);

  // Responsive illustrative scaling derived smoothly from user inputs
  // In microgravity: normalized droplet scale ~0.14 - 0.28
  const baseDropletRadius = useMemo(() => {
    const clampedMm = Math.max(0.5, Math.min(5.0, dropletDiameter));
    return 0.12 + (clampedMm / 5.0) * 0.12;
  }, [dropletDiameter]);

  // Oxygen shifts reaction temperature and envelope dimensions:
  // - Low O2: Wider, cooler, translucent blue chemiluminescent shell
  // - High O2: Tighter, hotter, glowing amber-orange combustion shell
  const o2Ratio = useMemo(() => {
    const clampedO2 = Math.max(15, Math.min(40, oxygenLevel));
    return (clampedO2 - 15) / 25; // 0.0 (15%) to 1.0 (40%)
  }, [oxygenLevel]);

  // Color grading based on oxygen level
  const { blueColor, amberColor, orangeColor, lightColor } = useMemo(() => {
    // At high O2, blue shifts to deeper violet-cyan; at low O2, vivid electric cyan
    const blue = new THREE.Color().lerpColors(
      new THREE.Color('#38BDF8'),
      new THREE.Color('#0284C7'),
      o2Ratio
    );
    // Amber reaction zone shifts from soft golden yellow to incandescent orange
    const amber = new THREE.Color().lerpColors(
      new THREE.Color('#FFD54F'),
      new THREE.Color('#FFA726'),
      o2Ratio
    );
    const orange = new THREE.Color().lerpColors(
      new THREE.Color('#FF9800'),
      new THREE.Color('#FF5722'),
      o2Ratio
    );
    const light = new THREE.Color().lerpColors(
      new THREE.Color('#FFA040'),
      new THREE.Color('#FF7A30'),
      o2Ratio
    );

    return { blueColor: blue, amberColor: amber, orangeColor: orange, lightColor: light };
  }, [o2Ratio]);

  // 1. Chemiluminescent Blue Outer Flame Envelope (Fresnel View-dependent limb brightening)
  const chemiluminescentShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: blueColor },
        uOpacity: { value: 0.45 - o2Ratio * 0.15 }, // Lower O2 = more prominent blue envelope
        uFresnelPower: { value: 2.5 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uFresnelPower;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(0.0, abs(dot(viewDir, normal))), uFresnelPower);
          float alpha = smoothstep(0.05, 0.95, fresnel) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [blueColor, o2Ratio]);

  // 2. Luminous Reaction Zone Shader (Organic microgravity breathing & turbulence)
  const reactionZoneShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uCoreColor: { value: amberColor },
        uEdgeColor: { value: orangeColor },
        uIntensity: { value: 0.8 + o2Ratio * 0.5 },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          // Subtle organic breathing wave along the spherical surface
          float displacement = sin(position.x * 5.0 + uTime * 1.6) *
                               cos(position.y * 5.0 + uTime * 1.3) *
                               sin(position.z * 5.0 + uTime * 1.5) * 0.035;
          vec3 displaced = position + normal * displacement;
          vPosition = displaced;
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uCoreColor;
        uniform vec3 uEdgeColor;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float NdotV = max(0.0, abs(dot(viewDir, normal)));
          float fresnel = pow(1.0 - NdotV, 1.8);
          
          vec3 col = mix(uCoreColor, uEdgeColor, fresnel);
          float alpha = (pow(1.0 - NdotV, 1.4) * 0.72 + 0.12) * uIntensity;
          gl_FragColor = vec4(col * (1.0 + fresnel * 0.6), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [amberColor, orangeColor, o2Ratio]);

  // Update uniforms when colors or inputs change
  useEffect(() => {
    if (chemiluminescentMatRef.current) {
      chemiluminescentMatRef.current.uniforms.uColor.value = blueColor;
      chemiluminescentMatRef.current.uniforms.uOpacity.value = 0.45 - o2Ratio * 0.15;
    }
    if (reactionZoneMatRef.current) {
      reactionZoneMatRef.current.uniforms.uCoreColor.value = amberColor;
      reactionZoneMatRef.current.uniforms.uEdgeColor.value = orangeColor;
      reactionZoneMatRef.current.uniforms.uIntensity.value = 0.8 + o2Ratio * 0.5;
    }
  }, [blueColor, amberColor, orangeColor, o2Ratio]);

  // Smooth animation loop
  useFrame((state) => {
    const t = prefersReducedMotion ? 0 : state.clock.getElapsedTime();

    if (reactionZoneMatRef.current) {
      reactionZoneMatRef.current.uniforms.uTime.value = t;
    }

    // Microgravity suspension: gentle floating oscillation
    if (flameGroupRef.current) {
      flameGroupRef.current.position.y = prefersReducedMotion ? 0 : Math.sin(t * 1.1) * 0.035;
      flameGroupRef.current.rotation.y = prefersReducedMotion ? 0 : t * 0.08;
    }

    // Dynamic flame core light breathing
    if (flameLightRef.current) {
      flameLightRef.current.intensity = 1.7 + (prefersReducedMotion ? 0 : Math.sin(t * 2.2) * 0.22);
    }
  });

  // Calculate layered radii based on fuel droplet size and oxygen
  // Physical scale: flame radius is roughly 3.5 - 5.0 times droplet radius
  const flameOuterRadius = baseDropletRadius * (3.8 + (1.0 - o2Ratio) * 0.6);
  const reactionZoneRadius = baseDropletRadius * (2.6 + o2Ratio * 0.4);
  const vaporSheathRadius = baseDropletRadius * 1.5;

  return (
    <group ref={flameGroupRef} position={[0, 0, 0]}>
      {/* ── Central Combustion Light Source ── */}
      <pointLight
        ref={flameLightRef}
        color={lightColor}
        intensity={1.8}
        distance={3.8}
        decay={2}
      />

      {/* ── 1. Central Liquid Fuel Droplet (Refractive / Specular Liquid Bead) ── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[baseDropletRadius, 32, 32]} />
        <meshPhysicalMaterial
          color="#0F172A"
          roughness={0.08}
          metalness={0.15}
          transmission={0.88}
          ior={1.42}
          reflectivity={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* ── 2. Fuel Vapor Sheath (Evaporation Boundary) ── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[vaporSheathRadius, 32, 32]} />
        <meshBasicMaterial
          color="#1E293B"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      {/* ── 3. High-Temperature Volumetric Inner Core Glow ── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[baseDropletRadius * 1.8, 32, 32]} />
        <meshBasicMaterial
          color="#FFE082"
          transparent
          opacity={0.35 + o2Ratio * 0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── 4. Luminous Reaction Zone Shell (Amber/Orange Organic Wave Shell) ── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[reactionZoneRadius, 48, 48]} />
        <primitive object={reactionZoneShader} ref={reactionZoneMatRef} attach="material" />
      </mesh>

      {/* ── 5. Chemiluminescent Outer Spherical Envelope (Blue/Cyan Radical Emission) ── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[flameOuterRadius, 48, 48]} />
        <primitive object={chemiluminescentShader} ref={chemiluminescentMatRef} attach="material" />
      </mesh>

      {/* ── 6. Restrained Drifting Luminescence Sparks (Microgravity Ember Radiation) ── */}
      <Sparkles
        count={18}
        scale={flameOuterRadius * 1.8}
        size={2.2}
        speed={0.15}
        color={orangeColor.getHexString()}
        opacity={0.5}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main Exported ConceptFlameLab3D Component
// ---------------------------------------------------------------------------
export const ConceptFlameLab3D: React.FC<ConceptFlameLab3DProps> = ({
  className = 'h-full w-full',
  oxygenLevel = 21,
  dropletDiameter = 2.0,
  interactive = true,
}) => {
  const controlsRef = useRef<any>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className={`relative ${className} select-none overflow-hidden`}>
      <ThreeCanvasBoundary
        fallbackType="lab-cube"
        camera={{ position: [2.3, 1.4, 2.8], fov: 42 }}
        ariaLabel="Interactive 3D Microgravity Droplet Combustion Chamber"
      >
        {/* Deep Space Lab Atmospheric Lighting */}
        <ambientLight intensity={0.35} color="#0E1B2E" />
        <directionalLight position={[3, 4, 3]} intensity={0.7} color="#38BDF8" />
        <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#0C1E36" />

        {/* Scientific Experimental Chamber Frame & Reticles */}
        <ScientificChamber />

        {/* Realistic Microgravity Spherical Flame & Droplet */}
        <MicrogravitySphericalFlame
          oxygenLevel={oxygenLevel}
          dropletDiameter={dropletDiameter}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Orbit Navigation Controls */}
        {interactive && (
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={1.8}
            maxDistance={5.5}
            enableDamping
            dampingFactor={0.06}
            autoRotate={!prefersReducedMotion}
            autoRotateSpeed={0.35}
          />
        )}
      </ThreeCanvasBoundary>

      {/* Floating Diagnostics / Header Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-[#070D1B]/85 border border-[#1E3252] text-[#38BDF8] backdrop-blur-md shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
          Chamber 3D View · Microgravity Environment
        </span>
        {interactive && (
          <button
            type="button"
            onClick={handleResetView}
            className="px-2.5 py-1 rounded-md text-[10px] font-mono text-gray-300 hover:text-white bg-[#070D1B]/85 border border-[#1E3252] hover:border-[#38BDF8]/60 transition-all backdrop-blur-md shadow-lg"
          >
            Reset Orbit
          </button>
        )}
      </div>

      {/* Scientific Integrity Footnote Badge */}
      <div className="absolute bottom-3 right-3 pointer-events-none z-10">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono text-amber-300/90 bg-[#070D1B]/85 border border-amber-500/25 backdrop-blur-md shadow-lg">
          Illustrative 3D visualization · not a physics simulation
        </span>
      </div>
    </div>
  );
};
