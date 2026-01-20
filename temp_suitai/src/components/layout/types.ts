import { ReactNode } from 'react';

/**
 * Header Component Props
 */
export interface HeaderProps {
  /**
   * Number of items in shopping cart
   * @default 0
   */
  cartCount?: number;
}

/**
 * Sidebar Item Configuration
 */
export interface SidebarItem {
  /**
   * Display label for the menu item
   */
  label: string;

  /**
   * Navigation href
   */
  href: string;

  /**
   * Optional icon element (React component or SVG)
   */
  icon?: ReactNode;

  /**
   * Optional badge count for notifications
   */
  badge?: number;
}

/**
 * Sidebar Component Props
 */
export interface SidebarProps {
  /**
   * Array of menu items to display
   */
  items: SidebarItem[];

  /**
   * Whether sidebar is initially open
   * @default true
   */
  isOpen?: boolean;

  /**
   * Callback when sidebar should close (mobile overlay click)
   */
  onClose?: () => void;

  /**
   * Title displayed in sidebar header
   * @default "Menu"
   */
  title?: string;
}

/**
 * Layout Item Configuration (extends SidebarItem)
 */
export interface LayoutItem extends SidebarItem {}

/**
 * Layout Component Props
 */
export interface LayoutProps {
  /**
   * Main content to render in the layout
   */
  children: ReactNode;

  /**
   * Number of items in shopping cart
   * @default 0
   */
  cartCount?: number;

  /**
   * Array of sidebar menu items
   * @default []
   */
  sidebarItems?: LayoutItem[];

  /**
   * Whether sidebar should be visible initially
   * @default false
   */
  showSidebar?: boolean;

  /**
   * Title displayed in sidebar header
   * @default "Menu"
   */
  sidebarTitle?: string;
}

/**
 * Navigation Link Configuration
 */
export interface NavLink {
  /**
   * Link label/text
   */
  label: string;

  /**
   * Navigation href
   */
  href: string;

  /**
   * Whether link is active/current page
   */
  isActive?: boolean;
}

/**
 * Footer Section Configuration
 */
export interface FooterSection {
  /**
   * Section title
   */
  title: string;

  /**
   * Links in this section
   */
  links: NavLink[];
}

/**
 * Social Media Link Configuration
 */
export interface SocialLink {
  /**
   * Platform name (twitter, github, linkedin, etc.)
   */
  platform: string;

  /**
   * URL to social profile
   */
  url: string;

  /**
   * Display label
   */
  label: string;

  /**
   * SVG icon or component
   */
  icon?: ReactNode;
}

/**
 * Theme Configuration
 */
export interface ThemeColors {
  /**
   * Header background color
   */
  headerBg?: string;

  /**
   * Footer background color
   */
  footerBg?: string;

  /**
   * Sidebar background color
   */
  sidebarBg?: string;

  /**
   * Primary text color
   */
  textColor?: string;

  /**
   * Secondary text color
   */
  textSecondary?: string;

  /**
   * Primary brand color
   */
  primaryColor?: string;

  /**
   * Primary color on hover
   */
  primaryHover?: string;

  /**
   * Border color
   */
  borderColor?: string;

  /**
   * Accent color for badges and alerts
   */
  accentColor?: string;

  /**
   * Hover background color
   */
  hoverBg?: string;
}

/**
 * Responsive Layout Configuration
 */
export interface ResponsiveConfig {
  /**
   * Breakpoint for mobile devices (px)
   * @default 768
   */
  mobileBreakpoint?: number;

  /**
   * Breakpoint for tablets (px)
   * @default 1024
   */
  tabletBreakpoint?: number;

  /**
   * Breakpoint for small mobile (px)
   * @default 480
   */
  smallMobileBreakpoint?: number;
}

/**
 * Header State
 */
export interface HeaderState {
  /**
   * Is mobile menu open
   */
  mobileMenuOpen: boolean;

  /**
   * Current cart count
   */
  cartCount: number;
}

/**
 * Sidebar State
 */
export interface SidebarState {
  /**
   * Is sidebar open/visible
   */
  isOpen: boolean;

  /**
   * Currently active menu item
   */
  activeItem?: string;

  /**
   * Menu items
   */
  items: SidebarItem[];
}

/**
 * Layout State
 */
export interface LayoutState {
  /**
   * Header state
   */
  header: HeaderState;

  /**
   * Sidebar state
   */
  sidebar: SidebarState;

  /**
   * Current theme (light or dark)
   */
  theme: 'light' | 'dark';
}
