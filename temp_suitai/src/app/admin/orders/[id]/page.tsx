'use client';

import { useState } from 'react';
import OrderStateActions from '@/components/admin/OrderStateActions';
import { OrderState, OrderStateUpdatePayload } from '@/types/order';
import { useOrderStateTransition } from '@/hooks/useOrderStateTransition';

/**
 * Example admin order detail page showing OrderStateActions usage
 */
export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [currentState, setCurrentState] = useState<OrderState>(OrderState.PENDING);
  const { updateOrderState, isLoading, error } = useOrderStateTransition();

  const handleStateChange = async (payload: OrderStateUpdatePayload) => {
    await updateOrderState(payload);
    // Update local state after successful API call
    setCurrentState(payload.newState);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Order #{params.id}</h1>

      <OrderStateActions
        currentState={currentState}
        orderId={params.id}
        onStateChange={handleStateChange}
        disabled={isLoading}
      />

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '0.5rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
