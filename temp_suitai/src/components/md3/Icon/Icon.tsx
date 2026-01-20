'use client';

import { CSSProperties, forwardRef } from 'react';

/**
 * Material Symbols Icon Component
 * Supports variable font settings: FILL, wght, GRAD, opsz
 */

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconVariant = 'outlined' | 'filled';

export interface IconProps {
  /** Material Symbols icon name (e.g., 'home', 'settings') */
  name: IconName;
  /** Icon size preset */
  size?: IconSize;
  /** Custom size in pixels (overrides size preset) */
  customSize?: number;
  /** Icon variant */
  variant?: IconVariant;
  /** Font weight (100-700) */
  weight?: number;
  /** Grade (-25 to 200) */
  grade?: number;
  /** Additional CSS class */
  className?: string;
  /** Color (CSS color value) */
  color?: string;
  /** Accessible label */
  'aria-label'?: string;
  /** Hide from screen readers */
  'aria-hidden'?: boolean;
  /** Click handler */
  onClick?: () => void;
}

// Size presets (optical size)
const sizeMap: Record<IconSize, number> = {
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

export const Icon = forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      name,
      size = 'md',
      customSize,
      variant = 'outlined',
      weight = 400,
      grade = 0,
      className = '',
      color,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = !ariaLabel,
      onClick,
    },
    ref
  ) => {
    const opticalSize = customSize || sizeMap[size];
    const fill = variant === 'filled' ? 1 : 0;

    const style: CSSProperties = {
      fontFamily: '"Material Symbols Rounded"',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontSize: `${opticalSize}px`,
      lineHeight: 1,
      letterSpacing: 'normal',
      textTransform: 'none',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      wordWrap: 'normal',
      direction: 'ltr',
      fontFeatureSettings: '"liga"',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility',
      fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
      color: color || 'inherit',
      cursor: onClick ? 'pointer' : 'inherit',
      userSelect: 'none',
    };

    return (
      <span
        ref={ref}
        className={`material-symbols-rounded ${className}`.trim()}
        style={style}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        role={ariaLabel ? 'img' : undefined}
        onClick={onClick}
      >
        {name}
      </span>
    );
  }
);

Icon.displayName = 'Icon';

// ============================================
// COMMON ICON NAMES
// ============================================

/** Common icon names for TypeScript autocomplete */
export const ICONS = {
  // Navigation
  home: 'home',
  menu: 'menu',
  close: 'close',
  arrowBack: 'arrow_back',
  arrowForward: 'arrow_forward',
  expandMore: 'expand_more',
  expandLess: 'expand_less',
  chevronLeft: 'chevron_left',
  chevronRight: 'chevron_right',
  moreVert: 'more_vert',
  moreHoriz: 'more_horiz',

  // Actions
  add: 'add',
  remove: 'remove',
  edit: 'edit',
  delete: 'delete',
  save: 'save',
  refresh: 'refresh',
  search: 'search',
  filter: 'filter_list',
  sort: 'sort',
  share: 'share',
  download: 'download',
  upload: 'upload',
  print: 'print',
  copy: 'content_copy',

  // Status
  check: 'check',
  checkCircle: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
  help: 'help',
  pending: 'pending',
  schedule: 'schedule',

  // Communication
  call: 'call',
  email: 'email',
  message: 'message',
  notification: 'notifications',
  notificationActive: 'notifications_active',

  // Content
  person: 'person',
  group: 'group',
  settings: 'settings',
  account: 'account_circle',
  visibility: 'visibility',
  visibilityOff: 'visibility_off',
  lock: 'lock',
  unlock: 'lock_open',

  // SUIT AI Specific
  suit: 'checkroom',
  fabric: 'texture',
  scissors: 'content_cut',
  ruler: 'straighten',
  qcCheck: 'verified',
  qcFail: 'gpp_bad',

  // Logistics
  flight: 'flight',
  flightLand: 'flight_land',
  flightTakeoff: 'flight_takeoff',
  localShipping: 'local_shipping',
  deliveryDining: 'delivery_dining',
  locationOn: 'location_on',
  map: 'map',
  route: 'route',
  navigation: 'navigation',

  // Status/Progress
  hourglass: 'hourglass_empty',
  hourglassFull: 'hourglass_full',
  timelapse: 'timelapse',
  timer: 'timer',

  // Risk/Priority
  priorityHigh: 'priority_high',
  flagged: 'flag',
  star: 'star',
  starOutline: 'star_outline',

  // Money
  payments: 'payments',
  currency: 'currency_rupee',
  receipt: 'receipt',

  // Misc
  dashboard: 'dashboard',
  analytics: 'analytics',
  inventory: 'inventory_2',
  category: 'category',
  label: 'label',
  bookmark: 'bookmark',
  attachment: 'attachment',
  link: 'link',
  image: 'image',
  camera: 'photo_camera',
} as const;

/** Type for icon names */
export type IconName = (typeof ICONS)[keyof typeof ICONS] | string;

// ============================================
// PRESET ICON COMPONENTS
// ============================================

/** Loading spinner icon */
export const LoadingIcon = ({ size = 'md', className = '' }: { size?: IconSize; className?: string }) => (
  <Icon
    name="progress_activity"
    size={size}
    className={`animate-spin ${className}`}
    aria-label="Loading"
  />
);

/** Success icon */
export const SuccessIcon = ({ size = 'md', className = '' }: { size?: IconSize; className?: string }) => (
  <Icon
    name={ICONS.checkCircle}
    size={size}
    variant="filled"
    color="var(--holbaza-risk-green)"
    className={className}
    aria-label="Success"
  />
);

/** Error icon */
export const ErrorIcon = ({ size = 'md', className = '' }: { size?: IconSize; className?: string }) => (
  <Icon
    name={ICONS.error}
    size={size}
    variant="filled"
    color="var(--md-sys-color-error)"
    className={className}
    aria-label="Error"
  />
);

/** Warning icon */
export const WarningIcon = ({ size = 'md', className = '' }: { size?: IconSize; className?: string }) => (
  <Icon
    name={ICONS.warning}
    size={size}
    variant="filled"
    color="var(--holbaza-risk-amber)"
    className={className}
    aria-label="Warning"
  />
);

/** Info icon */
export const InfoIcon = ({ size = 'md', className = '' }: { size?: IconSize; className?: string }) => (
  <Icon
    name={ICONS.info}
    size={size}
    variant="filled"
    color="var(--md-sys-color-primary)"
    className={className}
    aria-label="Information"
  />
);

export default Icon;
