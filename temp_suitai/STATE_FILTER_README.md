# State Filter Implementation

This document describes the Order State Filter implementation for the Operator Dashboard.

## Overview

The State Filter allows operators to filter orders by their current state (S01-S19). The implementation includes:

- **19 Order States** with human-readable labels and color coding
- **Instant Filtering** - changes apply immediately without page reload
- **Context-based State Management** - using React Context API
- **Reusable Filter Component** - can be integrated into any page

## Files Created

### Core Files

1. **`src/lib/orderStates.ts`**
   - Defines all 19 order states (S01-S19)
   - Provides state labels and color codes
   - Exports utility functions for state management
   - Includes `getAllOrderStates()` for dropdown population

2. **`src/lib/orderContext.tsx`**
   - React Context for managing filter state
   - Provides `OrderFilterProvider` wrapper component
   - Exports `useOrderFilter()` hook for components
   - Handles state selection and filtering logic

3. **`src/components/OrderStateFilter.tsx`**
   - Dropdown filter component
   - Displays all 19 states with checkboxes
   - Shows color badges for each state
   - Includes "Clear" button to reset filters

4. **`src/components/OrderStateFilter.module.css`**
   - Styling for the filter dropdown
   - Responsive design with hover effects
   - Color-coded state badges

### Example Implementation

5. **`src/app/admin/orders/page.tsx`**
   - Example Orders Dashboard page
   - Demonstrates filter integration
   - Shows how to consume filtered data

6. **`src/app/admin/orders/orders.module.css`**
   - Styling for the orders table

## Order States

All 19 states with their labels and colors:

| State | Label | Color |
|-------|-------|-------|
| S01 | Pending | Orange |
| S02 | Confirmed | Royal Blue |
| S03 | Processing | Gold |
| S04 | Quality Check | Sky Blue |
| S05 | Ready for Shipment | Light Green |
| S06 | Shipped | Lime Green |
| S07 | In Transit | Medium Sea Green |
| S08 | Delivered | Forest Green |
| S09 | Completed | Green |
| S10 | On Hold | Goldenrod |
| S11 | Pending Review | Crimson |
| S12 | Return Requested | Tomato |
| S13 | Return In Progress | Coral |
| S14 | Returned | Indian Red |
| S15 | Refund Processing | Light Coral |
| S16 | Refunded | Dark Red |
| S17 | Cancelled | Dim Gray |
| S18 | Error | Red |
| S19 | Archived | Dark Gray |

## Usage

### Basic Setup

1. Wrap your page with `OrderFilterProvider`:

```tsx
import { OrderFilterProvider } from '@/lib/orderContext';

export default function AdminLayout({ children }) {
  return (
    <OrderFilterProvider>
      {children}
    </OrderFilterProvider>
  );
}
```

2. Add the filter component to your page:

```tsx
import { OrderStateFilter } from '@/components/OrderStateFilter';

export default function OrdersPage() {
  return (
    <div>
      <h1>Orders</h1>
      <OrderStateFilter />
      {/* Your content here */}
    </div>
  );
}
```

3. Use the hook to access filter state in your components:

```tsx
import { useOrderFilter } from '@/lib/orderContext';

function OrdersTable() {
  const { filterState } = useOrderFilter();

  // Filter your orders based on filterState.selectedStates
  const filtered = orders.filter(order =>
    filterState.selectedStates.length === 0 ||
    filterState.selectedStates.includes(order.state)
  );

  return (
    <table>
      {/* Render filtered orders */}
    </table>
  );
}
```

## API Reference

### `orderStates.ts`

#### Enum: `OrderState`
All 19 states (S01-S19) as enum values.

#### Function: `getStateLabel(state: OrderState): string`
Returns the human-readable label for a state.

```tsx
getStateLabel(OrderState.S01); // Returns "Pending"
```

#### Function: `getStateColor(state: OrderState): string`
Returns the hex color code for a state.

```tsx
getStateColor(OrderState.S01); // Returns "#FFA500"
```

#### Function: `getStateDescription(state: OrderState): string`
Returns a description of what the state represents.

```tsx
getStateDescription(OrderState.S01); // Returns "Order pending processing"
```

#### Function: `getAllOrderStates(): Array<{value, label, color}>`
Returns all states formatted for dropdown/list rendering.

```tsx
const states = getAllOrderStates();
// [
//   { value: 'S01', label: 'Pending', color: '#FFA500' },
//   { value: 'S02', label: 'Confirmed', color: '#4169E1' },
//   ...
// ]
```

### `orderContext.tsx`

#### Component: `OrderFilterProvider`
Wrapper component that provides filter context to children.

```tsx
<OrderFilterProvider>
  {children}
</OrderFilterProvider>
```

#### Hook: `useOrderFilter()`
Returns the current filter state and control functions.

```tsx
const { filterState, setSelectedStates, toggleState, clearFilters } = useOrderFilter();

// filterState.selectedStates: OrderState[] - currently selected states
// setSelectedStates(states): Set specific states
// toggleState(state): Toggle a single state on/off
// clearFilters(): Clear all selected states
```

### `OrderStateFilter`

#### Component: `<OrderStateFilter />`
Dropdown component for selecting filter states.

Features:
- Display all 19 states
- Color-coded badges
- Checkbox selection
- Clear button
- Responsive design
- Keyboard accessible

## Acceptance Criteria Fulfillment

✅ **All 19 states in dropdown**
- Enum with S01-S19 defined in `orderStates.ts`
- All states displayed in `OrderStateFilter` component

✅ **Filter applies immediately**
- Changes to filter state update component instantly
- No page reload required
- Uses React Context for instant updates

✅ **State labels human-readable**
- Each state has a descriptive label (e.g., "Pending", "Confirmed")
- Labels defined in `ORDER_STATE_CONFIG`
- Accessible via `getStateLabel()` function

✅ **Color coding by state**
- Each state has assigned hex color
- Color badges displayed in dropdown
- Used in table rows for visual distinction
- Colors represent state progression (warm → cool → warning → error)

## Integration Examples

### With Database/API

To integrate with real data from a database:

```tsx
import { OrderState } from '@/lib/orderStates';
import { prisma } from '@/lib/prisma';

// In your API route or server action
export async function getFilteredOrders(selectedStates: OrderState[]) {
  return prisma.order.findMany({
    where:
      selectedStates.length > 0
        ? { state: { in: selectedStates } }
        : undefined,
    orderBy: { createdAt: 'desc' },
  });
}
```

### With URL Query Parameters

For bookmarkable filters:

```tsx
import { useSearchParams, useRouter } from 'next/navigation';

export function OrderStateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedStates = searchParams.getAll('states') as OrderState[];

  const updateFilter = (newStates: OrderState[]) => {
    const params = new URLSearchParams();
    newStates.forEach(state => params.append('states', state));
    router.push(`?${params.toString()}`);
  };

  // Use in component...
}
```

## Notes

- The filter component is fully client-side with React Context
- For real applications, integrate with your API/database for server-side filtering
- Color scheme supports both light and dark modes (customize colors as needed)
- States are pre-defined but can be extended or modified as business requirements change
