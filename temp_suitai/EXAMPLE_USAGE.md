# VOICE-E01-S03-T04: Example Usage

This document demonstrates the complete flow of the scan completion announcement feature.

---

## Scenario: Body Scan Session

### Step 1: Vision Service Starts Scanning

The Python vision service processes video frames and updates scan progress:

```python
from vision_service.filtering import MeasurementLock
import requests

# Initialize measurement lock
lock = MeasurementLock()
session_id = "session-abc123"

# Process video frames
for frame_num, frame in enumerate(video_stream):
    # Extract body measurements from frame
    measurement = extract_body_measurements(frame)

    # Add to measurement lock
    state = lock.add_measurement(measurement)

    # Calculate progress
    progress = min(state.stable_frame_count / 300, 1.0)

    # Update Next.js API
    response = requests.post(
        f'http://localhost:3000/api/sessions/{session_id}/scan-status',
        json={
            'isLocked': state.is_locked,
            'progress': progress,
            'stableFrameCount': state.stable_frame_count,
            'confidence': state.confidence,
            'universalMeasurementId': state.universal_measurement_id if state.is_locked else None
        }
    )

    print(f"Frame {frame_num}: {int(progress * 100)}% complete")

    # Stop when locked
    if state.is_locked:
        print(f"Scan complete! UMI: {state.universal_measurement_id}")
        break
```

**Output**:
```
Frame 0: 0% complete
Frame 1: 0% complete
...
Frame 150: 50% complete
...
Frame 299: 99% complete
Frame 300: 100% complete
Scan complete! UMI: UMI_1737362713000_a1b2c3_x7y8z9
```

---

### Step 2: User Checks Status (Optional)

User or frontend can check the current scan status:

```bash
curl http://localhost:3000/api/sessions/session-abc123/scan-status
```

**Response**:
```json
{
  "sessionId": "session-abc123",
  "isLocked": true,
  "progress": 1.0,
  "stableFrameCount": 300,
  "confidence": 0.95,
  "universalMeasurementId": "UMI_1737362713000_a1b2c3_x7y8z9",
  "updatedAt": "2026-01-20T08:25:13.000Z"
}
```

---

### Step 3: Trigger LLM Announcement

System or user triggers the completion announcement:

```bash
curl -X POST http://localhost:3000/api/sessions/session-abc123/announce-completion
```

---

### Step 4: LLM Processing (Behind the Scenes)

Here's what happens internally when the announcement endpoint is called:

#### 4a. Initial Prompt to Claude
```json
{
  "role": "user",
  "content": "Please check the scan status for session \"session-abc123\" and let me know if it's complete. If the scan is complete (locked), celebrate the completion with an enthusiastic announcement!"
}
```

#### 4b. Claude Decides to Use Tool
```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "I'll check the scan status for you."
    },
    {
      "type": "tool_use",
      "id": "toolu_01A2B3C4D5E6F7G8H9",
      "name": "get_scan_status",
      "input": {
        "sessionId": "session-abc123"
      }
    }
  ],
  "stop_reason": "tool_use"
}
```

#### 4c. System Executes Tool
```typescript
// handleToolCall() is invoked
const status = await fetchScanStatus("session-abc123");
// Fetches: GET /api/sessions/session-abc123/scan-status

return JSON.stringify({
  isLocked: true,
  progress: 100,
  stableFrameCount: 300,
  confidence: 95,
  universalMeasurementId: "UMI_1737362713000_a1b2c3_x7y8z9",
  message: "Scan is complete and locked!"
});
```

#### 4d. Tool Result Returned to Claude
```json
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01A2B3C4D5E6F7G8H9",
      "content": "{\"isLocked\":true,\"progress\":100,\"stableFrameCount\":300,\"confidence\":95,\"universalMeasurementId\":\"UMI_1737362713000_a1b2c3_x7y8z9\",\"message\":\"Scan is complete and locked!\"}"
    }
  ]
}
```

#### 4e. Claude Generates Celebration
```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "🎉 Fantastic news! Your body scan for session session-abc123 is complete and locked!\n\nHere are the final results:\n• Status: ✅ Locked and ready\n• Progress: 100% complete\n• Stable frames captured: 300/300\n• Confidence level: 95%\n• Universal Measurement ID: UMI_1737362713000_a1b2c3_x7y8z9\n\nThe scan quality is excellent with a 95% confidence score. All 300 stable frames have been successfully captured and processed. Your measurements are now securely stored and ready for analysis!"
    }
  ],
  "stop_reason": "end_turn"
}
```

---

### Step 5: Final Response to User

```json
{
  "sessionId": "session-abc123",
  "announcement": "🎉 Fantastic news! Your body scan for session session-abc123 is complete and locked!\n\nHere are the final results:\n• Status: ✅ Locked and ready\n• Progress: 100% complete\n• Stable frames captured: 300/300\n• Confidence level: 95%\n• Universal Measurement ID: UMI_1737362713000_a1b2c3_x7y8z9\n\nThe scan quality is excellent with a 95% confidence score. All 300 stable frames have been successfully captured and processed. Your measurements are now securely stored and ready for analysis!"
}
```

---

## Alternative Scenario: Scan Still in Progress

### Trigger Announcement Early
```bash
curl -X POST http://localhost:3000/api/sessions/session-abc123/announce-completion
```

### Claude's Response (Not Yet Complete)
```json
{
  "sessionId": "session-abc123",
  "announcement": "I've checked the scan status for session session-abc123. The scan is currently in progress:\n\n• Progress: 67% complete\n• Stable frames: 200/300 captured\n• Confidence: 82%\n• Status: Not yet locked\n\nYou're making great progress! We need 100 more stable frames to reach the 300 required for completion. The system is tracking measurements with an 82% confidence level. Keep going!"
}
```

---

## Frontend Integration Example

### React Component

```typescript
import { useState } from 'react';

export function ScanStatus({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch current status
  const checkStatus = async () => {
    const res = await fetch(`/api/sessions/${sessionId}/scan-status`);
    const data = await res.json();
    setStatus(data);
  };

  // Trigger announcement
  const announceCompletion = async () => {
    setLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}/announce-completion`, {
      method: 'POST',
    });
    const data = await res.json();
    setAnnouncement(data.announcement);
    setLoading(false);
  };

  return (
    <div className="scan-status">
      <h2>Body Scan Status</h2>

      <button onClick={checkStatus}>Check Status</button>

      {status && (
        <div className="status-display">
          <div>Progress: {Math.round(status.progress * 100)}%</div>
          <div>Frames: {status.stableFrameCount}/300</div>
          <div>Confidence: {Math.round(status.confidence * 100)}%</div>
          <div>Status: {status.isLocked ? '✅ Complete' : '⏳ In Progress'}</div>
        </div>
      )}

      <button onClick={announceCompletion} disabled={loading}>
        {loading ? 'Checking...' : 'Get AI Announcement'}
      </button>

      {announcement && (
        <div className="announcement">
          <h3>AI Announcement:</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{announcement}</p>
        </div>
      )}
    </div>
  );
}
```

---

## WebSocket Real-Time Updates (Future Enhancement)

```typescript
// Real-time progress updates
const ws = new WebSocket('ws://localhost:3000/scan-updates');

ws.on('message', (data) => {
  const update = JSON.parse(data);

  if (update.sessionId === sessionId) {
    // Update UI with progress
    setProgress(update.progress);
    setFrameCount(update.stableFrameCount);

    // Auto-celebrate when locked
    if (update.isLocked && !hasAnnounced) {
      announceCompletion();
      setHasAnnounced(true);
    }
  }
});
```

---

## Summary

The complete flow:
1. **Vision Service** processes frames → updates scan status via API
2. **Database** stores current scan state
3. **Frontend/System** triggers announcement when ready
4. **Claude (LLM)** autonomously calls `get_scan_status` tool
5. **Tool Handler** fetches status from API
6. **Claude** analyzes status and generates contextual response
7. **User** receives celebration if complete, or progress update if ongoing

This creates a natural, conversational experience where the AI understands the scan context and responds appropriately! 🎉
