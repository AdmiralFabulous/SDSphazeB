/**
 * Design Tokens - Holbaza Design System
 * TypeScript definitions for MD3 theme tokens
 * SUIT AI v4.b Phase B
 */

// ============================================
// COLOR TOKENS
// ============================================

export const colors = {
  // Primary (Deep Indigo)
  primary: {
    main: '#1A237E',
    onPrimary: '#FFFFFF',
    container: '#DEE0FF',
    onContainer: '#000F5C',
  },

  // Secondary (Warm Amber)
  secondary: {
    main: '#FF8F00',
    onSecondary: '#FFFFFF',
    container: '#FFDDB3',
    onContainer: '#2A1800',
  },

  // Tertiary (Teal)
  tertiary: {
    main: '#00695C',
    onTertiary: '#FFFFFF',
    container: '#A7F3EB',
    onContainer: '#00201C',
  },

  // Error
  error: {
    main: '#BA1A1A',
    onError: '#FFFFFF',
    container: '#FFDAD6',
    onContainer: '#410002',
  },

  // Surface (Light)
  surface: {
    main: '#FFFBFF',
    onSurface: '#1C1B1F',
    variant: '#E7E0EC',
    onVariant: '#49454F',
    containerLowest: '#FFFFFF',
    containerLow: '#F7F2FA',
    container: '#F3EDF7',
    containerHigh: '#ECE6F0',
    containerHighest: '#E6E1E5',
  },

  // Outline
  outline: {
    main: '#79747E',
    variant: '#CAC4D0',
  },

  // Inverse
  inverse: {
    surface: '#313033',
    onSurface: '#F4EFF4',
    primary: '#B9C3FF',
  },
} as const;

// Risk colors (Holbaza-specific)
export const riskColors = {
  green: {
    main: '#4CAF50',
    light: '#C8E6C9',
    dark: '#2E7D32',
  },
  amber: {
    main: '#FF9800',
    light: '#FFE0B2',
    dark: '#F57C00',
  },
  red: {
    main: '#F44336',
    light: '#FFCDD2',
    dark: '#D32F2F',
  },
  critical: {
    main: '#B71C1C',
    light: '#FFEBEE',
    dark: '#7F0000',
  },
} as const;

// Track colors
export const trackColors = {
  A: '#1565C0', // UK - Blue
  B: '#C62828', // UAE - Red
} as const;

// State colors (S01-S26)
export const stateColors = {
  // Manufacturing states (S01-S19)
  pending: '#9E9E9E',
  cutting: '#7E57C2',
  stitching: '#5C6BC0',
  qc: '#42A5F5',
  ready: '#26A69A',
  shipped: '#66BB6A',
  delivered: '#4CAF50',
  complete: '#2E7D32',

  // Logistics states (S20-S26)
  flightManifest: '#FF7043',
  inFlight: '#EF5350',
  landed: '#EC407A',
  customs: '#AB47BC',
  vanAssigned: '#7E57C2',
  outForDelivery: '#5C6BC0',
  deliveredUAE: '#26A69A',
} as const;

// ============================================
// ELEVATION TOKENS
// ============================================

export const elevation = {
  level0: '0px',
  level1: '1px',
  level2: '3px',
  level3: '6px',
  level4: '8px',
  level5: '12px',
} as const;

export const shadows = {
  level1: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  level2: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
  level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
  level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
} as const;

// ============================================
// SHAPE TOKENS
// ============================================

export const shape = {
  none: '0px',
  extraSmall: '4px',
  small: '8px',
  medium: '12px',
  large: '16px',
  extraLarge: '28px',
  full: '9999px',
} as const;

// ============================================
// MOTION TOKENS
// ============================================

export const duration = {
  short1: '50ms',
  short2: '100ms',
  short3: '150ms',
  short4: '200ms',
  medium1: '250ms',
  medium2: '300ms',
  medium3: '350ms',
  medium4: '400ms',
  long1: '450ms',
  long2: '500ms',
  long3: '550ms',
  long4: '600ms',
} as const;

export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
} as const;

// ============================================
// TYPOGRAPHY TOKENS
// ============================================

export const fontFamily = {
  brand: "'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  plain: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  hindi: "'Noto Sans Devanagari', 'Roboto', sans-serif",
  punjabi: "'Noto Sans Gurmukhi', 'Roboto', sans-serif",
  mono: "'Roboto Mono', 'SF Mono', 'Monaco', 'Consolas', monospace",
} as const;

export const typeScale = {
  displayLarge: {
    fontFamily: fontFamily.brand,
    fontWeight: 400,
    fontSize: '57px',
    lineHeight: '64px',
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontFamily: fontFamily.brand,
    fontWeight: 400,
    fontSize: '45px',
    lineHeight: '52px',
    letterSpacing: '0px',
  },
  displaySmall: {
    fontFamily: fontFamily.brand,
    fontWeight: 400,
    fontSize: '36px',
    lineHeight: '44px',
    letterSpacing: '0px',
  },
  headlineLarge: {
    fontFamily: fontFamily.brand,
    fontWeight: 400,
    fontSize: '32px',
    lineHeight: '40px',
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontFamily: fontFamily.brand,
    fontWeight: 400,
    fontSize: '28px',
    lineHeight: '36px',
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontFamily: fontFamily.brand,
    fontWeight: 400,
    fontSize: '24px',
    lineHeight: '32px',
    letterSpacing: '0px',
  },
  titleLarge: {
    fontFamily: fontFamily.brand,
    fontWeight: 400,
    fontSize: '22px',
    lineHeight: '28px',
    letterSpacing: '0px',
  },
  titleMedium: {
    fontFamily: fontFamily.plain,
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontFamily: fontFamily.plain,
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.1px',
  },
  bodyLarge: {
    fontFamily: fontFamily.plain,
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontFamily: fontFamily.plain,
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontFamily: fontFamily.plain,
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.4px',
  },
  labelLarge: {
    fontFamily: fontFamily.plain,
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontFamily: fontFamily.plain,
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontFamily: fontFamily.plain,
    fontWeight: 500,
    fontSize: '11px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
} as const;

// ============================================
// Z-INDEX TOKENS
// ============================================

export const zIndex = {
  drawer: 100,
  appbar: 200,
  modal: 300,
  snackbar: 400,
  tooltip: 500,
} as const;

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  mobile: 0,
  tablet: 600,
  desktop: 905,
  large: 1240,
  xlarge: 1440,
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get risk color based on score (0-1)
 */
export function getRiskColor(score: number): keyof typeof riskColors {
  if (score < 0.3) return 'green';
  if (score < 0.6) return 'amber';
  if (score < 0.8) return 'red';
  return 'critical';
}

/**
 * Get risk CSS class based on score
 */
export function getRiskClass(score: number): string {
  const level = getRiskColor(score);
  return `risk-${level}`;
}

/**
 * Get track color
 */
export function getTrackColor(track: 'A' | 'B'): string {
  return trackColors[track];
}

// ============================================
// TAILWIND CONFIG EXTENSION
// ============================================

/**
 * Tailwind CSS config extension for MD3 tokens
 * Use in tailwind.config.js: theme.extend = tailwindExtend
 */
export const tailwindExtend = {
  colors: {
    primary: colors.primary.main,
    'on-primary': colors.primary.onPrimary,
    'primary-container': colors.primary.container,
    'on-primary-container': colors.primary.onContainer,

    secondary: colors.secondary.main,
    'on-secondary': colors.secondary.onSecondary,
    'secondary-container': colors.secondary.container,
    'on-secondary-container': colors.secondary.onContainer,

    tertiary: colors.tertiary.main,
    'on-tertiary': colors.tertiary.onTertiary,
    'tertiary-container': colors.tertiary.container,
    'on-tertiary-container': colors.tertiary.onContainer,

    error: colors.error.main,
    'on-error': colors.error.onError,
    'error-container': colors.error.container,
    'on-error-container': colors.error.onContainer,

    surface: colors.surface.main,
    'on-surface': colors.surface.onSurface,
    'surface-variant': colors.surface.variant,
    'on-surface-variant': colors.surface.onVariant,

    outline: colors.outline.main,
    'outline-variant': colors.outline.variant,

    // Risk colors
    'risk-green': riskColors.green.main,
    'risk-amber': riskColors.amber.main,
    'risk-red': riskColors.red.main,
    'risk-critical': riskColors.critical.main,

    // Track colors
    'track-a': trackColors.A,
    'track-b': trackColors.B,
  },
  borderRadius: {
    none: shape.none,
    xs: shape.extraSmall,
    sm: shape.small,
    md: shape.medium,
    lg: shape.large,
    xl: shape.extraLarge,
    full: shape.full,
  },
  boxShadow: {
    'elevation-1': shadows.level1,
    'elevation-2': shadows.level2,
    'elevation-3': shadows.level3,
    'elevation-4': shadows.level4,
    'elevation-5': shadows.level5,
  },
  fontFamily: {
    brand: [fontFamily.brand],
    plain: [fontFamily.plain],
    hindi: [fontFamily.hindi],
    punjabi: [fontFamily.punjabi],
    mono: [fontFamily.mono],
  },
  transitionDuration: {
    'short-1': duration.short1,
    'short-2': duration.short2,
    'short-3': duration.short3,
    'short-4': duration.short4,
    'medium-1': duration.medium1,
    'medium-2': duration.medium2,
    'medium-3': duration.medium3,
    'medium-4': duration.medium4,
  },
  zIndex: {
    drawer: String(zIndex.drawer),
    appbar: String(zIndex.appbar),
    modal: String(zIndex.modal),
    snackbar: String(zIndex.snackbar),
    tooltip: String(zIndex.tooltip),
  },
  screens: {
    tablet: `${breakpoints.tablet}px`,
    desktop: `${breakpoints.desktop}px`,
    large: `${breakpoints.large}px`,
    xlarge: `${breakpoints.xlarge}px`,
  },
} as const;

// ============================================
// TYPES
// ============================================

export type RiskLevel = keyof typeof riskColors;
export type Track = 'A' | 'B';
export type ElevationLevel = keyof typeof elevation;
export type ShapeSize = keyof typeof shape;
export type TypeScaleKey = keyof typeof typeScale;
export type SpacingKey = keyof typeof spacing;
export type BreakpointKey = keyof typeof breakpoints;
