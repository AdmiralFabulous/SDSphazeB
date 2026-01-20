/**
 * Voice Event Demo Component
 * VOICE-E01-S04-T03: Handle Function Calls
 *
 * Example integration showing all voice event features
 */

import React from 'react';
import { VoiceProvider } from '../../contexts/VoiceContext';
import { SpeedWarningDisplay } from './SpeedWarningDisplay';
import { PhaseTransitionIndicator } from './PhaseTransitionIndicator';
import { ScanProgressIndicator } from './ScanProgressIndicator';

/**
 * Complete voice-enabled scan interface
 *
 * @example
 * ```tsx
 * import { VoiceEventDemo } from './components/voice/VoiceEventDemo';
 *
 * function App() {
 *   return <VoiceEventDemo />;
 * }
 * ```
 */
export function VoiceEventDemo() {
  return (
    <VoiceProvider>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            3D Body Scan
          </h1>
          <p style={{ color: '#6c757d' }}>
            Voice-guided measurement capture
          </p>
        </header>

        {/* Phase Indicator */}
        <div style={{ marginBottom: '24px' }}>
          <PhaseTransitionIndicator />
        </div>

        {/* Progress Indicator */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            Scan Progress
          </h2>
          <ScanProgressIndicator showDetails />
        </div>

        {/* Speed Warning (overlays when active) */}
        <SpeedWarningDisplay />

        {/* Instructions */}
        <div
          style={{
            marginTop: '32px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            Instructions
          </h3>
          <ul style={{ fontSize: '13px', color: '#495057', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              Stand in position and begin rotating slowly
            </li>
            <li style={{ marginBottom: '8px' }}>
              Keep rotation speed below 30°/s for best results
            </li>
            <li style={{ marginBottom: '8px' }}>
              Hold steady when the system starts locking measurements
            </li>
            <li>
              Wait for confirmation when measurements are locked
            </li>
          </ul>
        </div>
      </div>
    </VoiceProvider>
  );
}
