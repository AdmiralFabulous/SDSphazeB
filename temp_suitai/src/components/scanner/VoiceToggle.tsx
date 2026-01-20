import React from 'react';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';

interface VoiceToggleProps {
  sessionId: string;
  onTranscript?: (transcript: string) => void;
  onError?: (error: Error) => void;
}

export function VoiceToggle({ sessionId, onTranscript, onError }: VoiceToggleProps) {
  const { isActive, isSpeaking, isListening, error, toggle } = useVoiceAssistant({
    sessionId,
    onTranscript,
    onError,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
      <button
        onClick={toggle}
        aria-label={isActive ? 'Stop voice assistant' : 'Start voice assistant'}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: '2px solid',
          borderColor: isActive ? '#22c55e' : '#94a3b8',
          backgroundColor: isActive ? '#dcfce7' : '#f1f5f9',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'all 0.2s ease',
          position: 'relative',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isActive ? '🎤' : '🔇'}

        {/* Listening indicator (pulsing ring) */}
        {isListening && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              bottom: '-4px',
              left: '-4px',
              borderRadius: '50%',
              border: '2px solid #22c55e',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        )}

        {/* Speaking indicator (animated waves) */}
        {isSpeaking && (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '12px',
            }}
          >
            🔊
          </span>
        )}
      </button>

      {/* State indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: '500',
            color: isActive ? '#22c55e' : '#64748b',
          }}
        >
          {isActive ? 'Active' : 'Inactive'}
        </div>

        {isListening && (
          <div
            style={{
              fontSize: '10px',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                animation: 'blink 1s ease-in-out infinite',
              }}
            />
            Listening...
          </div>
        )}

        {isSpeaking && (
          <div
            style={{
              fontSize: '10px',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#8b5cf6',
                animation: 'blink 0.6s ease-in-out infinite',
              }}
            />
            Speaking...
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            fontSize: '11px',
            color: '#ef4444',
            backgroundColor: '#fee2e2',
            padding: '4px 8px',
            borderRadius: '4px',
            maxWidth: '200px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* Session ID display (for debugging) */}
      <div
        style={{
          fontSize: '10px',
          color: '#94a3b8',
          fontFamily: 'monospace',
        }}
      >
        Session: {sessionId.slice(0, 8)}...
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.1);
            }
          }

          @keyframes blink {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.3;
            }
          }
        `}
      </style>
    </div>
  );
}
