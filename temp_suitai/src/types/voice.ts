/**
 * Voice Integration Type Definitions
 * VOICE-E01-S04-T03: Handle Function Calls
 */

export type VoiceEventType =
  | 'speed_warning'
  | 'phase_transition'
  | 'measurement_lock'
  | 'height_confirmed'
  | 'session_started'
  | 'session_ended'
  | 'error';

export type ScanPhase =
  | 'idle'
  | 'positioning'
  | 'scanning'
  | 'locking'
  | 'locked'
  | 'complete';

export interface VoiceEvent {
  type: VoiceEventType;
  timestamp: number;
  data?: unknown;
}

export interface SpeedWarningEvent extends VoiceEvent {
  type: 'speed_warning';
  data: {
    currentSpeed: number;
    threshold: number;
    shouldWarn: boolean;
    message?: string;
  };
}

export interface PhaseTransitionEvent extends VoiceEvent {
  type: 'phase_transition';
  data: {
    fromPhase: ScanPhase;
    toPhase: ScanPhase;
    reason?: string;
  };
}

export interface MeasurementLockEvent extends VoiceEvent {
  type: 'measurement_lock';
  data: {
    isLocked: boolean;
    stabilityScore: number;
    stableFrameCount: number;
    measurementId?: string;
  };
}

export interface HeightConfirmedEvent extends VoiceEvent {
  type: 'height_confirmed';
  data: {
    height: number;
    sessionId: string;
  };
}

export interface SessionEvent extends VoiceEvent {
  type: 'session_started' | 'session_ended';
  data: {
    sessionId: string;
  };
}

export interface ErrorEvent extends VoiceEvent {
  type: 'error';
  data: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type TypedVoiceEvent =
  | SpeedWarningEvent
  | PhaseTransitionEvent
  | MeasurementLockEvent
  | HeightConfirmedEvent
  | SessionEvent
  | ErrorEvent;

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  currentPhase: ScanPhase;
  events: TypedVoiceEvent[];
  error: string | null;
  sessionId: string | null;
}

export interface VoiceContextValue {
  state: VoiceState;
  emitEvent: (event: TypedVoiceEvent) => void;
  clearEvents: () => void;
  setPhase: (phase: ScanPhase) => void;
  setSessionId: (sessionId: string | null) => void;
}

export interface AIFunctionCall {
  name: string;
  parameters: Record<string, unknown>;
}

export interface AIFunctionResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
