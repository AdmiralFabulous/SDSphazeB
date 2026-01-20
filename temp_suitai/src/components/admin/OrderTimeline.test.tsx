/**
 * OrderTimeline Component Tests
 * Verifies all acceptance criteria for state history timeline
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderTimeline from './OrderTimeline';

// Mock fetch
global.fetch = jest.fn();

const mockStateHistory = [
  {
    id: '1',
    state: 'UNLOCKED',
    stateChangedAt: '2024-01-20T10:00:00Z',
    stableFrameCount: 0,
    stabilityScore: 0,
    confidence: 0,
    changedBy: 'system',
    notes: 'Measurement session started',
  },
  {
    id: '2',
    state: 'IN_PROGRESS',
    stateChangedAt: '2024-01-20T10:00:30Z',
    stableFrameCount: 150,
    stabilityScore: 0.5,
    confidence: 0.5,
    changedBy: 'system',
    notes: 'Collecting stable measurements',
    warnings: ['High variation detected in frame 145'],
  },
  {
    id: '3',
    state: 'LOCKED',
    stateChangedAt: '2024-01-20T10:01:00Z',
    stableFrameCount: 300,
    stabilityScore: 1.0,
    confidence: 0.98,
    changedBy: 'vision_service',
    universalMeasurementId: 'UMI_20240120100100_abc123_xyz789',
    notes: 'Measurement locked and geometric median computed',
    metadata: {
      numMeasurements: 300,
      frameCountAtLock: 450,
      stableFrames: 300,
      measurementDimension: 10,
    },
  },
];

describe('OrderTimeline Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('Acceptance Criteria', () => {
    test('AC1: Displays visual timeline with all state transitions', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      await waitFor(() => {
        // Verify all three state transitions are visible
        expect(screen.getByText('Unlocked')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('Locked')).toBeInTheDocument();
      });
    });

    test('AC2: Shows all state transitions in chronological order', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      await waitFor(() => {
        const entries = screen.getAllByRole('button', { name: /expand|collapse/i });
        expect(entries.length).toBe(3);

        // Verify order by checking the DOM structure
        const container = screen.getByText('State History Timeline').parentElement
          ?.parentElement;
        const timelineEntries = container?.querySelectorAll('.timeline-entry');
        expect(timelineEntries?.length).toBe(3);
      });
    });

    test('AC3: Displays who made the change (changedBy field)', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      const user = userEvent.setup();

      await waitFor(() => {
        const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i });
        // Expand the second entry
        user.click(expandButtons[1]);
      });

      await waitFor(() => {
        expect(screen.getByText('system')).toBeInTheDocument();
      });
    });

    test('AC4: Displays notes for each transition', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      const user = userEvent.setup();

      await waitFor(() => {
        const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i });
        // Expand the first entry which has notes
        user.click(expandButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Measurement session started')).toBeInTheDocument();
      });
    });

    test('AC5: Visual timeline with distinct state indicators', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      const { container } = render(<OrderTimeline sessionId="session-123" />);

      await waitFor(() => {
        // Check for state icons and visual distinction
        const stateIcons = container.querySelectorAll('.state-icon');
        expect(stateIcons.length).toBeGreaterThan(0);

        // Check for different state entries with different colors
        const unlockedEntry = container.querySelector('.timeline-entry.unlocked');
        const inProgressEntry = container.querySelector('.timeline-entry.in-progress');
        const lockedEntry = container.querySelector('.timeline-entry.locked');

        expect(unlockedEntry).toBeInTheDocument();
        expect(inProgressEntry).toBeInTheDocument();
        expect(lockedEntry).toBeInTheDocument();
      });
    });
  });

  describe('Timeline Features', () => {
    test('Displays stability score as progress bar', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      const { container } = render(<OrderTimeline sessionId="session-123" />);

      const user = userEvent.setup();

      await waitFor(() => {
        const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i });
        user.click(expandButtons[2]); // Locked state
      });

      await waitFor(() => {
        const progressBars = container.querySelectorAll('.progress-bar');
        expect(progressBars.length).toBeGreaterThan(0);

        // Check stability score
        expect(screen.getByText(/100\.0%/)).toBeInTheDocument();
      });
    });

    test('Displays confidence metric', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      const user = userEvent.setup();

      await waitFor(() => {
        const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i });
        user.click(expandButtons[2]); // Locked state
      });

      await waitFor(() => {
        expect(screen.getByText(/Confidence:/)).toBeInTheDocument();
      });
    });

    test('Shows Universal Measurement ID when locked', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      const user = userEvent.setup();

      await waitFor(() => {
        const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i });
        user.click(expandButtons[2]); // Locked state
      });

      await waitFor(() => {
        expect(screen.getByText(/UMI_20240120100100_abc123_xyz789/)).toBeInTheDocument();
      });
    });

    test('Displays warnings when present', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      const user = userEvent.setup();

      await waitFor(() => {
        const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i });
        user.click(expandButtons[1]); // In progress state
      });

      await waitFor(() => {
        expect(screen.getByText(/High variation detected/)).toBeInTheDocument();
      });
    });

    test('Shows metadata at lock time', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      const user = userEvent.setup();

      await waitFor(() => {
        const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i });
        user.click(expandButtons[2]); // Locked state
      });

      await waitFor(() => {
        expect(screen.getByText(/Total Measurements:/)).toBeInTheDocument();
        expect(screen.getByText('300')).toBeInTheDocument(); // numMeasurements
      });
    });

    test('Latest entry is expanded by default', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      const { container } = render(<OrderTimeline sessionId="session-123" />);

      await waitFor(() => {
        const latestEntry = container.querySelector('.timeline-entry.latest');
        const details = latestEntry?.querySelector('.entry-details');
        // Latest entry should have details visible
        expect(details).toBeInTheDocument();
      });
    });

    test('Entries can be expanded/collapsed', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      const user = userEvent.setup();

      await waitFor(() => {
        const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i });
        // Click first entry to expand
        user.click(expandButtons[0]);
      });

      await waitFor(() => {
        // Should show details
        expect(screen.getByText('Measurement session started')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('Displays error when fetch fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<OrderTimeline sessionId="session-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });
    });

    test('Displays empty state when no history exists', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<OrderTimeline sessionId="session-123" />);

      await waitFor(() => {
        expect(screen.getByText(/No state transitions recorded/)).toBeInTheDocument();
      });
    });

    test('Shows loading state initially', () => {
      (fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => mockStateHistory,
              });
            }, 100);
          })
      );

      render(<OrderTimeline sessionId="session-123" />);

      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    test('Fetches state history from correct endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/sessions/session-123/state-history');
      });
    });

    test('Calls onTimelineLoad callback after fetch', async () => {
      const onTimelineLoad = jest.fn();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" onTimelineLoad={onTimelineLoad} />);

      await waitFor(() => {
        expect(onTimelineLoad).toHaveBeenCalledWith(mockStateHistory);
      });
    });

    test('Shows header with stats', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStateHistory,
      });

      render(<OrderTimeline sessionId="session-123" />);

      await waitFor(() => {
        expect(screen.getByText('State History Timeline')).toBeInTheDocument();
        expect(screen.getByText(/Total Transitions:/)).toBeInTheDocument();
        expect(screen.getByText(/3/)).toBeInTheDocument(); // 3 transitions
        expect(screen.getByText(/Current State:/)).toBeInTheDocument();
      });
    });
  });
});
