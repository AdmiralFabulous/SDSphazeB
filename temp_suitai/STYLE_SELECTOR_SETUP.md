# Style Selector Component - Setup & Usage

## Overview

The Style Selector component (`src/components/configurator/StyleSelector.tsx`) provides a comprehensive UI for selecting suit style options including lapel styles, vent styles, and button options. It features visual feedback, descriptions for each option, and images for lapel styles.

## Files Created

### Component Files
- **`src/components/configurator/StyleSelector.tsx`** - Main React component with TypeScript types
- **`src/components/configurator/StyleSelector.css`** - Responsive styling with dark/light mode support

### Database & API
- **`prisma/schema.prisma`** - Updated with three new models:
  - `LapelStyle` - Lapel style options with images
  - `VentStyle` - Vent configuration options
  - `ButtonOption` - Button closure options
- **`src/app/api/styles/lapels/route.ts`** - GET endpoint for lapel styles
- **`src/app/api/styles/vents/route.ts`** - GET endpoint for vent styles
- **`src/app/api/styles/buttons/route.ts`** - GET endpoint for button options

### Seed Data
- **`prisma/seed.ts`** - Database seeding script with sample data
- **`public/images/styles/README.md`** - Guide for adding lapel style images
- **`public/images/styles/`** - Directory for lapel style images

### Configuration
- **`package.json`** - Updated with `prisma:seed` script

## Features

### ✓ All Style Options Available
- **Lapel Styles:** Notch, Peak, Shawl
- **Vent Styles:** Center, Side, Ventless
- **Button Options:** Two-button, Three-button, Four-button, Double-breasted

### ✓ Visual Selection Feedback
- Highlighted border and background on selection
- Animated checkmark indicator in top-right corner
- Smooth hover effects with elevation
- Visual distinction for out-of-stock items

### ✓ Descriptions for Each Option
- Style name clearly displayed
- Category label (e.g., "notch", "single", "two-button")
- Detailed description explaining the style
- Out-of-stock badge when applicable

### ✓ Images for Lapel Styles
- Image preview section for lapel styles (150px height)
- Object-fit cover ensures proper aspect ratio
- Lazy-loaded from public directory
- Fallback handling if images unavailable

## Component Props

```typescript
interface StyleSelectorProps {
  onSelectLapel?: (lapel: LapelStyle) => void;
  onSelectVent?: (vent: VentStyle) => void;
  onSelectButton?: (button: ButtonOption) => void;
  selectedLapelId?: string;
  selectedVentId?: string;
  selectedButtonId?: string;
}
```

### Props Explanation

- **onSelectLapel**: Callback fired when a lapel style is selected
- **onSelectVent**: Callback fired when a vent style is selected
- **onSelectButton**: Callback fired when a button option is selected
- **selectedLapelId**: ID of currently selected lapel (for visual highlighting)
- **selectedVentId**: ID of currently selected vent
- **selectedButtonId**: ID of currently selected button option

## Usage Example

```tsx
import StyleSelector from '@/components/configurator/StyleSelector';
import { useState } from 'react';

export default function MyPage() {
  const [selectedLapel, setSelectedLapel] = useState<string>();
  const [selectedVent, setSelectedVent] = useState<string>();
  const [selectedButton, setSelectedButton] = useState<string>();

  return (
    <StyleSelector
      onSelectLapel={(lapel) => setSelectedLapel(lapel.id)}
      onSelectVent={(vent) => setSelectedVent(vent.id)}
      onSelectButton={(button) => setSelectedButton(button.id)}
      selectedLapelId={selectedLapel}
      selectedVentId={selectedVent}
      selectedButtonId={selectedButton}
    />
  );
}
```

## Setup Instructions

### 1. Run Database Migration

```bash
npm run prisma:migrate
```

This creates the necessary database tables for LapelStyle, VentStyle, and ButtonOption.

### 2. Seed Sample Data

```bash
npm run prisma:seed
```

This populates the database with sample style options.

### 3. Add Lapel Style Images

Place lapel style images in `public/images/styles/`:

- `lapel-notch.jpg` (400x400px minimum, optimized < 100KB)
- `lapel-peak.jpg` (400x400px minimum, optimized < 100KB)
- `lapel-shawl.jpg` (400x400px minimum, optimized < 100KB)

Or update `prisma/seed.ts` with your own image URLs and re-run `npm run prisma:seed`.

### 4. Use Component

Import and use the component in your pages or layouts:

```tsx
import StyleSelector from '@/components/configurator/StyleSelector';

export default function Configurator() {
  return <StyleSelector />;
}
```

## Styling Details

### Design System
- **Color Palette:** Blue primary (#646cff) with light/dark theme support
- **Typography:** Clear hierarchy with descriptive labels
- **Spacing:** 1.5rem gaps in grid, 2rem container padding

### Responsive Breakpoints
- **Desktop (1200px+):** 250px minimum column width
- **Tablet (768px):** 200px minimum column width
- **Mobile (480px):** Single column, horizontal card layout

### Dark/Light Mode
- Automatic adaptation based on system preferences
- Uses `@media (prefers-color-scheme: dark/light)`
- Maintained contrast ratios for accessibility

## Features

### Out-of-Stock Handling
- Toggle checkbox to show/hide out-of-stock items
- Visual opacity reduction for unavailable items
- Disabled cursor interaction on out-of-stock items
- Red badge display indicating unavailability

### Error Handling
- Loading states for each section independently
- Error messages if API calls fail
- "No options available" message when filtered results are empty
- Console error logging for debugging

### Accessibility
- Semantic HTML with proper headings
- Keyboard interactive elements (checkboxes, cards)
- Clear visual feedback for selection state
- Role attributes for screen readers

## API Endpoints

All endpoints return data in the following format:

```typescript
GET /api/styles/lapels
GET /api/styles/vents
GET /api/styles/buttons

Response:
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "inStock": boolean,
      "imageUrl": "string" // lapels only
    }
  ]
}
```

## Database Schema

### LapelStyle
- `id` (String, unique ID)
- `name` (String, unique)
- `description` (String)
- `imageUrl` (String)
- `category` (String)
- `inStock` (Boolean, default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### VentStyle
- `id` (String, unique ID)
- `name` (String, unique)
- `description` (String)
- `category` (String)
- `inStock` (Boolean, default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### ButtonOption
- `id` (String, unique ID)
- `name` (String, unique)
- `description` (String)
- `category` (String)
- `inStock` (Boolean, default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Next Steps

1. **Add Real Images:** Replace placeholder image URLs with actual lapel style images
2. **Connect to Configurator:** Integrate with main suit configurator UI
3. **Persist Selections:** Store selected styles in session or database
4. **Add More Styles:** Extend with additional style options as needed
5. **Customize Descriptions:** Update style descriptions with marketing copy

## Troubleshooting

### Images Not Loading
- Ensure image files are in `public/images/styles/`
- Check file names match URLs in database
- Verify image permissions are readable

### API Endpoints Returning Empty
- Run `npm run prisma:seed` to populate database
- Check database connection in `.env`
- Verify Prisma models are defined

### Styling Issues
- Clear browser cache
- Ensure CSS file is in same directory as component
- Check for CSS variable overrides in global styles

## Acceptance Criteria - All Met ✓

- [x] **All style options available** - Three categories (lapel, vents, buttons) with multiple options each
- [x] **Visual selection feedback** - Highlighted border, checkmark badge, hover effects
- [x] **Descriptions for each option** - Name, category, and detailed description
- [x] **Images for lapel styles** - Image preview with 150px height and object-fit

