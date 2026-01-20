import React from 'react'
import { Pattern } from './types/configurator.types'
import './styles/PatternSelector.css'

interface PatternSelectorProps {
  patterns: Pattern[]
  selectedPattern: Pattern | null
  onPatternSelect: (pattern: Pattern) => void
}

export const PatternSelector: React.FC<PatternSelectorProps> = ({
  patterns,
  selectedPattern,
  onPatternSelect,
}) => {
  const renderPatternPreview = (pattern: Pattern): React.ReactNode => {
    switch (pattern.type) {
      case 'solid':
        return <div className="pattern-preview solid" />
      case 'gradient':
        return (
          <div
            className="pattern-preview gradient"
            style={{
              background:
                'linear-gradient(135deg, rgba(100,100,100,0.5) 0%, rgba(200,200,200,0.5) 100%)',
            }}
          />
        )
      case 'stripe':
        return <div className="pattern-preview stripe" />
      case 'geometric':
        return <div className="pattern-preview geometric" />
      default:
        return <div className="pattern-preview" />
    }
  }

  return (
    <div className="pattern-selector">
      <h3 className="section-title">Pattern</h3>
      <div className="patterns-grid">
        {patterns.map((pattern) => (
          <button
            key={pattern.id}
            className={`pattern-item ${selectedPattern?.id === pattern.id ? 'selected' : ''}`}
            onClick={() => onPatternSelect(pattern)}
            title={pattern.description || pattern.name}
            aria-label={`Select ${pattern.name} pattern`}
          >
            <div className="pattern-preview-container">
              {pattern.previewUrl ? (
                <img src={pattern.previewUrl} alt={pattern.name} />
              ) : (
                renderPatternPreview(pattern)
              )}
            </div>
            <span className="pattern-name">{pattern.name}</span>
            {selectedPattern?.id === pattern.id && (
              <span className="pattern-checkmark">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
