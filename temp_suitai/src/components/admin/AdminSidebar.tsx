'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, UserRole, MenuItem } from '@/types';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  user: User;
  onLogout: () => void;
}

// Menu items configuration with role-based access
const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: '📊',
    roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.ANALYST],
  },
  {
    id: 'sessions',
    label: 'Sessions',
    href: '/admin/sessions',
    icon: '📹',
    roles: [UserRole.ADMIN, UserRole.OPERATOR],
  },
  {
    id: 'measurements',
    label: 'Measurements',
    href: '/admin/measurements',
    icon: '📏',
    roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.ANALYST],
  },
  {
    id: 'queue',
    label: 'Order Queue',
    href: '/admin/queue',
    icon: '📋',
    roles: [UserRole.ADMIN, UserRole.OPERATOR],
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/admin/reports',
    icon: '📈',
    roles: [UserRole.ADMIN, UserRole.ANALYST],
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: '⚙️',
    roles: [UserRole.ADMIN],
  },
];

export default function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const [activeItem, setActiveItem] = useState<string>('dashboard');
  const [isOpen, setIsOpen] = useState(true);

  // Filter menu items based on user role
  const visibleMenuItems = MENU_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  );

  const handleMenuItemClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      {/* Header with toggle button */}
      <div className={styles.header}>
        <button
          className={styles.toggleButton}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        {isOpen && <h1 className={styles.title}>Admin</h1>}
      </div>

      {/* User info section */}
      {isOpen && (
        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user.name}</p>
            <p className={styles.userRole}>{user.role}</p>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
        </div>
      )}

      {/* Navigation menu */}
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {visibleMenuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`${styles.menuItem} ${
                  activeItem === item.id ? styles.active : ''
                }`}
                onClick={() => handleMenuItemClick(item.id)}
              >
                <span className={styles.icon}>{item.icon}</span>
                {isOpen && <span className={styles.label}>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout section */}
      {isOpen && (
        <div className={styles.footer}>
          <button className={styles.logoutButton} onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
