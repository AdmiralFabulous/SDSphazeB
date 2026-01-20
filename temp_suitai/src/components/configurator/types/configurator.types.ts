/**
 * Type definitions for the Configurator components
 * Follows backend patterns (dataclasses, state management)
 */

export interface ColorSwatch {
  id: string
  name: string
  hex: string
  rgb: [number, number, number]
  label?: string
}

export interface Pattern {
  id: string
  name: string
  type: 'solid' | 'gradient' | 'stripe' | 'geometric'
  previewUrl?: string
  description?: string
}

export interface LiningSelectorState {
  selectedColor: ColorSwatch | null
  selectedPattern: Pattern | null
  customColor: string | null
  isLocked: boolean
  confidence: number
  timestamp: Date
}

export interface LiningSelectorConfig {
  defaultColor?: ColorSwatch
  defaultPattern?: Pattern
  colorOptions: ColorSwatch[]
  patternOptions: Pattern[]
  enableCustomColor: boolean
  enablePreview: boolean
  previewResolution?: [number, number]
}

export interface LiningSelectorProps {
  config: LiningSelectorConfig
  onSelectionChange?: (state: LiningSelectorState) => void
  onColorSelect?: (color: ColorSwatch | string) => void
  onPatternSelect?: (pattern: Pattern) => void
  initialState?: Partial<LiningSelectorState>
}
