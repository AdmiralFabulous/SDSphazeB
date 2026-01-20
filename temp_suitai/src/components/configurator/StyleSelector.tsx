'use client';

import { useEffect, useState } from 'react';
import './StyleSelector.css';

interface LapelStyle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
}

interface VentStyle {
  id: string;
  name: string;
  description: string;
  category: string;
  inStock: boolean;
}

interface ButtonOption {
  id: string;
  name: string;
  description: string;
  category: string;
  inStock: boolean;
}

interface StyleSelectorProps {
  onSelectLapel?: (lapel: LapelStyle) => void;
  onSelectVent?: (vent: VentStyle) => void;
  onSelectButton?: (button: ButtonOption) => void;
  selectedLapelId?: string;
  selectedVentId?: string;
  selectedButtonId?: string;
}

export default function StyleSelector({
  onSelectLapel,
  onSelectVent,
  onSelectButton,
  selectedLapelId,
  selectedVentId,
  selectedButtonId,
}: StyleSelectorProps) {
  const [lapels, setLapels] = useState<LapelStyle[]>([]);
  const [vents, setVents] = useState<VentStyle[]>([]);
  const [buttons, setButtons] = useState<ButtonOption[]>([]);
  const [loadingLapels, setLoadingLapels] = useState(true);
  const [loadingVents, setLoadingVents] = useState(true);
  const [loadingButtons, setLoadingButtons] = useState(true);
  const [errorLapels, setErrorLapels] = useState<string | null>(null);
  const [errorVents, setErrorVents] = useState<string | null>(null);
  const [errorButtons, setErrorButtons] = useState<string | null>(null);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  // Fetch lapel styles
  useEffect(() => {
    const fetchLapels = async () => {
      try {
        setLoadingLapels(true);
        const response = await fetch('/api/styles/lapels');
        if (!response.ok) {
          throw new Error('Failed to fetch lapel styles');
        }
        const result = await response.json();
        setLapels(result.data);
        setErrorLapels(null);
      } catch (error) {
        console.error('Error fetching lapels:', error);
        setErrorLapels('Failed to load lapel styles');
      } finally {
        setLoadingLapels(false);
      }
    };

    fetchLapels();
  }, []);

  // Fetch vent styles
  useEffect(() => {
    const fetchVents = async () => {
      try {
        setLoadingVents(true);
        const response = await fetch('/api/styles/vents');
        if (!response.ok) {
          throw new Error('Failed to fetch vent styles');
        }
        const result = await response.json();
        setVents(result.data);
        setErrorVents(null);
      } catch (error) {
        console.error('Error fetching vents:', error);
        setErrorVents('Failed to load vent styles');
      } finally {
        setLoadingVents(false);
      }
    };

    fetchVents();
  }, []);

  // Fetch button options
  useEffect(() => {
    const fetchButtons = async () => {
      try {
        setLoadingButtons(true);
        const response = await fetch('/api/styles/buttons');
        if (!response.ok) {
          throw new Error('Failed to fetch button options');
        }
        const result = await response.json();
        setButtons(result.data);
        setErrorButtons(null);
      } catch (error) {
        console.error('Error fetching buttons:', error);
        setErrorButtons('Failed to load button options');
      } finally {
        setLoadingButtons(false);
      }
    };

    fetchButtons();
  }, []);

  const filterAvailable = (items: any[]) => {
    return showOutOfStock ? items : items.filter((item) => item.inStock);
  };

  const renderStyleOption = (
    option: LapelStyle | VentStyle | ButtonOption,
    isSelected: boolean,
    onSelect: (item: any) => void,
    showImage: boolean = false
  ) => {
    const imageSrc = (option as LapelStyle).imageUrl;

    return (
      <div
        key={option.id}
        className={`style-option ${isSelected ? 'selected' : ''} ${!option.inStock ? 'out-of-stock' : ''}`}
        onClick={() => option.inStock && onSelect(option)}
        role="button"
        tabIndex={0}
      >
        {showImage && imageSrc && (
          <div className="style-image">
            <img src={imageSrc} alt={option.name} />
          </div>
        )}
        <div className="style-content">
          <h4 className="style-name">{option.name}</h4>
          <p className="style-category">{option.category}</p>
          <p className="style-description">{option.description}</p>
          {!option.inStock && <span className="stock-badge">Out of Stock</span>}
        </div>
        {isSelected && (
          <div className="selection-indicator">
            <svg
              className="checkmark"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="style-selector-container">
      <div className="style-selector-header">
        <h2>Style Options</h2>
        <label className="show-out-of-stock">
          <input
            type="checkbox"
            checked={showOutOfStock}
            onChange={(e) => setShowOutOfStock(e.target.checked)}
          />
          Show Out of Stock
        </label>
      </div>

      {/* Lapel Styles Section */}
      <section className="style-section">
        <div className="section-header">
          <h3>Lapel Styles</h3>
          {loadingLapels && <span className="loading">Loading...</span>}
          {errorLapels && <span className="error">{errorLapels}</span>}
        </div>
        {!loadingLapels && !errorLapels && (
          <div className="style-grid">
            {filterAvailable(lapels).length > 0 ? (
              filterAvailable(lapels).map((lapel) =>
                renderStyleOption(
                  lapel,
                  selectedLapelId === lapel.id,
                  onSelectLapel || (() => {}),
                  true
                )
              )
            ) : (
              <div className="no-options">No lapel styles available</div>
            )}
          </div>
        )}
      </section>

      {/* Vent Styles Section */}
      <section className="style-section">
        <div className="section-header">
          <h3>Vent Styles</h3>
          {loadingVents && <span className="loading">Loading...</span>}
          {errorVents && <span className="error">{errorVents}</span>}
        </div>
        {!loadingVents && !errorVents && (
          <div className="style-grid">
            {filterAvailable(vents).length > 0 ? (
              filterAvailable(vents).map((vent) =>
                renderStyleOption(
                  vent,
                  selectedVentId === vent.id,
                  onSelectVent || (() => {})
                )
              )
            ) : (
              <div className="no-options">No vent styles available</div>
            )}
          </div>
        )}
      </section>

      {/* Button Options Section */}
      <section className="style-section">
        <div className="section-header">
          <h3>Button Options</h3>
          {loadingButtons && <span className="loading">Loading...</span>}
          {errorButtons && <span className="error">{errorButtons}</span>}
        </div>
        {!loadingButtons && !errorButtons && (
          <div className="style-grid">
            {filterAvailable(buttons).length > 0 ? (
              filterAvailable(buttons).map((button) =>
                renderStyleOption(
                  button,
                  selectedButtonId === button.id,
                  onSelectButton || (() => {})
                )
              )
            ) : (
              <div className="no-options">No button options available</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
