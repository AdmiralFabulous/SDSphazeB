import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { mergeAnonymousSession } from '@/lib/session-merge';

const MergeRequestSchema = z.object({
  anonymousSessionId: z.string().min(1, 'Anonymous session ID is required'),
  userId: z.string().min(1, 'User ID is required')
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = MergeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { anonymousSessionId, userId } = validationResult.data;

    // Perform the merge
    const result = await mergeAnonymousSession(prisma, anonymousSessionId, userId);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });

  } catch (error) {
    console.error('Session merge endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        merged: { measurements: 0, configs: 0 },
        errors: ['Internal server error']
      },
      { status: 500 }
    );
  }
}
