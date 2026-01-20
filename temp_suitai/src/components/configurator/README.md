# Configurator Components

This directory contains the core 3D visualization components for the SUIT AI configurator, with professional lighting setup for rendering parametric body models (SMPL/SMPL-X).

## Components

### 1. **Lighting.tsx**
Professional three-point lighting setup with environment mapping and shadow configuration.

**Key Features:**
- ✓ Three-point lighting (key, fill, back)
- ✓ Ambient light for base illumination
- ✓ High-quality shadow mapping (2048x2048 PCF)
- ✓ Procedural environment map for reflections
- ✓ Subtle animation for premium feel
- ✓ HDRI loading support for custom environments

**Usage:**
```typescript
import { Lighting } from '@/components/configurator/Lighting';

<Lighting scene={scene} enableAnimations={true} />
```

### 2. **Scene3D.tsx**
Three.js scene container with automatic setup and lifecycle management.

**Key Features:**
- ✓ Automatic scene, camera, renderer initialization
- ✓ Responsive canvas resizing
- ✓ Integrated lighting system
- ✓ Callback for custom setup
- ✓ Proper resource cleanup

**Usage:**
```typescript
import { Scene3D } from '@/components/configurator/Scene3D';

<Scene3D
  width={1200}
  height={800}
  enableAnimations={true}
  onSceneReady={(scene, camera, renderer) => {
    // Add your models here
  }}
/>
```

### 3. **ConfiguratorExample.tsx**
Example implementation demonstrating the lighting setup with a test 3D object.

**Features:**
- ✓ Complete working example
- ✓ Test geometry with proper materials
- ✓ Shadow ground plane
- ✓ Interactive rotation
- ✓ UI overlays with information

## File Structure

```
configurator/
├── Lighting.tsx              # Core lighting setup
├── Scene3D.tsx              # Scene container
├── ConfiguratorExample.tsx   # Example usage
├── lightingPresets.ts       # Preset configurations
├── LIGHTING_SETUP.md        # Detailed lighting documentation
└── README.md                # This file
```

## Lighting Presets

The `lightingPresets.ts` file provides 6 pre-configured lighting scenarios:

1. **Studio** (Default) - Professional balanced lighting
2. **Soft** - Gentle, diffused lighting
3. **Dramatic** - High contrast dramatic effect
4. **Neutral** - Even, clinically balanced
5. **Warm** - Golden hour aesthetic
6. **Cool** - Modern, crisp aesthetic

### Using Presets

```typescript
import { getLightingPreset, LIGHTING_PRESETS } from '@/components/configurator/lightingPresets';

const preset = getLightingPreset('dramatic');
const presets = getAvailablePresets(); // ['studio', 'soft', 'dramatic', ...]
```

## Integration with 3D Models

### Loading GLTF/GLB Models

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/models/body.glb', (gltf) => {
  const model = gltf.scene;
  scene.add(model);

  // Shadows automatically applied via enableShadows()
});
```

### Loading Custom Environment Maps

```typescript
import { loadEnvironmentMap } from '@/components/configurator/Lighting';

// Load HDRI for realistic reflections
await loadEnvironmentMap(scene, '/env/studio_hdri.hdr');
```

## Shadow Configuration

Shadows are automatically enabled on all meshes with optimized settings:

- **Type**: PCF (Percentage-Closer Filtering)
- **Resolution**: 2048×2048
- **Bias**: -0.001 (prevents artifacts)
- **Radius**: 4 (soft edges)

### Manual Shadow Control

```typescript
import { enableShadows } from '@/components/configurator/Lighting';

enableShadows(scene, renderer, {
  castShadow: true,
  receiveShadow: true,
});
```

## Animation System

The lighting includes three synchronized animations:

1. **Key Light Orbital Motion**
   - Smooth rotation around model
   - Maintains premium, dynamic feel
   - Speed: 0.3 rad/s

2. **Fill Light Intensity Breathing**
   - 0.5-0.7 intensity variation
   - Frequency: 0.5 Hz
   - Soft, subtle effect

3. **Back Light Intensity Flicker**
   - 0.42-0.58 intensity variation
   - Frequency: 0.7 Hz with phase offset
   - Creates depth variation

**Disable animations:**
```typescript
<Lighting scene={scene} enableAnimations={false} />
```

## Performance Optimizations

- Minimal light count (4 total) for efficiency
- 2048×2048 shadow maps balance quality/performance
- Procedural environment map (no file I/O)
- Proper resource cleanup and disposal
- Optimized shadow camera frustum

## Environment Prep

Create directories for 3D assets:

```bash
public/
├── models/           # GLTF/GLB files
│   └── body.glb
├── env/              # HDRI environment maps
│   └── studio.hdr
└── textures/         # Texture files
    └── body_texture.png
```

## Dependencies

Installed automatically:
- `three` (^0.182.0) - 3D rendering
- `@types/three` (^0.182.0) - TypeScript definitions

## Example Implementation

```typescript
import { Scene3D } from '@/components/configurator/Scene3D';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function BodyConfigurator() {
  const handleSceneReady = (scene, camera, renderer) => {
    // Load body model
    const loader = new GLTFLoader();
    loader.load('/models/body.glb', (gltf) => {
      scene.add(gltf.scene);
    });
  };

  return (
    <Scene3D
      width={1200}
      height={800}
      enableAnimations={true}
      onSceneReady={handleSceneReady}
    />
  );
}
```

## Browser Requirements

- WebGL 2.0 support (modern browsers)
- Shader support (GLSL)
- ~50MB VRAM for high-res shadow maps

## Troubleshooting

### Shadows not appearing
- Verify `enableShadows(scene, renderer)` was called
- Check object has `castShadow = true`
- Ensure ground plane has `receiveShadow = true`

### Performance issues
- Reduce shadow resolution: `2048 → 1024`
- Disable animations: `enableAnimations={false}`
- Profile with browser DevTools

### HDRI loading fails
- Verify file path and CORS headers
- Check browser console for errors
- Ensure HDRI format is supported (.hdr, .exr)

## API Reference

### Lighting Component Props

```typescript
interface LightingProps {
  scene: THREE.Scene;           // Required: Three.js scene
  enableAnimations?: boolean;     // Default: true
}
```

### Scene3D Component Props

```typescript
interface Scene3DProps {
  onSceneReady?: (
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer
  ) => void;
  enableAnimations?: boolean;     // Default: true
  width?: number;                 // Default: 800
  height?: number;                // Default: 600
}
```

### Utility Functions

```typescript
// Enable shadows on all meshes
enableShadows(scene, renderer, options?)

// Load HDRI environment map
loadEnvironmentMap(scene, hdriUrl): Promise<void>

// Get lighting preset
getLightingPreset(name: string): LightingPreset

// Get available presets
getAvailablePresets(): string[]
```

## Next Steps

1. Create material system for parametric body visualization
2. Implement camera controls (orbit, zoom, pan)
3. Add measurement visualization overlays
4. Create real-time parameter adjustment UI
5. Integrate with Python backend for model data

## Related Documentation

- See [LIGHTING_SETUP.md](./LIGHTING_SETUP.md) for detailed lighting configuration
- See [Three.js Documentation](https://threejs.org/docs/) for rendering details
- See SMPL model documentation for body mesh format
