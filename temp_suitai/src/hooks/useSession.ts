import { useState, useEffect } from 'react';

const SESSION_ID_KEY = 'session_id';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Fallback for edge cases
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create a session ID
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    throw new Error('useSession can only be used in the browser');
  }

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

interface UseSessionReturn {
  sessionId: string | null;
  isLoading: boolean;
  claim: (data?: Record<string, unknown>) => Promise<void>;
}

/**
 * Hook to manage session state with UUID persistence in localStorage
 *
 * @returns Object containing sessionId, loading state, and claim function
 */
export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const id = getOrCreateSessionId();
      setSessionId(id);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claim = async (data?: Record<string, unknown>): Promise<void> => {
    if (!sessionId) {
      throw new Error('Session ID not initialized');
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data || {}),
      });

      if (!response.ok) {
        throw new Error(`Failed to claim session: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Session claim failed:', error);
      throw error;
    }
  };

  return {
    sessionId,
    isLoading,
    claim,
  };
}

/**
 * Utility function to get the current session ID without React hooks
 * Useful for non-React code or initial setup
 */
export function getSessionId(): string {
  return getOrCreateSessionId();
}
