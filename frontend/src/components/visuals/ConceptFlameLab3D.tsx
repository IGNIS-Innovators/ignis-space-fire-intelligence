import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeCanvasBoundary } from './ThreeCanvasBoundary';

interface ConceptFlameLab3DProps {
  className?: string;
  oxygenLevel?: number; // 15 to 40% (visual accent only)
  dropletDiameter?: number;
  interactive?: boolean;
}

function LabCubeScene({
  oxygenLevel = 21,
  dropletDiameter = 2.0,
}: {
  oxygenLevel?: number;
  dropletDiameter?: number;
}) {
  const flameGroupRef = useRef<THREE.Group>(null!);
  const flameCoreRef = useRef<THREE.Mesh>(null!);
  const flameOuterRef = useRef<THREE.Mesh>(null!);

  // Visual hue subtly warms up with oxygen (artistic only, not simulation)
  const flameColor = oxygenLevel > 28 ? '#FF4500' : oxygenLevel > 21 ? '#FF641C' : '#FFA040';
  const outerColor = oxygenLevel < 20 ? '#00BFFF' : '#36B8FF';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (flameGroupRef.current) {
      flameGroupRef.current.position.y = Math.sin(t * 1.5) * 0.08;
    }
    if (flameOuterRef.current) {
      const s = 1 + Math.sin(t * 2.5) * 0.05;
      flameOuterRef.current.scale.set(s, s, s);
    }
  });

  const dropletScale = Math.min(Math.max((dropletDiameter / 2.0) * 0.45, 0.3), 0.75);

  return (
    <group>
      {/* Combustion Chamber Wireframe Box (1.8m scale) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 2.4, 2.4]} />
        <meshBasicMaterial
          color="#213047"
          wireframe
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Glass Walls (Subtle Translucent Panels) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.38, 2.38, 2.38]} />
        <meshPhysicalMaterial
          color="#0A1828"
          transparent
          opacity={0.12}
          roughness={0.1}
          metalness={0.1}
          transmission={0.6}
        />
      </mesh>

      {/* Grid Floor */}
      <group position={[0, -1.2, 0]}>
        <Grid
          args={[2.4, 2.4]}
          cellSize={0.3}
          cellThickness={0.6}
          cellColor="#1E3A5F"
          sectionSize={0.6}
          sectionThickness={1.2}
          sectionColor="#36B8FF"
          fadeDistance={4}
        />
      </group>

      {/* Microgravity Flame Suspension Group */}
      <group ref={flameGroupRef} position={[0, 0, 0]}>
        {/* Outer Quenched Envelope */}
        <mesh ref={flameOuterRef}>
          <sphereGeometry args={[dropletScale * 1.9, 32, 32]} />
          <meshStandardMaterial
            color={outerColor}
            emissive={outerColor}
            emissiveIntensity={0.6}
            transparent
            opacity={0.35}
            roughness={0.1}
          />
        </mesh>

        {/* Reaction Zone */}
        <mesh>
          <sphereGeometry args={[dropletScale * 1.4, 32, 32]} />
          <meshStandardMaterial
            color={flameColor}
            emissive={flameColor}
            emissiveIntensity={1.2}
            transparent
            opacity={0.75}
            roughness={0.2}
          />
        </mesh>

        {/* Droplet Core */}
        <mesh ref={flameCoreRef}>
          <sphereGeometry args={[dropletScale * 0.7, 32, 32]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFD700"
            emissiveIntensity={2.0}
          />
        </mesh>

        {/* Chamber Embers */}
        <Sparkles
          count={20}
          scale={2.2}
          size={2.5}
          speed={0.3}
          color="#FF8D36"
          opacity={0.6}
        />
      </group>
    </group>
  );
}

export const ConceptFlameLab3D: React.FC<ConceptFlameLab3DProps> = ({
  className = 'h-full w-full',
  oxygenLevel = 21,
  dropletDiameter = 2.0,
  interactive = true,
}) => {
  const controlsRef = useRef<any>(null);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <ThreeCanvasBoundary
        fallbackType="lab-cube"
        camera={{ position: [2.5, 1.8, 3.2], fov: 45 }}
        ariaLabel="Interactive 3D Microgravity Combustion Chamber"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 4, 3]} intensity={1.8} color="#36B8FF" />
        <pointLight position={[-3, -1, -2]} intensity={1.2} color="#FF641C" />
        <LabCubeScene oxygenLevel={oxygenLevel} dropletDiameter={dropletDiameter} />
        {interactive && (
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={2.0}
            maxDistance={6.0}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}
      </ThreeCanvasBoundary>

      {/* Floating Controls Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#0D1829]/80 border border-[#213047] text-cyan-300">
          Chamber 3D View
        </span>
        {interactive && (
          <button
            onClick={handleResetView}
            className="px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 hover:text-white bg-[#0D1829]/80 border border-[#213047] hover:border-cyan-500/50 transition-colors"
          >
            Reset Orbit
          </button>
        )}
      </div>

      <div className="absolute bottom-3 right-3 pointer-events-none z-10">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono text-amber-300/90 bg-[#070D1B]/80 border border-amber-500/25 backdrop-blur-md">
          3D conceptual visualization · not experimental measurement
        </span>
      </div>
    </div>
  );
};
