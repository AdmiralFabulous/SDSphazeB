/**
 * Speed Warning Display Component
 * VOICE-E01-S04-T03: Handle Function Calls
 *
 * Visual feedback for rotation speed warnings
 */

import React, { useState, useEffect } from 'react';
import { useSpeedWarning } from '../../hooks/useVoiceEvents';

export interface SpeedWarningDisplayProps {
  className?: string;
  autoHideDuration?: number;
}

export function SpeedWarningDisplay({
  className = '',
  autoHideDuration = 5000,
}: SpeedWarningDisplayProps) {
  const { shouldWarn, currentSpeed, threshold, message } = useSpeedWarning();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldWarn) {
      setVisible(true);

      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    }
  }, [shouldWarn, autoHideDuration]);

  if (!visible || !shouldWarn) {
    return null;
  }

  return (
    <div
      className={`speed-warning ${className}`}
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        backgroundColor: '#ff6b6b',
        color: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            fontSize: '24px',
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          ⚠️
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Speed Warning
          </div>
          <div style={{ fontSize: '14px', opacity: 0.95 }}>
            {message || `Current speed: ${currentSpeed.toFixed(1)}°/s (limit: ${threshold}°/s)`}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
