'use client';

import React, { useMemo } from 'react';
import { OrderStateFilter } from '@/components/OrderStateFilter';
import { OrderFilterProvider, useOrderFilter } from '@/lib/orderContext';
import { getStateLabel, getStateColor } from '@/lib/orderStates';
import styles from './orders.module.css';

/**
 * Example order interface - replace with actual database model
 */
interface Order {
  id: string;
  orderNumber: string;
  state: string;
  customer: string;
  amount: number;
  createdAt: string;
}

/**
 * Example orders data - replace with real data from API
 */
const EXAMPLE_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    state: 'S01',
    customer: 'John Doe',
    amount: 150.0,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    state: 'S05',
    customer: 'Jane Smith',
    amount: 250.0,
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    state: 'S08',
    customer: 'Bob Johnson',
    amount: 300.0,
    createdAt: '2024-01-13',
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    state: 'S09',
    customer: 'Alice Williams',
    amount: 180.0,
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    orderNumber: 'ORD-005',
    state: 'S12',
    customer: 'Charlie Brown',
    amount: 220.0,
    createdAt: '2024-01-11',
  },
];

/**
 * Order table component that filters orders based on selected states
 */
function OrdersTable() {
  const { filterState } = useOrderFilter();

  const filteredOrders = useMemo(() => {
    if (filterState.selectedStates.length === 0) {
      return EXAMPLE_ORDERS;
    }
    return EXAMPLE_ORDERS.filter((order) =>
      filterState.selectedStates.includes(order.state as never),
    );
  }, [filterState.selectedStates]);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Customer</th>
            <th>State</th>
            <th>Amount</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className={styles.orderNumber}>{order.orderNumber}</td>
                <td>{order.customer}</td>
                <td>
                  <span
                    className={styles.stateBadge}
                    style={{
                      backgroundColor: getStateColor(order.state as never),
                    }}
                  >
                    {getStateLabel(order.state as never)}
                  </span>
                </td>
                <td className={styles.amount}>${order.amount.toFixed(2)}</td>
                <td>{order.createdAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className={styles.noResults}>
                No orders found for selected states
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className={styles.summary}>
        Showing {filteredOrders.length} of {EXAMPLE_ORDERS.length} orders
      </div>
    </div>
  );
}

/**
 * Main orders page component
 * Demonstrates how to use the OrderStateFilter and OrderFilterProvider
 */
export default function OrdersPage() {
  return (
    <OrderFilterProvider>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Orders Dashboard</h1>
          <div className={styles.filterSection}>
            <OrderStateFilter />
          </div>
        </div>

        <OrdersTable />
      </div>
    </OrderFilterProvider>
  );
}
