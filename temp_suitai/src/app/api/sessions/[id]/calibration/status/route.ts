import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sessions/[id]/calibration/status
 *
 * Returns current calibration status for a session.
 * Used for polling or status checks from the UI.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    const calibrationSession = await prisma.calibrationSession.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    if (!calibrationSession) {
      return NextResponse.json(
        {
          sessionId,
          state: 'NOT_STARTED',
          stabilityScore: null,
          confidence: null,
          stableFrameCount: 0,
          lockedScaleFactor: null,
          measurementId: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      sessionId: calibrationSession.sessionId,
      state: calibrationSession.state,
      stabilityScore: calibrationSession.stabilityScore,
      confidence: calibrationSession.confidence,
      stableFrameCount: calibrationSession.stableFrameCount,
      lockedScaleFactor: calibrationSession.lockedScaleFactor,
      measurementId: calibrationSession.measurementId,
      createdAt: calibrationSession.createdAt,
      updatedAt: calibrationSession.updatedAt,
    });
  } catch (error) {
    console.error('[Status API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
