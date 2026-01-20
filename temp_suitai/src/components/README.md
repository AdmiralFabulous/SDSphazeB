# NumericInput Component

A fully-featured React numeric input component with validation, accessibility features, and customizable constraints.

## Features

- ✅ **Controlled Input** - Works with React state management
- ✅ **Validation** - Min/max constraints with real-time validation
- ✅ **Increment/Decrement Buttons** - Easy value adjustment with +/- buttons
- ✅ **Error Handling** - Display custom error messages
- ✅ **Accessibility** - Full ARIA labels and descriptions
- ✅ **Customizable** - Step, min, max, unit, label, placeholder
- ✅ **Disabled State** - Support for disabled inputs and buttons
- ✅ **Value Normalization** - Clamps values to min/max on blur
- ✅ **Responsive Design** - Mobile-friendly styling
- ✅ **Type Safe** - Properly typed with JSDoc

## Installation

The component is located in `src/components/NumericInput.jsx` and `src/components/NumericInput.css`.

```bash
# No additional dependencies required
# Uses only React (built-in)
```

## Basic Usage

```jsx
import { useState } from 'react'
import NumericInput from './components/NumericInput'

function App() {
  const [height, setHeight] = useState(170)

  return (
    <NumericInput
      value={height}
      onChange={setHeight}
      min={100}
      max={250}
      unit="cm"
      label="Height"
    />
  )
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number \| null` | The current numeric value |
| `onChange` | `(value: number \| null) => void` | Callback when value changes |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` | `number` | `-Infinity` | Minimum allowed value |
| `max` | `number` | `Infinity` | Maximum allowed value |
| `step` | `number` | `1` | Step size for increment/decrement |
| `label` | `string` | - | Label text displayed above input |
| `unit` | `string` | - | Unit text (e.g., 'cm', 'm', 'kg') |
| `placeholder` | `string` | - | Placeholder text for empty input |
| `disabled` | `boolean` | `false` | Whether input is disabled |
| `error` | `string` | - | Error message to display |
| `className` | `string` | - | Additional CSS class name |

## Examples

### Height Input (100-250 cm)

```jsx
<NumericInput
  value={height}
  onChange={setHeight}
  min={100}
  max={250}
  step={1}
  label="Height"
  unit="cm"
  placeholder="Enter height"
/>
```

### Weight Input (0.1-500 kg)

```jsx
<NumericInput
  value={weight}
  onChange={setWeight}
  min={0.1}
  max={500}
  step={0.1}
  label="Weight"
  unit="kg"
/>
```

### Age Input (1-150 years)

```jsx
<NumericInput
  value={age}
  onChange={setAge}
  min={1}
  max={150}
  step={1}
  label="Age"
  unit="years"
/>
```

### With Error Display

```jsx
const [value, setValue] = useState(null)
const [error, setError] = useState(null)

const handleChange = (val) => {
  setValue(val)
  if (val === null) {
    setError('Value is required')
  } else {
    setError(null)
  }
}

return (
  <NumericInput
    value={value}
    onChange={handleChange}
    label="Required Field"
    error={error}
  />
)
```

### Disabled State

```jsx
<NumericInput
  value={value}
  onChange={setValue}
  label="Readonly"
  disabled={true}
/>
```

## Behavior

### Value Handling

- **Empty Input**: `null` is passed to `onChange`
- **Invalid Input**: Non-numeric characters are ignored, `onChange` is not called
- **On Blur**: Value is automatically clamped to min/max range

### Increment/Decrement

- Buttons are disabled when value reaches min or max
- Clicking + button increases by `step` value
- Clicking - button decreases by `step` value
- Buttons respect min/max constraints

### Validation

- **Real-time**: Invalid input is detected while typing
- **On Blur**: Value is normalized and clamped to range
- **Error Display**: Out-of-range values show inline error message

## Styling

The component uses CSS variables for theming:

```css
/* Primary color */
--color-primary: #646cff;

/* Error color */
--color-error: #ef4444;

/* Success color (for messages) */
--color-success: #10b981;
```

To customize, override the CSS classes:

```css
.numeric-input-wrapper {
  /* Main container styles */
}

.numeric-input-field {
  /* Input field styles */
}

.numeric-input-button {
  /* Button styles */
}

.numeric-input-error-message {
  /* Error message styles */
}
```

## Accessibility

The component includes:

- ✅ `aria-label` - Describes the input purpose
- ✅ `aria-invalid` - Indicates validation state
- ✅ `aria-describedby` - Links error message to input
- ✅ Semantic HTML - Uses proper form elements
- ✅ Keyboard Support - Full keyboard navigation
- ✅ Focus Management - Visible focus states
- ✅ Type `number` - Native numeric keyboard on mobile

## Testing

The component includes comprehensive tests in `NumericInput.test.jsx`:

```bash
npm test NumericInput.test.jsx
```

Test coverage includes:

- ✅ Rendering with various props
- ✅ Value handling and updates
- ✅ User input and onChange callbacks
- ✅ Min/max validation and clamping
- ✅ Increment/decrement button functionality
- ✅ Error display and clearing
- ✅ Disabled state
- ✅ Accessibility attributes

## Integration Example

See `src/App.jsx` for a complete example integrating:

1. NumericInput component
2. Form submission to API
3. Loading state management
4. Error handling
5. Success messages

To run the example:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the demo.

## API Integration

The component works seamlessly with the existing height endpoint:

```jsx
const handleSubmit = async () => {
  const response = await fetch(`/api/sessions/${sessionId}/height`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ height })
  })

  const data = await response.json()
  if (!response.ok) {
    setError(data.error)
  }
}
```

## Performance

- ✅ Minimal re-renders - Only updates on value/props change
- ✅ No external dependencies - Uses only React
- ✅ Optimized callbacks - `useCallback` for event handlers
- ✅ CSS-in-JS free - Pure CSS for styling

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## License

Part of SUIT AI v4.b project

## Components Structure

```
src/
├── components/
│   ├── NumericInput.jsx          # Main component
│   ├── NumericInput.css          # Styling
│   ├── NumericInput.test.jsx     # Tests
│   └── README.md                 # This file
├── App.jsx                       # Demo usage
├── App.css                       # App styling
└── ...
```
