/**
 * Voice Events Hook
 * VOICE-E01-S04-T03: Handle Function Calls
 *
 * React to AI-triggered events in the UI
 */

import { useEffect, useCallback, useRef } from 'react';
import { useVoiceContext } from '../contexts/VoiceContext';
import type {
  TypedVoiceEvent,
  VoiceEventType,
  SpeedWarningEvent,
  PhaseTransitionEvent,
  MeasurementLockEvent,
  ScanPhase,
} from '../types/voice';

type EventHandler<T extends TypedVoiceEvent = TypedVoiceEvent> = (event: T) => void;

interface UseVoiceEventsOptions {
  onSpeedWarning?: EventHandler<SpeedWarningEvent>;
  onPhaseTransition?: EventHandler<PhaseTransitionEvent>;
  onMeasurementLock?: EventHandler<MeasurementLockEvent>;
  onEvent?: EventHandler;
  eventTypes?: VoiceEventType[];
}

/**
 * Hook for listening to and reacting to voice events
 *
 * @example
 * ```tsx
 * useVoiceEvents({
 *   onSpeedWarning: (event) => {
 *     if (event.data.shouldWarn) {
 *       showNotification('Slow down rotation');
 *     }
 *   },
 *   onPhaseTransition: (event) => {
 *     console.log(`Phase changed: ${event.data.fromPhase} -> ${event.data.toPhase}`);
 *   }
 * });
 * ```
 */
export function useVoiceEvents(options: UseVoiceEventsOptions = {}) {
  const { state } = useVoiceContext();
  const {
    onSpeedWarning,
    onPhaseTransition,
    onMeasurementLock,
    onEvent,
    eventTypes,
  } = options;

  const lastProcessedIndex = useRef(0);

  useEffect(() => {
    const newEvents = state.events.slice(lastProcessedIndex.current);

    newEvents.forEach((event) => {
      // Filter by event types if specified
      if (eventTypes && !eventTypes.includes(event.type)) {
        return;
      }

      // Call the general handler
      if (onEvent) {
        onEvent(event);
      }

      // Call specific handlers
      switch (event.type) {
        case 'speed_warning':
          if (onSpeedWarning) {
            onSpeedWarning(event as SpeedWarningEvent);
          }
          break;

        case 'phase_transition':
          if (onPhaseTransition) {
            onPhaseTransition(event as PhaseTransitionEvent);
          }
          break;

        case 'measurement_lock':
          if (onMeasurementLock) {
            onMeasurementLock(event as MeasurementLockEvent);
          }
          break;
      }
    });

    lastProcessedIndex.current = state.events.length;
  }, [state.events, onSpeedWarning, onPhaseTransition, onMeasurementLock, onEvent, eventTypes]);

  return {
    events: state.events,
    currentPhase: state.currentPhase,
    error: state.error,
  };
}

/**
 * Hook for getting the latest event of a specific type
 */
export function useLatestEvent<T extends TypedVoiceEvent>(
  eventType: VoiceEventType
): T | undefined {
  const { state } = useVoiceContext();

  return state.events
    .filter((e) => e.type === eventType)
    .slice(-1)[0] as T | undefined;
}

/**
 * Hook for tracking scan phase and progress
 */
export function useScanProgress() {
  const { state } = useVoiceContext();
  const latestLockEvent = useLatestEvent<MeasurementLockEvent>('measurement_lock');

  const getPhaseProgress = useCallback((phase: ScanPhase): number => {
    switch (phase) {
      case 'idle':
        return 0;
      case 'positioning':
        return 0.1;
      case 'scanning':
        return 0.3;
      case 'locking':
        // Use stability score if available
        if (latestLockEvent?.data.stabilityScore !== undefined) {
          return 0.5 + (latestLockEvent.data.stabilityScore * 0.3);
        }
        return 0.5;
      case 'locked':
        return 0.9;
      case 'complete':
        return 1.0;
      default:
        return 0;
    }
  }, [latestLockEvent]);

  return {
    phase: state.currentPhase,
    progress: getPhaseProgress(state.currentPhase),
    stabilityScore: latestLockEvent?.data.stabilityScore ?? 0,
    stableFrameCount: latestLockEvent?.data.stableFrameCount ?? 0,
    isLocked: latestLockEvent?.data.isLocked ?? false,
  };
}

/**
 * Hook for monitoring rotation speed warnings
 */
export function useSpeedWarning() {
  const latestWarning = useLatestEvent<SpeedWarningEvent>('speed_warning');

  return {
    shouldWarn: latestWarning?.data.shouldWarn ?? false,
    currentSpeed: latestWarning?.data.currentSpeed ?? 0,
    threshold: latestWarning?.data.threshold ?? 30,
    message: latestWarning?.data.message,
  };
}
