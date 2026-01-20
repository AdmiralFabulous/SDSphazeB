import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Quality settings for different rendering tiers
 */
export interface QualitySettings {
  tier: 'A' | 'B' | 'C';
  shadows: boolean;
  shadowResolution: 'high' | 'medium' | 'low';
  textures: boolean;
  textureResolution: 'high' | 'medium' | 'low';
  effects: {
    bloom: boolean;
    antialiasing: boolean;
    ambientOcclusion: boolean;
  };
  targetFrameRate: number;
  maxGeometryComplexity: number;
}

/**
 * Device capabilities detected from browser
 */
interface DeviceCapabilities {
  gpu: 'powerful' | 'standard' | 'low-end';
  memory: number; // in MB
  cores: number;
  maxCanvasSize: number;
  supportsWebGL2: boolean;
  supportsWebGPU: boolean;
}

/**
 * Context value type
 */
interface QualityContextType {
  settings: QualitySettings;
  setTier: (tier: 'A' | 'B' | 'C') => void;
  isLoading: boolean;
  deviceCapabilities: DeviceCapabilities | null;
}

/**
 * Create the context
 */
const QualityContext = createContext<QualityContextType | undefined>(undefined);

/**
 * Quality settings for each tier
 */
const QUALITY_TIERS: Record<'A' | 'B' | 'C', QualitySettings> = {
  A: {
    tier: 'A',
    shadows: true,
    shadowResolution: 'high',
    textures: true,
    textureResolution: 'high',
    effects: {
      bloom: true,
      antialiasing: true,
      ambientOcclusion: true,
    },
    targetFrameRate: 60,
    maxGeometryComplexity: 1000000,
  },
  B: {
    tier: 'B',
    shadows: true,
    shadowResolution: 'medium',
    textures: true,
    textureResolution: 'medium',
    effects: {
      bloom: false,
      antialiasing: true,
      ambientOcclusion: false,
    },
    targetFrameRate: 30,
    maxGeometryComplexity: 500000,
  },
  C: {
    tier: 'C',
    shadows: false,
    shadowResolution: 'low',
    textures: false,
    textureResolution: 'low',
    effects: {
      bloom: false,
      antialiasing: false,
      ambientOcclusion: false,
    },
    targetFrameRate: 24,
    maxGeometryComplexity: 100000,
  },
};

/**
 * Detect device capabilities
 */
function detectDeviceCapabilities(): DeviceCapabilities {
  const navigator_ = navigator as any;
  const cores = navigator_.hardwareConcurrency || 4;
  const memory = (navigator_.deviceMemory || 4) * 1024; // Convert GB to MB

  // Detect GPU capabilities
  let gpu: 'powerful' | 'standard' | 'low-end' = 'standard';

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

      // Heuristics for GPU capability detection
      const powerfulGPUs = ['nvidia', 'rtx', 'gtx 1080', 'a100', 'm1', 'm2', 'apple'];
      const lowEndGPUs = ['integrated', 'intel uhd', 'intel hd', 'adreno 300', 'mali-400'];

      if (powerfulGPUs.some(gpu => renderer.includes(gpu))) {
        gpu = 'powerful';
      } else if (lowEndGPUs.some(gpu => renderer.includes(gpu))) {
        gpu = 'low-end';
      }
    }
  }

  const supportsWebGL2 = !!gl && gl instanceof WebGL2RenderingContext;
  const supportsWebGPU = !!(navigator_ as any).gpu;

  // Calculate max canvas size based on device
  let maxCanvasSize = 2048;
  if (gpu === 'powerful') {
    maxCanvasSize = 4096;
  } else if (gpu === 'low-end') {
    maxCanvasSize = 1024;
  }

  return {
    gpu,
    memory,
    cores,
    maxCanvasSize,
    supportsWebGL2,
    supportsWebGPU,
  };
}

/**
 * Auto-select quality tier based on device capabilities
 */
function selectTierForDevice(capabilities: DeviceCapabilities): 'A' | 'B' | 'C' {
  // Tier A: Powerful GPU + sufficient memory
  if (capabilities.gpu === 'powerful' && capabilities.memory >= 8192 && capabilities.cores >= 8) {
    return 'A';
  }

  // Tier C: Low-end GPU or limited resources
  if (capabilities.gpu === 'low-end' || capabilities.memory < 4096 || capabilities.cores < 4) {
    return 'C';
  }

  // Tier B: Standard mid-range setup
  return 'B';
}

/**
 * Props for QualityProvider
 */
interface QualityProviderProps {
  children: ReactNode;
  autoDetect?: boolean;
  initialTier?: 'A' | 'B' | 'C';
}

/**
 * QualityProvider component that manages rendering quality settings
 */
export function QualityProvider({
  children,
  autoDetect = true,
  initialTier = 'B',
}: QualityProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [tier, setTierState] = useState<'A' | 'B' | 'C'>(initialTier);

  useEffect(() => {
    const capabilities = detectDeviceCapabilities();
    setDeviceCapabilities(capabilities);

    if (autoDetect) {
      const selectedTier = selectTierForDevice(capabilities);
      setTierState(selectedTier);
    }

    setIsLoading(false);
  }, [autoDetect]);

  const setTier = (newTier: 'A' | 'B' | 'C') => {
    setTierState(newTier);
  };

  const settings = QUALITY_TIERS[tier];

  const value: QualityContextType = {
    settings,
    setTier,
    isLoading,
    deviceCapabilities,
  };

  return (
    <QualityContext.Provider value={value}>
      {children}
    </QualityContext.Provider>
  );
}

/**
 * Hook to access quality settings
 */
export function useQuality(): QualityContextType {
  const context = useContext(QualityContext);
  if (context === undefined) {
    throw new Error('useQuality must be used within a QualityProvider');
  }
  return context;
}

/**
 * Hook to access only the quality settings
 */
export function useQualitySettings(): QualitySettings {
  const { settings } = useQuality();
  return settings;
}

/**
 * Hook to access device capabilities
 */
export function useDeviceCapabilities(): DeviceCapabilities | null {
  const { deviceCapabilities } = useQuality();
  return deviceCapabilities;
}
