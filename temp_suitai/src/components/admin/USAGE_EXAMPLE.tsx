/**
 * USAGE EXAMPLE: MeasurementsDisplay Component
 *
 * This file demonstrates how to integrate and use the MeasurementsDisplay
 * component in your application.
 */

import React from 'react';
import MeasurementsDisplay from './MeasurementsDisplay';

/**
 * Example 1: Simple Integration
 *
 * The most basic usage - just render the component.
 * All state is managed internally.
 */
export function AdminDashboardSimple() {
  return (
    <div className="admin-dashboard">
      <MeasurementsDisplay />
    </div>
  );
}

/**
 * Example 2: Wrapped in a Layout
 *
 * Show how to integrate with a larger admin layout.
 */
export function AdminDashboardWithLayout() {
  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>Operator Dashboard</h1>
        <nav>Dashboard Navigation</nav>
      </header>

      <main className="admin-content">
        <section className="measurements-section">
          <MeasurementsDisplay />
        </section>
      </main>

      <footer className="admin-footer">
        <p>© 2024 SUIT AI System</p>
      </footer>
    </div>
  );
}

/**
 * Example 3: With Loading State
 *
 * How to conditionally render the component based on data loading.
 */
export function AdminDashboardWithLoading() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate loading measurements from API
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <div>Loading measurements...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <MeasurementsDisplay />;
}

/**
 * Example 4: With Tab Navigation
 *
 * Show how to use the measurements display as one tab among others.
 */
export function AdminDashboardWithTabs() {
  const [activeTab, setActiveTab] = React.useState<'measurements' | 'settings' | 'history'>('measurements');

  return (
    <div>
      <div className="tab-buttons">
        <button
          className={activeTab === 'measurements' ? 'active' : ''}
          onClick={() => setActiveTab('measurements')}
        >
          Measurements
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'measurements' && <MeasurementsDisplay />}
        {activeTab === 'settings' && <div>Settings Content</div>}
        {activeTab === 'history' && <div>History Content</div>}
      </div>
    </div>
  );
}

/**
 * Example 5: Session-Based Measurements (Future Enhancement)
 *
 * This shows how you might integrate with a session context
 * to load/save measurements. This is a future enhancement example.
 */
/*
export function AdminDashboardWithSession() {
  const { sessionId, measurements } = useSession();
  const [localMeasurements, setLocalMeasurements] = React.useState(measurements);

  const handleSave = async () => {
    try {
      // API call to save measurements
      await fetch(`/api/sessions/${sessionId}/measurements`, {
        method: 'POST',
        body: JSON.stringify(localMeasurements),
      });
      alert('Measurements saved!');
    } catch (error) {
      alert('Failed to save measurements');
    }
  };

  return (
    <div>
      <MeasurementsDisplay />
      <button onClick={handleSave}>Save Measurements</button>
    </div>
  );
}
*/

/**
 * Example 6: Styling Integration
 *
 * Show how to customize the component appearance with CSS.
 */
export function AdminDashboardWithCustomStyling() {
  return (
    <div className="custom-admin-theme">
      <style>{`
        .custom-admin-theme {
          --primary: #2563eb;
          --primary-hover: #1d4ed8;
          --success: #10b981;
          --danger: #ef4444;
        }

        .custom-admin-theme .measurements-display {
          padding: 3rem;
          max-width: 1200px;
          margin: 0 auto;
        }
      `}</style>
      <MeasurementsDisplay />
    </div>
  );
}

/**
 * Complete Integration Example
 *
 * Full example of how to set up measurements in an admin page
 * with proper layout, error handling, and loading states.
 */
export function CompleteAdminPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'measurements' | 'export'>('measurements');

  React.useEffect(() => {
    // Load initial data
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('Failed to load measurements');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <header>
        <h1>Operator Dashboard - ADMIN-E01-S03-T02</h1>
        <p>Display and manage 28 body measurements</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="tabs">
        <button
          className={activeTab === 'measurements' ? 'active' : ''}
          onClick={() => setActiveTab('measurements')}
        >
          📊 Measurements
        </button>
        <button
          className={activeTab === 'export' ? 'active' : ''}
          onClick={() => setActiveTab('export')}
        >
          📥 Export Help
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading measurements...</div>
      ) : (
        <div className="content">
          {activeTab === 'measurements' && (
            <>
              <MeasurementsDisplay />
            </>
          )}
          {activeTab === 'export' && (
            <div className="export-help">
              <h2>Export Formats</h2>
              <ul>
                <li><strong>Optitex</strong>: Professional fashion CAD software format</li>
                <li><strong>CSV</strong>: Spreadsheet compatible (Excel, Sheets)</li>
                <li><strong>JSON</strong>: Programmatic integration and APIs</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <footer>
        <p>Task: ADMIN-E01-S03-T02 | Module: Operator Dashboard | Epic: 01</p>
      </footer>
    </div>
  );
}

// Export the main example
export default CompleteAdminPage;

/**
 * QUICK START GUIDE
 *
 * 1. Import the component:
 *    import MeasurementsDisplay from '@/components/admin/MeasurementsDisplay';
 *
 * 2. Render it:
 *    <MeasurementsDisplay />
 *
 * 3. Users can:
 *    - Click values to edit
 *    - Copy measurements to clipboard
 *    - Export in multiple formats
 *
 * That's it! The component handles everything internally.
 */
