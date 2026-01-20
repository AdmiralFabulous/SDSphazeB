# Layout Components - Quick Start Guide

## Files Created

### Component Files
- `src/components/layout/Header.tsx` - Header with navigation and cart
- `src/components/layout/Footer.tsx` - Footer with multiple link sections
- `src/components/layout/Sidebar.tsx` - Collapsible sidebar navigation
- `src/components/layout/Layout.tsx` - Complete layout wrapper
- `src/components/layout/index.ts` - Component exports

### Style Files
- `src/components/styles/Header.css`
- `src/components/styles/Footer.css`
- `src/components/styles/Sidebar.css`
- `src/components/styles/Layout.css`

### Documentation & Demo
- `src/components/layout/README.md` - Full documentation
- `src/app/layout-demo/page.tsx` - Interactive demo page
- `src/app/layout-demo/demo.css` - Demo styling
- `LAYOUT_COMPONENTS_SUMMARY.md` - Complete task summary
- `LAYOUT_QUICK_START.md` - This file

## Quick Integration

### Option 1: Use the Complete Layout Wrapper

```tsx
// In your app/layout.tsx or page
import { Layout } from '@/components/layout/Layout';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Orders', href: '/orders', badge: 3 },
  { label: 'Settings', href: '/settings' },
];

export default function RootLayout({ children }) {
  return (
    <Layout
      cartCount={0}
      sidebarItems={sidebarItems}
      showSidebar={false}
      sidebarTitle="Navigation"
    >
      {children}
    </Layout>
  );
}
```

### Option 2: Use Individual Components

```tsx
import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';
import { Sidebar } from '@/components/layout';

export default function Page() {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
  ];

  return (
    <>
      <Header cartCount={5} />
      <Sidebar items={items} isOpen={true} />
      <main>{/* Your content */}</main>
      <Footer />
    </>
  );
}
```

## Component Props

### Header
```tsx
interface HeaderProps {
  cartCount?: number; // Items in cart (default: 0)
}
```

### Footer
No props required - renders fixed content with auto-updating year.

### Sidebar
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

### Layout
```tsx
interface LayoutProps {
  children: ReactNode;
  cartCount?: number;
  sidebarItems?: LayoutItem[];
  showSidebar?: boolean;
  sidebarTitle?: string;
}
```

## Features Summary

### Header
✅ Navigation links
✅ Shopping cart with badge
✅ Mobile hamburger menu
✅ Sticky positioning
✅ Dark/light mode

### Footer
✅ Product links
✅ Company links
✅ Legal links
✅ Social media icons
✅ Auto-updating copyright

### Sidebar
✅ Collapsible menu
✅ Icon support
✅ Badge notifications
✅ Mobile overlay
✅ Active state styling

### All Components
✅ Responsive design (mobile, tablet, desktop)
✅ Dark/light mode support
✅ WCAG AA accessibility
✅ Keyboard navigation
✅ Touch-friendly on mobile

## View the Demo

Open `/layout-demo` in your browser to see:
- All components in action
- Interactive cart count control
- Sidebar toggle button
- Responsive behavior
- Feature showcase
- Accessibility checklist
- Responsive breakpoints table

## CSS Customization

All colors can be customized via CSS variables in your global CSS:

```css
:root {
  /* Light mode */
  --header-bg: #ffffff;
  --footer-bg: #f9fafb;
  --sidebar-bg: #ffffff;
  --border-color: #e5e7eb;
  --text-color: #213547;
  --text-secondary: #666666;
  --primary-color: #646cff;
  --primary-hover: #535be2;
  --primary-active: #535be2;
  --accent-color: #ff6b6b;
  --hover-bg: #f0f0f0;
  --social-bg: #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode variables with -dark suffix */
    --header-bg-dark: #1a1a1a;
    --footer-bg-dark: #1a1a1a;
    --sidebar-bg-dark: #1a1a1a;
    --border-color-dark: #404040;
    --text-color-dark: #e0e0e0;
    --text-secondary-dark: #a0a0a0;
    --primary-color-dark: #a4d9ff;
    --primary-hover-dark: #b4e4ff;
    --primary-active-dark: #b4e4ff;
    --accent-color-dark: #ff6b6b;
    --hover-bg-dark: #333333;
    --social-bg-dark: #333333;
  }
}
```

## Responsive Breakpoints

- **Desktop** (≥ 1024px): Sidebar visible, full navigation
- **Tablet** (768px - 1023px): Hamburger menu, no sidebar
- **Mobile** (< 768px): Full-width sidebar overlay
- **Small Mobile** (< 480px): Optimized spacing

## Accessibility Features

- Semantic HTML with proper heading hierarchy
- ARIA labels on all interactive elements
- Full keyboard navigation support
- Color contrast meets WCAG AA
- Focus indicators for keyboard users
- Respects `prefers-reduced-motion`
- Supports dark mode via `prefers-color-scheme`

## Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS 12+, Android Chrome)

## Next Steps

1. **Copy demo structure** - Use `/layout-demo` as reference
2. **Update global styles** - Customize CSS variables
3. **Add your branding** - Update logo, colors, links
4. **Create pages** - Build page content
5. **Test responsive** - Check on mobile devices
6. **Customize navigation** - Update sidebar items and header links

## Troubleshooting

### Components not showing
- Ensure Next.js is set to use App Router
- Check that CSS files are imported
- Verify component paths in imports

### Styles not applying
- Clear browser cache
- Check for CSS conflicts
- Verify CSS variable values
- Test in incognito window

### Mobile menu not working
- Check z-index values
- Verify JavaScript is enabled
- Test on actual mobile device
- Check browser console for errors

## For More Information

See `src/components/layout/README.md` for:
- Complete component documentation
- Detailed usage examples
- Styling guide
- Testing setup
- Browser compatibility matrix

Visit `/layout-demo` to see all features in action!
