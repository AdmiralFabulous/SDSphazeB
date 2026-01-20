import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceAssistantOptions {
  sessionId: string;
  onTranscript?: (transcript: string) => void;
  onError?: (error: Error) => void;
}

interface VoiceAssistantState {
  isActive: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  error: string | null;
}

export function useVoiceAssistant(options: VoiceAssistantOptions) {
  const { sessionId, onTranscript, onError } = options;

  const [state, setState] = useState<VoiceAssistantState>({
    isActive: false,
    isSpeaking: false,
    isListening: false,
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const error = new Error('Speech recognition not supported in this browser');
      setState(prev => ({ ...prev, error: error.message }));
      onError?.(error);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      if (event.results[event.results.length - 1].isFinal) {
        onTranscript?.(transcript);
      }
    };

    recognition.onerror = (event) => {
      const error = new Error(`Speech recognition error: ${event.error}`);
      setState(prev => ({ ...prev, error: error.message, isListening: false }));
      onError?.(error);
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onTranscript, onError]);

  // Start voice assistant
  const start = useCallback(() => {
    if (!recognitionRef.current) {
      const error = new Error('Speech recognition not initialized');
      setState(prev => ({ ...prev, error: error.message }));
      onError?.(error);
      return;
    }

    try {
      recognitionRef.current.start();
      setState(prev => ({ ...prev, isActive: true, error: null }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start voice assistant');
      setState(prev => ({ ...prev, error: err.message }));
      onError?.(err);
    }
  }, [onError]);

  // Stop voice assistant
  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setState(prev => ({ ...prev, isActive: false, isSpeaking: false, isListening: false }));
  }, []);

  // Speak text
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      const error = new Error('Speech synthesis not supported');
      onError?.(error);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true }));
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    utterance.onerror = (event) => {
      const error = new Error(`Speech synthesis error: ${event.error}`);
      setState(prev => ({ ...prev, isSpeaking: false, error: error.message }));
      onError?.(error);
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [onError]);

  // Toggle voice assistant
  const toggle = useCallback(() => {
    if (state.isActive) {
      stop();
    } else {
      start();
    }
  }, [state.isActive, start, stop]);

  return {
    ...state,
    sessionId,
    start,
    stop,
    toggle,
    speak,
  };
}

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
