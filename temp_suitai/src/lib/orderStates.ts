/**
 * Order State Definitions
 * Defines all 26 possible order states with labels and color coding
 *
 * Phase B Extension: Added S20-S26 for Dubai logistics track
 * - Track A (UK): S01-S19 (local delivery)
 * - Track B (Dubai): S01-S15 -> S20-S26 (charter flight delivery)
 */

export enum OrderState {
  // Common states (S01-S16)
  S01 = "S01_PAID",
  S02 = "S02_MEASUREMENT_PENDING",
  S03 = "S03_MEASUREMENT_RECEIVED",
  S04 = "S04_PATTERN_PENDING",
  S05 = "S05_PATTERN_GENERATED",
  S06 = "S06_SENT_TO_PRINTER",
  S07 = "S07_PRINT_COLLECTED",
  S08 = "S08_PRINT_REJECTED",
  S09 = "S09_DELIVERED_TO_RAJA",
  S10 = "S10_CUTTING_IN_PROGRESS",
  S11 = "S11_CUTTING_COMPLETE",
  S12 = "S12_STITCHING_IN_PROGRESS",
  S13 = "S13_STITCHING_COMPLETE",
  S14 = "S14_QC_IN_PROGRESS",
  S15 = "S15_QC_PASSED",
  S16 = "S16_QC_FAILED",

  // Track A states (S17-S19) - UK local delivery
  S17 = "S17_SHIPPED",
  S18 = "S18_DELIVERED",
  S19 = "S19_COMPLETE",

  // Track B states (S20-S26) - Dubai charter flight logistics
  S20 = "S20_FLIGHT_MANIFEST",
  S21 = "S21_IN_FLIGHT",
  S22 = "S22_LANDED",
  S23 = "S23_CUSTOMS_CLEARED",
  S24 = "S24_VAN_ASSIGNED",
  S25 = "S25_OUT_FOR_DELIVERY",
  S26 = "S26_DELIVERED_UAE",
}

export type OrderStateType = keyof typeof OrderState;

interface StateConfig {
  label: string;
  color: string;
  description: string;
  track?: "A" | "B" | "common";
}

export const ORDER_STATE_CONFIG: Record<OrderState, StateConfig> = {
  // Common states (S01-S16) - Both tracks
  [OrderState.S01]: {
    label: "Paid",
    color: "#4CAF50", // Green
    description: "Payment received, order confirmed",
    track: "common",
  },
  [OrderState.S02]: {
    label: "Awaiting Measurements",
    color: "#FF9800", // Orange
    description: "Waiting for customer body measurements",
    track: "common",
  },
  [OrderState.S03]: {
    label: "Measurements Received",
    color: "#8BC34A", // Light green
    description: "Body measurements received and validated",
    track: "common",
  },
  [OrderState.S04]: {
    label: "Pattern Pending",
    color: "#03A9F4", // Light blue
    description: "Generating bespoke pattern from measurements",
    track: "common",
  },
  [OrderState.S05]: {
    label: "Pattern Generated",
    color: "#00BCD4", // Cyan
    description: "Pattern generated, ready for printing",
    track: "common",
  },
  [OrderState.S06]: {
    label: "Sent to Printer",
    color: "#9C27B0", // Purple
    description: "Pattern sent to large-format printer",
    track: "common",
  },
  [OrderState.S07]: {
    label: "Print Collected",
    color: "#673AB7", // Deep purple
    description: "Printed pattern collected from printer",
    track: "common",
  },
  [OrderState.S08]: {
    label: "Print Rejected",
    color: "#F44336", // Red
    description: "Print quality rejected, needs reprinting",
    track: "common",
  },
  [OrderState.S09]: {
    label: "Delivered to Tailor",
    color: "#795548", // Brown
    description: "Pattern and fabric delivered to tailor (Raja)",
    track: "common",
  },
  [OrderState.S10]: {
    label: "Cutting",
    color: "#FF5722", // Deep orange
    description: "Tailor cutting fabric using pattern",
    track: "common",
  },
  [OrderState.S11]: {
    label: "Cut Complete",
    color: "#E91E63", // Pink
    description: "Fabric cutting completed",
    track: "common",
  },
  [OrderState.S12]: {
    label: "Stitching",
    color: "#9E9E9E", // Grey
    description: "Tailor stitching the suit",
    track: "common",
  },
  [OrderState.S13]: {
    label: "Stitching Complete",
    color: "#607D8B", // Blue grey
    description: "Suit stitching completed",
    track: "common",
  },
  [OrderState.S14]: {
    label: "Quality Check",
    color: "#FFEB3B", // Yellow
    description: "Suit undergoing quality inspection",
    track: "common",
  },
  [OrderState.S15]: {
    label: "QC Passed",
    color: "#4CAF50", // Green
    description: "Quality check passed, ready for shipping",
    track: "common",
  },
  [OrderState.S16]: {
    label: "QC Failed",
    color: "#F44336", // Red
    description: "Quality check failed, needs rework",
    track: "common",
  },

  // Track A states (S17-S19) - UK local delivery
  [OrderState.S17]: {
    label: "Shipped (UK)",
    color: "#2196F3", // Blue
    description: "Suit shipped via UK courier",
    track: "A",
  },
  [OrderState.S18]: {
    label: "Delivered (UK)",
    color: "#1976D2", // Dark blue
    description: "Suit delivered to UK address",
    track: "A",
  },
  [OrderState.S19]: {
    label: "Complete",
    color: "#0D47A1", // Navy
    description: "Order completed successfully",
    track: "A",
  },

  // Track B states (S20-S26) - Dubai charter flight logistics
  [OrderState.S20]: {
    label: "Flight Manifest",
    color: "#4169E1", // Royal blue
    description: "Added to charter flight manifest (ATQ to UAE)",
    track: "B",
  },
  [OrderState.S21]: {
    label: "In Flight",
    color: "#87CEEB", // Sky blue
    description: "On charter flight from Amritsar to UAE",
    track: "B",
  },
  [OrderState.S22]: {
    label: "Landed in UAE",
    color: "#00CED1", // Dark turquoise
    description: "Flight landed at Sharjah/Dubai airport",
    track: "B",
  },
  [OrderState.S23]: {
    label: "Customs Cleared",
    color: "#20B2AA", // Light sea green
    description: "Cleared UAE customs inspection",
    track: "B",
  },
  [OrderState.S24]: {
    label: "Van Assigned",
    color: "#3CB371", // Medium sea green
    description: "Delivery van assigned for last-mile delivery",
    track: "B",
  },
  [OrderState.S25]: {
    label: "Out for Delivery",
    color: "#2E8B57", // Sea green
    description: "Van en route to customer location in UAE",
    track: "B",
  },
  [OrderState.S26]: {
    label: "Delivered (UAE)",
    color: "#006400", // Dark green
    description: "Suit delivered to UAE address within 24 hours",
    track: "B",
  },
};

/**
 * Get human-readable label for an order state
 */
export function getStateLabel(state: OrderState | string): string {
  const enumState =
    typeof state === "string"
      ? Object.values(OrderState).find((s) => s === state)
      : state;
  if (!enumState) return state as string;
  return ORDER_STATE_CONFIG[enumState]?.label || (state as string);
}

/**
 * Get color for an order state
 */
export function getStateColor(state: OrderState | string): string {
  const enumState =
    typeof state === "string"
      ? Object.values(OrderState).find((s) => s === state)
      : state;
  if (!enumState) return "#000000";
  return ORDER_STATE_CONFIG[enumState]?.color || "#000000";
}

/**
 * Get description for an order state
 */
export function getStateDescription(state: OrderState | string): string {
  const enumState =
    typeof state === "string"
      ? Object.values(OrderState).find((s) => s === state)
      : state;
  if (!enumState) return "";
  return ORDER_STATE_CONFIG[enumState]?.description || "";
}

/**
 * Get track for an order state
 */
export function getStateTrack(
  state: OrderState | string,
): "A" | "B" | "common" | undefined {
  const enumState =
    typeof state === "string"
      ? Object.values(OrderState).find((s) => s === state)
      : state;
  if (!enumState) return undefined;
  return ORDER_STATE_CONFIG[enumState]?.track;
}

/**
 * Get all order states as an array for dropdowns
 */
export function getAllOrderStates(): Array<{
  value: OrderState;
  label: string;
  color: string;
  track?: "A" | "B" | "common";
}> {
  return Object.values(OrderState).map((state) => ({
    value: state,
    label: getStateLabel(state),
    color: getStateColor(state),
    track: getStateTrack(state),
  }));
}

/**
 * Get states for a specific track
 */
export function getStatesForTrack(track: "A" | "B"): OrderState[] {
  return Object.values(OrderState).filter((state) => {
    const stateTrack = ORDER_STATE_CONFIG[state]?.track;
    return stateTrack === "common" || stateTrack === track;
  });
}

/**
 * Check if a state is a Track B logistics state
 */
export function isTrackBState(state: OrderState | string): boolean {
  const stateStr = typeof state === "string" ? state : state.toString();
  return stateStr.startsWith("S2") && parseInt(stateStr.substring(1, 3)) >= 20;
}
