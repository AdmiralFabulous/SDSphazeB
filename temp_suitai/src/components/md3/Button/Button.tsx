'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode, useRef, useCallback } from 'react';
import { Icon, IconName, LoadingIcon } from '../Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button text content */
  children?: ReactNode;
  /** Leading icon name */
  icon?: IconName;
  /** Trailing icon (icon on right side) */
  trailingIcon?: IconName;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Danger/destructive action styling */
  danger?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'filled',
      size = 'md',
      children,
      icon,
      trailingIcon,
      loading = false,
      fullWidth = false,
      danger = false,
      disabled,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const rippleRef = useRef<HTMLSpanElement>(null);

    // Ripple effect handler
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;

        // Create ripple effect
        const button = e.currentTarget;
        const ripple = rippleRef.current;
        if (ripple) {
          const rect = button.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          ripple.classList.remove(styles.rippleAnimate);
          // Trigger reflow
          void ripple.offsetWidth;
          ripple.classList.add(styles.rippleAnimate);
        }

        onClick?.(e);
      },
      [disabled, loading, onClick]
    );

    const iconSize = size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm';

    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      danger && styles.danger,
      loading && styles.loading,
      disabled && styles.disabled,
      icon && !children && styles.iconOnly,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        <span className={styles.stateLayer} />
        <span ref={rippleRef} className={styles.ripple} />

        <span className={styles.content}>
          {loading ? (
            <LoadingIcon size={iconSize} className={styles.icon} />
          ) : icon ? (
            <Icon name={icon} size={iconSize} className={styles.icon} />
          ) : null}

          {children && <span className={styles.label}>{children}</span>}

          {trailingIcon && !loading && (
            <Icon name={trailingIcon} size={iconSize} className={styles.trailingIcon} />
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
