# Lighting Setup Documentation

## Overview

The `Lighting.tsx` component provides a professional three-point lighting setup for 3D model visualization in the SUIT AI configurator. It includes:

- **Key Light**: Primary light source providing main illumination and shadows
- **Fill Light**: Soft light to fill shadows and reduce contrast
- **Back Light**: Rim/separation light to add depth and separation from background
- **Ambient Light**: Base global illumination
- **Environment Map**: Subtle procedural environment for realistic reflections
- **Shadow Configuration**: High-quality shadow mapping with optimized parameters
- **Subtle Animation**: Premium feel with gentle light movement and intensity variation

## Usage

### Basic Setup

```typescript
import { Scene3D } from '@/components/configurator/Scene3D';

export function ConfiguratorView() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Scene3D
        enableAnimations={true}
        width={1200}
        height={800}
        onSceneReady={(scene, camera, renderer) => {
          // Your custom setup here
        }}
      />
    </div>
  );
}
```

### Manual Lighting Setup

If you prefer to set up lighting in an existing Three.js scene:

```typescript
import { Lighting, enableShadows } from '@/components/configurator/Lighting';

// In your React component
const [scene] = useState(() => new THREE.Scene());

useEffect(() => {
  // Lighting component will handle all lighting setup
  const lightingComponent = <Lighting scene={scene} enableAnimations={true} />;

  // Enable shadows on your objects
  enableShadows(scene, renderer);
}, [scene]);
```

## Light Configuration

### Key Light (Main)
- **Position**: (5, 8, 5)
- **Intensity**: 1.2
- **Color**: White (0xffffff)
- **Features**:
  - Casts shadows with high-quality mapping (2048x2048)
  - Shadow bias: -0.001 for sharp shadows
  - Shadow radius: 4 for soft shadow edges
  - Camera frustum optimized for typical object sizes

### Fill Light (Soft)
- **Position**: (-5, 4, 3)
- **Intensity**: 0.6 (animated: 0.5-0.7)
- **Color**: Sky blue (0x87ceeb)
- **Features**: No shadow casting (soft light only)

### Back Light (Rim)
- **Position**: (0, 5, -8)
- **Intensity**: 0.5 (animated: 0.42-0.58)
- **Color**: Orange (0xff9500)
- **Features**: Creates separation between model and background

### Ambient Light
- **Intensity**: 0.3
- **Color**: White (0xffffff)
- **Purpose**: Base illumination, prevents pure black shadows

## Environment Map

The component generates a procedural environment map (canvas-based) with:
- Subtle gradient background
- Noise texture for realism
- sRGB color space for accurate reflections
- Appropriate for materials with metallic/reflective properties

### Using Custom HDRI Maps

For enhanced realism, use the provided utility function to load custom HDRI files:

```typescript
import { loadEnvironmentMap } from '@/components/configurator/Lighting';

// Load a custom HDRI map
await loadEnvironmentMap(scene, '/env/studio_hdri.hdr');
```

**Note**: HDRI files should be placed in `public/env/` directory.

## Shadow Configuration

Shadows are automatically configured for optimal quality:

- **Shadow Map Type**: PCF (Percentage-Closer Filtering)
- **Shadow Map Resolution**: 2048x2048
- **Shadow Bias**: -0.001 (prevents shadow acne)
- **Shadow Radius**: 4 (soft edges)
- **Camera Frustum**: Optimized for ±15 units in XY, 50 units in Z

### Applying Shadows to Objects

```typescript
import { enableShadows } from '@/components/configurator/Lighting';

// Automatically enables shadows on all meshes in scene
enableShadows(scene, renderer, {
  castShadow: true,
  receiveShadow: true,
});

// Or manually on specific objects
mesh.castShadow = true;
mesh.receiveShadow = true;
```

## Animation System

The lighting includes subtle animations for a premium feel:

### Key Light Animation
- Gentle orbital rotation around the model
- Rotation speed: 0.3 radians/second
- Maintains base position with 70% of original radius
- Smooth, continuous motion

### Fill Light Animation
- Intensity varies between 0.5-0.7
- Sinusoidal variation at 0.5 Hz
- Creates subtle breathing effect

### Back Light Animation
- Intensity varies between 0.42-0.58
- Sinusoidal variation at 0.7 Hz with phase offset
- Independent from other lights for realistic effect

### Disabling Animations

```typescript
<Lighting scene={scene} enableAnimations={false} />
```

## Performance Optimization

The lighting setup is optimized for real-time rendering:

1. **Shadow Map Resolution**: 2048x2048 balances quality and performance
2. **Light Count**: Minimal (4 lights) for optimal frame rate
3. **Update Strategy**: Shadows update automatically when needed
4. **Animation**: Uses requestAnimationFrame for smooth 60 FPS
5. **Cleanup**: Proper disposal of textures and resources

## Integration with SMPL/3D Models

The lighting is designed to work with parametric body models (SMPL/SMPL-X):

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/models/body.glb', (gltf) => {
  const model = gltf.scene;

  // Lighting is already set up in the scene
  scene.add(model);

  // Shadows will be automatically applied to the model
  enableShadows(scene, renderer);
});
```

## Troubleshooting

### Shadows Not Appearing
- Ensure `enableShadows()` has been called
- Check that object has `castShadow = true`
- Verify renderer has `shadowMap.enabled = true`

### Lighting Too Dark/Bright
- Adjust individual light intensities in the Lighting component
- Modify ambient light intensity for overall brightness

### Performance Issues
- Reduce shadow map resolution: `2048 → 1024`
- Disable animations: `enableAnimations={false}`
- Reduce light count (remove unnecessary lights)

### HDRI Not Loading
- Verify file path is correct
- Ensure CORS headers are set for external resources
- Check browser console for loading errors

## Future Enhancements

Potential improvements:
- Dynamic light positioning based on model bounding box
- Light intensity presets (studio, outdoor, product)
- Shadow quality settings (low, medium, high)
- Real-time light editor UI
- HDRI map browser integration
- Light gizmos for interactive positioning
