import React, { useState, useEffect } from 'react';
import './FabricSelector.css';

interface Fabric {
  id: string;
  name: string;
  category: string;
  colorHex: string;
  imageUrl?: string;
  inStock: boolean;
}

interface FabricSelectorProps {
  onSelectFabric?: (fabric: Fabric) => void;
  selectedFabricId?: string;
}

export const FabricSelector: React.FC<FabricSelectorProps> = ({
  onSelectFabric,
  selectedFabricId,
}) => {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedFabricId);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  useEffect(() => {
    fetchFabrics();
  }, []);

  const fetchFabrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/fabrics');

      if (!response.ok) {
        throw new Error('Failed to fetch fabrics');
      }

      const data = await response.json();
      setFabrics(data.fabrics);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.fabrics.map((f: Fabric) => f.category))
      ).sort();
      setCategories(uniqueCategories as string[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFabrics = (): Fabric[] => {
    return fabrics.filter((fabric) => {
      if (selectedCategory && fabric.category !== selectedCategory) {
        return false;
      }
      if (!showOutOfStock && !fabric.inStock) {
        return false;
      }
      return true;
    });
  };

  const handleFabricClick = (fabric: Fabric) => {
    if (!fabric.inStock) return;

    setSelectedId(fabric.id);
    onSelectFabric?.(fabric);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleOutOfStockToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowOutOfStock(e.target.checked);
  };

  const filteredFabrics = getFilteredFabrics();

  if (loading) {
    return <div className="fabric-selector-container">Loading fabrics...</div>;
  }

  if (error) {
    return (
      <div className="fabric-selector-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchFabrics}>Retry</button>
      </div>
    );
  }

  return (
    <div className="fabric-selector-container">
      <h2>Select a Fabric</h2>

      <div className="fabric-selector-controls">
        <div className="control-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group checkbox">
          <input
            type="checkbox"
            id="show-out-of-stock"
            checked={showOutOfStock}
            onChange={handleOutOfStockToggle}
          />
          <label htmlFor="show-out-of-stock">Show Out of Stock</label>
        </div>
      </div>

      <div className="fabric-grid">
        {filteredFabrics.length > 0 ? (
          filteredFabrics.map((fabric) => (
            <div
              key={fabric.id}
              className={`fabric-swatch ${
                selectedId === fabric.id ? 'selected' : ''
              } ${!fabric.inStock ? 'out-of-stock' : ''}`}
              onClick={() => handleFabricClick(fabric)}
            >
              <div
                className="swatch-preview"
                style={{
                  backgroundColor: fabric.colorHex,
                  backgroundImage: fabric.imageUrl
                    ? `url('${fabric.imageUrl}')`
                    : undefined,
                }}
                title={fabric.name}
              />
              <div className="swatch-info">
                <p className="swatch-name">{fabric.name}</p>
                <p className="swatch-category">{fabric.category}</p>
                {!fabric.inStock && (
                  <p className="swatch-status">Out of Stock</p>
                )}
              </div>
              {selectedId === fabric.id && (
                <div className="selection-indicator">✓</div>
              )}
            </div>
          ))
        ) : (
          <div className="no-fabrics-message">
            No fabrics match your filters
          </div>
        )}
      </div>

      {selectedId && (
        <div className="selection-summary">
          <p>
            Selected:{' '}
            <strong>
              {fabrics.find((f) => f.id === selectedId)?.name}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
};
