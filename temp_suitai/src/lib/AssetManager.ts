/**
 * Asset Manager - Handles lazy loading, caching, and disposal of assets with reference counting
 * Prevents memory leaks through automatic disposal after timeout
 */

type AssetType = 'texture' | 'model' | 'shader' | 'audio' | 'data';

interface AssetMetadata {
  id: string;
  type: AssetType;
  url: string;
  loadedAt: number;
  refCount: number;
  size?: number;
  disposalTimeoutId?: NodeJS.Timeout;
  disposed: boolean;
}

interface AssetManagerConfig {
  disposalTimeout: number; // milliseconds before auto-disposal
  maxCacheSize?: number; // maximum cache size in bytes
  enableLogging?: boolean;
}

interface PreloadOptions {
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
}

class AssetManager {
  private cache: Map<string, { asset: any; metadata: AssetMetadata }> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private config: AssetManagerConfig;
  private totalCacheSize: number = 0;

  constructor(config: AssetManagerConfig) {
    this.config = {
      disposalTimeout: 60000, // default 60 seconds
      enableLogging: false,
      ...config,
    };
  }

  /**
   * Load an asset, with caching and reference counting
   */
  async load<T = any>(url: string, type: AssetType, loader?: (url: string) => Promise<T>): Promise<T> {
    const assetId = this.getAssetId(url, type);

    // Check if already loaded
    if (this.cache.has(assetId)) {
      const entry = this.cache.get(assetId)!;
      entry.metadata.refCount++;
      this.clearDisposalTimeout(entry.metadata);
      this.log(`Asset incremented: ${assetId} (refCount: ${entry.metadata.refCount})`);
      return entry.asset;
    }

    // Check if currently loading
    if (this.loadingPromises.has(assetId)) {
      this.log(`Reusing in-flight load: ${assetId}`);
      return this.loadingPromises.get(assetId)!;
    }

    // Load asset
    const loadPromise = this.loadAsset(assetId, url, type, loader);
    this.loadingPromises.set(assetId, loadPromise);

    try {
      const asset = await loadPromise;
      return asset;
    } finally {
      this.loadingPromises.delete(assetId);
    }
  }

  /**
   * Release reference to asset - will be auto-disposed after timeout
   */
  release(url: string, type: AssetType): void {
    const assetId = this.getAssetId(url, type);
    const entry = this.cache.get(assetId);

    if (!entry) {
      this.log(`Warning: Release called on non-cached asset: ${assetId}`);
      return;
    }

    entry.metadata.refCount = Math.max(0, entry.metadata.refCount - 1);
    this.log(`Asset released: ${assetId} (refCount: ${entry.metadata.refCount})`);

    // Schedule disposal if no more references
    if (entry.metadata.refCount === 0) {
      this.scheduleDisposal(entry.metadata);
    }
  }

  /**
   * Preload assets without incrementing reference count
   */
  async preload(urls: string[], type: AssetType, options: PreloadOptions = {}): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    // Sort by priority
    const sortedUrls = urls.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return (priorityOrder[options.priority || 'normal'] as number) - (priorityOrder[options.priority || 'normal'] as number);
    });

    for (const url of sortedUrls) {
      try {
        const asset = await Promise.race([
          this.load(url, type),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Preload timeout for ${url}`)), options.timeout || 30000)
          ),
        ]);
        results.set(url, asset);
        // Release immediately since preload doesn't hold reference
        this.release(url, type);
      } catch (error) {
        this.log(`Failed to preload ${url}: ${error}`);
        results.set(url, null);
      }
    }

    return results;
  }

  /**
   * Immediately dispose asset regardless of refCount
   */
  dispose(url: string, type: AssetType): void {
    const assetId = this.getAssetId(url, type);
    const entry = this.cache.get(assetId);

    if (!entry) {
      this.log(`Warning: Dispose called on non-cached asset: ${assetId}`);
      return;
    }

    this.disposeAsset(entry.metadata);
    this.cache.delete(assetId);
    this.log(`Asset disposed: ${assetId}`);
  }

  /**
   * Dispose all assets
   */
  disposeAll(): void {
    for (const [assetId, entry] of this.cache.entries()) {
      this.disposeAsset(entry.metadata);
    }
    this.cache.clear();
    this.loadingPromises.clear();
    this.totalCacheSize = 0;
    this.log('All assets disposed');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    loadedAssets: number;
    totalSize: number;
    assetDetails: Array<{
      id: string;
      type: AssetType;
      refCount: number;
      size?: number;
      age: number;
    }>;
  } {
    const assetDetails = Array.from(this.cache.values()).map((entry) => ({
      id: entry.metadata.id,
      type: entry.metadata.type,
      refCount: entry.metadata.refCount,
      size: entry.metadata.size,
      age: Date.now() - entry.metadata.loadedAt,
    }));

    return {
      loadedAssets: this.cache.size,
      totalSize: this.totalCacheSize,
      assetDetails,
    };
  }

  /**
   * Clear cache of unreferenced assets
   */
  clearUnused(): void {
    let clearedCount = 0;
    for (const [assetId, entry] of this.cache.entries()) {
      if (entry.metadata.refCount === 0) {
        this.disposeAsset(entry.metadata);
        this.cache.delete(assetId);
        clearedCount++;
      }
    }
    this.log(`Cleared ${clearedCount} unused assets`);
  }

  // Private helpers

  private async loadAsset<T = any>(
    assetId: string,
    url: string,
    type: AssetType,
    loader?: (url: string) => Promise<T>
  ): Promise<T> {
    this.log(`Loading asset: ${assetId}`);

    let asset: T;

    if (loader) {
      asset = await loader(url);
    } else {
      asset = await this.defaultLoader(url, type);
    }

    const metadata: AssetMetadata = {
      id: assetId,
      type,
      url,
      loadedAt: Date.now(),
      refCount: 1,
      size: this.estimateSize(asset),
      disposed: false,
    };

    this.cache.set(assetId, { asset, metadata });
    this.totalCacheSize += metadata.size || 0;

    // Enforce cache size limit
    if (this.config.maxCacheSize && this.totalCacheSize > this.config.maxCacheSize) {
      this.evictLRU();
    }

    this.log(`Asset loaded: ${assetId} (size: ${metadata.size})`);
    return asset;
  }

  private defaultLoader(url: string, type: AssetType): Promise<any> {
    if (typeof window === 'undefined') {
      // Server-side fallback
      return Promise.resolve(null);
    }

    switch (type) {
      case 'texture':
        return this.loadImage(url);
      case 'audio':
        return this.loadAudio(url);
      case 'data':
        return fetch(url).then((res) => res.json());
      default:
        return Promise.reject(new Error(`Unsupported asset type: ${type}`));
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  private loadAudio(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
      audio.src = url;
      audio.load();
    });
  }

  private scheduleDisposal(metadata: AssetMetadata): void {
    if (metadata.disposalTimeoutId) {
      clearTimeout(metadata.disposalTimeoutId);
    }

    metadata.disposalTimeoutId = setTimeout(() => {
      if (!metadata.disposed && this.cache.has(metadata.id)) {
        this.disposeAsset(metadata);
        this.cache.delete(metadata.id);
        this.log(`Asset auto-disposed: ${metadata.id}`);
      }
    }, this.config.disposalTimeout);

    this.log(`Disposal scheduled for: ${metadata.id} (timeout: ${this.config.disposalTimeout}ms)`);
  }

  private clearDisposalTimeout(metadata: AssetMetadata): void {
    if (metadata.disposalTimeoutId) {
      clearTimeout(metadata.disposalTimeoutId);
      metadata.disposalTimeoutId = undefined;
    }
  }

  private disposeAsset(metadata: AssetMetadata): void {
    this.clearDisposalTimeout(metadata);

    // Clean up asset-specific resources
    const entry = this.cache.get(metadata.id);
    if (entry?.asset) {
      const asset = entry.asset;

      if (asset instanceof HTMLImageElement) {
        asset.src = '';
      } else if (asset instanceof HTMLAudioElement) {
        asset.pause();
        asset.src = '';
      } else if (asset instanceof WebGLTexture || asset instanceof WebGLProgram || asset instanceof WebGLBuffer) {
        // Would need WebGL context to properly dispose
        this.log(`WebGL resource cleanup needed for: ${metadata.id}`);
      }
    }

    this.totalCacheSize = Math.max(0, this.totalCacheSize - (metadata.size || 0));
    metadata.disposed = true;
  }

  private evictLRU(): void {
    let lruEntry: [string, { asset: any; metadata: AssetMetadata }] | null = null;
    let oldestTime = Infinity;

    for (const entry of this.cache.entries()) {
      if (entry[1].metadata.refCount === 0 && entry[1].metadata.loadedAt < oldestTime) {
        oldestTime = entry[1].metadata.loadedAt;
        lruEntry = entry;
      }
    }

    if (lruEntry) {
      const [assetId, entry] = lruEntry;
      this.disposeAsset(entry.metadata);
      this.cache.delete(assetId);
      this.log(`LRU eviction: ${assetId}`);
    }
  }

  private getAssetId(url: string, type: AssetType): string {
    return `${type}:${url}`;
  }

  private estimateSize(asset: any): number {
    if (asset instanceof HTMLImageElement) {
      return (asset.width * asset.height * 4) / 1024 / 1024; // Estimate in MB
    }
    if (asset instanceof HTMLAudioElement) {
      return 5; // Rough estimate
    }
    if (typeof asset === 'object' && asset !== null) {
      return JSON.stringify(asset).length / 1024; // KB
    }
    return 0;
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[AssetManager] ${message}`);
    }
  }
}

// Export singleton instance
const assetManager = new AssetManager({
  disposalTimeout: 60000,
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  enableLogging: process.env.NODE_ENV === 'development',
});

export { AssetManager, type AssetType, type AssetManagerConfig, type PreloadOptions };
export default assetManager;
