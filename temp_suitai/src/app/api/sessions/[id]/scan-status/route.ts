import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for scan status update
const ScanStatusUpdateSchema = z.object({
  isLocked: z.boolean().optional(),
  progress: z.number().min(0).max(1).optional(),
  stableFrameCount: z.number().int().min(0).optional(),
  confidence: z.number().min(0).max(1).optional(),
  universalMeasurementId: z.string().optional(),
});

// GET: Retrieve scan status for a session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        scanIsLocked: true,
        scanProgress: true,
        scanStableFrameCount: true,
        scanConfidence: true,
        scanUniversalMeasurementId: true,
        updatedAt: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        sessionId: session.id,
        isLocked: session.scanIsLocked,
        progress: session.scanProgress,
        stableFrameCount: session.scanStableFrameCount,
        confidence: session.scanConfidence,
        universalMeasurementId: session.scanUniversalMeasurementId,
        updatedAt: session.updatedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Scan status GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update scan status for a session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validationResult = ScanStatusUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Build update object based on what's provided
    const updateData: any = {};
    if (data.isLocked !== undefined) updateData.scanIsLocked = data.isLocked;
    if (data.progress !== undefined) updateData.scanProgress = data.progress;
    if (data.stableFrameCount !== undefined) updateData.scanStableFrameCount = data.stableFrameCount;
    if (data.confidence !== undefined) updateData.scanConfidence = data.confidence;
    if (data.universalMeasurementId !== undefined) updateData.scanUniversalMeasurementId = data.universalMeasurementId;

    // Update or create session with scan status
    const session = await prisma.session.upsert({
      where: { id: params.id },
      update: updateData,
      create: {
        id: params.id,
        ...updateData,
      },
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        isLocked: session.scanIsLocked,
        progress: session.scanProgress,
        stableFrameCount: session.scanStableFrameCount,
        confidence: session.scanConfidence,
        universalMeasurementId: session.scanUniversalMeasurementId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Scan status POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
