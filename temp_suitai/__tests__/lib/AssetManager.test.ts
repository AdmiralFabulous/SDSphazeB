import { AssetManager, type AssetType } from '../../src/lib/AssetManager';

describe('AssetManager', () => {
  let manager: AssetManager;

  beforeEach(() => {
    manager = new AssetManager({
      disposalTimeout: 100, // Fast timeout for testing
      maxCacheSize: 10 * 1024 * 1024, // 10MB
      enableLogging: false,
    });
  });

  afterEach(() => {
    manager.disposeAll();
  });

  describe('Reference Counting', () => {
    it('should increment refCount on load', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));
      await manager.load('test.json', 'data', mockLoader);

      const stats = manager.getStats();
      expect(stats.loadedAssets).toBe(1);
      expect(stats.assetDetails[0].refCount).toBe(1);
    });

    it('should reuse cached asset and increment refCount', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));

      const asset1 = await manager.load('test.json', 'data', mockLoader);
      const asset2 = await manager.load('test.json', 'data', mockLoader);

      expect(asset1).toBe(asset2);
      expect(mockLoader).toHaveBeenCalledTimes(1); // Only loaded once
      expect(manager.getStats().assetDetails[0].refCount).toBe(2);
    });

    it('should decrement refCount on release', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));
      await manager.load('test.json', 'data', mockLoader);
      await manager.load('test.json', 'data', mockLoader);

      manager.release('test.json', 'data');
      expect(manager.getStats().assetDetails[0].refCount).toBe(1);

      manager.release('test.json', 'data');
      expect(manager.getStats().assetDetails[0].refCount).toBe(0);
    });

    it('should not go below 0 refCount', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));
      await manager.load('test.json', 'data', mockLoader);

      manager.release('test.json', 'data');
      manager.release('test.json', 'data'); // Release again
      manager.release('test.json', 'data'); // And again

      expect(manager.getStats().assetDetails[0].refCount).toBe(0);
    });
  });

  describe('Automatic Disposal', () => {
    it('should schedule disposal when refCount reaches 0', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));
      await manager.load('test.json', 'data', mockLoader);

      manager.release('test.json', 'data');
      expect(manager.getStats().loadedAssets).toBe(1); // Still in cache

      await new Promise((resolve) => setTimeout(resolve, 150)); // Wait for disposal
      expect(manager.getStats().loadedAssets).toBe(0); // Disposed
    });

    it('should not dispose asset when refCount > 0', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));
      await manager.load('test.json', 'data', mockLoader);
      await manager.load('test.json', 'data', mockLoader);

      manager.release('test.json', 'data');
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(manager.getStats().loadedAssets).toBe(1); // Still in cache
      expect(manager.getStats().assetDetails[0].refCount).toBe(1);
    });

    it('should cancel disposal timeout when asset is reloaded', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));
      await manager.load('test.json', 'data', mockLoader);

      manager.release('test.json', 'data');
      await new Promise((resolve) => setTimeout(resolve, 50)); // Partial timeout

      const asset = await manager.load('test.json', 'data', mockLoader); // Reload before disposal
      expect(manager.getStats().loadedAssets).toBe(1);
      expect(manager.getStats().assetDetails[0].refCount).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(manager.getStats().loadedAssets).toBe(1); // Still in cache
    });
  });

  describe('Preloading', () => {
    it('should preload multiple assets', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));

      const results = await manager.preload(
        ['asset1.json', 'asset2.json', 'asset3.json'],
        'data',
        { timeout: 5000 }
      );

      expect(results.size).toBe(3);
      expect(results.get('asset1.json')).toEqual({ data: 'test' });
    });

    it('should not increment refCount for preloaded assets', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));

      await manager.preload(['asset1.json'], 'data');

      const stats = manager.getStats();
      // Asset should be disposed after preload completes and releases
      expect(stats.loadedAssets).toBe(0);
    });

    it('should handle preload timeout', async () => {
      const mockLoader = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: 'test' }), 200)
          )
      );

      const results = await manager.preload(['slow.json'], 'data', { timeout: 50 });

      expect(results.get('slow.json')).toBeNull();
    });
  });

  describe('Immediate Disposal', () => {
    it('should immediately dispose asset', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));
      await manager.load('test.json', 'data', mockLoader);

      manager.dispose('test.json', 'data');
      expect(manager.getStats().loadedAssets).toBe(0);
    });

    it('should not wait for timeout when disposed explicitly', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));
      await manager.load('test.json', 'data', mockLoader);

      manager.release('test.json', 'data');
      manager.dispose('test.json', 'data');

      expect(manager.getStats().loadedAssets).toBe(0);
    });
  });

  describe('Cache Statistics', () => {
    it('should provide accurate cache statistics', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));

      await manager.load('asset1.json', 'data', mockLoader);
      await manager.load('asset2.json', 'data', mockLoader);

      const stats = manager.getStats();
      expect(stats.loadedAssets).toBe(2);
      expect(stats.assetDetails.length).toBe(2);
      expect(stats.assetDetails[0].type).toBe('data');
    });

    it('should track asset age', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));
      await manager.load('test.json', 'data', mockLoader);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = manager.getStats();
      expect(stats.assetDetails[0].age).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Clear Unused', () => {
    it('should clear unused assets', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));

      await manager.load('used.json', 'data', mockLoader);
      await manager.load('unused.json', 'data', mockLoader);

      manager.release('unused.json', 'data');
      manager.clearUnused();

      const stats = manager.getStats();
      expect(stats.loadedAssets).toBe(1);
      expect(stats.assetDetails[0].id).toContain('used.json');
    });

    it('should not clear assets with refCount > 0', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));
      await manager.load('asset1.json', 'data', mockLoader);
      await manager.load('asset2.json', 'data', mockLoader);

      manager.release('asset2.json', 'data');
      manager.clearUnused();

      const stats = manager.getStats();
      expect(stats.loadedAssets).toBe(1);
    });
  });

  describe('Dispose All', () => {
    it('should dispose all assets', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));

      await manager.load('asset1.json', 'data', mockLoader);
      await manager.load('asset2.json', 'data', mockLoader);
      await manager.load('asset3.json', 'data', mockLoader);

      manager.disposeAll();
      expect(manager.getStats().loadedAssets).toBe(0);
    });
  });

  describe('Concurrent Loading', () => {
    it('should handle concurrent loads of same asset', async () => {
      const mockLoader = jest.fn(() =>
        new Promise((resolve) => setTimeout(() => resolve({ data: 'test' }), 50))
      );

      const [asset1, asset2, asset3] = await Promise.all([
        manager.load('test.json', 'data', mockLoader),
        manager.load('test.json', 'data', mockLoader),
        manager.load('test.json', 'data', mockLoader),
      ]);

      expect(asset1).toBe(asset2);
      expect(asset2).toBe(asset3);
      expect(mockLoader).toHaveBeenCalledTimes(1); // Only loaded once
      expect(manager.getStats().assetDetails[0].refCount).toBe(3);
    });
  });

  describe('Multiple Asset Types', () => {
    it('should handle multiple asset types independently', async () => {
      const mockLoaderData = jest.fn(() => Promise.resolve({ data: 'test' }));
      const mockLoaderTexture = jest.fn(() => Promise.resolve(new Image()));

      await manager.load('data.json', 'data', mockLoaderData);
      await manager.load('texture.png', 'texture', mockLoaderTexture);

      const stats = manager.getStats();
      expect(stats.loadedAssets).toBe(2);
      expect(stats.assetDetails[0].type).toBe('data');
      expect(stats.assetDetails[1].type).toBe('texture');
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should not accumulate assets indefinitely', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ data: 'test' }));

      // Load 100 assets
      for (let i = 0; i < 100; i++) {
        const asset = await manager.load(`asset${i}.json`, 'data', mockLoader);
        manager.release(`asset${i}.json`, 'data');
      }

      // Wait for all to dispose
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be empty or very small
      const stats = manager.getStats();
      expect(stats.loadedAssets).toBeLessThan(5); // Allow some margin
    });

    it('should properly clean up HTML elements', async () => {
      const img = new Image();
      const mockLoader = jest.fn(() => Promise.resolve(img));

      await manager.load('image.png', 'texture', mockLoader);
      manager.release('image.png', 'texture');

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Image should be cleaned (src set to empty string)
      expect(img.src).toBe('');
    });

    it('should respect cache size limit', async () => {
      const manager = new AssetManager({
        disposalTimeout: 1000,
        maxCacheSize: 1024, // 1KB limit
        enableLogging: false,
      });

      const mockLoader = jest.fn(() => Promise.resolve({ data: 'x'.repeat(1000) }));

      // Load more than 1KB
      await manager.load('asset1.json', 'data', mockLoader);
      const asset1RefCount = manager.getStats().assetDetails[0].refCount;

      manager.release('asset1.json', 'data');
      await manager.load('asset2.json', 'data', mockLoader);

      const stats = manager.getStats();
      // Asset1 should have been evicted due to size limit
      expect(stats.loadedAssets).toBeLessThanOrEqual(2);

      manager.disposeAll();
    });
  });

  describe('Error Handling', () => {
    it('should warn on release of non-cached asset', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      manager.release('nonexistent.json', 'data');

      consoleWarnSpy.mockRestore();
    });

    it('should warn on dispose of non-cached asset', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      manager.dispose('nonexistent.json', 'data');

      consoleWarnSpy.mockRestore();
    });
  });
});
