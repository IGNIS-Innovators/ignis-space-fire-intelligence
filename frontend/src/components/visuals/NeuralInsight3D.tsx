import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeCanvasBoundary } from './ThreeCanvasBoundary';

function NeuralSculpture() {
  const groupRef = useRef<THREE.Group>(null!);
  const icosahedronRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  // Generate deterministic neural nodes
  const nodePositions = useMemo(() => {
    const coords: [number, number, number][] = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 1.25 + (i % 3) * 0.15;
      coords.push([
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi),
      ]);
    }
    return coords;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.25;
      groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.2;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.4;
      const s = 1 + Math.sin(t * 2) * 0.08;
      innerRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Wireframe Neural Sphere / Icosahedron */}
      <mesh ref={icosahedronRef}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshStandardMaterial
          color="#36B8FF"
          wireframe
          transparent
          opacity={0.35}
          roughness={0.2}
          emissive="#0284c7"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Inner Glowing Cognitive Core */}
      <mesh ref={innerRef}>
        <dodecahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color="#FF641C"
          emissive="#FF8D36"
          emissiveIntensity={1.2}
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Synaptic Nodes */}
      {nodePositions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial
            color={idx % 4 === 0 ? '#FF8D36' : '#36B8FF'}
          />
        </mesh>
      ))}

      {/* Flowing Data Sparkles */}
      <Sparkles
        count={35}
        scale={3}
        size={2.5}
        speed={0.4}
        color="#36B8FF"
        opacity={0.65}
      />
      <Sparkles
        count={15}
        scale={2.2}
        size={2.5}
        speed={0.6}
        color="#FF8D36"
        opacity={0.5}
      />
    </group>
  );
}

export const NeuralInsight3D: React.FC<{ className?: string }> = ({
  className = 'h-full w-full',
}) => {
  return (
    <div className={`relative ${className}`}>
      <ThreeCanvasBoundary
        fallbackType="neural"
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        ariaLabel="3D Neural Network Architecture Visualizer"
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#36B8FF" />
        <pointLight position={[-3, -3, 2]} intensity={1.2} color="#FF641C" />
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
          <NeuralSculpture />
        </Float>
      </ThreeCanvasBoundary>
    </div>
  );
};
