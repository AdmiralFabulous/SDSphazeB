/**
 * GPU Detection and Quality Settings
 * Detects GPU tier and provides quality presets based on device capabilities
 */

export type GPUTier = 'low' | 'medium' | 'high';

export interface QualitySettings {
  tier: GPUTier;
  pixelRatio: number;
  samples: number;
  toneMappingExposure: number;
  shadowMapSize: 512 | 1024 | 2048;
}

const QUALITY_PRESETS: Record<GPUTier, QualitySettings> = {
  low: {
    tier: 'low',
    pixelRatio: Math.min(window.devicePixelRatio, 1),
    samples: 1,
    toneMappingExposure: 1,
    shadowMapSize: 512,
  },
  medium: {
    tier: 'medium',
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    samples: 4,
    toneMappingExposure: 1.2,
    shadowMapSize: 1024,
  },
  high: {
    tier: 'high',
    pixelRatio: window.devicePixelRatio,
    samples: 8,
    toneMappingExposure: 1.5,
    shadowMapSize: 2048,
  },
};

/**
 * Detects GPU tier based on WebGL capabilities
 */
export function detectGPUTier(): GPUTier {
  if (typeof window === 'undefined') {
    return 'medium';
  }

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      return 'low';
    }

    // Check for WebGL2 support
    const hasWebGL2 =
      typeof WebGL2RenderingContext !== 'undefined' &&
      gl instanceof WebGL2RenderingContext;

    if (!hasWebGL2) {
      return 'low';
    }

    // Check for important extensions
    const hasFloatTextures =
      !!gl.getExtension('OES_texture_float') ||
      !!gl.getExtension('EXT_color_buffer_half_float');

    if (!hasFloatTextures) {
      return 'medium';
    }

    // Check device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory && deviceMemory >= 8) {
      return 'high';
    }

    // Check max texture size as proxy for GPU power
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (maxTextureSize >= 4096) {
      return 'high';
    }

    // Check for ES3 support (common on modern GPUs)
    const maxFragmentUniforms = gl.getParameter(
      gl.MAX_FRAGMENT_UNIFORM_VECTORS
    );
    if (maxFragmentUniforms >= 256) {
      return 'high';
    }

    return 'medium';
  } catch {
    return 'medium';
  }
}

/**
 * Gets quality settings for the detected GPU tier
 */
export function getQualitySettings(tier?: GPUTier): QualitySettings {
  const detectedTier = tier || detectGPUTier();
  return QUALITY_PRESETS[detectedTier];
}

/**
 * Checks if WebGL is supported
 */
export function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') || canvas.getContext('webgl')
    );
  } catch {
    return false;
  }
}
