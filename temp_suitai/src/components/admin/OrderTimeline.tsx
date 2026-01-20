/**
 * OrderTimeline Component
 *
 * Displays a visual timeline of all state transitions for a measurement session.
 * Shows:
 * - Visual timeline with state progression (UNLOCKED → IN_PROGRESS → LOCKED)
 * - Timestamp of each transition
 * - User/system who made the change
 * - Stability score and confidence metrics
 * - Associated notes and warnings
 * - Measurement metrics (frame counts, geometric median)
 */

import React, { useEffect, useState } from 'react';
import './OrderTimeline.css';

interface StateHistoryRecord {
  id: string;
  state: 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED';
  stateChangedAt: string;
  stableFrameCount: number;
  stabilityScore: number;
  confidence: number;
  changedBy?: string;
  notes?: string;
  warnings?: string[];
  universalMeasurementId?: string;
  metadata?: {
    numMeasurements?: number;
    frameCountAtLock?: number;
    stableFrames?: number;
    measurementDimension?: number;
  };
}

interface OrderTimelineProps {
  sessionId: string;
  onTimelineLoad?: (records: StateHistoryRecord[]) => void;
}

const StateIcon: React.FC<{ state: string }> = ({ state }) => {
  switch (state) {
    case 'UNLOCKED':
      return (
        <div className="state-icon unlocked" title="Measurement unlocked">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 1C6.48 1 2 5.48 2 11h2c0-4.42 3.58-8 8-8s8 3.58 8 8c0 3.59-2.39 6.69-5.67 7.72v2.1c5.37-.5 9.67-5.16 9.67-9.82 0-5.52-4.48-10-10-10z" />
          </svg>
        </div>
      );
    case 'IN_PROGRESS':
      return (
        <div className="state-icon in-progress" title="Measurement in progress">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
        </div>
      );
    case 'LOCKED':
      return (
        <div className="state-icon locked" title="Measurement locked">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

const StateLabel: React.FC<{ state: string }> = ({ state }) => {
  const labels: Record<string, string> = {
    UNLOCKED: 'Unlocked',
    IN_PROGRESS: 'In Progress',
    LOCKED: 'Locked',
  };
  return <span className={`state-label state-${state.toLowerCase()}`}>{labels[state]}</span>;
};

const TimelineEntry: React.FC<{ record: StateHistoryRecord; isLatest: boolean }> = ({
  record,
  isLatest,
}) => {
  const [expanded, setExpanded] = useState(isLatest);
  const date = new Date(record.stateChangedAt);
  const timeStr = date.toLocaleTimeString();
  const dateStr = date.toLocaleDateString();

  return (
    <div className={`timeline-entry ${record.state.toLowerCase()} ${isLatest ? 'latest' : ''}`}>
      <div className="timeline-marker">
        <div className="timeline-dot">
          <StateIcon state={record.state} />
        </div>
        <div className="timeline-line" />
      </div>

      <div className="entry-content">
        <div className="entry-header">
          <div className="state-info">
            <StateLabel state={record.state} />
            <span className="timestamp">{timeStr}</span>
          </div>
          <button
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▼' : '▶'}
          </button>
        </div>

        {expanded && (
          <div className="entry-details">
            <div className="detail-row">
              <span className="label">Date:</span>
              <span className="value">{dateStr}</span>
            </div>

            <div className="detail-row">
              <span className="label">Frame Count:</span>
              <span className="value">{record.stableFrameCount}</span>
            </div>

            <div className="progress-container">
              <span className="label">Stability Score:</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${record.stabilityScore * 100}%` }}
                />
              </div>
              <span className="value">{(record.stabilityScore * 100).toFixed(1)}%</span>
            </div>

            <div className="progress-container">
              <span className="label">Confidence:</span>
              <div className="progress-bar">
                <div
                  className="progress-fill confidence"
                  style={{ width: `${record.confidence * 100}%` }}
                />
              </div>
              <span className="value">{(record.confidence * 100).toFixed(1)}%</span>
            </div>

            {record.changedBy && (
              <div className="detail-row">
                <span className="label">Changed By:</span>
                <span className="value">{record.changedBy}</span>
              </div>
            )}

            {record.universalMeasurementId && (
              <div className="detail-row">
                <span className="label">Measurement ID:</span>
                <span className="value umi">{record.universalMeasurementId}</span>
              </div>
            )}

            {record.notes && (
              <div className="detail-section">
                <span className="label">Notes:</span>
                <p className="notes">{record.notes}</p>
              </div>
            )}

            {record.warnings && record.warnings.length > 0 && (
              <div className="detail-section warnings-section">
                <span className="label">Warnings:</span>
                <ul className="warnings-list">
                  {record.warnings.map((warning, idx) => (
                    <li key={idx} className="warning-item">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {record.metadata && (
              <div className="detail-section">
                <span className="label">Metadata:</span>
                <dl className="metadata-list">
                  {record.metadata.numMeasurements !== undefined && (
                    <>
                      <dt>Total Measurements:</dt>
                      <dd>{record.metadata.numMeasurements}</dd>
                    </>
                  )}
                  {record.metadata.frameCountAtLock !== undefined && (
                    <>
                      <dt>Frame Count at Lock:</dt>
                      <dd>{record.metadata.frameCountAtLock}</dd>
                    </>
                  )}
                  {record.metadata.measurementDimension !== undefined && (
                    <>
                      <dt>Dimension:</dt>
                      <dd>{record.metadata.measurementDimension}D</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ sessionId, onTimelineLoad }) => {
  const [history, setHistory] = useState<StateHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStateHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/sessions/${sessionId}/state-history`);

        if (!response.ok) {
          throw new Error(`Failed to fetch state history: ${response.statusText}`);
        }

        const data = await response.json();
        setHistory(data);
        onTimelineLoad?.(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching state history:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchStateHistory();
    }
  }, [sessionId, onTimelineLoad]);

  if (loading) {
    return (
      <div className="order-timeline">
        <div className="loading">Loading state history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-timeline">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="order-timeline">
        <div className="empty-state">No state transitions recorded yet</div>
      </div>
    );
  }

  const latestRecord = history[history.length - 1];

  return (
    <div className="order-timeline">
      <div className="timeline-header">
        <h2>State History Timeline</h2>
        <div className="timeline-stats">
          <div className="stat">
            <span className="label">Total Transitions:</span>
            <span className="value">{history.length}</span>
          </div>
          <div className="stat">
            <span className="label">Current State:</span>
            <StateLabel state={latestRecord.state} />
          </div>
        </div>
      </div>

      <div className="timeline-container">
        {history.map((record, idx) => (
          <TimelineEntry
            key={record.id}
            record={record}
            isLatest={idx === history.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderTimeline;
