/**
 * Phase Transition Indicator Component
 * VOICE-E01-S04-T03: Handle Function Calls
 *
 * Visual feedback for scan phase changes
 */

import React, { useState, useEffect } from 'react';
import { useVoiceEvents } from '../../hooks/useVoiceEvents';
import type { ScanPhase } from '../../types/voice';

export interface PhaseTransitionIndicatorProps {
  className?: string;
  displayDuration?: number;
}

const PHASE_LABELS: Record<ScanPhase, string> = {
  idle: 'Ready',
  positioning: 'Positioning',
  scanning: 'Scanning',
  locking: 'Locking Measurements',
  locked: 'Measurements Locked',
  complete: 'Complete',
};

const PHASE_COLORS: Record<ScanPhase, string> = {
  idle: '#6c757d',
  positioning: '#ffc107',
  scanning: '#17a2b8',
  locking: '#fd7e14',
  locked: '#28a745',
  complete: '#20c997',
};

export function PhaseTransitionIndicator({
  className = '',
  displayDuration = 3000,
}: PhaseTransitionIndicatorProps) {
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<ScanPhase>('idle');

  useVoiceEvents({
    onPhaseTransition: (event) => {
      const { fromPhase, toPhase, reason } = event.data;
      setCurrentPhase(toPhase);

      const message = reason
        ? `${PHASE_LABELS[toPhase]}: ${reason}`
        : `Entering ${PHASE_LABELS[toPhase]} phase`;

      setTransitionMessage(message);

      const timer = setTimeout(() => {
        setTransitionMessage(null);
      }, displayDuration);

      return () => clearTimeout(timer);
    },
  });

  return (
    <div className={`phase-transition-indicator ${className}`}>
      {/* Current Phase Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: PHASE_COLORS[currentPhase],
          color: '#ffffff',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            marginRight: '8px',
            animation: currentPhase === 'scanning' ? 'pulse 1.5s infinite' : 'none',
          }}
          aria-hidden="true"
        />
        {PHASE_LABELS[currentPhase]}
      </div>

      {/* Transition Message Toast */}
      {transitionMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            backgroundColor: '#ffffff',
            color: '#333333',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out',
            border: `2px solid ${PHASE_COLORS[currentPhase]}`,
          }}
        >
          {transitionMessage}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
