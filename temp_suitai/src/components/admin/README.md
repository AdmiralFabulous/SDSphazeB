# MeasurementsDisplay Component

A comprehensive React component for displaying, editing, and exporting anthropometric body measurements in multiple formats.

## Overview

The `MeasurementsDisplay` component provides a professional interface for managing 28 standardized body measurements grouped by anatomical category. It supports inline editing, copy-to-clipboard functionality, and exports to multiple formats including Optitex.

## Features

### Display
- **28 Measurements** organized into 4 categories:
  - **Head & Neck** (4 measurements): Head circumference, neck circumference, head length, head width
  - **Torso & Chest** (6 measurements): Shoulder, chest, waist, hip circumference, shoulder width, torso length
  - **Arms & Hands** (5 measurements): Left/right arm circumference, left/right wrist circumference, arm length
  - **Legs & Feet** (7 measurements): Left/right thigh/calf/ankle circumference, leg length

### Interactions
- **Edit Values**: Click any measurement value to edit inline
- **Copy to Clipboard**: Each measurement has a copy button with visual feedback
- **Progress Tracking**: Shows count of filled measurements

### Export Formats
1. **Optitex Format** (.txt)
   - Tab-separated values format
   - Measurement name, value, unit per line
   - Includes export metadata
   - File format: `measurements_optitex_{timestamp}.txt`

2. **CSV Format** (.csv)
   - Standard comma-separated values
   - Columns: Measurement, Value, Unit, Category, Description
   - Compatible with Excel/Google Sheets
   - File format: `measurements_{timestamp}.csv`

3. **JSON Format** (.json)
   - Structured data format
   - Includes export metadata and measurements array
   - Easy integration with APIs/databases
   - File format: `measurements_{timestamp}.json`

## Usage

### Basic Integration

```tsx
import MeasurementsDisplay from '@/components/admin/MeasurementsDisplay';

export default function AdminDashboard() {
  return (
    <div>
      <MeasurementsDisplay />
    </div>
  );
}
```

### Component Props

Currently, the component manages all state internally. No props are required.

```tsx
<MeasurementsDisplay />
```

## Measurement Data Structure

```tsx
interface Measurement {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  category: string;              // Category key
  value: number;                 // Current measurement value
  unit: string;                  // Unit of measurement (cm)
  description: string;           // Detailed description
}

interface MeasurementGroup {
  category: string;              // Category key
  label: string;                 // Display label
  measurements: Measurement[];   // Array of measurements
}
```

## Copy Functionality

When a user clicks the "Copy" button for a measurement:

1. Text is formatted as: `"{name}: {value} {unit}"`
2. Content is copied to clipboard via `navigator.clipboard.writeText()`
3. Button shows "✓ Copied" feedback
4. Feedback clears after 2 seconds

Example copied text:
```
Head Circumference: 57.5 cm
```

## Optitex Export Format

The Optitex export generates a tab-separated text file with the following structure:

```
OPTITEX MEASUREMENT EXPORT
Generated: 2024-01-19T15:30:45.123Z

MEASUREMENT	VALUE	UNIT
--------------------------------------------------

# Head & Neck
Head Circumference	57.5	cm
Neck Circumference	38.2	cm
Head Length	21.3	cm
Head Width	18.9	cm

# Torso & Chest
Shoulder Circumference	112.4	cm
...
```

This format is specifically designed for Optitex software integration, which requires tab-separated values with clear section headers.

## Styling

The component includes comprehensive CSS with:

- **Dark Mode Support**: Automatically adapts to `prefers-color-scheme` media query
- **Responsive Design**:
  - 2-column grid on desktop (600px+ min-width per column)
  - 1-column layout on tablets and mobile
  - Optimized touch targets on mobile
- **Accessibility**: Proper color contrast, clear visual feedback, keyboard-accessible
- **Print Styles**: Hides buttons and optimizes layout for printing

### CSS Variables (can be customized via your theme)

```css
/* Primary colors used in component */
--primary: #2563eb;
--primary-hover: #1d4ed8;
--success: #10b981;
--danger: #ef4444;
```

## File Exports

All export functions create downloadable files using the Blob API:

```tsx
// Example: Optitex export flow
const content = generateOptitexFormat();  // String content
const blob = new Blob([content], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
// Trigger download and clean up
```

## Accessibility

- Proper semantic HTML structure
- Color-coded buttons with text labels (not icon-only)
- Keyboard accessible inputs and buttons
- ARIA-compatible descriptions for each measurement
- Clear visual feedback for interactions

## Browser Support

- Modern browsers with `navigator.clipboard` support (Chrome 63+, Firefox 53+, Safari 13.1+)
- Graceful degradation with console error logging
- Works with dark mode via CSS media queries

## File Structure

```
src/components/admin/
├── MeasurementsDisplay.tsx      # Component implementation
├── MeasurementsDisplay.css      # Component styles
├── MeasurementsDisplay.test.tsx # Test/demo file
└── README.md                     # This file
```

## Performance

- Inline editing uses React state updates
- Copy feedback automatically clears after 2 seconds
- Export functions generate files on-demand
- No external dependencies beyond React

## Future Enhancements

Potential additions for future versions:
- API integration to fetch/save measurements from server
- Preset measurement profiles (size S, M, L, XL, etc.)
- Real-time validation against anthropometric standards
- Comparison with previous measurements
- Visual body diagram with landmark annotations
- Unit conversion (cm ↔ inches)
- Batch import from CSV
- Measurement history tracking

## Integration Notes

- Component uses `.tsx` format (TypeScript React)
- Requires React 16.8+ (for hooks)
- CSS uses modern features (CSS Grid, Flexbox, CSS Variables)
- No external UI library dependencies
- Compatible with Next.js and standard React apps

## Testing

Run tests with:
```bash
npm test MeasurementsDisplay
```

Or view the demo:
```bash
npm run dev
# Navigate to component in your dev environment
```

## License

Part of SUIT AI measurement system. Internal use.

## References

- ISO 20685-1: 3D scanning methodologies for internationally compatible anthropometric databases
- SMPL: A Skinned Multi-Person Linear Model
- Optitex Design Software: CAD for fashion industry
