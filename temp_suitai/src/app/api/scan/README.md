# Scan API Endpoints

Frame quality and user detection status API for the SUIT AI measurement system.

## Endpoints Overview

### 1. **POST /api/scan/init**
Initialize a new scanning session.

**Purpose**: Creates a new scan record linked to a session.

**Request**:
```json
{
  "sessionId": "session-uuid"
}
```

**Response** (201 Created):
```json
{
  "scanId": "scan-uuid",
  "sessionId": "session-uuid",
  "startedAt": "2026-01-20T10:00:00.000Z",
  "message": "Scan initialized successfully"
}
```

**Error Responses**:
- 400: Missing or invalid `sessionId`
- 500: Internal server error

---

### 2. **POST /api/scan/frames**
Submit frame quality data for a scan.

**Purpose**: Records frame-level measurements including user detection status.

**Request**:
```json
{
  "scanId": "scan-uuid",
  "frameNumber": 0,
  "userInFrame": true,           // Required: boolean indicator
  "confidence": 0.95,            // Required: 0.0-1.0 confidence score
  "stabilityScore": 0.75,        // Optional: 0.0-1.0 stability
  "iou": 0.88,                   // Optional: IoU from segmentation
  "isValid": true                // Optional: auto-computed if omitted
}
```

**Response** (201 Created):
```json
{
  "frameId": "frame-uuid",
  "scanId": "scan-uuid",
  "frameNumber": 0,
  "userInFrame": true,
  "message": "Frame 0 recorded successfully"
}
```

**Validation Rules**:
- `scanId`: Required, must be a valid existing scan
- `frameNumber`: Required, must be non-negative integer
- `userInFrame`: Required boolean
- `confidence`: Required, must be 0.0-1.0
- `stabilityScore`: Optional, defaults to 0.0
- `iou`: Optional float value
- `isValid`: Optional, auto-computed as `userInFrame && confidence > 0.5`

**Error Responses**:
- 400: Validation failed
- 404: Scan not found
- 500: Internal server error

---

### 3. **GET /api/scan/status**
Query current scan status and quality metrics.

**Purpose**: Retrieves aggregated frame data, quality metrics, and user detection statistics.

**Query Parameters**:
- `scanId` (required): Scan identifier
- `sessionId` (optional): Session identifier for validation

**Example**:
```
GET /api/scan/status?scanId=scan-uuid&sessionId=session-uuid
```

**Response** (200 OK):
```json
{
  "scanId": "scan-uuid",
  "sessionId": "session-uuid",
  "status": "active",
  "isLocked": false,
  "frameCount": 50,
  "latestFrame": {
    "frameNumber": 49,
    "userInFrame": true,
    "confidence": 0.93,
    "stabilityScore": 0.82,
    "iou": 0.89,
    "isValid": true,
    "timestamp": "2026-01-20T10:00:05.000Z"
  },
  "averageConfidence": 0.91,
  "averageStabilityScore": 0.78,
  "userDetectionRate": 94.0,
  "qualityMetrics": {
    "totalFrames": 50,
    "validFrames": 47,
    "framesWithUser": 47,
    "avgConfidence": 0.91,
    "avgStability": 0.78
  },
  "startedAt": "2026-01-20T10:00:00.000Z",
  "completedAt": null
}
```

**Response Fields**:
- `status`: One of `active`, `locked`, `completed`
- `userDetectionRate`: Percentage (0-100) of frames with user detected
- `framesWithUser`: Count of frames where `userInFrame = true`
- `latestFrame`: Most recent frame data

**Error Responses**:
- 400: Missing required `scanId`
- 404: Scan not found
- 500: Internal server error

---

## Data Model

### Scan
```
{
  id: string                  // Unique scan ID
  sessionId: string           // Associated session
  startedAt: ISO8601DateTime  // Scan start time
  completedAt: ISO8601DateTime | null
  isLocked: boolean           // Whether measurements are finalized
  frames: Frame[]             // Collection of frame records
}
```

### Frame
```
{
  id: string                  // Unique frame ID
  scanId: string              // Associated scan
  frameNumber: integer        // Sequential frame index
  userInFrame: boolean        // User presence indicator ← Core field
  confidence: float           // Detection confidence (0-1)
  stabilityScore: float       // Measurement stability (0-1)
  iou: float | null           // Segmentation IoU (0-1)
  isValid: boolean            // Overall frame validity
  timestamp: ISO8601DateTime  // Frame recording time
}
```

---

## Usage Examples

### Example 1: Complete Scan Workflow

```javascript
// 1. Initialize scan
const initRes = await fetch('/api/scan/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: 'user-session-123' }),
});
const { scanId } = await initRes.json();

// 2. Process and submit frames
for (let i = 0; i < 100; i++) {
  const frame = processFrame(videoFrames[i]);

  await fetch('/api/scan/frames', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scanId,
      frameNumber: i,
      userInFrame: frame.personDetected,    // boolean
      confidence: frame.detectionConfidence, // 0-1
      stabilityScore: frame.stability,       // 0-1
      iou: frame.iou,
    }),
  });
}

// 3. Check final status
const statusRes = await fetch(`/api/scan/status?scanId=${scanId}`);
const status = await statusRes.json();
console.log(`Detected user in ${status.userDetectionRate}% of frames`);
```

### Example 2: Real-time Status Monitoring

```javascript
// Poll status during scanning
setInterval(async () => {
  const res = await fetch(`/api/scan/status?scanId=${scanId}`);
  const { frameCount, userDetectionRate, latestFrame } = await res.json();

  // Update UI
  updateProgress({
    frames: frameCount,
    detection: `${userDetectionRate.toFixed(1)}%`,
    lastUserDetected: latestFrame.userInFrame,
  });
}, 100); // Poll every 100ms
```

### Example 3: Quality Assessment

```javascript
const res = await fetch(`/api/scan/status?scanId=${scanId}`);
const status = await res.json();
const { qualityMetrics } = status;

const isHighQuality =
  qualityMetrics.avgConfidence > 0.85 &&
  qualityMetrics.avgStability > 0.75 &&
  qualityMetrics.validFrames / qualityMetrics.totalFrames > 0.9;

console.log(`Scan quality: ${isHighQuality ? 'HIGH' : 'LOW'}`);
```

---

## Integration with Vision Service

The frame quality data is populated by the vision service:

```python
from vision_service.frame_quality_detector import FrameQualityDetector

detector = FrameQualityDetector(
    sam_segmenter=segmenter,
    measurement_lock=lock_tracker,
)

# Analyze frame
quality = detector.analyze_frame(image)

# Submit to API
requests.post('/api/scan/frames', json={
    'scanId': scan_id,
    'frameNumber': frame_num,
    'userInFrame': quality.user_in_frame,  # ← Core field
    'confidence': quality.confidence,
    'stabilityScore': quality.stability_score,
    'iou': quality.iou,
})
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": {
    "field1": ["error reason"],
    "field2": ["error reason"]
  }
}
```

Common errors:
- **400 Bad Request**: Validation failed on input data
- **404 Not Found**: Scan or session not found
- **500 Internal Server Error**: Unexpected server error

---

## Performance Considerations

- Frame submission is lightweight (~1-2ms per request)
- Status queries are O(n) where n = frame count
- For real-time monitoring, use polling at 100-200ms intervals
- Consider pagination for scans with >10,000 frames

---

## Type Definitions

See `src/app/api/scan/status/route.ts` for:
- `ScanStatusResponse`
- `FrameQualityMetrics`
- `ScanInitResponse`
- `FrameSubmissionResponse`

---

## Testing

Run tests with:
```bash
npm test -- __tests__/scan-status.test.ts
```

See `__tests__/scan-status.test.ts` for comprehensive test coverage.
