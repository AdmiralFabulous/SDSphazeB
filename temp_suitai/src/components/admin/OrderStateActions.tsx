'use client';

import { useState } from 'react';
import {
  OrderState,
  VALID_TRANSITIONS,
  STATE_LABELS,
  STATE_COLORS,
  CRITICAL_STATES,
  OrderStateUpdatePayload,
} from '@/types/order';
import ConfirmationDialog from './ConfirmationDialog';
import styles from './OrderStateActions.module.css';

export interface OrderStateActionsProps {
  currentState: OrderState;
  orderId: string;
  onStateChange?: (payload: OrderStateUpdatePayload) => Promise<void>;
  disabled?: boolean;
}

export default function OrderStateActions({
  currentState,
  orderId,
  onStateChange,
  disabled = false,
}: OrderStateActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notes, setNotes] = useState('');
  const [pendingState, setPendingState] = useState<OrderState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validNextStates = VALID_TRANSITIONS[currentState] || [];
  const isCriticalTransition = pendingState && CRITICAL_STATES.has(pendingState);

  const handleTransitionClick = (newState: OrderState) => {
    setPendingState(newState);

    // Show confirmation only for critical states
    if (CRITICAL_STATES.has(newState)) {
      setShowConfirmation(true);
    } else {
      executeTransition(newState, '');
    }
  };

  const executeTransition = async (newState: OrderState, transitionNotes: string) => {
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
      setNotes('');
      setPendingState(null);
      setShowConfirmation(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order state';
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
    setNotes('');
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
      </div>

      {validNextStates.length === 0 ? (
        <div className={styles.noTransitions}>
          <p>No valid transitions available from this state.</p>
        </div>
      ) : (
        <div className={styles.buttonsContainer}>
          {validNextStates.map((nextState) => (
            <button
              key={nextState}
              className={`${styles.transitionButton} ${
                CRITICAL_STATES.has(nextState) ? styles.critical : ''
              }`}
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
                </>
              )}
            </button>
          ))}
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
