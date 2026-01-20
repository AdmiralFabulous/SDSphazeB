import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for scan initialization
const ScanInitSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export interface ScanInitResponse {
  scanId: string;
  sessionId: string;
  startedAt: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = ScanInitSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { sessionId } = validationResult.data;

    // Verify session exists or create it
    let session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      session = await prisma.session.create({
        data: { id: sessionId },
      });
    }

    // Create new scan
    const scan = await prisma.scan.create({
      data: {
        sessionId,
      },
    });

    const response: ScanInitResponse = {
      scanId: scan.id,
      sessionId: scan.sessionId,
      startedAt: scan.startedAt.toISOString(),
      message: 'Scan initialized successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Scan init endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
