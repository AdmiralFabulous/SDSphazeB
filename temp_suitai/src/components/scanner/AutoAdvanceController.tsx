/**
 * Auto-Advance Controller
 * VOICE-E01-S04-T04: Auto-Advance UI
 *
 * Automatically advances the UI through the scanning workflow based on voice command completion
 * Flow: Calibration → Scanning → Complete → Measurements
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useVoiceEvents } from '../../hooks/useVoiceEvents';
import type { ScanPhase, PhaseTransitionEvent } from '../../types/voice';

export interface AutoAdvanceConfig {
  /** Enable/disable auto-advance functionality */
  enabled?: boolean;

  /** Delay in milliseconds before auto-advancing (default: 0) */
  advanceDelay?: number;

  /** Enable auto-navigation to measurements page after completion */
  autoNavigateToMeasurements?: boolean;

  /** Phases that trigger auto-advance (default: all phases) */
  enabledPhases?: ScanPhase[];

  /** Callback when auto-advance is triggered */
  onAutoAdvance?: (fromPhase: ScanPhase, toPhase: ScanPhase) => void;

  /** Callback when navigating to measurements */
  onNavigateToMeasurements?: (sessionId: string) => void;
}

export interface AutoAdvanceControllerProps {
  /** Current session ID */
  sessionId: string | null;

  /** Auto-advance configuration */
  config?: AutoAdvanceConfig;

  /** Manual navigation function for measurements */
  navigateToMeasurements?: (sessionId: string) => void;

  /** Manual phase change function */
  setPhase?: (phase: ScanPhase) => void;

  /** Current phase (for controlled mode) */
  currentPhase?: ScanPhase;
}

const DEFAULT_CONFIG: Required<AutoAdvanceConfig> = {
  enabled: true,
  advanceDelay: 0,
  autoNavigateToMeasurements: true,
  enabledPhases: ['idle', 'positioning', 'scanning', 'locking', 'locked', 'complete'],
  onAutoAdvance: () => {},
  onNavigateToMeasurements: () => {},
};

/**
 * Phase advancement map
 * Defines the next phase for each current phase
 */
const PHASE_ADVANCEMENT: Record<ScanPhase, ScanPhase | null> = {
  idle: 'positioning',
  positioning: 'scanning',
  scanning: 'locking',
  locking: 'locked',
  locked: 'complete',
  complete: null, // Terminal state - navigate to measurements
};

/**
 * Completion phrases that trigger auto-advance
 * These are phrases the AI might say to indicate a step is complete
 */
const COMPLETION_PHRASES = [
  'ready to scan',
  'scanning complete',
  'calibration complete',
  'position confirmed',
  'measurements locked',
  'scan finished',
  'all done',
  'process complete',
  'ready to proceed',
  'you can move to',
  'next step',
];

/**
 * AutoAdvanceController Component
 *
 * Listens to voice events and automatically advances the UI through the scanning workflow.
 * Supports configurable delays, phase filtering, and auto-navigation to measurements.
 *
 * @example
 * ```tsx
 * <AutoAdvanceController
 *   sessionId={sessionId}
 *   config={{
 *     enabled: true,
 *     advanceDelay: 1000,
 *     autoNavigateToMeasurements: true,
 *     onAutoAdvance: (from, to) => {
 *       console.log(`Auto-advancing from ${from} to ${to}`);
 *     }
 *   }}
 *   navigateToMeasurements={(id) => router.push(`/measurements/${id}`)}
 *   setPhase={setCurrentPhase}
 * />
 * ```
 */
export const AutoAdvanceController: React.FC<AutoAdvanceControllerProps> = ({
  sessionId,
  config = {},
  navigateToMeasurements,
  setPhase,
  currentPhase: externalPhase,
}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [internalPhase, setInternalPhase] = useState<ScanPhase>('idle');
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasNavigatedRef = useRef(false);

  // Use external phase if provided, otherwise use internal
  const currentPhase = externalPhase ?? internalPhase;
  const updatePhase = setPhase ?? setInternalPhase;

  /**
   * Advance to the next phase
   */
  const advancePhase = useCallback((fromPhase: ScanPhase) => {
    if (!mergedConfig.enabled) return;

    const nextPhase = PHASE_ADVANCEMENT[fromPhase];

    if (!nextPhase) {
      // Terminal state - navigate to measurements if configured
      if (
        mergedConfig.autoNavigateToMeasurements &&
        sessionId &&
        navigateToMeasurements &&
        !hasNavigatedRef.current
      ) {
        hasNavigatedRef.current = true;
        mergedConfig.onNavigateToMeasurements(sessionId);
        navigateToMeasurements(sessionId);
      }
      return;
    }

    // Check if this phase is enabled for auto-advance
    if (!mergedConfig.enabledPhases.includes(fromPhase)) {
      return;
    }

    // Clear any existing timeout
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
    }

    // Apply delay if configured
    if (mergedConfig.advanceDelay > 0) {
      advanceTimeoutRef.current = setTimeout(() => {
        updatePhase(nextPhase);
        mergedConfig.onAutoAdvance(fromPhase, nextPhase);
      }, mergedConfig.advanceDelay);
    } else {
      updatePhase(nextPhase);
      mergedConfig.onAutoAdvance(fromPhase, nextPhase);
    }
  }, [
    mergedConfig,
    sessionId,
    navigateToMeasurements,
    updatePhase,
  ]);

  /**
   * Check if a message contains completion phrases
   */
  const isCompletionMessage = useCallback((message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return COMPLETION_PHRASES.some(phrase => lowerMessage.includes(phrase));
  }, []);

  /**
   * Handle phase transition events
   */
  const handlePhaseTransition = useCallback((event: PhaseTransitionEvent) => {
    const { toPhase, reason } = event.data;

    // Update the current phase
    updatePhase(toPhase);

    // Check if the transition reason contains completion phrases
    if (reason && isCompletionMessage(reason)) {
      advancePhase(toPhase);
    }
  }, [updatePhase, isCompletionMessage, advancePhase]);

  /**
   * Handle measurement lock events (indicates scanning is complete)
   */
  const handleMeasurementLock = useCallback(() => {
    if (currentPhase === 'locking') {
      advancePhase('locking'); // Advances to 'locked'
    }
  }, [currentPhase, advancePhase]);

  /**
   * Handle general voice events for completion detection
   */
  const handleVoiceEvent = useCallback((event: any) => {
    // Check for completion phrases in event data
    if (event.data?.message && isCompletionMessage(event.data.message)) {
      advancePhase(currentPhase);
    }
  }, [currentPhase, isCompletionMessage, advancePhase]);

  // Subscribe to voice events
  useVoiceEvents({
    onPhaseTransition: handlePhaseTransition,
    onMeasurementLock: handleMeasurementLock,
    onEvent: handleVoiceEvent,
  });

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  // Reset navigation flag when session changes
  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [sessionId]);

  // This is a controller component - it doesn't render anything
  return null;
};

/**
 * Hook version of AutoAdvanceController for more flexible usage
 */
export function useAutoAdvance(props: AutoAdvanceControllerProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...props.config };
  const [internalPhase, setInternalPhase] = useState<ScanPhase>('idle');
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasNavigatedRef = useRef(false);

  const currentPhase = props.currentPhase ?? internalPhase;
  const updatePhase = props.setPhase ?? setInternalPhase;

  const advancePhase = useCallback((fromPhase: ScanPhase) => {
    if (!mergedConfig.enabled) return;

    const nextPhase = PHASE_ADVANCEMENT[fromPhase];

    if (!nextPhase) {
      if (
        mergedConfig.autoNavigateToMeasurements &&
        props.sessionId &&
        props.navigateToMeasurements &&
        !hasNavigatedRef.current
      ) {
        hasNavigatedRef.current = true;
        mergedConfig.onNavigateToMeasurements(props.sessionId);
        props.navigateToMeasurements(props.sessionId);
      }
      return;
    }

    if (!mergedConfig.enabledPhases.includes(fromPhase)) {
      return;
    }

    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
    }

    if (mergedConfig.advanceDelay > 0) {
      advanceTimeoutRef.current = setTimeout(() => {
        updatePhase(nextPhase);
        mergedConfig.onAutoAdvance(fromPhase, nextPhase);
      }, mergedConfig.advanceDelay);
    } else {
      updatePhase(nextPhase);
      mergedConfig.onAutoAdvance(fromPhase, nextPhase);
    }
  }, [mergedConfig, props.sessionId, props.navigateToMeasurements, updatePhase]);

  const isCompletionMessage = useCallback((message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return COMPLETION_PHRASES.some(phrase => lowerMessage.includes(phrase));
  }, []);

  const handlePhaseTransition = useCallback((event: PhaseTransitionEvent) => {
    const { toPhase, reason } = event.data;
    updatePhase(toPhase);
    if (reason && isCompletionMessage(reason)) {
      advancePhase(toPhase);
    }
  }, [updatePhase, isCompletionMessage, advancePhase]);

  const handleMeasurementLock = useCallback(() => {
    if (currentPhase === 'locking') {
      advancePhase('locking');
    }
  }, [currentPhase, advancePhase]);

  const handleVoiceEvent = useCallback((event: any) => {
    if (event.data?.message && isCompletionMessage(event.data.message)) {
      advancePhase(currentPhase);
    }
  }, [currentPhase, isCompletionMessage, advancePhase]);

  useVoiceEvents({
    onPhaseTransition: handlePhaseTransition,
    onMeasurementLock: handleMeasurementLock,
    onEvent: handleVoiceEvent,
  });

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [props.sessionId]);

  return {
    currentPhase,
    setPhase: updatePhase,
    advancePhase,
  };
}

export default AutoAdvanceController;
