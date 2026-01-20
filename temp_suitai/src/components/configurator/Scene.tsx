'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import {
  getQualitySettings,
  type GPUTier,
  type QualitySettings,
} from '@/utils/gpuDetection';

/**
 * Fallback component shown while scene is loading
 */
function SceneLoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#cccccc" wireframe />
    </mesh>
  );
}

/**
 * Camera setup component
 */
function SceneCamera() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 1.6, 3]}
        near={0.1}
        far={100}
        fov={45}
      />
      <OrbitControls
        enableZoom
        enablePan
        enableRotate
        autoRotateSpeed={0}
        maxDistance={10}
        minDistance={1}
      />
    </>
  );
}

/**
 * Lighting setup component
 */
function SceneLights() {
  return (
    <>
      {/* Key light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* Fill light */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.5}
      />
      {/* Ambient light */}
      <ambientLight intensity={0.6} />
      {/* Hemisphere light for natural lighting */}
      <hemisphereLight args={[0xffffff, 0x808080, 0.4]} />
    </>
  );
}

/**
 * Ground plane component
 */
function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#f0f0f0" />
    </mesh>
  );
}

/**
 * Main scene content component
 */
function SceneContent() {
  return (
    <>
      <SceneCamera />
      <SceneLights />
      <Ground />
      {/* Placeholder for model - will be replaced with SMPL-X model */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.3, 1, 4, 8]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
    </>
  );
}

export interface SceneProps {
  /**
   * GPU tier override (for testing/settings)
   */
  gpuTier?: GPUTier;
  /**
   * Canvas container class name
   */
  className?: string;
  /**
   * Optional callback when scene is ready
   */
  onSceneReady?: (qualitySettings: QualitySettings) => void;
}

/**
 * R3F Canvas Scene Component
 *
 * Features:
 * - frameloop="demand" for performance optimization
 * - GPU tier detection with quality presets
 * - Suspense boundary for loading states
 * - Proper camera and lighting setup
 * - Responsive to device capabilities
 */
export function Scene({
  gpuTier,
  className = '',
  onSceneReady,
}: SceneProps) {
  const qualitySettings = useMemo(() => {
    const settings = getQualitySettings(gpuTier);
    onSceneReady?.(settings);
    return settings;
  }, [gpuTier, onSceneReady]);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        frameloop="demand"
        dpr={qualitySettings.pixelRatio}
        gl={{
          antialias: true,
          alpha: true,
          stencil: false,
          depth: true,
          precision: 'highp',
          powerPreference: 'high-performance',
        }}
        camera={{
          position: [0, 1.6, 3],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        shadows="variance"
      >
        <Suspense fallback={<SceneLoadingFallback />}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Scene;
