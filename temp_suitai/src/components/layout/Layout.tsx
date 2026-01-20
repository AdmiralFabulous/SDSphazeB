'use client';

import { useState, ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import '../styles/Layout.css';

interface LayoutItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: number;
}

interface LayoutProps {
  children: ReactNode;
  cartCount?: number;
  sidebarItems?: LayoutItem[];
  showSidebar?: boolean;
  sidebarTitle?: string;
}

export function Layout({
  children,
  cartCount = 0,
  sidebarItems = [],
  showSidebar = false,
  sidebarTitle = 'Menu',
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);

  return (
    <div className="layout">
      <Header cartCount={cartCount} />

      <div className="layout-body">
        {sidebarItems.length > 0 && (
          <Sidebar
            items={sidebarItems}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            title={sidebarTitle}
          />
        )}

        <main className={`layout-main ${sidebarItems.length > 0 ? 'with-sidebar' : ''}`}>
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
