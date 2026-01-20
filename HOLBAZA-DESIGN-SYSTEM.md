# Holbaza Design System

## Brand Identity & Design Guidelines

> **Version:** 1.0  
> **Platform:** Material Design 3 (MD3)  
> **Target Users:** Tailors (India), QC Inspectors, Drivers (UAE), Operations Team

---

## 1. Brand Overview

### 1.1 Brand Name
**Holbaza** (होलबाज़ा) - The India-facing brand for all tailor network operations.

### 1.2 Brand Positioning
- **Functional**: Tools that work, not decorations
- **Modern**: Clean, contemporary design language
- **Accessible**: Easy for all skill levels, optimized for mobile
- **Trustworthy**: Professional appearance that builds confidence

### 1.3 Brand Personality
| Attribute | Expression |
|-----------|------------|
| Reliable | Consistent UI, predictable interactions |
| Efficient | Minimal steps to complete tasks |
| Respectful | Culturally appropriate, multi-language |
| Professional | Clean aesthetics, no clutter |

---

## 2. Color System

### 2.1 Primary Palette (MD3 Tonal)

```
Primary: Deep Indigo
├── Primary:        #1A237E (Indigo 900)
├── On Primary:     #FFFFFF
├── Primary Container: #C5CAE9 (Indigo 100)
└── On Primary Container: #1A237E

Secondary: Warm Amber
├── Secondary:      #FF8F00 (Amber 800)
├── On Secondary:   #FFFFFF
├── Secondary Container: #FFE082 (Amber 200)
└── On Secondary Container: #E65100

Tertiary: Teal Accent
├── Tertiary:       #00695C (Teal 800)
├── On Tertiary:    #FFFFFF
├── Tertiary Container: #B2DFDB (Teal 100)
└── On Tertiary Container: #004D40
```

### 2.2 Semantic Colors

```
Status Colors (Risk/State Indicators):

Success (QC Pass, Delivered):
├── Color:          #2E7D32 (Green 800)
├── Container:      #C8E6C9 (Green 100)
└── Icon:           check_circle

Warning (Amber Risk, Attention):
├── Color:          #F57C00 (Orange 800)
├── Container:      #FFE0B2 (Orange 100)
└── Icon:           warning

Error (QC Fail, Critical Risk):
├── Color:          #C62828 (Red 800)
├── Container:      #FFCDD2 (Red 100)
└── Icon:           error

Info (In Progress, Neutral):
├── Color:          #1565C0 (Blue 800)
├── Container:      #BBDEFB (Blue 100)
└── Icon:           info
```

### 2.3 Risk Score Colors

```css
/* Composite Risk Score 0-1 */
.risk-green    { background: #4CAF50; }  /* 0.0 - 0.3: On Track */
.risk-amber    { background: #FF9800; }  /* 0.3 - 0.6: Monitor */
.risk-red      { background: #F44336; }  /* 0.6 - 0.8: At Risk */
.risk-critical { background: #B71C1C; }  /* 0.8 - 1.0: Critical */
```

### 2.4 Surface Colors

```
Light Theme:
├── Background:     #FAFAFA
├── Surface:        #FFFFFF
├── Surface Variant: #F5F5F5
├── Outline:        #E0E0E0
└── On Surface:     #212121

Dark Theme:
├── Background:     #121212
├── Surface:        #1E1E1E
├── Surface Variant: #2C2C2C
├── Outline:        #424242
└── On Surface:     #E0E0E0
```

---

## 3. Typography

### 3.1 Font Stack

```css
/* Primary: Google Sans (or Roboto fallback) */
--font-primary: 'Google Sans', 'Roboto', -apple-system, sans-serif;

/* Monospace: For codes, IDs, measurements */
--font-mono: 'Roboto Mono', 'Consolas', monospace;

/* Hindi/Punjabi: Noto Sans Devanagari */
--font-indic: 'Noto Sans Devanagari', 'Noto Sans Gurmukhi', sans-serif;
```

### 3.2 Type Scale (MD3)

```
Display Large:   57px / 64px line / -0.25 tracking
Display Medium:  45px / 52px line / 0 tracking
Display Small:   36px / 44px line / 0 tracking

Headline Large:  32px / 40px line / 0 tracking
Headline Medium: 28px / 36px line / 0 tracking
Headline Small:  24px / 32px line / 0 tracking

Title Large:     22px / 28px line / 0 tracking
Title Medium:    16px / 24px line / 0.15 tracking
Title Small:     14px / 20px line / 0.1 tracking

Body Large:      16px / 24px line / 0.5 tracking
Body Medium:     14px / 20px line / 0.25 tracking
Body Small:      12px / 16px line / 0.4 tracking

Label Large:     14px / 20px line / 0.1 tracking
Label Medium:    12px / 16px line / 0.5 tracking
Label Small:     11px / 16px line / 0.5 tracking
```

### 3.3 Typography Usage

| Context | Style | Weight |
|---------|-------|--------|
| Page titles | Headline Large | Medium (500) |
| Section headers | Title Large | Medium (500) |
| Card titles | Title Medium | Medium (500) |
| Body text | Body Medium | Regular (400) |
| Buttons | Label Large | Medium (500) |
| Captions | Body Small | Regular (400) |
| Suit IDs, codes | Mono, Body Medium | Regular (400) |
| Hindi labels | Indic, Body Large | Regular (400) |

---

## 4. Iconography

### 4.1 Icon System
Use **Material Symbols** (variable font) with these settings:

```css
.material-symbols-rounded {
  font-variation-settings:
    'FILL' 0,      /* Outlined by default */
    'wght' 400,    /* Regular weight */
    'GRAD' 0,      /* No grade */
    'opsz' 24;     /* Optical size 24 */
}

/* Filled variant for active states */
.material-symbols-rounded.filled {
  font-variation-settings: 'FILL' 1;
}
```

### 4.2 Core Icons

| Function | Icon Name | Usage |
|----------|-----------|-------|
| Suit/Order | checkroom | Suit tracking |
| Tailor | content_cut | Tailor profiles |
| QC Pass | verified | Quality approved |
| QC Fail | cancel | Quality rejected |
| Flight | flight_takeoff | Charter logistics |
| Van | local_shipping | Ground delivery |
| Location | location_on | GPS/coordinates |
| Time | schedule | Deadlines, ETAs |
| Risk High | warning | Risk alerts |
| Phone | call | VAPI calls |
| Payment | payments | UPI/Razorpay |
| Settings | settings | Configuration |
| Menu | menu | Navigation |
| Back | arrow_back | Navigation |
| Add | add | Create actions |
| Edit | edit | Modify actions |
| Delete | delete | Remove actions |

### 4.3 State-Specific Icons

```
Manufacturing States:
S01-S03: assignment (order phase)
S04-S05: architecture (pattern phase)
S06-S08: print (printing phase)
S09-S13: checkroom (production phase)
S14-S16: verified/cancel (QC phase)
S17-S19: local_shipping (shipping phase)

Logistics States:
S20: flight_takeoff (manifest)
S21: flight (in flight)
S22: flight_land (landed)
S23: security (customs)
S24: local_shipping (van assigned)
S25: delivery_dining (out for delivery)
S26: check_circle (delivered)
```

---

## 5. Component Library

### 5.1 Cards (MD3 Filled)

```jsx
// Suit Card - Primary display unit
<Card variant="filled" className="suit-card">
  <CardHeader>
    <Avatar icon="checkroom" color={riskColor} />
    <div>
      <Title>SUIT-2024-0847</Title>
      <Subtitle>Navy Wool - 3 Piece</Subtitle>
    </div>
    <RiskBadge score={0.45} />
  </CardHeader>
  <CardContent>
    <StateChip state="S11" label="Stitching" />
    <ProgressBar value={65} />
    <MetaRow>
      <Icon name="schedule" />
      <Text>Due: 14:30 IST</Text>
    </MetaRow>
  </CardContent>
  <CardActions>
    <Button variant="text">Details</Button>
    <Button variant="filled">Update Status</Button>
  </CardActions>
</Card>
```

**Card Variants:**
- `filled`: Default, white surface with subtle shadow
- `outlined`: Border only, no shadow (for lists)
- `elevated`: Higher shadow, for emphasis

### 5.2 Buttons (MD3)

```jsx
// Primary action
<Button variant="filled" icon="check">
  Accept Job
</Button>

// Secondary action  
<Button variant="tonal" icon="call">
  Call Tailor
</Button>

// Tertiary action
<Button variant="outlined" icon="info">
  View Details
</Button>

// Text only
<Button variant="text">
  Cancel
</Button>

// FAB (Floating Action Button)
<FAB icon="add" label="New Order" extended />
```

**Button States:**
- Default: Full opacity
- Hover: +8% overlay
- Pressed: +12% overlay
- Disabled: 38% opacity, no interaction

### 5.3 State Chips

```jsx
// Status indicator chips
<StateChip 
  state="S11" 
  label="Stitching"
  color="info"
  icon="checkroom"
/>

// Risk chips
<RiskChip 
  score={0.72}
  label="At Risk"
  color="error"
/>

// Filter chips
<FilterChip 
  selected={true}
  label="Track B"
  onSelect={handleFilter}
/>
```

### 5.4 Navigation

```jsx
// Bottom Navigation (Mobile - Tailor App)
<BottomNav>
  <NavItem icon="home" label="Home" active />
  <NavItem icon="checkroom" label="Jobs" badge={3} />
  <NavItem icon="payments" label="Earnings" />
  <NavItem icon="person" label="Profile" />
</BottomNav>

// Navigation Rail (Tablet/Desktop - Dashboard)
<NavRail>
  <NavRailItem icon="dashboard" label="Overview" />
  <NavRailItem icon="checkroom" label="Suits" active />
  <NavRailItem icon="people" label="Tailors" />
  <NavRailItem icon="flight" label="Flights" />
  <NavRailItem icon="local_shipping" label="Vans" />
  <NavRailItem icon="settings" label="Settings" />
</NavRail>

// Top App Bar
<TopAppBar>
  <IconButton icon="menu" />
  <Title>Active Jobs</Title>
  <IconButton icon="search" />
  <IconButton icon="notifications" badge={2} />
  <Avatar src={user.photo} />
</TopAppBar>
```

### 5.5 Forms & Inputs

```jsx
// Text Field (MD3 Filled)
<TextField
  variant="filled"
  label="Tailor Name"
  placeholder="Enter full name"
  supportingText="As shown on UPI"
  leadingIcon="person"
  required
/>

// Dropdown / Select
<Select
  label="Skill Level"
  options={['Junior', 'Senior', 'Master']}
  value={skillLevel}
  onChange={setSkillLevel}
/>

// Search Bar
<SearchBar
  placeholder="Search suits, tailors..."
  onSearch={handleSearch}
  filters={['State', 'Risk', 'Tailor']}
/>
```

### 5.6 Data Display

```jsx
// Data Table (Desktop)
<DataTable
  columns={[
    { key: 'id', label: 'Suit ID', width: 150 },
    { key: 'state', label: 'Status', render: StateChip },
    { key: 'tailor', label: 'Tailor' },
    { key: 'risk', label: 'Risk', render: RiskBadge },
    { key: 'deadline', label: 'Due', format: 'time' },
    { key: 'actions', label: '', render: ActionMenu }
  ]}
  data={suits}
  selectable
  sortable
  pagination
/>

// List (Mobile)
<List>
  {suits.map(suit => (
    <ListItem
      key={suit.id}
      leading={<Avatar icon="checkroom" color={suit.riskColor} />}
      headline={suit.id}
      supportingText={`${suit.fabric} - ${suit.stateLabel}`}
      trailing={<StateChip state={suit.state} small />}
      onClick={() => navigate(`/suits/${suit.id}`)}
    />
  ))}
</List>
```

### 5.7 Feedback & Dialogs

```jsx
// Snackbar
<Snackbar
  message="Job accepted successfully"
  action={{ label: 'Undo', onClick: handleUndo }}
  duration={4000}
/>

// Dialog
<Dialog open={showConfirm} onClose={handleClose}>
  <DialogTitle>Confirm QC Result</DialogTitle>
  <DialogContent>
    <Text>Mark suit SUIT-2024-0847 as QC Passed?</Text>
    <Text variant="body-small">This will trigger payment to tailor.</Text>
  </DialogContent>
  <DialogActions>
    <Button variant="text" onClick={handleClose}>Cancel</Button>
    <Button variant="filled" onClick={handleConfirm}>Confirm</Button>
  </DialogActions>
</Dialog>

// Bottom Sheet (Mobile)
<BottomSheet open={showActions}>
  <SheetHeader>
    <Title>Update Status</Title>
    <IconButton icon="close" onClick={handleClose} />
  </SheetHeader>
  <SheetContent>
    <List>
      <ListItem icon="check" label="Mark Complete" />
      <ListItem icon="warning" label="Report Issue" />
      <ListItem icon="call" label="Call Support" />
    </List>
  </SheetContent>
</BottomSheet>
```

---

## 6. Layout Patterns

### 6.1 Responsive Breakpoints

```css
/* MD3 Window Size Classes */
--compact:  0px - 599px;    /* Phone portrait */
--medium:   600px - 839px;  /* Phone landscape, tablet portrait */
--expanded: 840px+;         /* Tablet landscape, desktop */
```

### 6.2 Grid System

```css
/* Compact (Mobile) */
.grid-compact {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
}

/* Medium (Tablet) */
.grid-medium {
  grid-template-columns: repeat(8, 1fr);
  gap: 24px;
  padding: 24px;
}

/* Expanded (Desktop) */
.grid-expanded {
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  padding: 24px;
  max-width: 1440px;
  margin: 0 auto;
}
```

### 6.3 Page Layouts

**Tailor App (Mobile-First):**
```
┌─────────────────────┐
│    Top App Bar      │
├─────────────────────┤
│                     │
│    Content Area     │
│    (Scrollable)     │
│                     │
├─────────────────────┤
│   Bottom Nav Bar    │
└─────────────────────┘
```

**Operations Dashboard (Desktop):**
```
┌──────┬──────────────────────────────────────┐
│      │           Top App Bar                │
│      ├──────────────────────────────────────┤
│ Nav  │                                      │
│ Rail │         Main Content Area            │
│      │         (Grid Layout)                │
│      │                                      │
│      │   ┌─────────┐  ┌─────────┐          │
│      │   │ Card 1  │  │ Card 2  │          │
│      │   └─────────┘  └─────────┘          │
└──────┴──────────────────────────────────────┘
```

---

## 7. Motion & Animation

### 7.1 Timing (MD3 Easing)

```css
/* Standard easing for most transitions */
--ease-standard: cubic-bezier(0.2, 0, 0, 1);

/* Emphasized for dramatic entrances */
--ease-emphasized: cubic-bezier(0.2, 0, 0, 1);

/* Decelerate for entering elements */
--ease-decelerate: cubic-bezier(0, 0, 0, 1);

/* Accelerate for exiting elements */
--ease-accelerate: cubic-bezier(0.3, 0, 1, 1);
```

### 7.2 Duration

```css
--duration-short1: 50ms;   /* Micro-interactions */
--duration-short2: 100ms;  /* Simple selections */
--duration-short3: 150ms;  /* Icons, small elements */
--duration-short4: 200ms;  /* Standard transitions */
--duration-medium1: 250ms; /* Complex transitions */
--duration-medium2: 300ms; /* Page transitions */
--duration-medium3: 350ms; /* Modal open/close */
--duration-medium4: 400ms; /* Large elements */
--duration-long1: 450ms;   /* Complex animations */
--duration-long2: 500ms;   /* Background changes */
```

### 7.3 Common Animations

```css
/* Card enter */
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ripple effect */
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Pulse for attention */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Risk badge pulse */
.risk-critical {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 8. Accessibility

### 8.1 Color Contrast
All text must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### 8.2 Touch Targets
- Minimum touch target: 48x48dp
- Recommended: 56x56dp for primary actions
- Spacing between targets: 8dp minimum

### 8.3 Focus States
```css
/* Visible focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid currentColor;
  }
}
```

### 8.4 Screen Reader Support
- All icons have `aria-label`
- Status changes announced via `aria-live`
- Form errors linked via `aria-describedby`

---

## 9. Localization

### 9.1 Supported Languages

| Code | Language | Script | Direction |
|------|----------|--------|-----------|
| en | English | Latin | LTR |
| hi | Hindi | Devanagari | LTR |
| pa | Punjabi | Gurmukhi | LTR |
| ar | Arabic | Arabic | RTL |

### 9.2 Language Switcher
```jsx
<LanguageSelector
  current="hi"
  options={[
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  ]}
  onChange={setLanguage}
/>
```

### 9.3 RTL Support
```css
/* Automatic RTL flip */
[dir="rtl"] {
  .icon-back { transform: scaleX(-1); }
  .nav-rail { right: 0; left: auto; }
}
```

---

## 10. Application-Specific Patterns

### 10.1 Tailor Mobile App

**Home Screen:**
```
┌─────────────────────────┐
│ Holbaza          🔔 👤  │
├─────────────────────────┤
│ नमस्ते, राजा जी         │
│ Good morning, Raja      │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 📊 Today's Summary  │ │
│ │ Active: 2 │ Done: 5 │ │
│ │ Earnings: ₹42,500   │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ 🔴 Urgent Job           │
│ ┌─────────────────────┐ │
│ │ SUIT-0847           │ │
│ │ Navy 3-piece        │ │
│ │ Due: 2 hours        │ │
│ │ [Accept] [Decline]  │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ 🏠  👔  💰  👤          │
│ Home Jobs Pay Profile   │
└─────────────────────────┘
```

**Job Detail Screen:**
```
┌─────────────────────────┐
│ ← SUIT-2024-0847        │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ [Suit Image/3D]     │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ Navy Wool - 3 Piece     │
│ Jacket + Trousers + Vest│
├─────────────────────────┤
│ 📏 Measurements         │
│ Chest: 42" │ Waist: 34" │
│ Length: 30" │ Shoulder..│
│ [View Full Specs →]     │
├─────────────────────────┤
│ ⏱️ Timeline             │
│ ● Assigned    10:30     │
│ ● Accepted    10:32     │
│ ○ Cutting     --:--     │
│ ○ Stitching   --:--     │
│ ○ Complete    --:--     │
├─────────────────────────┤
│ [📸 Upload Progress]    │
│ [✓ Mark Complete]       │
└─────────────────────────┘
```

### 10.2 Operations Dashboard

**Suit Tracker View:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │ Holbaza Operations              🔍  🔔  Admin ▾ │
│      ├──────────────────────────────────────────────────┤
│ 📊   │ Track B Suits                    Filter ▾  + New │
│      ├──────────────────────────────────────────────────┤
│ 👔   │ ┌────────────────────────────────────────────┐   │
│      │ │ 🟢 12  🟡 8  🔴 3  ⚫ 1  │ Total: 24      │   │
│ 👥   │ └────────────────────────────────────────────┘   │
│      ├──────────────────────────────────────────────────┤
│ ✈️   │ ID          State      Tailor    Risk   Due     │
│      │ ─────────────────────────────────────────────── │
│ 🚐   │ SUIT-0847   Stitching  Raja      🟡0.45  14:30  │
│      │ SUIT-0848   Cutting    Mohan     🟢0.22  16:00  │
│ ⚙️   │ SUIT-0849   QC Review  Sanjay    🔴0.78  13:00  │
│      │ SUIT-0850   In Flight  --        🟢0.15  18:00  │
│      │                                                  │
│      │ [1] [2] [3] ... [8]  Showing 1-10 of 24         │
└──────┴──────────────────────────────────────────────────┘
```

**Flight Management:**
```
┌──────────────────────────────────────────────────────────┐
│ ✈️ Charter Flights                                       │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐  ┌──────────────────────┐      │
│ │ FLT-2024-0122        │  │ FLT-2024-0123        │      │
│ │ ATQ → SHJ            │  │ ATQ → MCT → AUH → SHJ│      │
│ │ Scheduled: 22:00 IST │  │ Scheduled: Tomorrow  │      │
│ │ Suits: 45/200        │  │ Suits: 12/200        │      │
│ │ Status: Loading      │  │ Status: Planning     │      │
│ │ [View Manifest]      │  │ [Add Suits]          │      │
│ └──────────────────────┘  └──────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

### 10.3 Driver Mobile App (UAE)

**Route View:**
```
┌─────────────────────────┐
│ ← Today's Route    🗺️   │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │                     │ │
│ │   [MAP VIEW]        │ │
│ │   with route pins   │ │
│ │                     │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ 8 Deliveries │ ~4.5 hrs │
├─────────────────────────┤
│ Next Stop:              │
│ ┌─────────────────────┐ │
│ │ 📍 Dubai Marina     │ │
│ │ Tower 3, Apt 1204   │ │
│ │ Ahmed Al-Rashid     │ │
│ │ Window: 14:00-15:00 │ │
│ │ [Navigate] [Call]   │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ ↓ Upcoming (7 more)     │
│ • JBR Beach Residence   │
│ • Palm Jumeirah Villa   │
│ • Downtown Burj Area    │
└─────────────────────────┘
```

---

## 11. Implementation

### 11.1 Tech Stack

```
Frontend Framework: Next.js 14+ (App Router)
UI Library: Custom MD3 components (no external lib)
Styling: Tailwind CSS + CSS Variables
Icons: Material Symbols (variable font)
Fonts: Google Sans, Noto Sans Devanagari
State: React Context + TanStack Query
Forms: React Hook Form + Zod
```

### 11.2 CSS Variables Setup

```css
/* theme.css */
:root {
  /* Primary */
  --md-sys-color-primary: #1A237E;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #C5CAE9;
  --md-sys-color-on-primary-container: #1A237E;
  
  /* Secondary */
  --md-sys-color-secondary: #FF8F00;
  --md-sys-color-on-secondary: #FFFFFF;
  --md-sys-color-secondary-container: #FFE082;
  --md-sys-color-on-secondary-container: #E65100;
  
  /* Surface */
  --md-sys-color-surface: #FFFFFF;
  --md-sys-color-on-surface: #212121;
  --md-sys-color-surface-variant: #F5F5F5;
  --md-sys-color-outline: #E0E0E0;
  
  /* Elevation */
  --md-sys-elevation-1: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15);
  --md-sys-elevation-2: 0 1px 2px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.15);
  --md-sys-elevation-3: 0 4px 8px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15);
  
  /* Shape */
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-full: 9999px;
}

/* Dark theme */
[data-theme="dark"] {
  --md-sys-color-surface: #1E1E1E;
  --md-sys-color-on-surface: #E0E0E0;
  /* ... */
}
```

### 11.3 Component Structure

```
src/
├── components/
│   ├── md3/                    # Base MD3 components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   ├── Card/
│   │   ├── TextField/
│   │   ├── Chip/
│   │   ├── Dialog/
│   │   ├── Navigation/
│   │   └── ...
│   ├── holbaza/                # Holbaza-specific components
│   │   ├── SuitCard/
│   │   ├── RiskBadge/
│   │   ├── StateChip/
│   │   ├── TailorAvatar/
│   │   └── ...
│   └── layout/                 # Layout components
│       ├── TailorAppShell/
│       ├── DashboardShell/
│       └── DriverAppShell/
├── styles/
│   ├── theme.css               # CSS variables
│   ├── typography.css          # Type scale
│   └── globals.css             # Global styles
└── lib/
    └── design-tokens.ts        # TypeScript tokens
```

---

## 12. Quality Checklist

### Before Shipping Any UI:

- [ ] Colors meet contrast requirements (4.5:1)
- [ ] Touch targets are 48dp minimum
- [ ] Loading states exist for all async actions
- [ ] Error states are clear and actionable
- [ ] Empty states guide users to next action
- [ ] Animations are 300ms or less
- [ ] Works on 320px width minimum
- [ ] Hindi/Punjabi text renders correctly
- [ ] Icons have aria-labels
- [ ] Keyboard navigation works
- [ ] Dark mode supported (if applicable)

---

## Appendix: Brand Assets

### Logo Usage
```
Primary Logo: "Holbaza" wordmark in Indigo
Icon Only: Stylized "H" for app icons
Minimum Size: 24px height for icon, 80px for wordmark
Clear Space: Height of "H" on all sides
```

### Favicon Specs
```
favicon.ico: 16x16, 32x32
apple-touch-icon: 180x180
android-chrome: 192x192, 512x512
```

---

*End of Holbaza Design System v1.0*
