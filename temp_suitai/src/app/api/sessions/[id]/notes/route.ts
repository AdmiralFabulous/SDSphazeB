import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for notes input
const NotesInputSchema = z.object({
  notes: z.string().max(5000).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = NotesInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { notes } = validationResult.data;

    // Update or create session with notes
    const session = await prisma.session.upsert({
      where: { id: params.id },
      update: { notes },
      create: { id: params.id, notes },
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        notes: session.notes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Notes endpoint error:', error);
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
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      select: { id: true, notes: true },
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
        notes: session.notes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Notes endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
