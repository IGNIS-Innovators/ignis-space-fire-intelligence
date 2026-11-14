import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeCanvasBoundary } from './ThreeCanvasBoundary';

function MicrogravityFlame() {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Subtle organic pulsing of microgravity spherical flame
    if (outerRef.current) {
      const scale = 1 + Math.sin(t * 2.2) * 0.04;
      outerRef.current.scale.set(scale, scale, scale);
      outerRef.current.rotation.y = t * 0.2;
    }

    if (innerRef.current) {
      const scale = 1 + Math.cos(t * 3.1) * 0.05;
      innerRef.current.scale.set(scale, scale, scale);
      innerRef.current.rotation.z = -t * 0.3;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.5;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.15;
    }
  });

  return (
    <group position={[0.2, 0, 0]}>
      {/* Orbital Arc / Ring */}
      <mesh ref={ringRef} rotation={[1.1, 0.4, 0]}>
        <ringGeometry args={[2.2, 2.24, 64]} />
        <meshBasicMaterial
          color="#36B8FF"
          side={THREE.DoubleSide}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Earth Horizon / Atmospheric Glow Arc */}
      <mesh position={[-0.8, -2.6, -1]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[4.5, 4.5, 0.2, 64, 1, true, 0, Math.PI * 0.6]} />
        <meshBasicMaterial
          color="#164e63"
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Outer Blue Chemiluminescent Flame Shell (characteristic of microgravity) */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshStandardMaterial
          color="#36B8FF"
          emissive="#0284c7"
          emissiveIntensity={0.8}
          transparent
          opacity={0.28}
          wireframe={false}
          roughness={0.2}
        />
      </mesh>

      {/* Mid Radiative Soot/Amber Reaction Zone */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshStandardMaterial
          color="#FF8D36"
          emissive="#FF641C"
          emissiveIntensity={1.4}
          transparent
          opacity={0.65}
          roughness={0.1}
        />
      </mesh>

      {/* Core Hot Fuel Droplet Vapor Zone */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFAA44"
          emissiveIntensity={2.5}
          roughness={0.0}
        />
      </mesh>

      {/* Floating Microgravity Embers */}
      <Sparkles
        count={35}
        scale={4}
        size={3}
        speed={0.4}
        color="#FF8D36"
        opacity={0.7}
      />
      <Sparkles
        count={25}
        scale={5}
        size={2}
        speed={0.2}
        color="#36B8FF"
        opacity={0.5}
      />
    </group>
  );
}

export const FlameHero3D: React.FC<{ className?: string }> = ({ className = 'h-full w-full' }) => {
  return (
    <div className={`relative ${className}`}>
      <ThreeCanvasBoundary
        fallbackType="flame-hero"
        camera={{ position: [0, 0, 4.6], fov: 42 }}
        ariaLabel="3D Animated Microgravity Flame and Orbital Horizon Scene"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#FF8D36" />
        <pointLight position={[-3, -2, 2]} intensity={1.0} color="#36B8FF" />
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
          <MicrogravityFlame />
        </Float>
      </ThreeCanvasBoundary>

      {/* Scientific truth disclaimer badge */}
      <div className="absolute bottom-3 right-4 pointer-events-none z-10">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider text-cyan-300/90 bg-[#070D1B]/80 border border-cyan-500/25 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          Illustrative 3D visualization · not a physics simulation
        </span>
      </div>
    </div>
  );
};
