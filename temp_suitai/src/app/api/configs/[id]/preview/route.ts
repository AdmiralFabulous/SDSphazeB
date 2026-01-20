import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type {
  PreviewData,
  StyleJson,
  JacketStyle,
  TrousersStyle,
  VestStyle,
} from '@/types/preview';

/**
 * GET /api/configs/:id/preview
 *
 * Returns complete preview data for 3D rendering including:
 * - Texture map URLs (diffuse, normal, roughness, AO)
 * - Mesh variant identifiers based on style options
 * - Material parameters (colors, button metal)
 * - Scene settings (environment, lighting)
 *
 * Optimized for fast 3D loading in configurator.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: configId } = await params;

    // Fetch configuration with fabric details
    const config = await prisma.suitConfig.findUnique({
      where: { id: configId },
      include: {
        fabric: true,
      },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Parse style JSON
    let styleJson: StyleJson = {};
    try {
      styleJson = JSON.parse(config.styleJson);
    } catch (error) {
      console.error('Failed to parse style JSON:', error);
      // Continue with empty style, will use defaults
    }

    // Build texture URLs from fabric base URL
    const baseUrl = config.fabric.textureUrl || '';
    const textures = {
      baseUrl,
      diffuse: `${baseUrl}/diffuse.jpg`,
      normal: `${baseUrl}/normal.jpg`,
      roughness: `${baseUrl}/roughness.jpg`,
      ao: `${baseUrl}/ao.jpg`,
    };

    // Generate mesh variant identifiers based on style
    const meshes = {
      jacket: getMeshVariant('jacket', styleJson.jacket),
      trousers: getMeshVariant('trousers', styleJson.trousers),
      vest: styleJson.vest?.included
        ? getMeshVariant('vest', styleJson.vest)
        : null,
    };

    // Build material parameters
    const materials = {
      fabricColor: config.fabric.colorHex || '#1a1a2e',
      liningColor: styleJson.jacket?.lining_color || '#1a1a2e',
      buttonMetal: 'brass', // Default button metal
    };

    // Scene configuration
    const scene = {
      environment: 'studio',
      lightingPreset: 'product',
    };

    // Construct complete preview data
    const previewData: PreviewData = {
      configId: config.id,
      textures,
      meshes,
      materials,
      scene,
    };

    return NextResponse.json(previewData, { status: 200 });
  } catch (error) {
    console.error('Preview endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate mesh variant file name based on garment type and style options
 *
 * Maps style parameters to specific 3D mesh files (GLB format).
 * Falls back to default variants when style options are not specified.
 */
function getMeshVariant(
  garment: 'jacket' | 'trousers' | 'vest',
  style: JacketStyle | TrousersStyle | VestStyle | undefined
): string {
  if (garment === 'jacket') {
    const jacketStyle = style as JacketStyle | undefined;
    const lapel = jacketStyle?.lapel || 'notch';
    const buttons = jacketStyle?.buttons || 2;
    const vents = jacketStyle?.vents || 'double';
    return `jacket_${lapel}_${buttons}btn_${vents}vent.glb`;
  }

  if (garment === 'trousers') {
    const trousersStyle = style as TrousersStyle | undefined;
    const fit = trousersStyle?.fit || 'slim';
    const pleats = trousersStyle?.pleats || 'flat';
    return `trousers_${fit}_${pleats}.glb`;
  }

  if (garment === 'vest') {
    const vestStyle = style as VestStyle | undefined;
    const buttons = vestStyle?.buttons || 5;
    return `vest_${buttons}btn.glb`;
  }

  // Fallback for any unknown garment type
  return `${garment}_default.glb`;
}
