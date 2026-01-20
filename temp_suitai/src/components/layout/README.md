# Layout Components

This directory contains reusable layout components for the SUIT AI application.

## Components

### Header
A responsive header component with navigation, cart icon, and mobile menu toggle.

**Features:**
- Navigation links (Home, About, Services, Contact)
- Shopping cart icon with badge
- Mobile hamburger menu toggle
- Sticky positioning
- Responsive design (mobile, tablet, desktop)
- Dark/light mode support
- Accessibility features (ARIA labels)

**Props:**
```tsx
interface HeaderProps {
  cartCount?: number; // Number of items in cart (default: 0)
}
```

**Usage:**
```tsx
import { Header } from '@/components/layout';

export function MyPage() {
  return <Header cartCount={5} />;
}
```

### Footer
A comprehensive footer component with multiple sections and social links.

**Features:**
- About section with description
- Product links (Features, Pricing, Documentation, API)
- Company links (About, Blog, Careers, Contact)
- Legal links (Privacy, Terms, Cookie Policy, Compliance)
- Social media links (Twitter, GitHub, LinkedIn)
- Responsive grid layout
- Dark/light mode support
- Automatic year in copyright

**Usage:**
```tsx
import { Footer } from '@/components/layout';

export function MyPage() {
  return <Footer />;
}
```

### Sidebar
A collapsible sidebar component for navigation with icon support and badges.

**Features:**
- Collapsible/expandable toggle
- Customizable menu items with icons
- Badge support for notifications
- Mobile overlay with close button
- Smooth animations
- Dark/light mode support
- Accessibility features

**Props:**
```tsx
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
```

**Usage:**
```tsx
import { Sidebar } from '@/components/layout';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', badge: 0 },
  { label: 'Orders', href: '/orders', badge: 3 },
  { label: 'Settings', href: '/settings' },
];

export function MyPage() {
  return (
    <Sidebar items={sidebarItems} isOpen={true} title="Navigation" />
  );
}
```

### Layout
A complete layout wrapper that combines Header, Sidebar, and Footer with a main content area.

**Features:**
- Full page layout structure
- Integrated Header, Sidebar, and Footer
- Responsive sidebar margin
- Main content area with flex layout
- Minimum full viewport height

**Props:**
```tsx
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
```

**Usage:**
```tsx
import { Layout } from '@/components/layout/Layout';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Settings', href: '/settings' },
];

export function RootLayout({ children }) {
  return (
    <Layout
      cartCount={2}
      sidebarItems={sidebarItems}
      showSidebar={false}
      sidebarTitle="Menu"
    >
      {children}
    </Layout>
  );
}
```

## Styling

All components use CSS with CSS variables for theming support:

### CSS Variables (Light Mode)
- `--header-bg`: Header background color
- `--footer-bg`: Footer background color
- `--sidebar-bg`: Sidebar background color
- `--border-color`: Border colors
- `--text-color`: Primary text color
- `--text-secondary`: Secondary text color
- `--primary-color`: Primary brand color
- `--primary-hover`: Primary color on hover
- `--primary-active`: Primary color when active
- `--accent-color`: Accent color (badges, alerts)
- `--hover-bg`: Hover background color
- `--social-bg`: Social links background

### Dark Mode
All components support dark mode via `prefers-color-scheme: dark` media query.
Dark mode CSS variables are available with `-dark` suffix.

### Responsive Breakpoints
- Desktop: >= 1024px (sidebar visible)
- Tablet: 768px - 1023px (sidebar hidden)
- Mobile: < 768px (full-width sidebar)
- Small Mobile: < 480px (optimized spacing)

## Accessibility Features

- **Semantic HTML**: Proper heading hierarchy and semantic tags
- **ARIA Labels**: Navigation and interactive elements have proper labels
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Color Contrast**: Meets WCAG AA standards
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **Mobile Focus**: Touch-friendly interaction areas

## Examples

### Basic Layout with Sidebar

```tsx
import { Layout } from '@/components/layout/Layout';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Profile', href: '/profile' },
  { label: 'Messages', href: '/messages', badge: 5 },
  { label: 'Settings', href: '/settings' },
];

export default function Page() {
  return (
    <Layout
      cartCount={0}
      sidebarItems={sidebarItems}
      showSidebar={true}
    >
      <div className="content">
        <h1>Welcome</h1>
        <p>Your content goes here</p>
      </div>
    </Layout>
  );
}
```

### Header Only

```tsx
import { Header } from '@/components/layout';

export default function Page() {
  return (
    <>
      <Header cartCount={3} />
      <main>Your content</main>
    </>
  );
}
```

### Footer Only

```tsx
import { Footer } from '@/components/layout';

export default function Page() {
  return (
    <>
      <main>Your content</main>
      <Footer />
    </>
  );
}
```

## Browser Support

- Chrome/Edge: Latest versions
- Firefox: Latest versions
- Safari: Latest versions
- Mobile browsers: iOS Safari 12+, Chrome for Android

## Customization

All styling can be customized by:
1. Modifying CSS variables in your global CSS
2. Overriding component CSS files
3. Using CSS Modules for scoped styles
4. Adding Tailwind CSS classes if needed

## Testing

Components are fully functional with Next.js and ready for integration testing. No external test dependencies are required.

Example test setup:
```tsx
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout';

describe('Header', () => {
  it('renders cart badge with correct count', () => {
    render(<Header cartCount={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
```
