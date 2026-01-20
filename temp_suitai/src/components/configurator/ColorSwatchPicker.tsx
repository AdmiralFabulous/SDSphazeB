import React, { useState } from 'react'
import { ColorSwatch } from './types/configurator.types'
import './styles/ColorSwatchPicker.css'

interface ColorSwatchPickerProps {
  swatches: ColorSwatch[]
  selectedColor: ColorSwatch | null
  onColorSelect: (color: ColorSwatch) => void
  enableCustomColor?: boolean
  onCustomColorSelect?: (hex: string) => void
}

export const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({
  swatches,
  selectedColor,
  onColorSelect,
  enableCustomColor = true,
  onCustomColorSelect,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customHex, setCustomHex] = useState('#000000')

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    setCustomHex(hex)
    onCustomColorSelect?.(hex)
  }

  const handleCustomColorApply = () => {
    onCustomColorSelect?.(customHex)
    setShowCustomPicker(false)
  }

  return (
    <div className="color-swatch-picker">
      <div className="swatches-grid">
        {swatches.map((swatch) => (
          <button
            key={swatch.id}
            className={`swatch ${selectedColor?.id === swatch.id ? 'selected' : ''}`}
            style={{ backgroundColor: swatch.hex }}
            onClick={() => onColorSelect(swatch)}
            title={swatch.name}
            aria-label={`Select ${swatch.name}`}
          >
            {selectedColor?.id === swatch.id && (
              <span className="checkmark">✓</span>
            )}
          </button>
        ))}
      </div>

      {enableCustomColor && (
        <div className="custom-color-section">
          <button
            className={`custom-color-button ${showCustomPicker ? 'active' : ''}`}
            onClick={() => setShowCustomPicker(!showCustomPicker)}
          >
            Custom Color
          </button>

          {showCustomPicker && (
            <div className="custom-color-picker">
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={customHex}
                  onChange={handleCustomColorChange}
                  className="color-input"
                />
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  placeholder="#000000"
                  className="hex-input"
                  maxLength={7}
                />
              </div>
              <button
                className="apply-button"
                onClick={handleCustomColorApply}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
