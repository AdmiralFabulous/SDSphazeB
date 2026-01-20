/**
 * Fabric Selector Component
 * Demonstrates fabric selection with texture loading and 3D view re-render
 *
 * Usage:
 * ```tsx
 * <FabricProvider>
 *   <FabricSelector />
 * </FabricProvider>
 * ```
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useFabricTexture } from '@/hooks/useFabricTexture';
import { useFabricStore } from '@/store';
import type { Fabric } from '@/types/fabric';

interface FabricSelectorProps {
  onTextureChange?: (fabricId: string, texture: any) => void;
}

/**
 * Component for selecting fabrics and loading textures
 * Triggers 3D view re-render when selection changes
 */
export function FabricSelector({ onTextureChange }: FabricSelectorProps) {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [isLoadingFabrics, setIsLoadingFabrics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fabricStore = useFabricStore();

  // Initialize fabric texture hook
  const { selectFabric, selectedFabric, texture, isLoading, error: textureError, clearSelection } =
    useFabricTexture({
      onTextureLoaded: (loadedTexture) => {
        // Trigger 3D view re-render
        if (onTextureChange && selectedFabric) {
          onTextureChange(selectedFabric.id, loadedTexture);
        }
      },
      onError: (err) => {
        setError(err);
        fabricStore.setError(err);
      },
      onLoadingChange: (loading) => {
        fabricStore.setLoading(loading);
      },
    });

  // Fetch available fabrics
  useEffect(() => {
    const fetchFabrics = async () => {
      try {
        setIsLoadingFabrics(true);
        // Mock data - replace with API call
        const mockFabrics: Fabric[] = [
          {
            id: 'fabric-1',
            name: 'Premium Cotton',
            category: 'Natural',
            colorHex: '#F5DEB3',
            textureUrl: 'https://via.placeholder.com/512?text=Cotton',
            inStock: true,
            price: 25,
          },
          {
            id: 'fabric-2',
            name: 'Silk Blend',
            category: 'Premium',
            colorHex: '#E0E0E0',
            textureUrl: 'https://via.placeholder.com/512?text=Silk',
            inStock: true,
            price: 45,
          },
          {
            id: 'fabric-3',
            name: 'Athletic Mesh',
            category: 'Performance',
            colorHex: '#4A90E2',
            textureUrl: 'https://via.placeholder.com/512?text=Mesh',
            inStock: true,
            price: 35,
          },
        ];

        setFabrics(mockFabrics);
        fabricStore.setFabrics(mockFabrics);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load fabrics';
        setError(errorMessage);
      } finally {
        setIsLoadingFabrics(false);
      }
    };

    fetchFabrics();
  }, [fabricStore]);

  const handleSelectFabric = async (fabric: Fabric) => {
    try {
      setError(null);
      // Call hook to load texture and update selection
      await selectFabric(fabric);
      // Store updates immediately via callback
      fabricStore.selectFabric(fabric, null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select fabric';
      setError(errorMessage);
    }
  };

  return (
    <div className="fabric-selector">
      <h2>Select Fabric</h2>

      {/* Loading state */}
      {isLoadingFabrics && <p className="loading">Loading fabrics...</p>}

      {/* Error state */}
      {error && <div className="error">{error}</div>}
      {textureError && <div className="error">{textureError}</div>}

      {/* Fabric grid */}
      <div className="fabric-grid">
        {fabrics.map((fabric) => (
          <div
            key={fabric.id}
            className={`fabric-item ${
              selectedFabric?.id === fabric.id ? 'selected' : ''
            } ${isLoading ? 'loading' : ''}`}
            onClick={() => handleSelectFabric(fabric)}
          >
            {/* Color swatch */}
            <div
              className="fabric-swatch"
              style={{
                backgroundColor: fabric.colorHex,
              }}
            >
              {isLoading && selectedFabric?.id === fabric.id && (
                <div className="loading-spinner">⏳</div>
              )}
            </div>

            {/* Fabric info */}
            <div className="fabric-info">
              <h3>{fabric.name}</h3>
              <p>{fabric.category}</p>
              {fabric.price && <p className="price">${fabric.price}</p>}
            </div>

            {/* Selection indicator */}
            {selectedFabric?.id === fabric.id && (
              <div className="selection-indicator">✓</div>
            )}
          </div>
        ))}
      </div>

      {/* Selected fabric preview */}
      {selectedFabric && (
        <div className="selected-preview">
          <h3>Selected: {selectedFabric.name}</h3>
          {texture && (
            <div className="texture-preview">
              <canvas
                width={128}
                height={128}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>
          )}
          <button onClick={clearSelection} className="clear-btn">
            Clear Selection
          </button>
        </div>
      )}

      <style>{`
        .fabric-selector {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .fabric-selector h2 {
          margin-top: 0;
          color: #333;
        }

        .loading,
        .error {
          padding: 12px;
          margin: 12px 0;
          border-radius: 4px;
        }

        .loading {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .error {
          background-color: #ffebee;
          color: #c62828;
        }

        .fabric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
          margin: 20px 0;
        }

        .fabric-item {
          cursor: pointer;
          border: 2px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .fabric-item:hover {
          border-color: #999;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .fabric-item.selected {
          border-color: #4a90e2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
        }

        .fabric-swatch {
          width: 100%;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .fabric-info {
          padding: 8px;
          background: white;
        }

        .fabric-info h3 {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #333;
        }

        .fabric-info p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }

        .fabric-info .price {
          font-weight: bold;
          color: #4a90e2;
        }

        .selection-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #4a90e2;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .selected-preview {
          margin-top: 20px;
          padding: 16px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .selected-preview h3 {
          margin-top: 0;
          color: #333;
        }

        .texture-preview {
          margin: 12px 0;
          display: flex;
          justify-content: center;
        }

        .clear-btn {
          padding: 8px 16px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }

        .clear-btn:hover {
          background: #d32f2f;
        }

        @media (max-width: 600px) {
          .fabric-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
