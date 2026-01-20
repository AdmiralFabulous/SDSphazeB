import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for scan status input
const ScanStatusInputSchema = z.object({
  aruco_visible: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = ScanStatusInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { aruco_visible } = validationResult.data;

    // Update or create session with aruco_visible status
    const session = await prisma.session.upsert({
      where: { id: params.id },
      update: { aruco_visible },
      create: { id: params.id, aruco_visible },
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        aruco_visible: session.aruco_visible,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Scan status endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Retrieve session
    const session = await prisma.session.findUnique({
      where: { id: params.id },
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
        aruco_visible: session.aruco_visible ?? false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Scan status endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
