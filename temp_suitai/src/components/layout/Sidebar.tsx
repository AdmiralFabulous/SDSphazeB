'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../styles/Sidebar.css';

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
}

export function Sidebar({ items, isOpen = true, onClose, title = 'Menu' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(!isOpen);

  const handleToggle = () => {
    setCollapsed(!collapsed);
    if (onClose && !collapsed) {
      onClose();
    }
  };

  return (
    <>
      {!collapsed && <div className="sidebar-overlay" onClick={() => setCollapsed(true)} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : 'open'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{title}</h2>
          <button
            className="sidebar-close"
            onClick={handleToggle}
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-list">
            {items.map((item, index) => (
              <li key={index} className="sidebar-item">
                <Link href={item.href} className="sidebar-link">
                  {item.icon && <span className="sidebar-icon">{item.icon}</span>}
                  <span className="sidebar-label">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="sidebar-badge">{item.badge}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-toggle" onClick={handleToggle} aria-label="Collapse sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
