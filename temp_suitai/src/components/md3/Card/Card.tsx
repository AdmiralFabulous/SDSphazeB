'use client';

import { forwardRef, HTMLAttributes, ReactNode, createContext, useContext } from 'react';
import styles from './Card.module.css';

export type CardVariant = 'filled' | 'outlined' | 'elevated';

// ============================================
// CARD CONTEXT
// ============================================

interface CardContextValue {
  variant: CardVariant;
  clickable: boolean;
}

const CardContext = createContext<CardContextValue>({
  variant: 'filled',
  clickable: false,
});

// ============================================
// CARD (Main Component)
// ============================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: CardVariant;
  /** Children */
  children?: ReactNode;
  /** Makes the card clickable with hover effects */
  clickable?: boolean;
  /** Click handler (sets clickable to true automatically) */
  onClick?: () => void;
  /** Selected state */
  selected?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'filled',
      children,
      clickable: clickableProp,
      onClick,
      selected = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const clickable = clickableProp ?? !!onClick;

    const classNames = [
      styles.card,
      styles[variant],
      clickable && styles.clickable,
      selected && styles.selected,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <CardContext.Provider value={{ variant, clickable }}>
        <div
          ref={ref}
          className={classNames}
          onClick={onClick}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          onKeyDown={
            clickable
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                  }
                }
              : undefined
          }
          {...props}
        >
          {clickable && <span className={styles.stateLayer} />}
          {children}
        </div>
      </CardContext.Provider>
    );
  }
);

Card.displayName = 'Card';

// ============================================
// CARD HEADER
// ============================================

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Avatar element (image or icon) */
  avatar?: ReactNode;
  /** Title text */
  title?: ReactNode;
  /** Subtitle text */
  subtitle?: ReactNode;
  /** Action element (button, menu, etc.) */
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ avatar, title, subtitle, action, className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${styles.header} ${className}`} {...props}>
        {avatar && <div className={styles.avatar}>{avatar}</div>}
        <div className={styles.headerContent}>
          {title && <div className={styles.title}>{title}</div>}
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          {children}
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ============================================
// CARD CONTENT
// ============================================

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Content padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ padding = 'md', className = '', children, ...props }, ref) => {
    const classNames = [styles.content, styles[`padding-${padding}`], className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// ============================================
// CARD MEDIA
// ============================================

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  image?: string;
  /** Alt text for image */
  alt?: string;
  /** Aspect ratio */
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
  /** Position at top (no border radius at bottom) */
  position?: 'top' | 'middle' | 'bottom';
}

export const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(
  (
    { image, alt = '', aspectRatio = '16/9', position = 'top', className = '', children, ...props },
    ref
  ) => {
    const classNames = [styles.media, styles[`media-${position}`], className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={classNames}
        style={{
          aspectRatio: aspectRatio === 'auto' ? undefined : aspectRatio,
          backgroundImage: image ? `url(${image})` : undefined,
        }}
        role={image ? 'img' : undefined}
        aria-label={image ? alt : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardMedia.displayName = 'CardMedia';

// ============================================
// CARD ACTIONS
// ============================================

export interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** Alignment of actions */
  align?: 'start' | 'center' | 'end' | 'space-between';
}

export const CardActions = forwardRef<HTMLDivElement, CardActionsProps>(
  ({ align = 'end', className = '', children, ...props }, ref) => {
    const classNames = [styles.actions, styles[`align-${align}`], className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  }
);

CardActions.displayName = 'CardActions';

// ============================================
// CARD DIVIDER
// ============================================

export const CardDivider = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(
  ({ className = '', ...props }, ref) => {
    return <hr ref={ref} className={`${styles.divider} ${className}`} {...props} />;
  }
);

CardDivider.displayName = 'CardDivider';

export default Card;
