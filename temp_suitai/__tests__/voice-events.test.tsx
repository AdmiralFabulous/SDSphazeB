/**
 * Voice Events Integration Tests
 * VOICE-E01-S04-T03: Handle Function Calls
 *
 * Manual test suite - requires vitest setup
 * Install: npm install --save-dev vitest @testing-library/react @testing-library/react-hooks
 * Add to package.json: "test": "vitest"
 * Run: npm test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { VoiceProvider, useVoiceContext } from '../src/contexts/VoiceContext';
import {
  useVoiceEvents,
  useLatestEvent,
  useScanProgress,
  useSpeedWarning,
} from '../src/hooks/useVoiceEvents';
import type {
  SpeedWarningEvent,
  PhaseTransitionEvent,
  MeasurementLockEvent,
} from '../src/types/voice';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <VoiceProvider>{children}</VoiceProvider>
);

describe('Voice Events System', () => {
  describe('VoiceContext', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useVoiceContext(), { wrapper });

      expect(result.current.state).toEqual({
        isListening: false,
        isProcessing: false,
        currentPhase: 'idle',
        events: [],
        error: null,
        sessionId: null,
      });
    });

    it('should emit events', () => {
      const { result } = renderHook(() => useVoiceContext(), { wrapper });

      const speedWarning: SpeedWarningEvent = {
        type: 'speed_warning',
        timestamp: Date.now(),
        data: {
          currentSpeed: 45,
          threshold: 30,
          shouldWarn: true,
          message: 'Please slow down rotation',
        },
      };

      act(() => {
        result.current.emitEvent(speedWarning);
      });

      expect(result.current.state.events).toHaveLength(1);
      expect(result.current.state.events[0]).toEqual(speedWarning);
    });

    it('should update phase on phase transition events', () => {
      const { result } = renderHook(() => useVoiceContext(), { wrapper });

      const phaseTransition: PhaseTransitionEvent = {
        type: 'phase_transition',
        timestamp: Date.now(),
        data: {
          fromPhase: 'idle',
          toPhase: 'scanning',
          reason: 'User started scan',
        },
      };

      act(() => {
        result.current.emitEvent(phaseTransition);
      });

      expect(result.current.state.currentPhase).toBe('scanning');
    });

    it('should clear events', () => {
      const { result } = renderHook(() => useVoiceContext(), { wrapper });

      act(() => {
        result.current.emitEvent({
          type: 'speed_warning',
          timestamp: Date.now(),
          data: {
            currentSpeed: 40,
            threshold: 30,
            shouldWarn: true,
          },
        });
      });

      expect(result.current.state.events).toHaveLength(1);

      act(() => {
        result.current.clearEvents();
      });

      expect(result.current.state.events).toHaveLength(0);
    });

    it('should set session ID', () => {
      const { result } = renderHook(() => useVoiceContext(), { wrapper });
      const sessionId = 'test-session-123';

      act(() => {
        result.current.setSessionId(sessionId);
      });

      expect(result.current.state.sessionId).toBe(sessionId);
    });
  });

  describe('useVoiceEvents', () => {
    it('should call event handlers when events are emitted', async () => {
      const onSpeedWarning = vi.fn();
      const onPhaseTransition = vi.fn();

      const { result: contextResult } = renderHook(() => useVoiceContext(), { wrapper });
      const { result: eventsResult } = renderHook(
        () => useVoiceEvents({ onSpeedWarning, onPhaseTransition }),
        { wrapper }
      );

      const speedWarning: SpeedWarningEvent = {
        type: 'speed_warning',
        timestamp: Date.now(),
        data: {
          currentSpeed: 45,
          threshold: 30,
          shouldWarn: true,
        },
      };

      act(() => {
        contextResult.current.emitEvent(speedWarning);
      });

      await waitFor(() => {
        expect(onSpeedWarning).toHaveBeenCalledWith(speedWarning);
      });
    });

    it('should filter events by type', async () => {
      const onEvent = vi.fn();

      const { result: contextResult } = renderHook(() => useVoiceContext(), { wrapper });
      const { result: eventsResult } = renderHook(
        () => useVoiceEvents({ onEvent, eventTypes: ['speed_warning'] }),
        { wrapper }
      );

      const speedWarning: SpeedWarningEvent = {
        type: 'speed_warning',
        timestamp: Date.now(),
        data: {
          currentSpeed: 45,
          threshold: 30,
          shouldWarn: true,
        },
      };

      const phaseTransition: PhaseTransitionEvent = {
        type: 'phase_transition',
        timestamp: Date.now(),
        data: {
          fromPhase: 'idle',
          toPhase: 'scanning',
        },
      };

      act(() => {
        contextResult.current.emitEvent(speedWarning);
        contextResult.current.emitEvent(phaseTransition);
      });

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledTimes(1);
        expect(onEvent).toHaveBeenCalledWith(speedWarning);
      });
    });
  });

  describe('useLatestEvent', () => {
    it('should return the latest event of a specific type', () => {
      const { result: contextResult } = renderHook(() => useVoiceContext(), { wrapper });
      const { result: latestEventResult } = renderHook(
        () => useLatestEvent<SpeedWarningEvent>('speed_warning'),
        { wrapper }
      );

      const warning1: SpeedWarningEvent = {
        type: 'speed_warning',
        timestamp: Date.now(),
        data: {
          currentSpeed: 35,
          threshold: 30,
          shouldWarn: true,
        },
      };

      const warning2: SpeedWarningEvent = {
        type: 'speed_warning',
        timestamp: Date.now() + 1000,
        data: {
          currentSpeed: 40,
          threshold: 30,
          shouldWarn: true,
        },
      };

      act(() => {
        contextResult.current.emitEvent(warning1);
        contextResult.current.emitEvent(warning2);
      });

      expect(latestEventResult.current).toEqual(warning2);
    });
  });

  describe('useScanProgress', () => {
    it('should calculate progress based on phase', () => {
      const { result: contextResult } = renderHook(() => useVoiceContext(), { wrapper });
      const { result: progressResult } = renderHook(() => useScanProgress(), { wrapper });

      expect(progressResult.current.progress).toBe(0);

      act(() => {
        contextResult.current.setPhase('scanning');
      });

      expect(progressResult.current.progress).toBe(0.3);

      act(() => {
        contextResult.current.setPhase('complete');
      });

      expect(progressResult.current.progress).toBe(1.0);
    });

    it('should incorporate stability score in locking phase', () => {
      const { result: contextResult } = renderHook(() => useVoiceContext(), { wrapper });
      const { result: progressResult } = renderHook(() => useScanProgress(), { wrapper });

      act(() => {
        contextResult.current.setPhase('locking');
      });

      expect(progressResult.current.progress).toBe(0.5);

      const lockEvent: MeasurementLockEvent = {
        type: 'measurement_lock',
        timestamp: Date.now(),
        data: {
          isLocked: false,
          stabilityScore: 0.5,
          stableFrameCount: 150,
        },
      };

      act(() => {
        contextResult.current.emitEvent(lockEvent);
      });

      // Progress should be 0.5 + (0.5 * 0.3) = 0.65
      expect(progressResult.current.progress).toBeCloseTo(0.65);
      expect(progressResult.current.stabilityScore).toBe(0.5);
      expect(progressResult.current.stableFrameCount).toBe(150);
    });
  });

  describe('useSpeedWarning', () => {
    it('should return speed warning data', () => {
      const { result: contextResult } = renderHook(() => useVoiceContext(), { wrapper });
      const { result: warningResult } = renderHook(() => useSpeedWarning(), { wrapper });

      expect(warningResult.current.shouldWarn).toBe(false);

      const warning: SpeedWarningEvent = {
        type: 'speed_warning',
        timestamp: Date.now(),
        data: {
          currentSpeed: 45,
          threshold: 30,
          shouldWarn: true,
          message: 'Slow down!',
        },
      };

      act(() => {
        contextResult.current.emitEvent(warning);
      });

      expect(warningResult.current.shouldWarn).toBe(true);
      expect(warningResult.current.currentSpeed).toBe(45);
      expect(warningResult.current.threshold).toBe(30);
      expect(warningResult.current.message).toBe('Slow down!');
    });
  });

  describe('Integration: Phase Transitions and Progress', () => {
    it('should handle complete scan workflow', () => {
      const { result: contextResult } = renderHook(() => useVoiceContext(), { wrapper });
      const { result: progressResult } = renderHook(() => useScanProgress(), { wrapper });

      // Start scan
      act(() => {
        contextResult.current.emitEvent({
          type: 'phase_transition',
          timestamp: Date.now(),
          data: { fromPhase: 'idle', toPhase: 'positioning' },
        });
      });
      expect(progressResult.current.phase).toBe('positioning');

      // Begin scanning
      act(() => {
        contextResult.current.emitEvent({
          type: 'phase_transition',
          timestamp: Date.now(),
          data: { fromPhase: 'positioning', toPhase: 'scanning' },
        });
      });
      expect(progressResult.current.phase).toBe('scanning');

      // Start locking
      act(() => {
        contextResult.current.emitEvent({
          type: 'phase_transition',
          timestamp: Date.now(),
          data: { fromPhase: 'scanning', toPhase: 'locking' },
        });
      });
      expect(progressResult.current.phase).toBe('locking');

      // Update stability
      act(() => {
        contextResult.current.emitEvent({
          type: 'measurement_lock',
          timestamp: Date.now(),
          data: {
            isLocked: false,
            stabilityScore: 0.8,
            stableFrameCount: 240,
          },
        });
      });
      expect(progressResult.current.stabilityScore).toBe(0.8);

      // Lock complete
      act(() => {
        contextResult.current.emitEvent({
          type: 'measurement_lock',
          timestamp: Date.now(),
          data: {
            isLocked: true,
            stabilityScore: 1.0,
            stableFrameCount: 300,
            measurementId: 'umid-123',
          },
        });
      });
      expect(progressResult.current.isLocked).toBe(true);

      // Transition to locked phase
      act(() => {
        contextResult.current.emitEvent({
          type: 'phase_transition',
          timestamp: Date.now(),
          data: { fromPhase: 'locking', toPhase: 'locked' },
        });
      });
      expect(progressResult.current.phase).toBe('locked');
      expect(progressResult.current.progress).toBe(0.9);
    });
  });
});
