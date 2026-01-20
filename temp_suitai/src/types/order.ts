// Order state enumeration
export enum OrderState {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// Define critical states that require confirmation
export const CRITICAL_STATES = new Set<OrderState>([
  OrderState.CANCELLED,
  OrderState.REFUNDED,
]);

// Valid state transitions: map from current state to allowed next states
export const VALID_TRANSITIONS: Record<OrderState, OrderState[]> = {
  [OrderState.PENDING]: [OrderState.CONFIRMED, OrderState.CANCELLED],
  [OrderState.CONFIRMED]: [OrderState.PROCESSING, OrderState.CANCELLED],
  [OrderState.PROCESSING]: [OrderState.READY, OrderState.CANCELLED],
  [OrderState.READY]: [OrderState.SHIPPED, OrderState.CANCELLED],
  [OrderState.SHIPPED]: [OrderState.DELIVERED, OrderState.CANCELLED],
  [OrderState.DELIVERED]: [OrderState.REFUNDED],
  [OrderState.CANCELLED]: [],
  [OrderState.REFUNDED]: [],
};

// User-friendly display names for states
export const STATE_LABELS: Record<OrderState, string> = {
  [OrderState.PENDING]: 'Pending',
  [OrderState.CONFIRMED]: 'Confirmed',
  [OrderState.PROCESSING]: 'Processing',
  [OrderState.READY]: 'Ready for Shipment',
  [OrderState.SHIPPED]: 'Shipped',
  [OrderState.DELIVERED]: 'Delivered',
  [OrderState.CANCELLED]: 'Cancelled',
  [OrderState.REFUNDED]: 'Refunded',
};

// Color coding for different states
export const STATE_COLORS: Record<OrderState, string> = {
  [OrderState.PENDING]: '#FFA500',
  [OrderState.CONFIRMED]: '#4169E1',
  [OrderState.PROCESSING]: '#FF6347',
  [OrderState.READY]: '#90EE90',
  [OrderState.SHIPPED]: '#87CEEB',
  [OrderState.DELIVERED]: '#228B22',
  [OrderState.CANCELLED]: '#808080',
  [OrderState.REFUNDED]: '#DC143C',
};

export interface OrderStateUpdatePayload {
  orderId: string;
  newState: OrderState;
  notes?: string;
}

export interface OrderStateActionProps {
  currentState: OrderState;
  orderId: string;
  onStateChange?: (payload: OrderStateUpdatePayload) => Promise<void>;
  disabled?: boolean;
}
