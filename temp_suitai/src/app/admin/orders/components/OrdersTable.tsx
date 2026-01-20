'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './OrdersTable.module.css';

interface OrderItem {
  id: string;
  fabric: string;
  quantity: number;
  notes?: string | null;
}

interface Order {
  id: string;
  orderNo: string;
  status: string;
  customer: string;
  email: string;
  phone?: string | null;
  items: OrderItem[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onStatusChange?: (status: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#FFA500',
  PROCESSING: '#4169E1',
  COMPLETED: '#228B22',
  CANCELLED: '#DC143C',
};

export function OrdersTable({ orders, isLoading, onStatusChange }: OrdersTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  const handleStatusFilter = (status: string) => {
    const newStatus = selectedStatus === status ? undefined : status;
    setSelectedStatus(newStatus);
    onStatusChange?.(newStatus || '');
  };

  if (isLoading) {
    return <div className={styles.container}>Loading orders...</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className={styles.container}>No orders found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <label>Filter by status:</label>
        <div className={styles.filterButtons}>
          {['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              className={`${styles.filterButton} ${selectedStatus === status ? styles.active : ''}`}
              onClick={() => handleStatusFilter(status)}
              style={selectedStatus === status ? { backgroundColor: STATUS_COLORS[status] } : {}}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order No</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Items</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`}>
              <tr className={styles.row}>
                <td className={styles.orderNo}>{order.orderNo}</td>
                <td>{order.customer}</td>
                <td>
                  <span
                    className={styles.status}
                    style={{ backgroundColor: STATUS_COLORS[order.status] }}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{order.items.length} item(s)</td>
                <td>{order.email}</td>
                <td>{order.phone || '-'}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            </Link>
          ))}
        </tbody>
      </table>
    </div>
  );
}
