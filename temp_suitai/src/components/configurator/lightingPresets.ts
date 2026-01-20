/**
 * Lighting presets for different use cases
 * Each preset defines configuration for the three-point lighting setup
 */

export interface LightingPreset {
  name: string;
  keyLight: {
    intensity: number;
    color: number;
    position: [number, number, number];
  };
  fillLight: {
    intensity: number;
    color: number;
    position: [number, number, number];
  };
  backLight: {
    intensity: number;
    color: number;
    position: [number, number, number];
  };
  ambientLight: {
    intensity: number;
    color: number;
  };
  backgroundColor: number;
  enableAnimations: boolean;
}

/**
 * Studio Lighting - Balanced professional lighting for product visualization
 * Best for: High-end fashion, premium product displays, body model visualization
 */
export const STUDIO_PRESET: LightingPreset = {
  name: 'Studio',
  keyLight: {
    intensity: 1.2,
    color: 0xffffff,
    position: [5, 8, 5],
  },
  fillLight: {
    intensity: 0.6,
    color: 0x87ceeb,
    position: [-5, 4, 3],
  },
  backLight: {
    intensity: 0.5,
    color: 0xff9500,
    position: [0, 5, -8],
  },
  ambientLight: {
    intensity: 0.3,
    color: 0xffffff,
  },
  backgroundColor: 0x1a1a1a,
  enableAnimations: true,
};

/**
 * Soft Lighting - Gentle, diffused lighting with minimal shadows
 * Best for: Fashion displays, retail showcases, neutral presentations
 */
export const SOFT_PRESET: LightingPreset = {
  name: 'Soft',
  keyLight: {
    intensity: 0.9,
    color: 0xffecd0,
    position: [4, 6, 4],
  },
  fillLight: {
    intensity: 0.8,
    color: 0xe0f0ff,
    position: [-4, 5, 4],
  },
  backLight: {
    intensity: 0.3,
    color: 0xffffff,
    position: [0, 4, -6],
  },
  ambientLight: {
    intensity: 0.5,
    color: 0xffffff,
  },
  backgroundColor: 0x2a2a2a,
  enableAnimations: true,
};

/**
 * Dramatic Lighting - High contrast with strong directional light
 * Best for: Premium showcases, artistic presentation, dramatic effects
 */
export const DRAMATIC_PRESET: LightingPreset = {
  name: 'Dramatic',
  keyLight: {
    intensity: 1.5,
    color: 0xffffff,
    position: [6, 10, 6],
  },
  fillLight: {
    intensity: 0.3,
    color: 0x4a6fa5,
    position: [-6, 3, 2],
  },
  backLight: {
    intensity: 0.7,
    color: 0xff8c00,
    position: [0, 6, -10],
  },
  ambientLight: {
    intensity: 0.15,
    color: 0xffffff,
  },
  backgroundColor: 0x0a0a0a,
  enableAnimations: true,
};

/**
 * Neutral Lighting - Even, balanced lighting with neutral colors
 * Best for: Clinical analysis, body measurement, technical visualization
 */
export const NEUTRAL_PRESET: LightingPreset = {
  name: 'Neutral',
  keyLight: {
    intensity: 1.0,
    color: 0xffffff,
    position: [5, 8, 5],
  },
  fillLight: {
    intensity: 0.7,
    color: 0xffffff,
    position: [-5, 4, 3],
  },
  backLight: {
    intensity: 0.4,
    color: 0xffffff,
    position: [0, 5, -8],
  },
  ambientLight: {
    intensity: 0.4,
    color: 0xffffff,
  },
  backgroundColor: 0x3a3a3a,
  enableAnimations: false,
};

/**
 * Warm Lighting - Golden hour feel with warm tones
 * Best for: Premium fit, lifestyle, warm aesthetic presentation
 */
export const WARM_PRESET: LightingPreset = {
  name: 'Warm',
  keyLight: {
    intensity: 1.1,
    color: 0xffd68f,
    position: [5, 8, 5],
  },
  fillLight: {
    intensity: 0.6,
    color: 0xffc98b,
    position: [-5, 4, 3],
  },
  backLight: {
    intensity: 0.5,
    color: 0xffa500,
    position: [0, 5, -8],
  },
  ambientLight: {
    intensity: 0.35,
    color: 0xffd68f,
  },
  backgroundColor: 0x2d2416,
  enableAnimations: true,
};

/**
 * Cool Lighting - Crisp, cool tones for modern aesthetic
 * Best for: Technical focus, modern brands, minimalist design
 */
export const COOL_PRESET: LightingPreset = {
  name: 'Cool',
  keyLight: {
    intensity: 1.2,
    color: 0xe8f4ff,
    position: [5, 8, 5],
  },
  fillLight: {
    intensity: 0.6,
    color: 0xb3d9ff,
    position: [-5, 4, 3],
  },
  backLight: {
    intensity: 0.5,
    color: 0x87ceeb,
    position: [0, 5, -8],
  },
  ambientLight: {
    intensity: 0.35,
    color: 0xe8f4ff,
  },
  backgroundColor: 0x1a2633,
  enableAnimations: true,
};

/**
 * Preset registry
 */
export const LIGHTING_PRESETS: Record<string, LightingPreset> = {
  studio: STUDIO_PRESET,
  soft: SOFT_PRESET,
  dramatic: DRAMATIC_PRESET,
  neutral: NEUTRAL_PRESET,
  warm: WARM_PRESET,
  cool: COOL_PRESET,
};

/**
 * Get preset by name
 */
export function getLightingPreset(name: string): LightingPreset {
  return LIGHTING_PRESETS[name.toLowerCase()] || STUDIO_PRESET;
}

/**
 * Get all available preset names
 */
export function getAvailablePresets(): string[] {
  return Object.keys(LIGHTING_PRESETS);
}
