/**
 * Create Holbaza Design System & Frontend Tasks
 * Material Design 3 implementation for all Holbaza interfaces
 */

const PROJECT_ID = 'e9f51260-db58-4e17-b0a8-7ad898206bf5';
const API_BASE = 'http://127.0.0.1:63846/api';

const designTasks = [
  // ==================== DESIGN FOUNDATION ====================
  {
    title: "DESIGN-001: Setup MD3 theme and CSS variables",
    description: "Type: Design Foundation\nPriority: P0\nDepends On: None\nEpic: Design System\n\nDescription:\nSetup Material Design 3 theming with Holbaza brand colors.\n\nFiles to Create:\n- src/styles/theme.css - CSS variables for colors, elevation, shape\n- src/styles/typography.css - MD3 type scale\n- src/styles/globals.css - Base styles\n- src/lib/design-tokens.ts - TypeScript tokens\n\nColor Palette:\n- Primary: #1A237E (Deep Indigo)\n- Secondary: #FF8F00 (Warm Amber)\n- Tertiary: #00695C (Teal)\n- Risk colors: green/amber/red/critical\n\nAcceptance Criteria:\n- CSS variables defined for all MD3 tokens\n- Light and dark theme support\n- TypeScript tokens exportable\n- Tailwind config extended with tokens"
  },
  {
    title: "DESIGN-002: Install and configure Material Symbols font",
    description: "Type: Design Foundation\nPriority: P0\nDepends On: DESIGN-001\nEpic: Design System\n\nDescription:\nSetup Material Symbols variable icon font.\n\nImplementation:\n1. Add to next.config.js or _document.tsx:\n   - Google Fonts link for Material Symbols Rounded\n2. Create Icon component with variant support:\n   - FILL, wght, GRAD, opsz settings\n   - Filled vs outlined variants\n3. Export common icon names as constants\n\nFile: src/components/md3/Icon/Icon.tsx\n\nAcceptance Criteria:\n- Icons render correctly\n- Variable font settings work\n- TypeScript autocomplete for icon names"
  },
  {
    title: "DESIGN-003: Setup Google Sans + Noto Sans Devanagari fonts",
    description: "Type: Design Foundation\nPriority: P0\nDepends On: DESIGN-001\nEpic: Design System\n\nDescription:\nConfigure fonts for English and Hindi/Punjabi.\n\nFonts:\n- Google Sans (primary) with Roboto fallback\n- Noto Sans Devanagari (Hindi)\n- Noto Sans Gurmukhi (Punjabi)\n- Roboto Mono (codes, IDs)\n\nImplementation:\n- next/font optimization\n- Font-display: swap\n- Subset for Devanagari\n\nAcceptance Criteria:\n- Fonts load without FOUT\n- Hindi text renders correctly\n- Monospace for suit IDs works"
  },

  // ==================== MD3 BASE COMPONENTS ====================
  {
    title: "DESIGN-004: Create MD3 Button component",
    description: "Type: Component\nPriority: P0\nDepends On: DESIGN-001, DESIGN-002\nEpic: Design System - Components\n\nDescription:\nCreate Button component with all MD3 variants.\n\nFile: src/components/md3/Button/Button.tsx\n\nVariants:\n- filled (primary action)\n- tonal (secondary)\n- outlined (tertiary)\n- text (minimal)\n- elevated (with shadow)\n\nProps:\n- variant, size (sm/md/lg)\n- icon (leading), iconPosition\n- loading, disabled states\n- fullWidth option\n\nStates: default, hover (+8%), pressed (+12%), disabled (38%)\n\nAcceptance Criteria:\n- All 5 variants styled\n- Ripple effect on click\n- Icon support works\n- Loading spinner works\n- Keyboard accessible"
  },
  {
    title: "DESIGN-005: Create MD3 Card component",
    description: "Type: Component\nPriority: P0\nDepends On: DESIGN-001\nEpic: Design System - Components\n\nDescription:\nCreate Card component with MD3 variants.\n\nFile: src/components/md3/Card/Card.tsx\n\nVariants:\n- filled (default, subtle shadow)\n- outlined (border, no shadow)\n- elevated (higher shadow)\n\nSub-components:\n- CardHeader (avatar, title, subtitle, action)\n- CardContent (body)\n- CardMedia (image/video)\n- CardActions (buttons)\n\nAcceptance Criteria:\n- All 3 variants styled\n- Composable sub-components\n- Hover state for clickable cards\n- Proper border radius (12px)"
  },
  {
    title: "DESIGN-006: Create MD3 TextField component",
    description: "Type: Component\nPriority: P0\nDepends On: DESIGN-001, DESIGN-002\nEpic: Design System - Components\n\nDescription:\nCreate TextField with MD3 filled variant.\n\nFile: src/components/md3/TextField/TextField.tsx\n\nFeatures:\n- Floating label animation\n- Leading/trailing icons\n- Supporting text\n- Error state with message\n- Character counter\n- Multiline (textarea) support\n\nProps:\n- label, placeholder, supportingText\n- leadingIcon, trailingIcon\n- error, errorText\n- maxLength, showCounter\n- multiline, rows\n\nAcceptance Criteria:\n- Label floats on focus/filled\n- Error state is red\n- Icons are interactive if clickable\n- Works with react-hook-form"
  },
  {
    title: "DESIGN-007: Create MD3 Chip components",
    description: "Type: Component\nPriority: P0\nDepends On: DESIGN-001, DESIGN-002\nEpic: Design System - Components\n\nDescription:\nCreate Chip components for states and filters.\n\nFiles:\n- src/components/md3/Chip/Chip.tsx\n- src/components/md3/Chip/FilterChip.tsx\n- src/components/md3/Chip/InputChip.tsx\n\nVariants:\n- Assist chip (actions)\n- Filter chip (toggle selection)\n- Input chip (removable)\n- Suggestion chip\n\nHolbaza-specific:\n- StateChip (S01-S26 with colors)\n- RiskChip (0-1 score with color)\n\nAcceptance Criteria:\n- Chips are 32dp height\n- Filter chips toggle correctly\n- StateChip shows correct color per state\n- RiskChip pulses on critical"
  },
  {
    title: "DESIGN-008: Create MD3 Dialog and BottomSheet",
    description: "Type: Component\nPriority: P1\nDepends On: DESIGN-004\nEpic: Design System - Components\n\nDescription:\nCreate modal components.\n\nFiles:\n- src/components/md3/Dialog/Dialog.tsx\n- src/components/md3/BottomSheet/BottomSheet.tsx\n\nDialog Features:\n- Title, content, actions areas\n- Scrim overlay\n- Close on escape/outside click\n- Focus trap\n\nBottomSheet Features:\n- Drag to dismiss\n- Peek heights (partial, full)\n- Handle indicator\n- Mobile-optimized\n\nAcceptance Criteria:\n- Proper z-index stacking\n- Smooth enter/exit animations (300ms)\n- Accessible (focus trap, aria)\n- Works on mobile"
  },
  {
    title: "DESIGN-009: Create MD3 Navigation components",
    description: "Type: Component\nPriority: P0\nDepends On: DESIGN-002\nEpic: Design System - Components\n\nDescription:\nCreate navigation components for all layouts.\n\nFiles:\n- src/components/md3/TopAppBar/TopAppBar.tsx\n- src/components/md3/BottomNav/BottomNav.tsx\n- src/components/md3/NavRail/NavRail.tsx\n- src/components/md3/NavDrawer/NavDrawer.tsx\n\nTopAppBar:\n- Center-aligned or small variant\n- Leading icon (menu/back)\n- Title\n- Trailing actions\n\nBottomNav (mobile):\n- 3-5 destinations\n- Icon + label\n- Badge support\n\nNavRail (tablet/desktop):\n- Vertical icon + label\n- FAB slot\n- Collapsible\n\nAcceptance Criteria:\n- Responsive switching between nav types\n- Active state clearly visible\n- Badges show notification count\n- Smooth transitions"
  },
  {
    title: "DESIGN-010: Create MD3 DataTable component",
    description: "Type: Component\nPriority: P1\nDepends On: DESIGN-005, DESIGN-007\nEpic: Design System - Components\n\nDescription:\nCreate data table for dashboard views.\n\nFile: src/components/md3/DataTable/DataTable.tsx\n\nFeatures:\n- Column definitions with render functions\n- Sorting (click header)\n- Row selection (checkbox)\n- Pagination\n- Loading skeleton\n- Empty state\n- Row actions menu\n\nProps:\n- columns, data\n- selectable, sortable\n- pagination (page, pageSize, total)\n- onRowClick, onSelectionChange\n- loading, emptyMessage\n\nAcceptance Criteria:\n- Horizontal scroll on overflow\n- Sticky header option\n- Custom cell renderers work\n- Works with TanStack Table"
  },
  {
    title: "DESIGN-011: Create MD3 List component",
    description: "Type: Component\nPriority: P1\nDepends On: DESIGN-005\nEpic: Design System - Components\n\nDescription:\nCreate List component for mobile views.\n\nFile: src/components/md3/List/List.tsx\n\nSub-components:\n- ListItem\n- ListItemAvatar (leading)\n- ListItemText (headline, supporting)\n- ListItemAction (trailing)\n- ListDivider\n- ListSubheader\n\nFeatures:\n- Single line, two line, three line variants\n- Leading: icon, avatar, image\n- Trailing: icon, text, checkbox, switch\n- Swipe actions (mobile)\n\nAcceptance Criteria:\n- 56dp height for one-line\n- 72dp height for two-line\n- Proper text truncation\n- Swipe gestures work on touch"
  },
  {
    title: "DESIGN-012: Create MD3 Snackbar and Toast",
    description: "Type: Component\nPriority: P1\nDepends On: DESIGN-004\nEpic: Design System - Components\n\nDescription:\nCreate feedback components.\n\nFiles:\n- src/components/md3/Snackbar/Snackbar.tsx\n- src/lib/toast.ts (imperative API)\n\nSnackbar Features:\n- Message text\n- Optional action button\n- Auto-dismiss (4s default)\n- Stacking for multiple\n- Position: bottom-center (mobile), bottom-left (desktop)\n\nToast API:\n```typescript\ntoast.success('Job accepted!')\ntoast.error('Failed to update')\ntoast.info('New job available', { action: 'View' })\n```\n\nAcceptance Criteria:\n- Snackbar rises from bottom\n- Action is clearly tappable\n- Queue system for multiple toasts\n- Swipe to dismiss"
  },

  // ==================== HOLBAZA-SPECIFIC COMPONENTS ====================
  {
    title: "DESIGN-013: Create SuitCard component",
    description: "Type: Holbaza Component\nPriority: P0\nDepends On: DESIGN-005, DESIGN-007\nEpic: Design System - Holbaza\n\nDescription:\nCreate the primary suit display card.\n\nFile: src/components/holbaza/SuitCard/SuitCard.tsx\n\nLayout:\n```\n┌─────────────────────────┐\n│ [Avatar] SUIT-ID  [Risk]│\n│          Fabric Type    │\n├─────────────────────────┤\n│ [StateChip]             │\n│ [ProgressBar]           │\n│ 🕐 Due: 14:30 IST       │\n├─────────────────────────┤\n│ [Details] [Update]      │\n└─────────────────────────┘\n```\n\nProps:\n- suit: Suit object\n- onStatusUpdate, onViewDetails\n- compact: boolean (for lists)\n\nAcceptance Criteria:\n- Risk color on avatar\n- Progress bar shows state progress\n- Deadline shows relative time\n- Responsive (stacks on mobile)"
  },
  {
    title: "DESIGN-014: Create RiskBadge component",
    description: "Type: Holbaza Component\nPriority: P0\nDepends On: DESIGN-001\nEpic: Design System - Holbaza\n\nDescription:\nCreate risk score badge with color coding.\n\nFile: src/components/holbaza/RiskBadge/RiskBadge.tsx\n\nProps:\n- score: number (0-1)\n- size: 'sm' | 'md' | 'lg'\n- showValue: boolean\n- pulse: boolean (auto on critical)\n\nColors:\n- 0.0-0.3: #4CAF50 (green)\n- 0.3-0.6: #FF9800 (amber)\n- 0.6-0.8: #F44336 (red)\n- 0.8-1.0: #B71C1C (critical, pulses)\n\nAcceptance Criteria:\n- Color transitions smoothly\n- Critical badge pulses\n- Accessible contrast\n- Tooltip shows exact value"
  },
  {
    title: "DESIGN-015: Create TailorCard component",
    description: "Type: Holbaza Component\nPriority: P1\nDepends On: DESIGN-005\nEpic: Design System - Holbaza\n\nDescription:\nCreate tailor profile card.\n\nFile: src/components/holbaza/TailorCard/TailorCard.tsx\n\nLayout:\n```\n┌─────────────────────────┐\n│ [Photo] राजा सिंह       │\n│         Raja Singh      │\n│         ⭐ Master       │\n├─────────────────────────┤\n│ 📍 Zone A - 5 min to QC │\n│ 📊 QC Rate: 97%         │\n│ 👔 Active: 1/2 jobs     │\n├─────────────────────────┤\n│ [Call] [Assign Job]     │\n└─────────────────────────┘\n```\n\nProps:\n- tailor: Tailor object\n- onCall, onAssign\n- showStats: boolean\n\nAcceptance Criteria:\n- Shows Hindi + English name\n- Skill badge colored\n- Availability clearly shown\n- Call triggers VAPI"
  },
  {
    title: "DESIGN-016: Create FlightCard component",
    description: "Type: Holbaza Component\nPriority: P1\nDepends On: DESIGN-005\nEpic: Design System - Holbaza\n\nDescription:\nCreate charter flight card.\n\nFile: src/components/holbaza/FlightCard/FlightCard.tsx\n\nLayout:\n```\n┌─────────────────────────┐\n│ ✈️ FLT-2024-0122        │\n│ ATQ ────────────→ SHJ   │\n│ 22:00 IST    02:30 GST  │\n├─────────────────────────┤\n│ [===----] 45/200 suits  │\n│ Status: Loading         │\n├─────────────────────────┤\n│ [Manifest] [Add Suits]  │\n└─────────────────────────┘\n```\n\nProps:\n- flight: Flight object\n- onViewManifest, onAddSuits\n\nAcceptance Criteria:\n- Route visualization\n- Multi-stop support (dots)\n- Capacity bar visual\n- Status badge"
  },
  {
    title: "DESIGN-017: Create DeliveryCard component",
    description: "Type: Holbaza Component\nPriority: P1\nDepends On: DESIGN-005\nEpic: Design System - Holbaza\n\nDescription:\nCreate delivery stop card for driver app.\n\nFile: src/components/holbaza/DeliveryCard/DeliveryCard.tsx\n\nLayout:\n```\n┌─────────────────────────┐\n│ 📍 Dubai Marina         │\n│ Tower 3, Apartment 1204 │\n├─────────────────────────┤\n│ 👤 Ahmed Al-Rashid      │\n│ 📞 +971 50 XXX XXXX     │\n│ ⏰ Window: 14:00-15:00  │\n├─────────────────────────┤\n│ 👔 SUIT-0847, SUIT-0848 │\n├─────────────────────────┤\n│ [Navigate] [Confirm]    │\n└─────────────────────────┘\n```\n\nProps:\n- delivery: Delivery object\n- onNavigate, onConfirm, onCall\n\nAcceptance Criteria:\n- Address clearly formatted\n- Time window prominent\n- Suit count visible\n- One-tap navigation"
  },

  // ==================== APP SHELLS ====================
  {
    title: "DESIGN-018: Create TailorAppShell layout",
    description: "Type: Layout\nPriority: P0\nDepends On: DESIGN-009\nEpic: Design System - Layouts\n\nDescription:\nCreate mobile app shell for tailor app.\n\nFile: src/components/layout/TailorAppShell/TailorAppShell.tsx\n\nStructure:\n```\n┌─────────────────────────┐\n│ TopAppBar               │\n├─────────────────────────┤\n│                         │\n│ {children}              │\n│ (scrollable content)    │\n│                         │\n├─────────────────────────┤\n│ BottomNav               │\n│ Home|Jobs|Pay|Profile   │\n└─────────────────────────┘\n```\n\nFeatures:\n- Safe area insets\n- Pull to refresh\n- FAB slot\n- Online/offline indicator\n\nAcceptance Criteria:\n- Works on iOS and Android\n- Bottom nav hides on scroll (optional)\n- Status bar color matches theme\n- Handles notch/dynamic island"
  },
  {
    title: "DESIGN-019: Create DashboardShell layout",
    description: "Type: Layout\nPriority: P0\nDepends On: DESIGN-009\nEpic: Design System - Layouts\n\nDescription:\nCreate desktop dashboard shell for ops team.\n\nFile: src/components/layout/DashboardShell/DashboardShell.tsx\n\nStructure:\n```\n┌──────┬──────────────────────────────┐\n│      │ TopAppBar                    │\n│      ├──────────────────────────────┤\n│ Nav  │                              │\n│ Rail │ {children}                   │\n│      │ (grid content area)          │\n│      │                              │\n└──────┴──────────────────────────────┘\n```\n\nFeatures:\n- Collapsible nav rail\n- Breadcrumb support\n- Global search\n- Notification bell\n- User menu\n\nAcceptance Criteria:\n- Responsive: rail collapses to drawer on tablet\n- Keyboard shortcuts (cmd+k search)\n- Active nav item highlighted\n- Works with Next.js App Router"
  },
  {
    title: "DESIGN-020: Create DriverAppShell layout",
    description: "Type: Layout\nPriority: P1\nDepends On: DESIGN-009\nEpic: Design System - Layouts\n\nDescription:\nCreate mobile app shell for UAE drivers.\n\nFile: src/components/layout/DriverAppShell/DriverAppShell.tsx\n\nStructure:\n```\n┌─────────────────────────┐\n│ TopAppBar (minimal)     │\n├─────────────────────────┤\n│ Map View (50%)          │\n├─────────────────────────┤\n│ Route List (50%)        │\n│ (draggable sheet)       │\n└─────────────────────────┘\n```\n\nFeatures:\n- Split view (map + list)\n- Draggable bottom sheet\n- Quick action FAB\n- GPS status indicator\n\nAcceptance Criteria:\n- Map integrates with Mapbox/Google\n- Sheet snaps to positions\n- Works in landscape\n- Low battery mode aware"
  },

  // ==================== SCREENS ====================
  {
    title: "DESIGN-021: Design Tailor Home screen",
    description: "Type: Screen Design\nPriority: P0\nDepends On: DESIGN-018, DESIGN-013\nEpic: Design System - Screens\n\nDescription:\nDesign the tailor app home screen.\n\nFile: src/app/(tailor)/page.tsx\n\nSections:\n1. Greeting (Hindi + English, time-aware)\n2. Today's Summary card (active, done, earnings)\n3. Urgent Jobs section (if any)\n4. Recent Activity list\n\nBehavior:\n- Pull to refresh\n- Urgent jobs pulse\n- Real-time updates via WebSocket\n\nAcceptance Criteria:\n- Personalized greeting\n- Summary updates live\n- Clear CTA for urgent jobs\n- Loads in <2s"
  },
  {
    title: "DESIGN-022: Design Tailor Job Detail screen",
    description: "Type: Screen Design\nPriority: P0\nDepends On: DESIGN-018\nEpic: Design System - Screens\n\nDescription:\nDesign the job detail screen for tailors.\n\nFile: src/app/(tailor)/jobs/[id]/page.tsx\n\nSections:\n1. Suit image/3D preview\n2. Fabric and style details\n3. Measurements (expandable)\n4. Timeline tracker\n5. Action buttons\n\nActions:\n- Accept Job\n- Upload Progress Photo\n- Mark Cutting Complete\n- Mark Stitching Complete\n- Request Help (VAPI call)\n\nAcceptance Criteria:\n- All measurements visible\n- Photo upload works\n- Timeline shows history\n- Offline capable"
  },
  {
    title: "DESIGN-023: Design Operations Dashboard - Suit Tracker",
    description: "Type: Screen Design\nPriority: P0\nDepends On: DESIGN-019, DESIGN-010, DESIGN-013\nEpic: Design System - Screens\n\nDescription:\nDesign the main ops dashboard suit tracker.\n\nFile: src/app/(dashboard)/suits/page.tsx\n\nSections:\n1. Risk summary bar (green/amber/red/critical counts)\n2. Filter bar (state, tailor, deadline, risk)\n3. Data table with suit rows\n4. Quick actions on hover\n\nTable Columns:\n- Suit ID, State chip, Tailor, Risk badge, Deadline, Actions\n\nFeatures:\n- Real-time updates (SSE)\n- Bulk actions on selection\n- Export to CSV\n- Click row for detail panel\n\nAcceptance Criteria:\n- Handles 500+ suits performantly\n- Filters are instant\n- Sort by any column\n- Mobile: switches to card list"
  },
  {
    title: "DESIGN-024: Design Operations Dashboard - Map View",
    description: "Type: Screen Design\nPriority: P1\nDepends On: DESIGN-019\nEpic: Design System - Screens\n\nDescription:\nDesign the map view for suit/van tracking.\n\nFile: src/app/(dashboard)/map/page.tsx\n\nFeatures:\n1. Full-screen map (Mapbox)\n2. Suit pins colored by risk\n3. Van icons with routes\n4. Cluster markers for dense areas\n5. Click marker for popup\n6. Filter panel overlay\n\nLayers:\n- Suits (toggleable)\n- Vans (toggleable)\n- QC Stations (toggleable)\n- Delivery zones (toggleable)\n\nAcceptance Criteria:\n- 60fps pan/zoom\n- Real-time position updates\n- Popup shows key details\n- Works on mobile (pinch zoom)"
  },
  {
    title: "DESIGN-025: Design Driver Route screen",
    description: "Type: Screen Design\nPriority: P1\nDepends On: DESIGN-020, DESIGN-017\nEpic: Design System - Screens\n\nDescription:\nDesign the driver's daily route screen.\n\nFile: src/app/(driver)/route/page.tsx\n\nSections:\n1. Map with route polyline\n2. Next stop highlight\n3. Stop list (draggable sheet)\n4. Summary (stops, time, distance)\n\nFeatures:\n- Turn-by-turn preview\n- Reorder stops (if allowed)\n- Mark complete with photo\n- Call customer button\n\nAcceptance Criteria:\n- Route optimized visually\n- ETA updates live\n- Works offline (cached route)\n- Low data mode"
  }
];

async function main() {
  console.log('Creating Holbaza Design System Tasks...');
  console.log('Project ID:', PROJECT_ID);
  console.log('Total tasks:', designTasks.length);
  console.log('');

  let created = 0;
  let failed = 0;

  for (const task of designTasks) {
    try {
      const response = await fetch(API_BASE + '/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: PROJECT_ID,
          title: task.title,
          description: task.description,
          status: 'todo'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.log('FAILED:', task.title);
        console.log('  Error:', error);
        failed++;
      } else {
        console.log('CREATED:', task.title);
        created++;
      }
    } catch (err) {
      console.log('ERROR:', task.title);
      console.log('  ', err.message);
      failed++;
    }
  }

  console.log('');
  console.log('=== SUMMARY ===');
  console.log('Created:', created);
  console.log('Failed:', failed);
}

main().catch(console.error);
