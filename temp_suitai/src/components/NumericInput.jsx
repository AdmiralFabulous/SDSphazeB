import { useState, useCallback } from 'react'
import './NumericInput.css'

/**
 * NumericInput Component
 * A controlled numeric input field with validation, error handling, and accessibility features.
 *
 * @param {number} value - The current numeric value
 * @param {function} onChange - Callback when value changes (receives numeric value or null)
 * @param {number} [min] - Minimum allowed value
 * @param {number} [max] - Maximum allowed value
 * @param {number} [step=1] - Step size for increment/decrement
 * @param {string} [label] - Label text displayed above input
 * @param {string} [unit] - Unit text displayed after input (e.g., 'cm', 'm')
 * @param {string} [placeholder] - Placeholder text
 * @param {boolean} [disabled=false] - Whether input is disabled
 * @param {string} [error] - Error message to display
 * @param {string} [className] - Additional CSS class
 */
function NumericInput({
  value,
  onChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  label,
  unit,
  placeholder,
  disabled = false,
  error,
  className,
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState(value !== null && value !== undefined ? String(value) : '')

  const handleChange = useCallback((e) => {
    const inputStr = e.target.value

    // Allow empty string for clearing the field
    if (inputStr === '') {
      setInputValue('')
      onChange(null)
      return
    }

    // Parse the input as a number
    const numValue = parseFloat(inputStr)

    // If parsing fails, still update display but don't call onChange
    if (isNaN(numValue)) {
      setInputValue(inputStr)
      return
    }

    // Update both display and callback
    setInputValue(inputStr)
    onChange(numValue)
  }, [onChange])

  const handleBlur = useCallback((e) => {
    setIsFocused(false)

    // On blur, validate and normalize the value
    if (inputValue === '') {
      return
    }

    const numValue = parseFloat(inputValue)
    if (isNaN(numValue)) {
      // Invalid number - clear the field
      setInputValue('')
      onChange(null)
      return
    }

    // Clamp value to min/max range
    const clampedValue = Math.max(min, Math.min(max, numValue))

    // Update display with clamped value and notify parent
    if (clampedValue !== numValue) {
      setInputValue(String(clampedValue))
      onChange(clampedValue)
    }
  }, [inputValue, onChange, min, max])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const increment = useCallback(() => {
    const current = inputValue === '' ? min : parseFloat(inputValue)
    const newValue = Math.min(max, current + step)
    setInputValue(String(newValue))
    onChange(newValue)
  }, [inputValue, onChange, min, max, step])

  const decrement = useCallback(() => {
    const current = inputValue === '' ? max : parseFloat(inputValue)
    const newValue = Math.max(min, current - step)
    setInputValue(String(newValue))
    onChange(newValue)
  }, [inputValue, onChange, min, max, step])

  const hasError = !!error
  const isInvalid = inputValue !== '' && !isNaN(parseFloat(inputValue)) &&
    (parseFloat(inputValue) < min || parseFloat(inputValue) > max)

  const classes = ['numeric-input-wrapper']
  if (className) classes.push(className)
  if (hasError) classes.push('numeric-input-error')
  if (isInvalid) classes.push('numeric-input-invalid')
  if (isFocused) classes.push('numeric-input-focused')

  return (
    <div className={classes.join(' ')}>
      {label && <label className="numeric-input-label">{label}</label>}

      <div className="numeric-input-container">
        <button
          className="numeric-input-button numeric-input-decrement"
          onClick={decrement}
          disabled={disabled || (inputValue !== '' && parseFloat(inputValue) <= min)}
          aria-label="Decrease value"
          type="button"
        >
          −
        </button>

        <div className="numeric-input-field-wrapper">
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            disabled={disabled}
            className="numeric-input-field"
            aria-label={label || 'Numeric input'}
            aria-invalid={hasError || isInvalid}
            aria-describedby={hasError ? 'numeric-input-error' : undefined}
          />
          {unit && <span className="numeric-input-unit">{unit}</span>}
        </div>

        <button
          className="numeric-input-button numeric-input-increment"
          onClick={increment}
          disabled={disabled || (inputValue !== '' && parseFloat(inputValue) >= max)}
          aria-label="Increase value"
          type="button"
        >
          +
        </button>
      </div>

      {hasError && (
        <div className="numeric-input-error-message" id="numeric-input-error">
          {error}
        </div>
      )}

      {!hasError && isInvalid && (
        <div className="numeric-input-error-message">
          Value must be between {min} and {max}
        </div>
      )}
    </div>
  )
}

export default NumericInput
