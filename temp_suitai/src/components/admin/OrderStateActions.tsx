"use client";

import { useState } from "react";
import {
  OrderState,
  VALID_TRANSITIONS,
  STATE_LABELS,
  STATE_COLORS,
  CRITICAL_STATES,
  OrderStateUpdatePayload,
} from "@/types/order";
import ConfirmationDialog from "./ConfirmationDialog";
import styles from "./OrderStateActions.module.css";

export interface OrderStateActionsProps {
  currentState: OrderState;
  orderId: string;
  orderItemId?: string; // For item-level logistics actions
  track?: "A" | "B"; // Track for determining valid transitions
  onStateChange?: (payload: OrderStateUpdatePayload) => Promise<void>;
  onLogisticsAction?: (action: LogisticsAction) => Promise<void>;
  disabled?: boolean;
}

// Phase B: Logistics action types
export interface LogisticsAction {
  type:
    | "ADD_TO_FLIGHT"
    | "ASSIGN_VAN"
    | "CONFIRM_DELIVERY"
    | "ASSIGN_TAILORS"
    | "TRIGGER_QC";
  orderId: string;
  orderItemId?: string;
  payload?: Record<string, any>;
}

// Phase B: State-specific logistics actions
const LOGISTICS_ACTIONS: Record<
  string,
  { label: string; type: LogisticsAction["type"]; icon: string }[]
> = {
  S15_QC_PASSED: [
    { label: "Add to Flight Manifest", type: "ADD_TO_FLIGHT", icon: "✈️" },
  ],
  S20_FLIGHT_MANIFEST: [
    { label: "View Flight Details", type: "ADD_TO_FLIGHT", icon: "📋" },
  ],
  S23_CUSTOMS_CLEARED: [
    { label: "Assign Delivery Van", type: "ASSIGN_VAN", icon: "🚐" },
  ],
  S24_VAN_ASSIGNED: [{ label: "View Route", type: "ASSIGN_VAN", icon: "🗺️" }],
  S25_OUT_FOR_DELIVERY: [
    { label: "Confirm Delivery", type: "CONFIRM_DELIVERY", icon: "✅" },
  ],
  S09_DELIVERED_TO_RAJA: [
    { label: "Assign Tailors", type: "ASSIGN_TAILORS", icon: "👔" },
  ],
  S13_STITCHING_COMPLETE: [
    { label: "Trigger QC", type: "TRIGGER_QC", icon: "🔍" },
  ],
};

export default function OrderStateActions({
  currentState,
  orderId,
  orderItemId,
  track = "A",
  onStateChange,
  onLogisticsAction,
  disabled = false,
}: OrderStateActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notes, setNotes] = useState("");
  const [pendingState, setPendingState] = useState<OrderState | null>(null);
  const [pendingAction, setPendingAction] = useState<LogisticsAction | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Get track-aware valid transitions
  const getValidTransitions = (): OrderState[] => {
    const allValid = VALID_TRANSITIONS[currentState] || [];

    // At the branch point (S15_QC_PASSED), filter based on track
    if (currentState === "S15_QC_PASSED") {
      if (track === "A") {
        return allValid.filter((s) => s === "S17_SHIPPED");
      } else {
        return allValid.filter((s) => s === "S20_FLIGHT_MANIFEST");
      }
    }

    return allValid;
  };

  const validNextStates = getValidTransitions();
  const logisticsActions = LOGISTICS_ACTIONS[currentState] || [];
  const isCriticalTransition =
    pendingState && CRITICAL_STATES.has(pendingState);

  // Check if this is a Track B logistics state
  const isTrackBState =
    currentState.startsWith("S2") &&
    parseInt(currentState.substring(1, 3)) >= 20;

  const handleTransitionClick = (newState: OrderState) => {
    setPendingState(newState);

    // Show confirmation only for critical states
    if (CRITICAL_STATES.has(newState)) {
      setShowConfirmation(true);
    } else {
      executeTransition(newState, "");
    }
  };

  const handleLogisticsAction = async (action: LogisticsAction["type"]) => {
    if (!onLogisticsAction) {
      console.log(`Logistics action triggered: ${action}`);
      return;
    }

    const logisticsAction: LogisticsAction = {
      type: action,
      orderId,
      orderItemId,
    };

    setPendingAction(logisticsAction);
    setIsLoading(true);
    setError(null);

    try {
      await onLogisticsAction(logisticsAction);
      setPendingAction(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to execute logistics action";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const executeTransition = async (
    newState: OrderState,
    transitionNotes: string,
  ) => {
    if (!onStateChange) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: OrderStateUpdatePayload = {
        orderId,
        newState,
        notes: transitionNotes || undefined,
      };

      await onStateChange(payload);

      // Clear state after successful transition
      setNotes("");
      setPendingState(null);
      setShowConfirmation(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update order state";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (pendingState) {
      executeTransition(pendingState, notes);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setPendingState(null);
    setNotes("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Current State:</span>
        <span
          className={styles.currentState}
          style={{ borderLeftColor: STATE_COLORS[currentState] }}
        >
          {STATE_LABELS[currentState]}
        </span>
        {track && (
          <span
            className={`${styles.trackBadge} ${track === "B" ? styles.trackB : styles.trackA}`}
          >
            Track {track} {track === "A" ? "🇬🇧" : "🇦🇪"}
          </span>
        )}
      </div>

      {/* Phase B: Logistics Actions */}
      {logisticsActions.length > 0 && (
        <div className={styles.logisticsSection}>
          <span className={styles.sectionLabel}>Quick Actions:</span>
          <div className={styles.logisticsButtons}>
            {logisticsActions.map((action) => (
              <button
                key={action.type}
                className={styles.logisticsButton}
                onClick={() => handleLogisticsAction(action.type)}
                disabled={disabled || isLoading}
                title={action.label}
              >
                <span className={styles.actionIcon}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* State Transitions */}
      {validNextStates.length === 0 ? (
        <div className={styles.noTransitions}>
          <p>
            {isTrackBState && currentState === "S26_DELIVERED_UAE"
              ? "✅ Order complete - Delivered in UAE"
              : currentState === "S19_COMPLETE"
                ? "✅ Order complete - Delivered in UK"
                : "No valid transitions available from this state."}
          </p>
        </div>
      ) : (
        <div className={styles.transitionsSection}>
          <span className={styles.sectionLabel}>State Transitions:</span>
          <div className={styles.buttonsContainer}>
            {validNextStates.map((nextState) => (
              <button
                key={nextState}
                className={`${styles.transitionButton} ${
                  CRITICAL_STATES.has(nextState) ? styles.critical : ""
                } ${nextState.startsWith("S2") ? styles.logistics : ""}`}
                onClick={() => handleTransitionClick(nextState)}
                disabled={disabled || isLoading}
                title={`Transition to ${STATE_LABELS[nextState]}`}
              >
                {isLoading && pendingState === nextState ? (
                  <>
                    <span className={styles.spinner}>⏳</span>
                    {STATE_LABELS[nextState]}
                  </>
                ) : (
                  <>
                    <span
                      className={styles.dot}
                      style={{ backgroundColor: STATE_COLORS[nextState] }}
                    />
                    {STATE_LABELS[nextState]}
                    {nextState.startsWith("S2") && (
                      <span className={styles.uaeFlag}>🇦🇪</span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {showConfirmation && pendingState && (
        <ConfirmationDialog
          title={`Confirm Transition to ${STATE_LABELS[pendingState]}`}
          message={`Are you sure you want to change the order state to ${STATE_LABELS[pendingState]}? This action cannot be easily reversed.`}
          isCritical={isCriticalTransition}
          notes={notes}
          onNotesChange={setNotes}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
