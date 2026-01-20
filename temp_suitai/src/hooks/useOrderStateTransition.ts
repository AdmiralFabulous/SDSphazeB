import { useState } from 'react';
import { OrderState, OrderStateUpdatePayload } from '@/types/order';

/**
 * Hook for managing order state transitions
 * Handles API communication, loading states, and error handling
 */
export function useOrderStateTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrderState = async (payload: OrderStateUpdatePayload): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${payload.orderId}/state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newState: payload.newState,
          notes: payload.notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update order state (${response.status})`
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateOrderState,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
