/**
 * API Route: GET /api/sessions/[id]/state-history
 *
 * Retrieves the complete state history/timeline for a measurement session.
 * Returns all state transitions with timestamps, metrics, and metadata.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface StateHistoryRecord {
  id: string;
  state: string;
  stateChangedAt: string;
  stableFrameCount: number;
  stabilityScore: number;
  confidence: number;
  changedBy?: string;
  notes?: string;
  warnings?: string[];
  universalMeasurementId?: string;
  metadata?: Record<string, unknown>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const sessionId = params.id;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Fetch state history, ordered by timestamp
    const stateHistory = await prisma.stateHistory.findMany({
      where: { sessionId },
      orderBy: { stateChangedAt: 'asc' },
    });

    // Transform database records to frontend format
    const records: StateHistoryRecord[] = stateHistory.map((record) => ({
      id: record.id,
      state: record.state,
      stateChangedAt: record.stateChangedAt.toISOString(),
      stableFrameCount: record.stableFrameCount,
      stabilityScore: record.stabilityScore,
      confidence: record.confidence,
      ...(record.changedBy && { changedBy: record.changedBy }),
      ...(record.notes && { notes: record.notes }),
      ...(record.warnings && { warnings: JSON.parse(record.warnings) }),
      ...(record.universalMeasurementId && { universalMeasurementId: record.universalMeasurementId }),
      ...(record.metadata && { metadata: record.metadata }),
    }));

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching state history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions/[id]/state-history
 * Add a new state history record
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const sessionId = params.id;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const body = await request.json();

    const {
      state,
      stateChangedAt,
      stableFrameCount,
      stabilityScore,
      confidence,
      changedBy,
      notes,
      warnings,
      universalMeasurementId,
      metadata,
    } = body;

    // Validate required fields
    if (!state || !stateChangedAt || stableFrameCount === undefined || stabilityScore === undefined || confidence === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: state, stateChangedAt, stableFrameCount, stabilityScore, confidence' },
        { status: 400 }
      );
    }

    // Validate state enum
    if (!['UNLOCKED', 'IN_PROGRESS', 'LOCKED'].includes(state)) {
      return NextResponse.json(
        { error: 'Invalid state. Must be UNLOCKED, IN_PROGRESS, or LOCKED' },
        { status: 400 }
      );
    }

    // Create state history record
    const record = await prisma.stateHistory.create({
      data: {
        sessionId,
        state,
        stateChangedAt: new Date(stateChangedAt),
        stableFrameCount,
        stabilityScore,
        confidence,
        changedBy: changedBy || 'system',
        notes: notes || null,
        warnings: warnings ? JSON.stringify(warnings) : null,
        universalMeasurementId: universalMeasurementId || null,
        metadata: metadata || null,
      },
    });

    // Transform response
    const response: StateHistoryRecord = {
      id: record.id,
      state: record.state,
      stateChangedAt: record.stateChangedAt.toISOString(),
      stableFrameCount: record.stableFrameCount,
      stabilityScore: record.stabilityScore,
      confidence: record.confidence,
      ...(record.changedBy && { changedBy: record.changedBy }),
      ...(record.notes && { notes: record.notes }),
      ...(record.warnings && { warnings: JSON.parse(record.warnings) }),
      ...(record.universalMeasurementId && { universalMeasurementId: record.universalMeasurementId }),
      ...(record.metadata && { metadata: record.metadata }),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating state history record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
