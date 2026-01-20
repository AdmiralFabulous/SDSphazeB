'use client';

import { useEffect, useState, useCallback } from 'react';

interface OrderItem {
  id: string;
  fabric: string;
  quantity: number;
  notes?: string | null;
}

interface Order {
  id: string;
  orderNo: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  customer: string;
  email: string;
  phone?: string | null;
  items: OrderItem[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useOrders(status?: string): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }
      params.append('take', '50');

      const response = await fetch(`/api/admin/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchOrders();

    // Set up polling for real-time updates (every 5 seconds)
    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}
