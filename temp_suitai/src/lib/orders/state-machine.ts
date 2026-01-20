/**
 * Order State Machine
 *
 * Defines valid state transitions for orders and provides validation functions.
 * Ensures orders can only move through valid state progressions.
 *
 * Phase B Extension: Added S20-S26 for Dubai logistics track.
 * - Track A (UK): S01-S19 (local delivery)
 * - Track B (Dubai): S01-S15 -> S20-S26 (charter flight delivery)
 */

export type Track = "A" | "B";

export const STATE_TRANSITIONS: Record<string, string[]> = {
  // S01-S15: Common states for both tracks
  S01_PAID: ["S02_MEASUREMENT_PENDING"],
  S02_MEASUREMENT_PENDING: ["S03_MEASUREMENT_RECEIVED"],
  S03_MEASUREMENT_RECEIVED: ["S04_PATTERN_PENDING"],
  S04_PATTERN_PENDING: ["S05_PATTERN_GENERATED"],
  S05_PATTERN_GENERATED: ["S06_SENT_TO_PRINTER"],
  S06_SENT_TO_PRINTER: ["S07_PRINT_COLLECTED", "S08_PRINT_REJECTED"],
  S07_PRINT_COLLECTED: ["S09_DELIVERED_TO_RAJA"],
  S08_PRINT_REJECTED: ["S06_SENT_TO_PRINTER"],
  S09_DELIVERED_TO_RAJA: ["S10_CUTTING_IN_PROGRESS"],
  S10_CUTTING_IN_PROGRESS: ["S11_CUTTING_COMPLETE"],
  S11_CUTTING_COMPLETE: ["S12_STITCHING_IN_PROGRESS"],
  S12_STITCHING_IN_PROGRESS: ["S13_STITCHING_COMPLETE"],
  S13_STITCHING_COMPLETE: ["S14_QC_IN_PROGRESS"],
  S14_QC_IN_PROGRESS: ["S15_QC_PASSED", "S16_QC_FAILED"],

  // S15: Branch point - Track A goes to S17, Track B goes to S20
  S15_QC_PASSED: ["S17_SHIPPED", "S20_FLIGHT_MANIFEST"],

  S16_QC_FAILED: ["S12_STITCHING_IN_PROGRESS"],

  // Track A: Local UK delivery (S17-S19)
  S17_SHIPPED: ["S18_DELIVERED"],
  S18_DELIVERED: ["S19_COMPLETE"],
  S19_COMPLETE: [], // Terminal state for Track A

  // Track B: Dubai charter flight logistics (S20-S26)
  S20_FLIGHT_MANIFEST: ["S21_IN_FLIGHT"],
  S21_IN_FLIGHT: ["S22_LANDED"],
  S22_LANDED: ["S23_CUSTOMS_CLEARED"],
  S23_CUSTOMS_CLEARED: ["S24_VAN_ASSIGNED"],
  S24_VAN_ASSIGNED: ["S25_OUT_FOR_DELIVERY"],
  S25_OUT_FOR_DELIVERY: ["S26_DELIVERED_UAE"],
  S26_DELIVERED_UAE: [], // Terminal state for Track B
};

export const STATE_LABELS: Record<string, string> = {
  // Common states (S01-S16)
  S01_PAID: "Paid",
  S02_MEASUREMENT_PENDING: "Awaiting Measurements",
  S03_MEASUREMENT_RECEIVED: "Measurements Received",
  S04_PATTERN_PENDING: "Pattern Generation Pending",
  S05_PATTERN_GENERATED: "Pattern Generated",
  S06_SENT_TO_PRINTER: "Sent to Printer",
  S07_PRINT_COLLECTED: "Print Collected",
  S08_PRINT_REJECTED: "Print Rejected",
  S09_DELIVERED_TO_RAJA: "Delivered to Tailor",
  S10_CUTTING_IN_PROGRESS: "Cutting",
  S11_CUTTING_COMPLETE: "Cut Complete",
  S12_STITCHING_IN_PROGRESS: "Stitching",
  S13_STITCHING_COMPLETE: "Stitching Complete",
  S14_QC_IN_PROGRESS: "Quality Check",
  S15_QC_PASSED: "QC Passed",
  S16_QC_FAILED: "QC Failed",

  // Track A states (S17-S19)
  S17_SHIPPED: "Shipped (UK)",
  S18_DELIVERED: "Delivered (UK)",
  S19_COMPLETE: "Complete",

  // Track B states (S20-S26)
  S20_FLIGHT_MANIFEST: "On Flight Manifest",
  S21_IN_FLIGHT: "In Flight",
  S22_LANDED: "Landed in UAE",
  S23_CUSTOMS_CLEARED: "Customs Cleared",
  S24_VAN_ASSIGNED: "Van Assigned",
  S25_OUT_FOR_DELIVERY: "Out for Delivery",
  S26_DELIVERED_UAE: "Delivered (UAE)",
};

/**
 * Track-specific valid transitions from S15_QC_PASSED
 */
export const TRACK_TRANSITIONS: Record<Track, Record<string, string[]>> = {
  A: {
    S15_QC_PASSED: ["S17_SHIPPED"],
  },
  B: {
    S15_QC_PASSED: ["S20_FLIGHT_MANIFEST"],
  },
};

/**
 * Terminal states for each track
 */
export const TERMINAL_STATES: Record<Track, string> = {
  A: "S19_COMPLETE",
  B: "S26_DELIVERED_UAE",
};

/**
 * Check if a state is a Track B logistics state
 */
export function isTrackBState(state: string): boolean {
  return state.startsWith("S2") && parseInt(state.substring(1, 3)) >= 20;
}

/**
 * Check if a state transition is valid
 * @param from - Current state
 * @param to - Target state
 * @param track - Order track (A or B), defaults to A for backward compatibility
 * @returns true if transition is valid, false otherwise
 */
export function isValidTransition(
  from: string,
  to: string,
  track: Track = "A",
): boolean {
  // For track-specific branch points, use track-aware transitions
  if (TRACK_TRANSITIONS[track]?.[from]) {
    return TRACK_TRANSITIONS[track][from].includes(to);
  }

  const validNextStates = STATE_TRANSITIONS[from] || [];
  return validNextStates.includes(to);
}

/**
 * Get all valid next states for a given current state
 * @param currentState - The current order state
 * @param track - Order track (A or B), defaults to A for backward compatibility
 * @returns Array of valid next state codes
 */
export function getValidNextStates(
  currentState: string,
  track: Track = "A",
): string[] {
  // For track-specific branch points, return track-specific options
  if (TRACK_TRANSITIONS[track]?.[currentState]) {
    return TRACK_TRANSITIONS[track][currentState];
  }

  return STATE_TRANSITIONS[currentState] || [];
}

/**
 * Get human-readable label for a state
 * @param state - State code
 * @returns Human-readable label
 */
export function getStateLabel(state: string): string {
  return STATE_LABELS[state] || state;
}

export interface StateTransitionValidation {
  valid: boolean;
  error?: string;
  validOptions?: string[];
}

/**
 * Validate a state transition and provide detailed error information
 * @param from - Current state
 * @param to - Target state
 * @param track - Order track (A or B), defaults to A for backward compatibility
 * @returns Validation result with error details if invalid
 */
export function validateStateTransition(
  from: string,
  to: string,
  track: Track = "A",
): StateTransitionValidation {
  // Check if source state exists
  if (!STATE_TRANSITIONS[from]) {
    return {
      valid: false,
      error: `Unknown state: ${from}`,
    };
  }

  // Check if target state exists (allow terminal states)
  const terminalStates = ["S19_COMPLETE", "S26_DELIVERED_UAE"];
  if (!STATE_TRANSITIONS[to] && !terminalStates.includes(to)) {
    return {
      valid: false,
      error: `Unknown target state: ${to}`,
    };
  }

  const validNextStates = getValidNextStates(from, track);

  // Check if order is in terminal state
  if (validNextStates.length === 0) {
    return {
      valid: false,
      error: `Order is in terminal state: ${getStateLabel(from)}`,
    };
  }

  // Check if transition is valid for this track
  if (!validNextStates.includes(to)) {
    return {
      valid: false,
      error: `Cannot transition from ${getStateLabel(from)} to ${getStateLabel(to)} on Track ${track}`,
      validOptions: validNextStates,
    };
  }

  return { valid: true };
}

/**
 * Get the expected track for a given state
 * Returns undefined for common states, 'A' for Track A specific, 'B' for Track B specific
 */
export function getStateTrack(state: string): Track | undefined {
  if (["S17_SHIPPED", "S18_DELIVERED", "S19_COMPLETE"].includes(state)) {
    return "A";
  }
  if (isTrackBState(state)) {
    return "B";
  }
  return undefined; // Common state
}
