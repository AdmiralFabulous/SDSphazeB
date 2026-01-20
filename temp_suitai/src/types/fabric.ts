/**
 * Fabric types for configurator
 */

export interface Fabric {
  id: string;
  name: string;
  category: string;
  colorHex: string;
  textureUrl?: string;
  imageUrl?: string;
  inStock: boolean;
  price?: number;
}

export interface FabricTexture {
  id: string;
  url: string;
  texture: any; // Three.js Texture
}

export interface FabricSelection {
  fabricId: string | null;
  fabric: Fabric | null;
  texture: FabricTexture | null;
  isLoading: boolean;
  error: string | null;
}
