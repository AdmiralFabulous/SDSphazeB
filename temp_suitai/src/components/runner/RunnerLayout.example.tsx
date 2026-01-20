import React, { useState } from 'react';
import { RunnerLayout } from './RunnerLayout';

/**
 * Example usage of the RunnerLayout component
 * This demonstrates all the features of the mobile layout
 */
export const RunnerLayoutExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'measurements' | 'settings'>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div style={{ padding: '16px' }}>
            <h2>Welcome Home</h2>
            <p>This is the home page content.</p>
            <p>The layout includes:</p>
            <ul>
              <li>Touch-friendly bottom navigation (min 44px buttons)</li>
              <li>Safe area handling for notched phones</li>
              <li>Header with runner name</li>
              <li>Responsive content area</li>
            </ul>
          </div>
        );

      case 'measurements':
        return (
          <div style={{ padding: '16px' }}>
            <h2>Measurements</h2>
            <p>View and manage your measurements here.</p>
            <div
              style={{
                backgroundColor: '#f0f0f0',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '16px',
              }}
            >
              <p>Height: 180 cm</p>
              <p>Weight: 75 kg</p>
              <p>Last updated: Today</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div style={{ padding: '16px' }}>
            <h2>Settings</h2>
            <p>Configure your preferences.</p>
            <div
              style={{
                backgroundColor: '#f0f0f0',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '16px',
              }}
            >
              <label style={{ display: 'block', marginBottom: '12px' }}>
                <input type="checkbox" defaultChecked /> Enable notifications
              </label>
              <label style={{ display: 'block', marginBottom: '12px' }}>
                <input type="checkbox" defaultChecked /> Dark mode
              </label>
              <label style={{ display: 'block' }}>
                <input type="checkbox" /> Share data
              </label>
            </div>
          </div>
        );
    }
  };

  return (
    <RunnerLayout
      runnerName="Alex Johnson"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </RunnerLayout>
  );
};

export default RunnerLayoutExample;
