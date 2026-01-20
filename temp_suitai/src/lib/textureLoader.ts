/**
 * Three.js Texture Loader Utility
 * Provides utilities for loading and managing fabric textures with Three.js
 */

/**
 * Load a texture from URL using platform-agnostic approach
 * Works with both canvas and Three.js contexts
 */
export async function loadFabricTexture(url: string): Promise<{
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  data?: ImageData;
}> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get 2D context from canvas');
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        resolve({
          canvas,
          width: canvas.width,
          height: canvas.height,
          data: imageData,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = url;

      // Timeout for slow networks
      setTimeout(() => {
        if (!img.complete) {
          reject(new Error('Texture load timeout'));
        }
      }, 30000);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Apply texture to Three.js material (when Three.js is available)
 * This is a helper for Three.js integration
 */
export function applyTextureToMaterial(
  material: any,
  textureData: { canvas: HTMLCanvasElement }
): void {
  try {
    // Check if THREE is available
    if (typeof window !== 'undefined' && (window as any).THREE) {
      const THREE = (window as any).THREE;

      // Create Three.js texture from canvas
      const texture = new THREE.CanvasTexture(textureData.canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      texture.generateMipmaps = true;

      // Apply to material
      material.map = texture;
      material.needsUpdate = true;
    }
  } catch (error) {
    console.warn('Failed to apply texture to material:', error);
  }
}

/**
 * Create a canvas texture placeholder
 * Useful for testing and fallback scenarios
 */
export function createPlaceholderTexture(color: string = '#CCCCCC'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);

    // Add a subtle pattern
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  }

  return canvas;
}

/**
 * Preload multiple textures concurrently
 */
export async function preloadTextures(urls: string[]): Promise<Map<string, any>> {
  const textureMap = new Map();

  const promises = urls.map(async (url) => {
    try {
      const texture = await loadFabricTexture(url);
      textureMap.set(url, texture);
    } catch (error) {
      console.warn(`Failed to preload texture: ${url}`, error);
    }
  });

  await Promise.all(promises);
  return textureMap;
}
