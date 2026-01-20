import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, userEvent, waitFor } from '@testing-library/react'
import NumericInput from './NumericInput'

describe('NumericInput Component', () => {
  describe('Basic Rendering', () => {
    it('should render with basic props', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={0} onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should render with label', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={0} onChange={handleChange} label="Height" />
      )

      expect(screen.getByText('Height')).toBeInTheDocument()
    })

    it('should render with unit', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={0} onChange={handleChange} unit="cm" />
      )

      expect(screen.getByText('cm')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput
          value={null}
          onChange={handleChange}
          placeholder="Enter value"
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Enter value')
    })

    it('should render with label and unit together', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput
          value={170}
          onChange={handleChange}
          label="Height"
          unit="cm"
        />
      )

      expect(screen.getByText('Height')).toBeInTheDocument()
      expect(screen.getByText('cm')).toBeInTheDocument()
    })
  })

  describe('Value Handling', () => {
    it('should display initial value', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={42} onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      expect(input.value).toBe('42')
    })

    it('should update input on value change', () => {
      const handleChange = vi.fn()
      const { rerender } = render(
        <NumericInput value={42} onChange={handleChange} />
      )

      const input = screen.getByRole('textbox')
      expect(input.value).toBe('42')

      rerender(<NumericInput value={100} onChange={handleChange} />)
      expect(input.value).toBe('100')
    })

    it('should handle null value', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={null} onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      expect(input.value).toBe('')
    })

    it('should handle undefined value', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={undefined} onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      expect(input.value).toBe('')
    })
  })

  describe('User Input', () => {
    it('should call onChange when user types a number', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={0} onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '123' } })

      expect(handleChange).toHaveBeenCalledWith(123)
    })

    it('should call onChange with null when field is cleared', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={42} onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '' } })

      expect(handleChange).toHaveBeenCalledWith(null)
    })

    it('should handle decimal input', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={0} onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '3.14' } })

      expect(handleChange).toHaveBeenCalledWith(3.14)
    })

    it('should handle negative numbers', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={0} onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '-50' } })

      expect(handleChange).toHaveBeenCalledWith(-50)
    })

    it('should not call onChange for invalid input', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={0} onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'abc' } })

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Min/Max Validation', () => {
    it('should enforce minimum value on blur', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={50} onChange={handleChange} min={100} max={250} />
      )

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '50' } })
      fireEvent.blur(input)

      // Value should be clamped to minimum
      expect(handleChange).toHaveBeenLastCalledWith(100)
    })

    it('should enforce maximum value on blur', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={150} onChange={handleChange} min={100} max={250} />
      )

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '300' } })
      fireEvent.blur(input)

      // Value should be clamped to maximum
      expect(handleChange).toHaveBeenLastCalledWith(250)
    })

    it('should accept value within range', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={150} onChange={handleChange} min={100} max={250} />
      )

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '170' } })
      fireEvent.blur(input)

      expect(input.value).toBe('170')
    })

    it('should display error message for out of range value', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput
          value={50}
          onChange={handleChange}
          min={100}
          max={250}
        />
      )

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '50' } })

      expect(screen.getByText('Value must be between 100 and 250')).toBeInTheDocument()
    })
  })

  describe('Increment/Decrement Buttons', () => {
    it('should increment value with + button', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={100} onChange={handleChange} step={5} />
      )

      const incrementButton = screen.getByRole('button', { name: /Increase value/i })
      fireEvent.click(incrementButton)

      expect(handleChange).toHaveBeenCalledWith(105)
    })

    it('should decrement value with - button', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={100} onChange={handleChange} step={5} />
      )

      const decrementButton = screen.getByRole('button', { name: /Decrease value/i })
      fireEvent.click(decrementButton)

      expect(handleChange).toHaveBeenCalledWith(95)
    })

    it('should respect maximum when incrementing', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={245} onChange={handleChange} max={250} step={10} />
      )

      const incrementButton = screen.getByRole('button', { name: /Increase value/i })
      fireEvent.click(incrementButton)

      expect(handleChange).toHaveBeenCalledWith(250)
    })

    it('should respect minimum when decrementing', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={105} onChange={handleChange} min={100} step={10} />
      )

      const decrementButton = screen.getByRole('button', { name: /Decrease value/i })
      fireEvent.click(decrementButton)

      expect(handleChange).toHaveBeenCalledWith(100)
    })

    it('should disable increment button at max', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={250} onChange={handleChange} max={250} />
      )

      const incrementButton = screen.getByRole('button', { name: /Increase value/i })
      expect(incrementButton).toBeDisabled()
    })

    it('should disable decrement button at min', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={100} onChange={handleChange} min={100} />
      )

      const decrementButton = screen.getByRole('button', { name: /Decrease value/i })
      expect(decrementButton).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when error prop is provided', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput
          value={0}
          onChange={handleChange}
          error="This field is required"
        />
      )

      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should clear invalid input on blur', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={0} onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'invalid' } })
      fireEvent.blur(input)

      expect(input.value).toBe('')
      expect(handleChange).toHaveBeenCalledWith(null)
    })
  })

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={0} onChange={handleChange} disabled={true} />
      )

      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('should disable buttons when disabled prop is true', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={100} onChange={handleChange} disabled={true} />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput
          value={0}
          onChange={handleChange}
          label="Height"
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Height')
    })

    it('should set aria-invalid when there is an error', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput
          value={0}
          onChange={handleChange}
          error="Error message"
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('should associate error message with aria-describedby', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput
          value={0}
          onChange={handleChange}
          error="Error message"
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'numeric-input-error')
    })
  })

  describe('Step Handling', () => {
    it('should use default step of 1', () => {
      const handleChange = vi.fn()
      render(<NumericInput value={10} onChange={handleChange} />)

      const incrementButton = screen.getByRole('button', { name: /Increase value/i })
      fireEvent.click(incrementButton)

      expect(handleChange).toHaveBeenCalledWith(11)
    })

    it('should use custom step value', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput value={10} onChange={handleChange} step={0.5} />
      )

      const incrementButton = screen.getByRole('button', { name: /Increase value/i })
      fireEvent.click(incrementButton)

      expect(handleChange).toHaveBeenCalledWith(10.5)
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput
          value={0}
          onChange={handleChange}
          className="custom-class"
        />
      )

      const wrapper = screen.getByRole('textbox').closest('.numeric-input-wrapper')
      expect(wrapper).toHaveClass('custom-class')
    })
  })

  describe('Integration Scenarios', () => {
    it('should work with height input constraints (100-250 cm)', () => {
      const handleChange = vi.fn()
      render(
        <NumericInput
          value={170}
          onChange={handleChange}
          min={100}
          max={250}
          unit="cm"
          label="Height"
        />
      )

      expect(screen.getByText('Height')).toBeInTheDocument()
      expect(screen.getByText('cm')).toBeInTheDocument()

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '180' } })
      expect(handleChange).toHaveBeenCalledWith(180)

      // Test out of range
      fireEvent.change(input, { target: { value: '300' } })
      fireEvent.blur(input)
      expect(handleChange).toHaveBeenCalledWith(250)
    })

    it('should work with custom error prop from parent', () => {
      const handleChange = vi.fn()
      const { rerender } = render(
        <NumericInput
          value={170}
          onChange={handleChange}
          min={100}
          max={250}
        />
      )

      expect(screen.queryByText('Server error')).not.toBeInTheDocument()

      rerender(
        <NumericInput
          value={170}
          onChange={handleChange}
          min={100}
          max={250}
          error="Server error"
        />
      )

      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })
})
