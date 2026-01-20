# Measurement Export Module

## Overview

The Measurement Export Module provides comprehensive functionality for exporting body measurement data in multiple formats:

- **Optitex** (TSV) - Tab-separated values for fashion CAD software
- **CSV** - Comma-separated values for spreadsheet applications
- **JSON** - Structured format for API integration and programmatic access

## Features

### Export Formats

#### Optitex Format
Professional tab-separated values (TSV) format optimized for Optitex fashion CAD software:

```
OPTITEX MEASUREMENT EXPORT
Generated: 2026-01-20T10:30:45.123Z
Session ID: session-123
Universal Measurement ID: UMI_2026_01_20_abc123_xyz789

MEASUREMENT	VALUE	UNIT
--------------------------------------------------

# Head & Neck
Head Circumference	57.50	cm
Neck Circumference	38.20	cm
...
```

**Features:**
- Organized by body region/category
- Tab-separated values for precise alignment
- Includes metadata (timestamp, session ID, measurement ID)
- Professional presentation suitable for industry use
- Measurement count summary

#### CSV Format
Standard comma-separated values format for spreadsheet compatibility:

```csv
Session ID,session-123
Universal Measurement ID,UMI_2026_01_20_abc123_xyz789
Generated,2026-01-20T10:30:45.123Z

Measurement Name,Category,Value,Unit
"Head Circumference",Head & Neck,57.50,cm
"Neck Circumference",Head & Neck,38.20,cm
...
```

**Features:**
- Compatible with Excel, Google Sheets, and other spreadsheet software
- Proper CSV escaping for special characters
- Metadata included in header rows
- Category grouping for easy filtering

#### JSON Format
Structured JSON for programmatic access and API integration:

```json
{
  "metadata": {
    "sessionId": "session-123",
    "universalMeasurementId": "UMI_2026_01_20_abc123_xyz789",
    "generated": "2026-01-20T10:30:45.123Z",
    "confidence": 0.95
  },
  "measurements": {
    "HEAD_NECK": [
      ["head_circumference", 57.50],
      ["neck_circumference", 38.20]
    ],
    "TORSO_CHEST": [...],
    "ARMS_HANDS": [...],
    "LEGS_FEET": [...]
  },
  "totals": {
    "count": 22
  }
}
```

**Features:**
- Clean, hierarchical structure
- Measurements grouped by category
- Metadata included for reference
- Easy to parse and integrate with other systems
- Pretty-printed with 2-space indentation

### Supported Measurements

The module supports 22 standard anthropometric measurements organized into 4 categories:

#### Head & Neck (4 measurements)
- Head Circumference
- Neck Circumference
- Head Length
- Head Width

#### Torso & Chest (6 measurements)
- Shoulder Circumference
- Chest Circumference
- Waist Circumference
- Hip Circumference
- Shoulder Width
- Torso Length

#### Arms & Hands (5 measurements)
- Left Arm Circumference
- Right Arm Circumference
- Left Wrist Circumference
- Right Wrist Circumference
- Arm Length

#### Legs & Feet (7 measurements)
- Left Thigh Circumference
- Right Thigh Circumference
- Left Calf Circumference
- Right Calf Circumference
- Left Ankle Circumference
- Right Ankle Circumference
- Leg Length

## API Reference

### `exportMeasurements(data, format?, options?)`

Main function to export measurements in the specified format.

**Parameters:**
- `data: MeasurementData` - Measurement data object
- `format: ExportFormat` (optional, default: 'optitex') - 'optitex' | 'csv' | 'json'
- `options: OptitexExportOptions` (optional) - Format-specific options

**Returns:** `string` - Formatted export content

**Example:**
```typescript
import { exportMeasurements } from '@/lib/export/measurement_export';

const measurements = {
  sessionId: 'session-123',
  universalMeasurementId: 'UMI_2026_01_20_abc123',
  measurements: {
    head_circumference: 57.5,
    neck_circumference: 38.2,
    // ... more measurements
  },
  confidence: 0.95,
};

const optitexContent = exportMeasurements(measurements, 'optitex');
const csvContent = exportMeasurements(measurements, 'csv');
const jsonContent = exportMeasurements(measurements, 'json');
```

### `generateOptitex(data, options?)`

Generate Optitex (TSV) format specifically.

**Parameters:**
- `data: MeasurementData` - Measurement data
- `options: OptitexExportOptions` (optional) - Optitex-specific options

**Returns:** `string` - TSV-formatted content

### `generateCSV(data)`

Generate CSV format specifically.

**Parameters:**
- `data: MeasurementData` - Measurement data

**Returns:** `string` - CSV-formatted content

### `generateJSON(data)`

Generate JSON format specifically.

**Parameters:**
- `data: MeasurementData` - Measurement data

**Returns:** `string` - JSON-formatted content

### `generateExportFilename(format, universalMeasurementId?)`

Generate appropriate filename for export based on format and measurement ID.

**Parameters:**
- `format: ExportFormat` - 'optitex' | 'csv' | 'json'
- `universalMeasurementId: string` (optional) - Universal Measurement ID

**Returns:** `string` - Filename with format-appropriate extension

**Example:**
```typescript
const filename = generateExportFilename('optitex', 'UMI_2026_01_20_abc123');
// Returns: "measurements_optitex_UMI_2026_01_20_abc123_2026-01-20T10-30-45.txt"
```

### `downloadExport(data, format?, options?)`

Trigger client-side download of exported measurements (browser only).

**Parameters:**
- `data: MeasurementData` - Measurement data
- `format: ExportFormat` (optional, default: 'optitex') - Export format
- `options: OptitexExportOptions` (optional) - Format-specific options

**Example:**
```typescript
import { downloadExport } from '@/lib/export/measurement_export';

const button = document.getElementById('download-optitex');
button.addEventListener('click', () => {
  downloadExport(measurementData, 'optitex');
});
```

## Data Types

### `MeasurementData`

```typescript
interface MeasurementData {
  sessionId?: string;                    // Session identifier
  universalMeasurementId?: string;       // Unique measurement ID
  measurements: Record<string, number>;  // Map of measurement keys to values
  confidence?: number;                   // Confidence score (0-1)
  timestamp?: string;                    // ISO 8601 timestamp
}
```

### `OptitexExportOptions`

```typescript
interface OptitexExportOptions {
  includeMetadata?: boolean;    // Include session/ID metadata
  includeCategory?: boolean;    // Include category headers
  precision?: number;           // Decimal places (default: 2)
}
```

### `ExportFormat`

```typescript
type ExportFormat = 'optitex' | 'csv' | 'json';
```

## REST API Endpoints

### Export Measurement Data

**Endpoint:** `POST /api/sessions/{sessionId}/export?format=optitex|csv|json`

**Query Parameters:**
- `format` (optional, default: 'optitex') - Export format

**Response Headers:**
- `Content-Type` - Format-appropriate MIME type
- `Content-Disposition` - Attachment header with filename
- `Content-Length` - File size in bytes

**Example Requests:**

```bash
# Optitex format
curl -X POST "http://localhost:3000/api/sessions/session-123/export?format=optitex"

# CSV format
curl -X POST "http://localhost:3000/api/sessions/session-123/export?format=csv"

# JSON format
curl -X POST "http://localhost:3000/api/sessions/session-123/export?format=json"
```

### Get Export Metadata

**Endpoint:** `GET /api/sessions/{sessionId}/export`

**Response:**
```json
{
  "sessionId": "session-123",
  "availableFormats": ["optitex", "csv", "json"],
  "descriptions": {
    "optitex": "Tab-separated values format for Optitex fashion CAD software",
    "csv": "Comma-separated values format for spreadsheet applications",
    "json": "JSON format for API integration and programmatic access"
  },
  "examples": {
    "optitexUrl": "/api/sessions/session-123/export?format=optitex",
    "csvUrl": "/api/sessions/session-123/export?format=csv",
    "jsonUrl": "/api/sessions/session-123/export?format=json"
  }
}
```

## Usage Examples

### Frontend Export with Download

```typescript
// components/ExportButton.tsx
import { downloadExport } from '@/lib/export/measurement_export';
import type { MeasurementData } from '@/lib/export/types';

export function ExportButton({ measurementData }: { measurementData: MeasurementData }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => downloadExport(measurementData, 'optitex')}>
        Download Optitex
      </button>
      <button onClick={() => downloadExport(measurementData, 'csv')}>
        Download CSV
      </button>
      <button onClick={() => downloadExport(measurementData, 'json')}>
        Download JSON
      </button>
    </div>
  );
}
```

### Backend Export with Server Response

```typescript
// API usage
export async function POST(request: NextRequest) {
  const { sessionId } = request.params;
  const format = request.nextUrl.searchParams.get('format') || 'optitex';

  const measurements: MeasurementData = {
    sessionId,
    measurements: {
      head_circumference: 57.5,
      // ... load from database
    },
  };

  const content = exportMeasurements(measurements, format as ExportFormat);

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="measurements.txt"`,
    },
  });
}
```

### Programmatic Processing

```typescript
// Process exported data
import { exportMeasurements } from '@/lib/export/measurement_export';

const measurements: MeasurementData = {
  sessionId: 'session-123',
  measurements: {
    head_circumference: 57.5,
    // ...
  },
};

// Export to JSON for API consumption
const json = exportMeasurements(measurements, 'json');
const data = JSON.parse(json);

// Use structured data
console.log(`Session: ${data.metadata.sessionId}`);
data.measurements.HEAD_NECK.forEach(([key, value]) => {
  console.log(`${key}: ${value} cm`);
});
```

## Integration with Vision Service

The export module is designed to work with the Vision & Measurement Service:

1. **Measurement Lock** outputs `universalMeasurementId` and measurements
2. **Export Module** accepts these measurements and formats them
3. **API Endpoint** retrieves session data and calls export module
4. **Client** downloads or processes the exported data

### Data Flow

```
Vision Service (measurements)
    ↓
Measurement Lock (stable measurements)
    ↓
Database (Session model with measurements)
    ↓
API Endpoint (/api/sessions/{id}/export)
    ↓
Export Module (format conversion)
    ↓
Client (download/process)
```

## Performance Characteristics

- **Memory:** O(n) where n = number of measurements (typically ~22)
- **CPU:** O(n) for formatting
- **String Generation:** < 1ms for typical measurement sets
- **File Download:** Instant (< 10ms)

## Testing

The module includes 50+ comprehensive test cases covering:

- Format generation (Optitex, CSV, JSON)
- Metadata inclusion
- Value formatting and precision
- Category grouping
- Special character handling
- Edge cases (empty, zero, very large/small values)
- Filename generation
- CSV escaping

**Run Tests:**
```bash
npm test -- measurement_export.test.ts
```

## Validation & Error Handling

### Input Validation
- Session ID existence checked in API
- Format parameter validated against allowed values
- Measurement data structure validated

### Error Responses
```json
{
  "error": "Invalid export format",
  "details": [...]
}
```

## Future Enhancements

- [ ] Batch export multiple sessions
- [ ] Custom measurement filtering
- [ ] Excel format (.xlsx) support
- [ ] PDF export with formatting
- [ ] Email export delivery
- [ ] Scheduled exports
- [ ] Export templates
- [ ] Comparison exports (before/after)

## File Structure

```
src/lib/export/
├── measurement_export.ts      (Main implementation)
├── measurement_export.test.ts (Test suite)
├── types.ts                   (TypeScript types)
└── README.md                  (This file)

src/app/api/sessions/[id]/export/
└── route.ts                   (REST API endpoint)
```

## Contributing

When adding new measurements:

1. Add to `STANDARD_MEASUREMENTS` in `measurement_export.ts`
2. Include label, unit, and category
3. Update tests to include new measurement
4. Update documentation with new count
5. Ensure category exists in `MEASUREMENT_CATEGORIES`

## Related Modules

- **Vision Service** - Provides measurement calculations
- **Measurement Lock** - Provides stable measurements with confidence
- **A-Pose Normalization** - Ensures consistent body pose
- **Landmarks** - Defines measurement points on SMPL model

## References

- Optitex Fashion CAD Software: https://www.optitex.com/
- ISO 20685-1: 3D scanning methodologies for anthropometric databases
- SMPL: A Skinned Multi-Person Linear Model
- RFC 4180: Common Format and MIME Type for Comma-Separated Values

## License

Same as parent project
