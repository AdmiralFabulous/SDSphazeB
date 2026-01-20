/**
 * Test cases for POST /api/sessions/[id]/height endpoint
 *
 * Acceptance Criteria:
 * - Height stored in session record
 * - Validation rejects values outside 100-250cm range
 * - Returns session ID and stored height
 */

interface TestCase {
  name: string;
  input: {
    sessionId: string;
    height: unknown;
  };
  expectedStatus: number;
  expectedResponse: {
    sessionId?: string;
    height?: number;
    error?: string;
  };
}

const testCases: TestCase[] = [
  // Valid cases
  {
    name: "Valid height at minimum boundary (100cm)",
    input: { sessionId: "session-123", height: 100 },
    expectedStatus: 200,
    expectedResponse: { sessionId: "session-123", height: 100 },
  },
  {
    name: "Valid height at maximum boundary (250cm)",
    input: { sessionId: "session-123", height: 250 },
    expectedStatus: 200,
    expectedResponse: { sessionId: "session-123", height: 250 },
  },
  {
    name: "Valid height in middle of range (175cm)",
    input: { sessionId: "session-123", height: 175 },
    expectedStatus: 200,
    expectedResponse: { sessionId: "session-123", height: 175 },
  },
  {
    name: "Valid height as string (should be parsed)",
    input: { sessionId: "session-123", height: "180" },
    expectedStatus: 200,
    expectedResponse: { sessionId: "session-123", height: 180 },
  },
  {
    name: "Valid height with decimal (should be rounded)",
    input: { sessionId: "session-123", height: 175.7 },
    expectedStatus: 200,
    expectedResponse: { sessionId: "session-123", height: 176 },
  },

  // Invalid: outside range
  {
    name: "Invalid: height below minimum (99cm)",
    input: { sessionId: "session-123", height: 99 },
    expectedStatus: 400,
    expectedResponse: { error: "Height must be between 100cm and 250cm" },
  },
  {
    name: "Invalid: height above maximum (251cm)",
    input: { sessionId: "session-123", height: 251 },
    expectedStatus: 400,
    expectedResponse: { error: "Height must be between 100cm and 250cm" },
  },
  {
    name: "Invalid: height far below minimum (50cm)",
    input: { sessionId: "session-123", height: 50 },
    expectedStatus: 400,
    expectedResponse: { error: "Height must be between 100cm and 250cm" },
  },
  {
    name: "Invalid: height far above maximum (300cm)",
    input: { sessionId: "session-123", height: 300 },
    expectedStatus: 400,
    expectedResponse: { error: "Height must be between 100cm and 250cm" },
  },

  // Invalid: missing/null/undefined
  {
    name: "Invalid: missing height field",
    input: { sessionId: "session-123", height: undefined },
    expectedStatus: 400,
    expectedResponse: { error: "Height is required" },
  },
  {
    name: "Invalid: null height",
    input: { sessionId: "session-123", height: null },
    expectedStatus: 400,
    expectedResponse: { error: "Height is required" },
  },

  // Invalid: wrong type
  {
    name: "Invalid: height as boolean",
    input: { sessionId: "session-123", height: true },
    expectedStatus: 400,
    expectedResponse: { error: "Height must be a valid number" },
  },
  {
    name: "Invalid: height as non-numeric string",
    input: { sessionId: "session-123", height: "abc" },
    expectedStatus: 400,
    expectedResponse: { error: "Height must be a valid number" },
  },

  // Invalid: session ID
  {
    name: "Invalid: empty session ID",
    input: { sessionId: "", height: 175 },
    expectedStatus: 400,
    expectedResponse: { error: "Invalid session ID" },
  },
  {
    name: "Invalid: whitespace session ID",
    input: { sessionId: "   ", height: 175 },
    expectedStatus: 400,
    expectedResponse: { error: "Invalid session ID" },
  },
];

/**
 * Summary of test coverage:
 *
 * Boundary Testing:
 * ✓ Minimum valid (100cm)
 * ✓ Maximum valid (250cm)
 * ✓ Just below minimum (99cm)
 * ✓ Just above maximum (251cm)
 *
 * Type Coercion:
 * ✓ String numbers are parsed
 * ✓ Decimals are rounded
 *
 * Validation:
 * ✓ Required field validation
 * ✓ Range validation
 * ✓ Type validation
 * ✓ Session ID validation
 *
 * Response Format:
 * ✓ Success returns sessionId and height
 * ✓ Errors return descriptive messages
 */

export { testCases };
