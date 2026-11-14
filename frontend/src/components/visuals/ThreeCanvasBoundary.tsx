import React, { Component, ReactNode, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { StaticSceneFallback } from './StaticSceneFallback';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('3D Canvas encountered WebGL error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface ThreeCanvasBoundaryProps {
  children: ReactNode;
  className?: string;
  fallbackType?: 'flame-hero' | 'lab-cube' | 'neural' | 'atmosphere';
  camera?: any;
  ariaLabel?: string;
}

export const ThreeCanvasBoundary: React.FC<ThreeCanvasBoundaryProps> = ({
  children,
  className = 'w-full h-full',
  fallbackType = 'flame-hero',
  camera = { position: [0, 0, 5], fov: 45 },
  ariaLabel = 'Conceptual 3D visualization scene',
}) => {
  const fallback = <StaticSceneFallback type={fallbackType} className={className} />;

  return (
    <div className={`relative ${className}`} role="region" aria-label={ariaLabel}>
      <WebGLErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <Canvas
            camera={camera}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%' }}
            aria-hidden="true"
          >
            {children}
          </Canvas>
        </Suspense>
      </WebGLErrorBoundary>
    </div>
  );
};
