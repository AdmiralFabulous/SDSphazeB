import React, { ReactNode } from 'react';
import './RunnerLayout.css';

interface RunnerLayoutProps {
  children: ReactNode;
  runnerName?: string;
  activeTab?: 'home' | 'measurements' | 'settings';
  onTabChange?: (tab: 'home' | 'measurements' | 'settings') => void;
}

export const RunnerLayout: React.FC<RunnerLayoutProps> = ({
  children,
  runnerName = 'Runner',
  activeTab = 'home',
  onTabChange,
}) => {
  const handleNavClick = (tab: 'home' | 'measurements' | 'settings') => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="runner-layout">
      {/* Header */}
      <header className="runner-header">
        <div className="runner-header-content">
          <h1 className="runner-name">{runnerName}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="runner-main">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="runner-nav">
        <button
          className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleNavClick('home')}
          aria-label="Home"
          aria-current={activeTab === 'home' ? 'page' : undefined}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="nav-label">Home</span>
        </button>

        <button
          className={`nav-button ${activeTab === 'measurements' ? 'active' : ''}`}
          onClick={() => handleNavClick('measurements')}
          aria-label="Measurements"
          aria-current={activeTab === 'measurements' ? 'page' : undefined}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
          <span className="nav-label">Measurements</span>
        </button>

        <button
          className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavClick('settings')}
          aria-label="Settings"
          aria-current={activeTab === 'settings' ? 'page' : undefined}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m6.08 0l4.24-4.24M1 12h6m6 0h6m-16.78 7.78l4.24-4.24m6.08 0l4.24 4.24" />
          </svg>
          <span className="nav-label">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default RunnerLayout;
