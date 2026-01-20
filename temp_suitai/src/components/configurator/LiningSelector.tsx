import React, { useState, useCallback, useEffect } from 'react'
import {
  LiningSelectorState,
  LiningSelectorConfig,
  LiningSelectorProps,
  ColorSwatch,
  Pattern,
} from './types/configurator.types'
import { ColorSwatchPicker } from './ColorSwatchPicker'
import { PatternSelector } from './PatternSelector'
import { PreviewPanel } from './PreviewPanel'
import './styles/LiningSelector.css'

export const LiningSelector: React.FC<LiningSelectorProps> = ({
  config,
  onSelectionChange,
  onColorSelect,
  onPatternSelect,
  initialState,
}) => {
  const [state, setState] = useState<LiningSelectorState>({
    selectedColor: initialState?.selectedColor || config.defaultColor || null,
    selectedPattern: initialState?.selectedPattern || config.defaultPattern || null,
    customColor: initialState?.customColor || null,
    isLocked: initialState?.isLocked || false,
    confidence: initialState?.confidence || 1.0,
    timestamp: initialState?.timestamp || new Date(),
  })

  // Update state and notify parent
  const updateState = useCallback(
    (updates: Partial<LiningSelectorState>) => {
      const newState = {
        ...state,
        ...updates,
        timestamp: new Date(),
      }
      setState(newState)
      onSelectionChange?.(newState)
    },
    [state, onSelectionChange]
  )

  const handleColorSelect = useCallback(
    (color: ColorSwatch) => {
      updateState({
        selectedColor: color,
        customColor: null,
      })
      onColorSelect?.(color)
    },
    [updateState, onColorSelect]
  )

  const handleCustomColorSelect = useCallback(
    (hex: string) => {
      updateState({
        customColor: hex,
        selectedColor: null,
      })
      onColorSelect?.(hex)
    },
    [updateState, onColorSelect]
  )

  const handlePatternSelect = useCallback(
    (pattern: Pattern) => {
      updateState({
        selectedPattern: pattern,
      })
      onPatternSelect?.(pattern)
    },
    [updateState, onPatternSelect]
  )

  const handleLock = useCallback(() => {
    updateState({
      isLocked: !state.isLocked,
      confidence: state.isLocked ? 1.0 : 0.95,
    })
  }, [state.isLocked, updateState])

  const handleReset = useCallback(() => {
    setState({
      selectedColor: config.defaultColor || null,
      selectedPattern: config.defaultPattern || null,
      customColor: null,
      isLocked: false,
      confidence: 1.0,
      timestamp: new Date(),
    })
  }, [config])

  return (
    <div className="lining-selector">
      <div className="selector-header">
        <h2>Jacket Lining Customization</h2>
        <div className="header-controls">
          <button
            className={`lock-button ${state.isLocked ? 'locked' : 'unlocked'}`}
            onClick={handleLock}
            title={state.isLocked ? 'Unlock selection' : 'Lock selection'}
            aria-label={state.isLocked ? 'Unlock' : 'Lock'}
          >
            {state.isLocked ? '🔒' : '🔓'}
          </button>
          <button
            className="reset-button"
            onClick={handleReset}
            title="Reset to default"
            aria-label="Reset"
          >
            ⟲
          </button>
        </div>
      </div>

      <div className="selector-content">
        <div className="selector-main">
          <section className="color-section">
            <h3>Color Selection</h3>
            <ColorSwatchPicker
              swatches={config.colorOptions}
              selectedColor={state.selectedColor}
              onColorSelect={handleColorSelect}
              enableCustomColor={config.enableCustomColor}
              onCustomColorSelect={handleCustomColorSelect}
            />
          </section>

          <section className="pattern-section">
            <PatternSelector
              patterns={config.patternOptions}
              selectedPattern={state.selectedPattern}
              onPatternSelect={handlePatternSelect}
            />
          </section>
        </div>

        {config.enablePreview && (
          <div className="selector-preview">
            <PreviewPanel
              selectedColor={state.selectedColor}
              selectedPattern={state.selectedPattern}
              customColor={state.customColor}
              title="Live Preview"
            />
          </div>
        )}
      </div>

      <div className="selector-footer">
        <div className="status-info">
          <span className="confidence-badge">
            Confidence: {(state.confidence * 100).toFixed(0)}%
          </span>
          <span className="timestamp">
            Last updated: {state.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  )
}
