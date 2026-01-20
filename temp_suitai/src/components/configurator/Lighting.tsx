import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LightingProps {
  scene: THREE.Scene;
  enableAnimations?: boolean;
}

/**
 * Three-point lighting setup with environment map and shadow configuration
 * Provides professional studio lighting for 3D model visualization
 */
export function Lighting({ scene, enableAnimations = true }: LightingProps) {
  const lightsRef = useRef<{
    keyLight: THREE.Light;
    fillLight: THREE.Light;
    backLight: THREE.Light;
    ambientLight: THREE.Light;
  } | null>(null);

  useEffect(() => {
    if (!scene) return;

    // Remove any existing lights to avoid duplication
    scene.children.forEach((child) => {
      if (child instanceof THREE.Light) {
        scene.remove(child);
      }
    });

    // 1. KEY LIGHT (Main light source) - 45° angle, warm color
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.001;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);

    // 2. FILL LIGHT (Soften shadows) - Opposite side, cooler color
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.6);
    fillLight.position.set(-5, 4, 3);
    fillLight.castShadow = false;
    scene.add(fillLight);

    // 3. BACK LIGHT (Rim/separation light) - Behind the model, slight color
    const backLight = new THREE.DirectionalLight(0xff9500, 0.5);
    backLight.position.set(0, 5, -8);
    backLight.castShadow = false;
    scene.add(backLight);

    // 4. AMBIENT LIGHT (Base illumination) - Subtle global light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Store references for animation
    lightsRef.current = {
      keyLight,
      fillLight,
      backLight,
      ambientLight,
    };

    return () => {
      // Cleanup is handled by removing lights above
    };
  }, [scene]);

  // Apply subtle animation for premium feel
  useEffect(() => {
    if (!enableAnimations || !lightsRef.current) return;

    let animationFrameId: number;
    let startTime = Date.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = (Date.now() - startTime) / 1000;

      if (lightsRef.current) {
        // Gentle rotation of key light for dynamic lighting effect
        const angle = elapsed * 0.3; // Slow rotation
        const radius = Math.sqrt(5 * 5 + 5 * 5); // Original distance from center
        lightsRef.current.keyLight.position.x = Math.cos(angle) * radius * 0.7 + 2;
        lightsRef.current.keyLight.position.z = Math.sin(angle) * radius * 0.7 + 3;

        // Subtle intensity variation for fill light
        const intensityVariation = 0.6 + Math.sin(elapsed * 0.5) * 0.1;
        lightsRef.current.fillLight.intensity = intensityVariation;

        // Back light subtle flicker
        const backIntensity = 0.5 + Math.sin(elapsed * 0.7 + 1) * 0.08;
        lightsRef.current.backLight.intensity = backIntensity;
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [enableAnimations]);

  // Environment map setup for reflections
  useEffect(() => {
    if (!scene) return;

    // Create a simple environment map using a gradient
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Create a subtle gradient environment map
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#1a1a1a'); // Dark bottom
    gradient.addColorStop(0.5, '#2d2d2d'); // Mid tone
    gradient.addColorStop(1, '#3a3a3a'); // Slightly lighter top

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Add subtle noise texture for realism
    const imageData = ctx.getImageData(0, 0, 256, 256);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 15;
      data[i] += noise; // R
      data[i + 1] += noise; // G
      data[i + 2] += noise; // B
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;

    // Apply environment map to scene
    scene.environment = texture;
    scene.background = new THREE.Color(0x1a1a1a);

    return () => {
      texture.dispose();
    };
  }, [scene]);

  // Update shadow map properties
  useEffect(() => {
    if (!scene) return;

    scene.children.forEach((child) => {
      if (child instanceof THREE.DirectionalLight && child.castShadow) {
        // Enable shadow map updates
        child.shadow.map?.dispose();
        child.shadow.needsUpdate = true;
      }
    });
  }, [scene]);

  return null; // This is a non-visual component
}

/**
 * Utility function to enable shadows on scene objects
 */
export function enableShadows(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  options?: {
    castShadow?: boolean;
    receiveShadow?: boolean;
  }
) {
  const { castShadow = true, receiveShadow = true } = options || {};

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = true;

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = castShadow;
      object.receiveShadow = receiveShadow;
    }
  });
}

/**
 * Load HDRI environment map from URL (for future enhancement)
 */
export async function loadEnvironmentMap(
  scene: THREE.Scene,
  hdriUrl: string
): Promise<void> {
  const { RGBELoader } = await import('three/examples/jsm/loaders/RGBELoader.js');

  return new Promise((resolve, reject) => {
    new RGBELoader().load(
      hdriUrl,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;
        resolve();
      },
      undefined,
      reject
    );
  });
}
