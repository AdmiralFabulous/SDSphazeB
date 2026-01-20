import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Scene3D } from './Scene3D';

/**
 * Example configurator component demonstrating the lighting setup
 * This shows how to integrate the Lighting component with 3D models
 */
export function ConfiguratorExample() {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  const handleSceneReady = (
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer
  ) => {
    sceneRef.current = scene;

    // Create a simple test object to visualize the lighting
    // In production, this would be loaded from a GLTF/GLB file
    const geometry = new THREE.IcosahedronGeometry(2, 4);
    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.4,
      roughness: 0.6,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Add a ground plane to receive shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.2,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add some interactive rotation
    const animate = () => {
      mesh.rotation.x += 0.002;
      mesh.rotation.y += 0.003;
    };

    // Hook into the render loop
    const originalAnimationFrame = requestAnimationFrame;
    let lastFrame: number;

    const renderLoop = () => {
      animate();
      lastFrame = originalAnimationFrame(renderLoop);
    };
    renderLoop();

    setModelLoaded(true);
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Scene3D
        onSceneReady={handleSceneReady}
        enableAnimations={true}
        width={1200}
        height={800}
      />

      {/* UI Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: '#fff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '20px',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          zIndex: 10,
        }}
      >
        <h2 style={{ margin: '0 0 10px 0' }}>Lighting Setup Demo</h2>
        <p style={{ margin: '5px 0' }}>
          Three-Point Lighting Configuration:
        </p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>🔦 Key Light: Main illumination (1.2 intensity)</li>
          <li>💡 Fill Light: Shadow softening (0.6 intensity)</li>
          <li>🎬 Back Light: Rim/separation (0.5 intensity)</li>
          <li>🌐 Ambient Light: Base illumination (0.3 intensity)</li>
        </ul>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#aaa' }}>
          Status: {modelLoaded ? '✓ Ready' : 'Loading...'}
        </p>
      </div>

      {/* Camera Controls Info */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          color: '#fff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '15px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          zIndex: 10,
        }}
      >
        <p style={{ margin: 0 }}>💻 Features:</p>
        <p style={{ margin: '5px 0 0 0' }}>
          • Dynamic light animation<br/>
          • High-quality shadows (2048x2048)<br/>
          • Environment map reflections<br/>
          • PCF shadow filtering
        </p>
      </div>
    </div>
  );
}
