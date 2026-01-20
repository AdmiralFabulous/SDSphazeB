/**
 * Scan Progress Indicator Component
 * VOICE-E01-S04-T03: Handle Function Calls
 *
 * Synchronized progress visualization for measurement locking
 */

import React from 'react';
import { useScanProgress } from '../../hooks/useVoiceEvents';

export interface ScanProgressIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function ScanProgressIndicator({
  className = '',
  showDetails = true,
}: ScanProgressIndicatorProps) {
  const {
    phase,
    progress,
    stabilityScore,
    stableFrameCount,
    isLocked,
  } = useScanProgress();

  const progressPercent = Math.round(progress * 100);
  const stabilityPercent = Math.round(stabilityScore * 100);

  return (
    <div className={`scan-progress-indicator ${className}`}>
      {/* Main Progress Bar */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#e9ecef',
          borderRadius: '8px',
          overflow: 'hidden',
          height: '32px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: isLocked ? '#28a745' : '#17a2b8',
            transition: 'width 0.3s ease-out, background-color 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '12px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {progressPercent > 10 && `${progressPercent}%`}
        </div>
        {progressPercent <= 10 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '12px',
              transform: 'translateY(-50%)',
              fontSize: '14px',
              fontWeight: '600',
              color: '#6c757d',
            }}
          >
            {progressPercent}%
          </div>
        )}
      </div>

      {/* Details Section */}
      {showDetails && (phase === 'locking' || phase === 'locked') && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#495057',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Stability Score:</span>
            <span style={{ fontWeight: '600' }}>
              {stabilityPercent}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Stable Frames:</span>
            <span style={{ fontWeight: '600' }}>
              {stableFrameCount} / 300
            </span>
          </div>
          {isLocked && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              ✓ Measurements Locked
            </div>
          )}
        </div>
      )}

      {/* Stability Progress Bar for Locking Phase */}
      {phase === 'locking' && !isLocked && (
        <div style={{ marginTop: '12px' }}>
          <div
            style={{
              fontSize: '12px',
              color: '#6c757d',
              marginBottom: '4px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Stabilizing</span>
            <span>{stableFrameCount} / 300 frames</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(stableFrameCount / 300) * 100}%`,
                height: '100%',
                backgroundColor: '#fd7e14',
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
