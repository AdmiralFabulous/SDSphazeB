import React from 'react'
import { ColorSwatch, Pattern } from './types/configurator.types'
import './styles/PreviewPanel.css'

interface PreviewPanelProps {
  selectedColor: ColorSwatch | null
  selectedPattern: Pattern | null
  customColor: string | null
  title?: string
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  selectedColor,
  selectedPattern,
  customColor,
  title = 'Lining Preview',
}) => {
  const getDisplayColor = (): string => {
    if (customColor) return customColor
    if (selectedColor) return selectedColor.hex
    return '#cccccc'
  }

  const getBackgroundStyle = (): React.CSSProperties => {
    const baseColor = getDisplayColor()

    if (selectedPattern?.type === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${baseColor} 0%, ${adjustBrightness(baseColor, -20)} 100%)`,
      }
    }

    if (selectedPattern?.type === 'stripe') {
      const stripColor = adjustBrightness(baseColor, -15)
      return {
        background: `repeating-linear-gradient(45deg, ${baseColor}, ${baseColor} 10px, ${stripColor} 10px, ${stripColor} 20px)`,
      }
    }

    if (selectedPattern?.type === 'geometric') {
      const accentColor = adjustBrightness(baseColor, -25)
      return {
        background: `
          linear-gradient(135deg, ${baseColor} 25%, transparent 25%),
          linear-gradient(225deg, ${baseColor} 25%, transparent 25%),
          linear-gradient(315deg, ${baseColor} 25%, transparent 25%),
          linear-gradient(45deg, ${baseColor} 25%, ${accentColor} 25%)
        `,
        backgroundPosition: '20px 0, 20px 0, 0 0, 0 0',
        backgroundSize: '40px 40px',
        backgroundRepeat: 'repeat',
      }
    }

    return { backgroundColor: baseColor }
  }

  return (
    <div className="preview-panel">
      <h3 className="preview-title">{title}</h3>
      <div className="preview-container">
        <div className="preview-jacket-outline">
          <div className="lining-area" style={getBackgroundStyle()} />
        </div>
      </div>
      <div className="preview-info">
        <div className="info-item">
          <span className="info-label">Color:</span>
          <span className="info-value">
            {customColor || selectedColor?.name || 'Not selected'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Pattern:</span>
          <span className="info-value">
            {selectedPattern?.name || 'Solid'}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Utility function to adjust color brightness
 * @param color - Hex color string
 * @param percent - Percentage to adjust (-100 to 100)
 */
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt))
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}
