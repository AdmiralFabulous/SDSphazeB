import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for scan status update
const ScanUpdateSchema = z.object({
  rotation_speed: z.number().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        rotation_speed: true,
        height: true,
        createdAt: true,
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
        rotation_speed: session.rotation_speed ?? 0,
        height: session.height,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = ScanUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Update or create session with rotation speed
    const session = await prisma.session.upsert({
      where: { id: params.id },
      update: validationResult.data,
      create: { id: params.id, ...validationResult.data },
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        rotation_speed: session.rotation_speed ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Scan update endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
