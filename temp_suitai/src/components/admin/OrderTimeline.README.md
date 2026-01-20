# OrderTimeline Component

Visual timeline component for displaying state transitions and measurement history in the Operator Dashboard.

## Features

### ✅ Acceptance Criteria Met

1. **Visual Timeline**: Displays a chronological timeline of all state transitions with distinct visual indicators
2. **All Transitions Shown**: Every state change (UNLOCKED → IN_PROGRESS → LOCKED) is displayed with full details
3. **Who Made Changes**: Shows the `changedBy` field indicating user or system that performed the transition
4. **Notes Display**: Displays associated notes for each state transition
5. **Progress Tracking**: Shows stability score and confidence metrics with visual progress bars
6. **Warnings**: Displays diagnostic warnings that occurred during measurements
7. **Metadata**: Shows measurement metadata including frame counts, dimensions, and universal measurement IDs

## Data Structure

### State History Record

```typescript
interface StateHistoryRecord {
  id: string;
  state: 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED';
  stateChangedAt: string;           // ISO timestamp
  stableFrameCount: number;         // Number of stable frames
  stabilityScore: number;           // 0.0-1.0
  confidence: number;               // 0.0-1.0
  changedBy?: string;               // User/system identifier
  notes?: string;                   // Optional transition notes
  warnings?: string[];              // Optional diagnostic warnings
  universalMeasurementId?: string;  // UMI_timestamp_hash_random
  metadata?: {
    numMeasurements?: number;
    frameCountAtLock?: number;
    stableFrames?: number;
    measurementDimension?: number;
  };
}
```

## Usage

### Basic Usage

```tsx
import OrderTimeline from '@/components/admin/OrderTimeline';

export function MeasurementDashboard() {
  return (
    <OrderTimeline
      sessionId="session-123"
      onTimelineLoad={(records) => console.log('Timeline loaded:', records)}
    />
  );
}
```

### With Event Handlers

```tsx
export function AdminPanel() {
  const [timeline, setTimeline] = useState<StateHistoryRecord[]>([]);

  return (
    <OrderTimeline
      sessionId={currentSessionId}
      onTimelineLoad={(records) => {
        setTimeline(records);
        // React to timeline data
      }}
    />
  );
}
```

## API Endpoints

### GET `/api/sessions/[id]/state-history`

Retrieves complete state history for a session.

**Response:**
```json
[
  {
    "id": "1",
    "state": "UNLOCKED",
    "stateChangedAt": "2024-01-20T10:00:00.000Z",
    "stableFrameCount": 0,
    "stabilityScore": 0,
    "confidence": 0,
    "changedBy": "system",
    "notes": "Measurement session started"
  },
  {
    "id": "2",
    "state": "IN_PROGRESS",
    "stateChangedAt": "2024-01-20T10:00:30.000Z",
    "stableFrameCount": 150,
    "stabilityScore": 0.5,
    "confidence": 0.5,
    "changedBy": "system",
    "notes": "Collecting stable measurements",
    "warnings": ["High variation detected in frame 145"]
  },
  {
    "id": "3",
    "state": "LOCKED",
    "stateChangedAt": "2024-01-20T10:01:00.000Z",
    "stableFrameCount": 300,
    "stabilityScore": 1.0,
    "confidence": 0.98,
    "changedBy": "vision_service",
    "universalMeasurementId": "UMI_20240120100100_abc123_xyz789",
    "notes": "Measurement locked and geometric median computed",
    "metadata": {
      "numMeasurements": 300,
      "frameCountAtLock": 450,
      "stableFrames": 300,
      "measurementDimension": 10
    }
  }
]
```

### POST `/api/sessions/[id]/state-history`

Add a new state history record.

**Request Body:**
```json
{
  "state": "IN_PROGRESS",
  "stateChangedAt": "2024-01-20T10:00:30Z",
  "stableFrameCount": 150,
  "stabilityScore": 0.5,
  "confidence": 0.5,
  "changedBy": "system",
  "notes": "Collecting stable measurements",
  "warnings": ["High variation detected in frame 145"],
  "universalMeasurementId": null,
  "metadata": null
}
```

**Response:** Created state history record with id

## Database Schema

### StateHistory Table

```prisma
model StateHistory {
  id                      String   @id @default(cuid())
  sessionId               String
  session                 Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  state                   String   // "UNLOCKED" | "IN_PROGRESS" | "LOCKED"
  stateChangedAt          DateTime
  stableFrameCount        Int
  stabilityScore          Float
  confidence              Float
  geometricMedian         String?  // JSON serialized array
  universalMeasurementId  String?  // UMI from lock

  changedBy               String?  // User or system that made the change
  notes                   String?  // Additional notes about the transition
  warnings                String?  // JSON serialized warnings array
  metadata                Json?    // Additional context

  createdAt               DateTime @default(now())

  @@index([sessionId])
  @@index([stateChangedAt])
  @@index([state])
}
```

## Component Props

### OrderTimelineProps

```typescript
interface OrderTimelineProps {
  sessionId: string;                                    // Session ID to load history for
  onTimelineLoad?: (records: StateHistoryRecord[]) => void; // Callback when timeline loads
}
```

## Visual Features

### State Icons and Colors

- **UNLOCKED** (🔓): Orange - Measurement not yet started or reset
- **IN_PROGRESS** (⏳): Blue - Currently collecting and detecting stability
- **LOCKED** (🔒): Green - Measurement locked with geometric median computed

### Progress Indicators

- **Stability Score**: Visual progress bar showing how close to lock threshold (300 frames)
- **Confidence Score**: Separate progress bar showing measurement confidence level

### Interactive Elements

- **Expandable Entries**: Click to expand/collapse detailed information
- **Auto-expand Latest**: Most recent entry is expanded by default for quick review
- **Collapsible Details**: View full metadata, warnings, and notes on demand

### Responsive Design

- Desktop: Full-width timeline with side-by-side details
- Tablet: Single column layout with good spacing
- Mobile: Optimized single column with touch-friendly controls

## Integration with MeasurementLock

The timeline directly reflects the state transitions from the Python `MeasurementLock` module:

1. **UNLOCKED**: Initial state when measurement starts
2. **IN_PROGRESS**: While collecting frames, waiting for 300 stable frames
3. **LOCKED**: After 300 stable frames collected, geometric median computed

Each transition should create a StateHistory record via the POST endpoint.

## Example Integration with Python Backend

When the Python vision service updates measurement lock state, it should POST to the state-history endpoint:

```python
import requests
import json

# After lock state changes
lock_state = measurement_lock.state

response = requests.post(
    f"http://localhost:3000/api/sessions/{session_id}/state-history",
    json={
        "state": "LOCKED" if lock_state.is_locked else "IN_PROGRESS",
        "stateChangedAt": lock_state.timestamp.isoformat(),
        "stableFrameCount": lock_state.stable_frame_count,
        "stabilityScore": lock_state.stability_score,
        "confidence": lock_state.confidence,
        "changedBy": "vision_service",
        "notes": f"Frame {lock_state.frame_count}: Stability {lock_state.stability_score:.2%}",
        "warnings": lock_state.warnings,
        "universalMeasurementId": lock_state.universal_measurement_id,
        "metadata": lock_state.metadata,
    }
)
```

## Testing

Run tests with:

```bash
npm test -- OrderTimeline.test.tsx
```

Tests cover:
- All acceptance criteria validation
- Visual timeline rendering
- State transition display
- Notes and warnings display
- Progress indicators
- API integration
- Error handling
- Empty states
- Loading states
- Expandable/collapsible entries

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full responsive support

## Performance Considerations

- Efficient timeline rendering with minimal re-renders
- Lazy loading of expanded details
- Indexed database queries for fast retrieval
- CSS animations optimized for smooth scrolling

## Migration

Run the database migration to add the StateHistory table:

```bash
npx prisma migrate deploy
```

Or for development:

```bash
npx prisma migrate dev --name add_state_history
```

## Future Enhancements

- Export timeline to CSV/PDF
- Filter by state or date range
- Real-time updates via WebSocket
- Timeline comparison between sessions
- Measurement quality analytics
- User attribution and audit trails
