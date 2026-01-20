# Voice Events System

**Task:** VOICE-E01-S04-T03 - Handle Function Calls
**Module:** Voice Integration
**Epic:** Epic 01, Story 04

## Overview

The voice events system enables the UI to react to AI-triggered events from the voice assistant. It provides a reactive event-driven architecture for handling speed warnings, phase transitions, and measurement progress synchronization.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Voice Assistant (AI)                    │
│                  (Processes user speech)                    │
└────────────────────────┬────────────────────────────────────┘
                         │ Function Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              API Routes (/api/vapi/functions)               │
│           (check_speed_warning, etc.)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ Events
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     VoiceContext                            │
│              (Central event dispatcher)                     │
└────────────────────────┬────────────────────────────────────┘
                         │ State Updates
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   useVoiceEvents Hooks                      │
│         (Subscribe to specific event types)                 │
└────────────────────────┬────────────────────────────────────┘
                         │ Reactive Updates
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    UI Components                            │
│  (SpeedWarning, PhaseTransition, ScanProgress)             │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Type Definitions (`src/types/voice.ts`)

Strongly-typed event definitions:

```typescript
// Event types
type VoiceEventType =
  | 'speed_warning'
  | 'phase_transition'
  | 'measurement_lock'
  | 'height_confirmed'
  | 'session_started'
  | 'session_ended'
  | 'error';

// Scan phases
type ScanPhase =
  | 'idle'
  | 'positioning'
  | 'scanning'
  | 'locking'
  | 'locked'
  | 'complete';
```

### 2. VoiceContext (`src/contexts/VoiceContext.tsx`)

Central state management for voice events:

```typescript
interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  currentPhase: ScanPhase;
  events: TypedVoiceEvent[];
  error: string | null;
  sessionId: string | null;
}
```

**Usage:**

```tsx
import { VoiceProvider } from './contexts/VoiceContext';

function App() {
  return (
    <VoiceProvider>
      {/* Your app components */}
    </VoiceProvider>
  );
}
```

### 3. Voice Events Hook (`src/hooks/useVoiceEvents.ts`)

React hook for subscribing to voice events:

```typescript
useVoiceEvents({
  onSpeedWarning: (event) => {
    if (event.data.shouldWarn) {
      console.log('Speed too high!');
    }
  },
  onPhaseTransition: (event) => {
    console.log(`Phase: ${event.data.toPhase}`);
  },
  onMeasurementLock: (event) => {
    console.log(`Stability: ${event.data.stabilityScore}`);
  }
});
```

**Available Hooks:**

- `useVoiceEvents()` - Subscribe to voice events with handlers
- `useLatestEvent(type)` - Get most recent event of a type
- `useScanProgress()` - Track scan phase and progress
- `useSpeedWarning()` - Monitor rotation speed warnings

## UI Components

### SpeedWarningDisplay

Visual alert when rotation speed exceeds threshold.

```tsx
import { SpeedWarningDisplay } from './components/voice';

<SpeedWarningDisplay
  autoHideDuration={5000}
  className="custom-warning"
/>
```

**Features:**
- Auto-hide after duration
- Slide-in animation
- Shows current speed vs threshold
- Accessible (ARIA live region)

### PhaseTransitionIndicator

Shows current scan phase with transition notifications.

```tsx
import { PhaseTransitionIndicator } from './components/voice';

<PhaseTransitionIndicator
  displayDuration={3000}
/>
```

**Features:**
- Color-coded phase badges
- Transition toast messages
- Pulse animation during scanning
- Phase-specific colors

### ScanProgressIndicator

Synchronized progress bar showing measurement lock status.

```tsx
import { ScanProgressIndicator } from './components/voice';

<ScanProgressIndicator
  showDetails={true}
/>
```

**Features:**
- Overall progress bar (0-100%)
- Stability score display
- Stable frame counter (0-300)
- Locking phase sub-progress
- Lock confirmation badge

## Event Types

### SpeedWarningEvent

Emitted when rotation speed exceeds threshold.

```typescript
{
  type: 'speed_warning',
  timestamp: 1234567890,
  data: {
    currentSpeed: 45,      // deg/s
    threshold: 30,         // deg/s
    shouldWarn: true,
    message: 'Please slow down rotation'
  }
}
```

### PhaseTransitionEvent

Emitted when scan phase changes.

```typescript
{
  type: 'phase_transition',
  timestamp: 1234567890,
  data: {
    fromPhase: 'scanning',
    toPhase: 'locking',
    reason: 'Stable rotation detected'
  }
}
```

### MeasurementLockEvent

Emitted during measurement stabilization.

```typescript
{
  type: 'measurement_lock',
  timestamp: 1234567890,
  data: {
    isLocked: false,
    stabilityScore: 0.75,    // 0.0 - 1.0
    stableFrameCount: 225,   // 0 - 300
    measurementId: 'umid-abc123'  // when locked
  }
}
```

## Integration with API

The voice events system integrates with existing API routes:

### Speed Monitoring

```typescript
// API: GET /api/sessions/:id/scan
const response = await fetch(`/api/sessions/${sessionId}/scan`);
const { rotation_speed } = await response.json();

// Emit event
emitEvent({
  type: 'speed_warning',
  timestamp: Date.now(),
  data: {
    currentSpeed: rotation_speed,
    threshold: 30,
    shouldWarn: rotation_speed > 30,
  }
});
```

### Function Calls (Vapi Integration)

```typescript
// API: POST /api/vapi/functions
// Function: check_speed_warning

{
  "name": "check_speed_warning",
  "parameters": {
    "session_id": "cuid123",
    "threshold": 30
  }
}

// Response triggers speed_warning event
```

## Progress Calculation

Progress is calculated based on current phase and stability:

```typescript
Phase         | Base Progress | Notes
------------- | ------------- | -------------------------
idle          | 0%           | Not started
positioning   | 10%          | Getting ready
scanning      | 30%          | Active rotation
locking       | 50-80%       | + (stabilityScore * 30%)
locked        | 90%          | Measurements confirmed
complete      | 100%         | Finished
```

During the `locking` phase, progress increases linearly with stability score:
- Stability 0.0 → 50% overall progress
- Stability 0.5 → 65% overall progress
- Stability 1.0 → 80% overall progress

## Testing

Comprehensive test suite in `__tests__/voice-events.test.tsx`:

```bash
npm test voice-events
```

**Test Coverage:**
- ✓ Event emission and handling
- ✓ Phase transitions
- ✓ Progress calculation
- ✓ Event filtering
- ✓ Latest event retrieval
- ✓ Speed warning logic
- ✓ Complete scan workflow

## Example Integration

See `src/components/voice/VoiceEventDemo.tsx` for a complete example:

```tsx
import { VoiceEventDemo } from './components/voice/VoiceEventDemo';

// Standalone demo
<VoiceEventDemo />
```

Or build custom integration:

```tsx
import { VoiceProvider } from './contexts/VoiceContext';
import {
  SpeedWarningDisplay,
  PhaseTransitionIndicator,
  ScanProgressIndicator
} from './components/voice';

function CustomScanUI() {
  return (
    <VoiceProvider>
      <div>
        <PhaseTransitionIndicator />
        <ScanProgressIndicator showDetails />
        <SpeedWarningDisplay />

        {/* Your custom components */}
      </div>
    </VoiceProvider>
  );
}
```

## API Integration Points

### Backend Events → Frontend

The system expects events to be triggered from:

1. **Vision Service** (`vision_service/filtering/speed_monitor.py`)
   - Monitors rotation speed
   - Triggers speed warnings

2. **Measurement Lock** (`vision_service/filtering/measurement_lock.py`)
   - Tracks stability (300 frames)
   - Emits lock events with stability score

3. **API Routes** (`src/app/api/vapi/functions/route.ts`)
   - AI function handlers
   - Speed warning checks

### Emitting Events from API

```typescript
// In your API route or service
import { emitVoiceEvent } from './voice-event-emitter';

// After speed check
emitVoiceEvent({
  type: 'speed_warning',
  timestamp: Date.now(),
  data: {
    currentSpeed: speed,
    threshold: 30,
    shouldWarn: speed > 30,
  }
});

// After phase change
emitVoiceEvent({
  type: 'phase_transition',
  timestamp: Date.now(),
  data: {
    fromPhase: 'scanning',
    toPhase: 'locking',
  }
});
```

## Acceptance Criteria

✅ **UI reacts to voice events**
- SpeedWarningDisplay shows warnings when speed exceeds threshold
- Components update in real-time when events are emitted

✅ **Speed warning shown visually**
- Prominent red alert with warning icon
- Shows current speed vs threshold
- Auto-hides after 5 seconds
- Accessible with ARIA live regions

✅ **Phase transitions handled**
- PhaseTransitionIndicator shows current phase
- Transition messages displayed for 3 seconds
- Phase badge color-coded by state
- Smooth animations between phases

✅ **Progress synchronized**
- ScanProgressIndicator shows 0-100% progress
- Incorporates stability score during locking
- Shows stable frame count (0-300)
- Visual confirmation when measurements locked
- Progress calculation matches backend state

## Files Created

```
src/
├── types/
│   └── voice.ts                              # Type definitions
├── contexts/
│   └── VoiceContext.tsx                      # State provider
├── hooks/
│   ├── useVoiceEvents.ts                     # Event hooks
│   └── index.ts                              # Hook exports
└── components/
    └── voice/
        ├── SpeedWarningDisplay.tsx           # Speed alert UI
        ├── PhaseTransitionIndicator.tsx      # Phase badge UI
        ├── ScanProgressIndicator.tsx         # Progress bar UI
        ├── VoiceEventDemo.tsx                # Integration demo
        └── index.ts                          # Component exports

__tests__/
└── voice-events.test.tsx                     # Integration tests

src/hooks/
└── VOICE_EVENTS_README.md                    # This file
```

## Next Steps

To complete the voice integration:

1. **Connect to WebSocket/SSE** - Real-time event streaming from backend
2. **Vapi Integration** - Wire up AI function calls to emit events
3. **Vision Service Bridge** - Stream speed/lock data from Python service
4. **Session Management** - Connect events to active scan sessions
5. **Error Handling** - Add retry logic and error recovery

## Related Tasks

- **VOICE-E01-S03-T03**: Speed warning API (prerequisite)
- **VIS-E02-S02-T04**: Measurement lock implementation (prerequisite)
- **VOICE-E01-S04-T01**: Speech recognition (parallel)
- **VOICE-E01-S04-T02**: Natural language processing (parallel)
