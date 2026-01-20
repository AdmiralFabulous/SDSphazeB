# Measurement Export - Quick Start Guide

Get up and running with the measurement export functionality in 5 minutes.

## Installation

No additional installation required! The export module uses only built-in dependencies.

## Basic Usage

### 1. Import the Export Function

```typescript
import { exportMeasurements, downloadExport } from '@/lib/export';
import type { MeasurementData } from '@/lib/export/types';
```

### 2. Create Measurement Data

```typescript
const measurements: MeasurementData = {
  sessionId: 'session-123',
  universalMeasurementId: 'UMI_2026_01_20_abc123_xyz789',
  measurements: {
    head_circumference: 57.5,
    neck_circumference: 38.2,
    chest_circumference: 98.6,
    waist_circumference: 82.3,
    hip_circumference: 95.4,
    // ... add more measurements
  },
  confidence: 0.95,
};
```

### 3. Export in Your Preferred Format

```typescript
// Export as Optitex (TSV)
const optitex = exportMeasurements(measurements, 'optitex');

// Export as CSV
const csv = exportMeasurements(measurements, 'csv');

// Export as JSON
const json = exportMeasurements(measurements, 'json');
```

### 4. Download File (Browser)

```typescript
// Automatic download to user's device
downloadExport(measurements, 'optitex');
```

## Common Scenarios

### Scenario 1: React Component with Export Buttons

```tsx
'use client';

import { downloadExport } from '@/lib/export';
import type { MeasurementData } from '@/lib/export/types';

export function MeasurementExport({ data }: { data: MeasurementData }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => downloadExport(data, 'optitex')}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Download Optitex
      </button>
      <button
        onClick={() => downloadExport(data, 'csv')}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Download CSV
      </button>
      <button
        onClick={() => downloadExport(data, 'json')}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Download JSON
      </button>
    </div>
  );
}
```

### Scenario 2: API Endpoint Export

```typescript
// GET /api/export?sessionId=xxx&format=csv
import { exportMeasurements } from '@/lib/export';
import type { ExportFormat, MeasurementData } from '@/lib/export/types';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  const format = (url.searchParams.get('format') || 'optitex') as ExportFormat;

  // Fetch measurements from database
  const measurements: MeasurementData = await fetchMeasurements(sessionId);

  // Generate export
  const content = exportMeasurements(measurements, format);

  // Return as file
  return new Response(content, {
    headers: {
      'Content-Type': format === 'json' ? 'application/json' : 'text/plain',
      'Content-Disposition': `attachment; filename="measurements_${format}.${getExtension(format)}"`,
    },
  });
}

function getExtension(format: string) {
  return format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt';
}
```

### Scenario 3: Server-Side Export with Session

```typescript
// Server action - triggered from client
'use server';

import { exportMeasurements } from '@/lib/export';
import prisma from '@/lib/prisma';

export async function exportSessionMeasurements(sessionId: string, format: 'optitex' | 'csv' | 'json') {
  // Get session with measurements
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // Parse stored measurements
  const measurements = JSON.parse(session.measurementData || '{}');

  // Generate export
  const content = exportMeasurements(
    {
      sessionId: session.id,
      universalMeasurementId: session.universalMeasurementId,
      measurements,
      confidence: session.measurementConfidence,
    },
    format
  );

  return content;
}
```

### Scenario 4: Copy to Clipboard

```typescript
import { exportMeasurements } from '@/lib/export';

async function copyToClipboard(measurements: MeasurementData, format: 'optitex' | 'csv' | 'json') {
  const content = exportMeasurements(measurements, format);
  await navigator.clipboard.writeText(content);
  alert('Copied to clipboard!');
}
```

## Exported Formats

### Optitex (TSV)

Perfect for professional use with fashion CAD software.

```
OPTITEX MEASUREMENT EXPORT
Generated: 2026-01-20T10:30:45.123Z
Session ID: session-123

MEASUREMENT	VALUE	UNIT
--------------------------------------------------

# Head & Neck
Head Circumference	57.50	cm
Neck Circumference	38.20	cm
```

### CSV

Perfect for spreadsheet applications.

```csv
Session ID,session-123
Generated,2026-01-20T10:30:45.123Z

Measurement Name,Category,Value,Unit
"Head Circumference",Head & Neck,57.50,cm
```

### JSON

Perfect for API integration and data processing.

```json
{
  "metadata": {
    "sessionId": "session-123",
    "generated": "2026-01-20T10:30:45.123Z",
    "confidence": 0.95
  },
  "measurements": {
    "HEAD_NECK": [
      ["head_circumference", 57.50]
    ]
  }
}
```

## Available Measurements

The module supports 22 standard measurements:

```typescript
import { STANDARD_MEASUREMENTS } from '@/lib/export';

// List all measurements
Object.entries(STANDARD_MEASUREMENTS).forEach(([key, measurement]) => {
  console.log(`${measurement.label} (${measurement.unit})`);
});
```

**Output:**
```
Head Circumference (cm)
Neck Circumference (cm)
...
Leg Length (cm)
```

## TypeScript Types

```typescript
// Measurement data
interface MeasurementData {
  sessionId?: string;
  universalMeasurementId?: string;
  measurements: Record<string, number>;
  confidence?: number;
  timestamp?: string;
}

// Export format
type ExportFormat = 'optitex' | 'csv' | 'json';
```

## API Endpoints

### Export Session Measurements

```bash
# Optitex format
POST /api/sessions/{sessionId}/export?format=optitex

# CSV format
POST /api/sessions/{sessionId}/export?format=csv

# JSON format
POST /api/sessions/{sessionId}/export?format=json
```

### Get Export Info

```bash
GET /api/sessions/{sessionId}/export
```

Response:
```json
{
  "sessionId": "session-123",
  "availableFormats": ["optitex", "csv", "json"],
  "examples": {...}
}
```

## Testing

```bash
# Run tests
npm test -- measurement_export.test.ts

# Test specific format
npm test -- -t "Optitex Format"

# Test with coverage
npm test -- --coverage measurement_export.test.ts
```

## Troubleshooting

### Issue: "Session not found"

**Solution:** Verify the session ID exists in the database:
```typescript
const session = await prisma.session.findUnique({
  where: { id: sessionId },
});
console.log(session); // Should not be null
```

### Issue: Measurements appear empty

**Solution:** Ensure measurements are properly stored:
```typescript
const measurements: MeasurementData = {
  measurements: {
    head_circumference: 57.5, // Key must match STANDARD_MEASUREMENTS
    // ... other measurements
  },
};
```

### Issue: Filename has special characters

**Solution:** The module automatically generates safe filenames:
```typescript
import { generateExportFilename } from '@/lib/export';

const filename = generateExportFilename('optitex', measurementId);
// Returns: measurements_optitex_UMI_2026_01_20_abc123_2026-01-20T10-30-45.txt
```

### Issue: JSON parse error

**Solution:** Ensure measurements are valid numbers:
```typescript
const measurements = {
  head_circumference: 57.5, // ✓ Valid
  // head_circumference: "57.5", // ✗ Invalid - should be number
};
```

## Best Practices

1. **Always include sessionId for traceability**
   ```typescript
   const data: MeasurementData = {
     sessionId: 'session-123', // Include this
     measurements: { ... },
   };
   ```

2. **Set confidence score for quality indication**
   ```typescript
   const data: MeasurementData = {
     measurements: { ... },
     confidence: 0.95, // Include confidence
   };
   ```

3. **Include universalMeasurementId for identification**
   ```typescript
   const data: MeasurementData = {
     universalMeasurementId: 'UMI_2026_01_20_abc123_xyz789',
     measurements: { ... },
   };
   ```

4. **Use server actions for security**
   ```typescript
   'use server'; // Validate session ID server-side
   export async function exportMeasurements(sessionId: string) {
     // Verify user has access to this session
     // Then export data
   }
   ```

5. **Handle errors gracefully**
   ```typescript
   try {
     downloadExport(measurements, 'optitex');
   } catch (error) {
     console.error('Export failed:', error);
     // Show user-friendly error message
   }
   ```

## More Examples

See `src/lib/export/README.md` for:
- Complete API reference
- Advanced options
- Integration patterns
- Database schema
- Performance notes
- Future enhancements

See `src/components/measurements/ExportOptions.tsx` for:
- React component examples
- UI patterns
- Error handling
- Loading states

## Need Help?

- Check `src/lib/export/README.md` for detailed documentation
- Review test cases in `measurement_export.test.ts`
- Look at example component in `ExportOptions.tsx`
- Check API implementation in `/api/sessions/[id]/export/route.ts`

---

**Version:** 1.0
**Last Updated:** January 20, 2026
**Status:** ✅ Ready for Production
