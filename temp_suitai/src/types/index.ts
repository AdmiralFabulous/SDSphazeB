// User roles in the admin system
export enum UserRole {
  ADMIN = "admin",
  OPERATOR = "operator",
  ANALYST = "analyst",
}

// User authentication and profile information
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Navigation menu item configuration
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  roles: UserRole[];
  children?: MenuItem[];
}

// Admin sidebar state
export interface SidebarState {
  isOpen: boolean;
  activeItem?: string;
}
