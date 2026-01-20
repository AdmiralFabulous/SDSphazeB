/**
 * Voice Context Provider
 * VOICE-E01-S04-T03: Handle Function Calls
 *
 * Provides centralized state management for voice events and AI interactions
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type {
  VoiceState,
  VoiceContextValue,
  TypedVoiceEvent,
  ScanPhase,
} from '../types/voice';

const initialState: VoiceState = {
  isListening: false,
  isProcessing: false,
  currentPhase: 'idle',
  events: [],
  error: null,
  sessionId: null,
};

type VoiceAction =
  | { type: 'EMIT_EVENT'; payload: TypedVoiceEvent }
  | { type: 'CLEAR_EVENTS' }
  | { type: 'SET_PHASE'; payload: ScanPhase }
  | { type: 'SET_SESSION_ID'; payload: string | null }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  switch (action.type) {
    case 'EMIT_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
      };

    case 'CLEAR_EVENTS':
      return {
        ...state,
        events: [],
      };

    case 'SET_PHASE':
      return {
        ...state,
        currentPhase: action.payload,
      };

    case 'SET_SESSION_ID':
      return {
        ...state,
        sessionId: action.payload,
      };

    case 'SET_LISTENING':
      return {
        ...state,
        isListening: action.payload,
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);

export interface VoiceProviderProps {
  children: ReactNode;
}

export function VoiceProvider({ children }: VoiceProviderProps) {
  const [state, dispatch] = useReducer(voiceReducer, initialState);

  const emitEvent = useCallback((event: TypedVoiceEvent) => {
    dispatch({ type: 'EMIT_EVENT', payload: event });

    // Auto-update phase for phase transition events
    if (event.type === 'phase_transition') {
      dispatch({ type: 'SET_PHASE', payload: event.data.toPhase });
    }

    // Clear errors on successful events
    if (event.type !== 'error' && state.error) {
      dispatch({ type: 'SET_ERROR', payload: null });
    }

    // Set error for error events
    if (event.type === 'error') {
      dispatch({ type: 'SET_ERROR', payload: event.data.message });
    }
  }, [state.error]);

  const clearEvents = useCallback(() => {
    dispatch({ type: 'CLEAR_EVENTS' });
  }, []);

  const setPhase = useCallback((phase: ScanPhase) => {
    dispatch({ type: 'SET_PHASE', payload: phase });
  }, []);

  const setSessionId = useCallback((sessionId: string | null) => {
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
  }, []);

  const value: VoiceContextValue = {
    state,
    emitEvent,
    clearEvents,
    setPhase,
    setSessionId,
  };

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoiceContext() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoiceContext must be used within a VoiceProvider');
  }
  return context;
}
