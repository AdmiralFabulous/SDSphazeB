'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import styles from './logistics.module.css';

interface TrackBOrder {
  id: string;
  status: string;
  track: string;
  deadline: string;
  riskScore: number;
  customerName: string;
  itemCount: number;
  flightId?: string;
}

interface Flight {
  id: string;
  flightNumber: string;
  status: string;
  departureAirport: string;
  arrivalAirport: string;
  scheduledDeparture: string;
  suitsOnBoard: number;
}

interface Van {
  id: string;
  licensePlate: string;
  driverName: string;
  status: string;
  currentLoad: number;
  capacity: number;
}

interface QcStation {
  id: string;
  name: string;
  isActive: boolean;
  currentLoad: number;
  capacity: number;
}

export default function LogisticsDashboard() {
  const [orders, setOrders] = useState<TrackBOrder[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [vans, setVans] = useState<Van[]>([]);
  const [qcStations, setQcStations] = useState<QcStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'flights' | 'vans' | 'qc'>('orders');

  useEffect(() => {
    fetchData();
    // Set up SSE for real-time updates
    const eventSource = setupSSE();
    return () => eventSource?.close();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Track B orders
      const ordersRes = await fetch('/api/orders?track=B');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.data || []);
      }

      // Fetch flights
      const flightsRes = await fetch('/api/logistics/flights');
      if (flightsRes.ok) {
        const flightsData = await flightsRes.json();
        setFlights(flightsData.data || []);
      }

      // Fetch vans
      const vansRes = await fetch('/api/logistics/vans');
      if (vansRes.ok) {
        const vansData = await vansRes.json();
        setVans(vansData.data || []);
      }

      // Fetch QC stations
      const qcRes = await fetch('/api/logistics/qc-stations');
      if (qcRes.ok) {
        const qcData = await qcRes.json();
        setQcStations(qcData.data || []);
      }

    } catch (err) {
      setError('Failed to fetch logistics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setupSSE = () => {
    // Placeholder for SSE connection
    // In production, this would connect to /api/logistics/stream
    return null;
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return '#B71C1C'; // Critical - dark red
    if (score >= 0.6) return '#F44336'; // High - red
    if (score >= 0.3) return '#FF9800'; // Medium - amber
    return '#4CAF50'; // Low - green
  };

  const getStatusBadgeClass = (status: string) => {
    if (status.includes('FLIGHT') || status.includes('IN_FLIGHT')) return styles.statusFlight;
    if (status.includes('DELIVERY') || status.includes('DELIVERED')) return styles.statusDelivery;
    if (status.includes('VAN')) return styles.statusVan;
    return styles.statusDefault;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <AdminSidebar />
        <main className={styles.main}>
          <div className={styles.loading}>Loading logistics data...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AdminSidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>🇦🇪 UAE Logistics Dashboard</h1>
          <p className={styles.subtitle}>Track B - 24-Hour Delivery Operations</p>
        </header>

        {/* Summary Cards */}
        <div className={styles.summaryCards}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📦</div>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>{orders.length}</span>
              <span className={styles.cardLabel}>Track B Orders</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>✈️</div>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {flights.filter(f => f.status === 'IN_FLIGHT').length}
              </span>
              <span className={styles.cardLabel}>Flights In Air</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🚐</div>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {vans.filter(v => v.status === 'EN_ROUTE' || v.status === 'DELIVERING').length}
              </span>
              <span className={styles.cardLabel}>Vans Active</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>⚠️</div>
            <div className={styles.cardContent}>
              <span className={styles.cardValue} style={{ color: '#F44336' }}>
                {orders.filter(o => o.riskScore >= 0.6).length}
              </span>
              <span className={styles.cardLabel}>At Risk</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'flights' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('flights')}
          >
            Flights ({flights.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'vans' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('vans')}
          >
            Vans ({vans.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'qc' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('qc')}
          >
            QC Stations ({qcStations.length})
          </button>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          {activeTab === 'orders' && (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyState}>
                        No Track B orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className={styles.orderId}>{order.id.slice(0, 8)}...</td>
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                            {order.status.replace(/_/g, ' ').replace(/^S\d+\s*/, '')}
                          </span>
                        </td>
                        <td>
                          <div
                            className={styles.riskBadge}
                            style={{ backgroundColor: getRiskColor(order.riskScore || 0) }}
                          >
                            {((order.riskScore || 0) * 100).toFixed(0)}%
                          </div>
                        </td>
                        <td>{order.customerName || 'N/A'}</td>
                        <td>{order.itemCount || 1}</td>
                        <td>
                          {order.deadline
                            ? new Date(order.deadline).toLocaleString('en-AE')
                            : 'N/A'}
                        </td>
                        <td>
                          <button
                            className={styles.actionBtn}
                            onClick={() => window.location.href = `/admin/orders/${order.id}`}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'flights' && (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Flight</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Departure</th>
                    <th>Suits</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyState}>
                        No flights scheduled
                      </td>
                    </tr>
                  ) : (
                    flights.map((flight) => (
                      <tr key={flight.id}>
                        <td className={styles.flightNumber}>
                          ✈️ {flight.flightNumber || flight.id.slice(0, 8)}
                        </td>
                        <td>
                          {flight.departureAirport} → {flight.arrivalAirport}
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles.statusFlight}`}>
                            {flight.status}
                          </span>
                        </td>
                        <td>
                          {new Date(flight.scheduledDeparture).toLocaleString('en-AE')}
                        </td>
                        <td>{flight.suitsOnBoard}</td>
                        <td>
                          <button className={styles.actionBtn}>Manifest</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'vans' && (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Van</th>
                    <th>Driver</th>
                    <th>Status</th>
                    <th>Load</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.emptyState}>
                        No vans registered
                      </td>
                    </tr>
                  ) : (
                    vans.map((van) => (
                      <tr key={van.id}>
                        <td>🚐 {van.licensePlate}</td>
                        <td>{van.driverName}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles.statusVan}`}>
                            {van.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.loadBar}>
                            <div
                              className={styles.loadFill}
                              style={{ width: `${(van.currentLoad / van.capacity) * 100}%` }}
                            />
                            <span>{van.currentLoad}/{van.capacity}</span>
                          </div>
                        </td>
                        <td>
                          <button className={styles.actionBtn}>Track</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'qc' && (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>Status</th>
                    <th>Load</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {qcStations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.emptyState}>
                        No QC stations registered
                      </td>
                    </tr>
                  ) : (
                    qcStations.map((station) => (
                      <tr key={station.id}>
                        <td>🔍 {station.name}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              station.isActive ? styles.statusActive : styles.statusInactive
                            }`}
                          >
                            {station.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.loadBar}>
                            <div
                              className={styles.loadFill}
                              style={{ width: `${(station.currentLoad / station.capacity) * 100}%` }}
                            />
                            <span>{station.currentLoad}/{station.capacity}</span>
                          </div>
                        </td>
                        <td>
                          <button className={styles.actionBtn}>View Queue</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={fetchData}>Retry</button>
          </div>
        )}
      </main>
    </div>
  );
}
