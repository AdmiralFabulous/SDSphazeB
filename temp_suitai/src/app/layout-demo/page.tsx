'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import './demo.css';

export default function LayoutDemoPage() {
  const [cartCount, setCartCount] = useState(5);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/profile' },
    { label: 'Messages', href: '/messages', badge: 5 },
    { label: 'Orders', href: '/orders', badge: 2 },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Settings', href: '/settings' },
    { label: 'Help', href: '/help' },
  ];

  return (
    <div className="layout-demo-page">
      <Header cartCount={cartCount} />

      <div className="demo-container">
        <Sidebar
          items={sidebarItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          title="Demo Menu"
        />

        <main className="demo-content">
          <section className="demo-section">
            <h1>Layout Components Demo</h1>
            <p className="intro-text">
              This page demonstrates all layout components: Header, Footer, and Sidebar.
            </p>

            <div className="demo-controls">
              <div className="control-group">
                <label htmlFor="cart-count">Cart Count:</label>
                <input
                  id="cart-count"
                  type="number"
                  min="0"
                  max="99"
                  value={cartCount}
                  onChange={(e) => setCartCount(Number(e.target.value))}
                />
                <span className="current-value">Current: {cartCount}</span>
              </div>

              <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
              </button>
            </div>
          </section>

          <section className="demo-section">
            <h2>Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>Header</h3>
                <ul>
                  <li>Navigation links</li>
                  <li>Shopping cart icon</li>
                  <li>Mobile menu toggle</li>
                  <li>Sticky positioning</li>
                </ul>
              </div>

              <div className="feature-card">
                <h3>Footer</h3>
                <ul>
                  <li>Multiple link sections</li>
                  <li>Social media links</li>
                  <li>Auto-updated copyright</li>
                  <li>Responsive grid</li>
                </ul>
              </div>

              <div className="feature-card">
                <h3>Sidebar</h3>
                <ul>
                  <li>Collapsible navigation</li>
                  <li>Badge notifications</li>
                  <li>Icon support</li>
                  <li>Active state</li>
                </ul>
              </div>

              <div className="feature-card">
                <h3>Responsive Design</h3>
                <ul>
                  <li>Mobile optimized</li>
                  <li>Tablet friendly</li>
                  <li>Desktop ready</li>
                  <li>Touch friendly</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="demo-section">
            <h2>Component Details</h2>

            <div className="component-details">
              <div className="detail-card">
                <h3>Header Component</h3>
                <p>
                  The Header component is sticky and stays at the top of the page. It includes navigation
                  links, a cart icon with dynamic badge, and a mobile menu toggle that appears on smaller screens.
                </p>
                <code>
                  &lt;Header cartCount={'{cartCount}'} /&gt;
                </code>
              </div>

              <div className="detail-card">
                <h3>Footer Component</h3>
                <p>
                  The Footer component contains multiple sections for different types of links: Product, Company,
                  Legal, and Social. It automatically updates the copyright year.
                </p>
                <code>
                  &lt;Footer /&gt;
                </code>
              </div>

              <div className="detail-card">
                <h3>Sidebar Component</h3>
                <p>
                  The Sidebar component provides navigation with icon and badge support. On mobile, it slides in
                  as an overlay with a semi-transparent background that can be closed by clicking the close button.
                </p>
                <code>
                  &lt;Sidebar items={'{sidebarItems}'} isOpen={'{sidebarOpen}'} /&gt;
                </code>
              </div>
            </div>
          </section>

          <section className="demo-section">
            <h2>Responsive Breakpoints</h2>
            <table className="breakpoints-table">
              <thead>
                <tr>
                  <th>Device Type</th>
                  <th>Width Range</th>
                  <th>Sidebar Behavior</th>
                  <th>Header</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Desktop</td>
                  <td>≥ 1024px</td>
                  <td>Visible (260px)</td>
                  <td>Full navigation visible</td>
                </tr>
                <tr>
                  <td>Tablet</td>
                  <td>768px - 1023px</td>
                  <td>Hidden by default</td>
                  <td>Hamburger menu</td>
                </tr>
                <tr>
                  <td>Mobile</td>
                  <td>&lt; 768px</td>
                  <td>Full-width overlay</td>
                  <td>Hamburger menu</td>
                </tr>
                <tr>
                  <td>Small Mobile</td>
                  <td>&lt; 480px</td>
                  <td>Optimized spacing</td>
                  <td>Compact header</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="demo-section">
            <h2>Accessibility Features</h2>
            <ul className="accessibility-list">
              <li>
                <strong>Semantic HTML:</strong> Proper heading hierarchy and semantic tags for better screen reader
                support
              </li>
              <li>
                <strong>ARIA Labels:</strong> All interactive elements have proper labels and roles
              </li>
              <li>
                <strong>Keyboard Navigation:</strong> All components are fully keyboard accessible
              </li>
              <li>
                <strong>Color Contrast:</strong> Text contrast meets WCAG AA standards
              </li>
              <li>
                <strong>Focus Indicators:</strong> Clear visual feedback for keyboard navigation
              </li>
              <li>
                <strong>Reduced Motion:</strong> Respects user's motion preferences
              </li>
              <li>
                <strong>Dark Mode Support:</strong> All components support dark mode via prefers-color-scheme
              </li>
            </ul>
          </section>

          <section className="demo-section footer-placeholder">
            <p>
              Scroll down to see the Footer component at the bottom of the page. The Footer is part of the demo
              layout.
            </p>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
