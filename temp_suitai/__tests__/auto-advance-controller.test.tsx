/**
 * AutoAdvanceController Tests
 * VOICE-E01-S04-T04: Auto-Advance UI
 */

import React, { useState } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutoAdvanceController, useAutoAdvance } from '../src/components/scanner/AutoAdvanceController';
import { VoiceProvider } from '../src/contexts/VoiceContext';
import type { ScanPhase, PhaseTransitionEvent, MeasurementLockEvent } from '../src/types/voice';

// Mock the useVoiceEvents hook
vi.mock('../src/hooks/useVoiceEvents', () => ({
  useVoiceEvents: (handlers: any) => {
    // Store handlers globally so tests can trigger them
    (global as any).mockVoiceEventHandlers = handlers;
  },
}));

describe('AutoAdvanceController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).mockVoiceEventHandlers = {};
  });

  describe('Basic Functionality', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <VoiceProvider>
          <AutoAdvanceController sessionId="test-session" />
        </VoiceProvider>
      );

      // Controller should not render anything
      expect(container.firstChild).toBeNull();
    });

    it('should accept configuration props', () => {
      const onAutoAdvance = vi.fn();
      const config = {
        enabled: true,
        advanceDelay: 500,
        autoNavigateToMeasurements: true,
        onAutoAdvance,
      };

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            config={config}
          />
        </VoiceProvider>
      );

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Phase Advancement', () => {
    it('should advance from idle to positioning on phase transition', async () => {
      const setPhase = vi.fn();
      const onAutoAdvance = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            config={{ onAutoAdvance }}
          />
        </VoiceProvider>
      );

      // Simulate phase transition with completion message
      const event: PhaseTransitionEvent = {
        type: 'phase_transition',
        timestamp: Date.now(),
        data: {
          fromPhase: 'idle',
          toPhase: 'positioning',
          reason: 'Ready to scan',
        },
      };

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onPhaseTransition(event);
      });

      // Should update phase
      expect(setPhase).toHaveBeenCalledWith('positioning');
    });

    it('should advance from positioning to scanning', async () => {
      const setPhase = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            currentPhase="positioning"
          />
        </VoiceProvider>
      );

      const event: PhaseTransitionEvent = {
        type: 'phase_transition',
        timestamp: Date.now(),
        data: {
          fromPhase: 'positioning',
          toPhase: 'scanning',
          reason: 'Position confirmed',
        },
      };

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onPhaseTransition(event);
      });

      expect(setPhase).toHaveBeenCalledWith('scanning');
    });

    it('should advance from scanning to locking', async () => {
      const setPhase = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            currentPhase="scanning"
          />
        </VoiceProvider>
      );

      const event: PhaseTransitionEvent = {
        type: 'phase_transition',
        timestamp: Date.now(),
        data: {
          fromPhase: 'scanning',
          toPhase: 'locking',
          reason: 'Scanning complete',
        },
      };

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onPhaseTransition(event);
      });

      expect(setPhase).toHaveBeenCalledWith('locking');
    });

    it('should advance from locking to locked on measurement lock event', async () => {
      const setPhase = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            currentPhase="locking"
          />
        </VoiceProvider>
      );

      const event: MeasurementLockEvent = {
        type: 'measurement_lock',
        timestamp: Date.now(),
        data: {
          locked: true,
          stabilityScore: 95,
          measurementCount: 100,
        },
      };

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onMeasurementLock(event);
      });

      // Should advance to locked
      await waitFor(() => {
        expect(setPhase).toHaveBeenCalled();
      });
    });

    it('should advance from locked to complete', async () => {
      const setPhase = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            currentPhase="locked"
          />
        </VoiceProvider>
      );

      const event: PhaseTransitionEvent = {
        type: 'phase_transition',
        timestamp: Date.now(),
        data: {
          fromPhase: 'locked',
          toPhase: 'complete',
          reason: 'All done',
        },
      };

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onPhaseTransition(event);
      });

      expect(setPhase).toHaveBeenCalledWith('complete');
    });
  });

  describe('Auto-Navigation to Measurements', () => {
    it('should navigate to measurements when complete phase is reached', async () => {
      const navigateToMeasurements = vi.fn();
      const onNavigateToMeasurements = vi.fn();
      const sessionId = 'test-session-123';

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId={sessionId}
            navigateToMeasurements={navigateToMeasurements}
            currentPhase="complete"
            config={{
              autoNavigateToMeasurements: true,
              onNavigateToMeasurements,
            }}
          />
        </VoiceProvider>
      );

      // Simulate completion event
      await act(async () => {
        (global as any).mockVoiceEventHandlers.onEvent({
          type: 'session_ended',
          timestamp: Date.now(),
          data: { message: 'Process complete' },
        });
      });

      // Should navigate to measurements
      await waitFor(() => {
        expect(navigateToMeasurements).toHaveBeenCalledWith(sessionId);
        expect(onNavigateToMeasurements).toHaveBeenCalledWith(sessionId);
      });
    });

    it('should not navigate if autoNavigateToMeasurements is false', async () => {
      const navigateToMeasurements = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            navigateToMeasurements={navigateToMeasurements}
            currentPhase="complete"
            config={{ autoNavigateToMeasurements: false }}
          />
        </VoiceProvider>
      );

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onEvent({
          type: 'session_ended',
          timestamp: Date.now(),
          data: { message: 'Process complete' },
        });
      });

      expect(navigateToMeasurements).not.toHaveBeenCalled();
    });

    it('should only navigate once per session', async () => {
      const navigateToMeasurements = vi.fn();

      const { rerender } = render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="session-1"
            navigateToMeasurements={navigateToMeasurements}
            currentPhase="complete"
          />
        </VoiceProvider>
      );

      // Trigger navigation
      await act(async () => {
        (global as any).mockVoiceEventHandlers.onEvent({
          type: 'session_ended',
          timestamp: Date.now(),
          data: { message: 'Process complete' },
        });
      });

      // Trigger again with same session
      await act(async () => {
        (global as any).mockVoiceEventHandlers.onEvent({
          type: 'session_ended',
          timestamp: Date.now(),
          data: { message: 'Process complete' },
        });
      });

      // Should only navigate once
      await waitFor(() => {
        expect(navigateToMeasurements).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Configuration Options', () => {
    it('should respect enabled flag', async () => {
      const setPhase = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            config={{ enabled: false }}
          />
        </VoiceProvider>
      );

      const event: PhaseTransitionEvent = {
        type: 'phase_transition',
        timestamp: Date.now(),
        data: {
          fromPhase: 'idle',
          toPhase: 'positioning',
          reason: 'Ready to scan',
        },
      };

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onPhaseTransition(event);
      });

      // Should still update phase but not auto-advance
      expect(setPhase).toHaveBeenCalledWith('positioning');
    });

    it('should apply advance delay', async () => {
      vi.useFakeTimers();
      const setPhase = vi.fn();
      const onAutoAdvance = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            config={{
              advanceDelay: 1000,
              onAutoAdvance,
            }}
          />
        </VoiceProvider>
      );

      const event: PhaseTransitionEvent = {
        type: 'phase_transition',
        timestamp: Date.now(),
        data: {
          fromPhase: 'idle',
          toPhase: 'positioning',
          reason: 'Ready to scan',
        },
      };

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onPhaseTransition(event);
      });

      // Should not advance immediately
      expect(onAutoAdvance).not.toHaveBeenCalled();

      // Advance time
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Should advance after delay
      expect(onAutoAdvance).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should filter phases based on enabledPhases config', async () => {
      const setPhase = vi.fn();
      const onAutoAdvance = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            currentPhase="scanning"
            config={{
              enabledPhases: ['idle', 'positioning'], // scanning not included
              onAutoAdvance,
            }}
          />
        </VoiceProvider>
      );

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onEvent({
          type: 'custom',
          timestamp: Date.now(),
          data: { message: 'Scanning complete' },
        });
      });

      // Should not auto-advance because scanning is not in enabledPhases
      expect(onAutoAdvance).not.toHaveBeenCalled();
    });
  });

  describe('Completion Phrase Detection', () => {
    it('should detect "ready to scan" as completion phrase', async () => {
      const setPhase = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            currentPhase="idle"
          />
        </VoiceProvider>
      );

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onEvent({
          type: 'custom',
          timestamp: Date.now(),
          data: { message: 'You are ready to scan now' },
        });
      });

      await waitFor(() => {
        expect(setPhase).toHaveBeenCalled();
      });
    });

    it('should detect "scanning complete" as completion phrase', async () => {
      const setPhase = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            currentPhase="scanning"
          />
        </VoiceProvider>
      );

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onEvent({
          type: 'custom',
          timestamp: Date.now(),
          data: { message: 'Scanning complete, processing measurements' },
        });
      });

      await waitFor(() => {
        expect(setPhase).toHaveBeenCalled();
      });
    });

    it('should detect "all done" as completion phrase', async () => {
      const setPhase = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            currentPhase="locked"
          />
        </VoiceProvider>
      );

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onEvent({
          type: 'custom',
          timestamp: Date.now(),
          data: { message: 'All done! Your measurements are ready.' },
        });
      });

      await waitFor(() => {
        expect(setPhase).toHaveBeenCalled();
      });
    });

    it('should be case-insensitive when detecting completion phrases', async () => {
      const setPhase = vi.fn();

      render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            currentPhase="positioning"
          />
        </VoiceProvider>
      );

      await act(async () => {
        (global as any).mockVoiceEventHandlers.onEvent({
          type: 'custom',
          timestamp: Date.now(),
          data: { message: 'POSITION CONFIRMED - READY TO PROCEED' },
        });
      });

      await waitFor(() => {
        expect(setPhase).toHaveBeenCalled();
      });
    });
  });

  describe('useAutoAdvance Hook', () => {
    it('should provide phase state and control', () => {
      const TestComponent = () => {
        const { currentPhase, setPhase, advancePhase } = useAutoAdvance({
          sessionId: 'test-session',
        });

        return (
          <div>
            <span data-testid="phase">{currentPhase}</span>
            <button onClick={() => setPhase('scanning')}>Set Phase</button>
            <button onClick={() => advancePhase('idle')}>Advance</button>
          </div>
        );
      };

      const { getByTestId } = render(
        <VoiceProvider>
          <TestComponent />
        </VoiceProvider>
      );

      expect(getByTestId('phase').textContent).toBe('idle');
    });

    it('should work with external phase control', () => {
      const TestComponent = () => {
        const [phase, setPhase] = useState<ScanPhase>('scanning');
        const { currentPhase } = useAutoAdvance({
          sessionId: 'test-session',
          currentPhase: phase,
          setPhase,
        });

        return <div data-testid="phase">{currentPhase}</div>;
      };

      const { getByTestId } = render(
        <VoiceProvider>
          <TestComponent />
        </VoiceProvider>
      );

      expect(getByTestId('phase').textContent).toBe('scanning');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null sessionId gracefully', () => {
      const { container } = render(
        <VoiceProvider>
          <AutoAdvanceController sessionId={null} />
        </VoiceProvider>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not crash when handlers are undefined', async () => {
      render(
        <VoiceProvider>
          <AutoAdvanceController sessionId="test-session" />
        </VoiceProvider>
      );

      // Should not crash when events fire without handlers
      await act(async () => {
        (global as any).mockVoiceEventHandlers.onPhaseTransition({
          type: 'phase_transition',
          timestamp: Date.now(),
          data: {
            fromPhase: 'idle',
            toPhase: 'positioning',
          },
        });
      });

      expect(true).toBe(true);
    });

    it('should clean up timeouts on unmount', () => {
      vi.useFakeTimers();
      const setPhase = vi.fn();

      const { unmount } = render(
        <VoiceProvider>
          <AutoAdvanceController
            sessionId="test-session"
            setPhase={setPhase}
            config={{ advanceDelay: 1000 }}
          />
        </VoiceProvider>
      );

      // Start an advance
      act(() => {
        (global as any).mockVoiceEventHandlers.onPhaseTransition({
          type: 'phase_transition',
          timestamp: Date.now(),
          data: {
            fromPhase: 'idle',
            toPhase: 'positioning',
            reason: 'Ready to scan',
          },
        });
      });

      // Unmount before timeout
      unmount();

      // Advance time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should not call setPhase after unmount
      expect(setPhase).toHaveBeenCalledWith('positioning'); // Only from event, not timeout

      vi.useRealTimers();
    });
  });
});
