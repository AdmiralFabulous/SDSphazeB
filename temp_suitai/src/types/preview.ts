/**
 * Types for 3D Preview API Response
 */

export interface PreviewTextures {
  baseUrl: string;
  diffuse: string;
  normal: string;
  roughness: string;
  ao: string;
}

export interface PreviewMeshes {
  jacket: string;
  trousers: string;
  vest: string | null;
}

export interface PreviewMaterials {
  fabricColor: string;
  liningColor: string;
  buttonMetal: string;
}

export interface PreviewScene {
  environment: string;
  lightingPreset: string;
}

export interface PreviewData {
  configId: string;
  textures: PreviewTextures;
  meshes: PreviewMeshes;
  materials: PreviewMaterials;
  scene: PreviewScene;
}

/**
 * Style JSON structure (stored in suit_configs.style_json)
 */
export interface JacketStyle {
  lapel?: 'notch' | 'peak' | 'shawl';
  buttons?: 1 | 2 | 3;
  vents?: 'none' | 'single' | 'double';
  lining_color?: string;
}

export interface TrousersStyle {
  fit?: 'slim' | 'regular' | 'relaxed';
  pleats?: 'flat' | 'single' | 'double';
}

export interface VestStyle {
  included?: boolean;
  buttons?: 5 | 6;
}

export interface StyleJson {
  jacket?: JacketStyle;
  trousers?: TrousersStyle;
  vest?: VestStyle;
}
