# Height Input Endpoint

## Overview

`POST /api/sessions/:id/height` - Store user-reported height for mesh scaling.

This endpoint allows storing a user's height measurement in a session, which is used for proper mesh scaling in the Vision & Measurement Service.

## Endpoint Details

### Request

**URL:** `POST /api/sessions/{id}/height`

**Path Parameters:**
- `id` (string, required) - The session ID

**Request Body:**
```json
{
  "height": 175
}
```

**Body Parameters:**
- `height` (number, required) - User height in centimeters (100-250cm range)

### Response

**Success Response (200 OK):**
```json
{
  "sessionId": "session-123",
  "height": 175
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Height must be between 100cm and 250cm"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Session not found"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Internal server error"
}
```

## Validation Rules

1. **Height is Required**: The height field must be present in the request body
2. **Valid Number**: Height must be a valid number (string numbers are parsed, e.g., "175")
3. **Range**: Height must be between 100cm and 250cm (inclusive)
4. **Session Exists**: The session ID must correspond to an existing session
5. **Session ID Format**: Session ID must be a non-empty string

## Examples

### Valid Request
```bash
curl -X POST http://localhost:3000/api/sessions/session-123/height \
  -H "Content-Type: application/json" \
  -d '{"height": 175}'
```

**Response:**
```json
{
  "sessionId": "session-123",
  "height": 175
}
```

### Invalid: Height Too Low
```bash
curl -X POST http://localhost:3000/api/sessions/session-123/height \
  -H "Content-Type: application/json" \
  -d '{"height": 50}'
```

**Response (400):**
```json
{
  "error": "Height must be between 100cm and 250cm"
}
```

### Invalid: Missing Height
```bash
curl -X POST http://localhost:3000/api/sessions/session-123/height \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (400):**
```json
{
  "error": "Height is required"
}
```

## Implementation Details

- **Language:** TypeScript
- **Framework:** Next.js 14+ (App Router)
- **Database:** Prisma ORM with PostgreSQL
- **Error Handling:** Comprehensive validation with descriptive error messages
- **Data Handling:**
  - String numbers are automatically parsed to numbers
  - Decimal heights are rounded to nearest integer
  - Height is stored in centimeters in the database

## Acceptance Criteria

- ✅ Height stored in session record (via Prisma)
- ✅ Validation rejects values outside 100-250cm range
- ✅ Returns session ID and stored height
- ✅ Proper HTTP status codes (200, 400, 404, 500)
- ✅ Descriptive error messages
- ✅ Input validation and type safety

## File Structure

```
src/app/api/sessions/[id]/height/
├── route.ts           # Main endpoint implementation
├── route.test.ts      # Test cases and validation examples
└── README.md          # This file
```

## Testing

See `route.test.ts` for comprehensive test cases covering:
- Boundary conditions (100cm, 250cm)
- Valid inputs (numbers, strings, decimals)
- Invalid inputs (out of range, missing, wrong type)
- Session ID validation
