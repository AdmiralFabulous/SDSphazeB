import { NextRequest, NextResponse } from 'next/server';
import { announceScanCompletion } from '@/lib/scan-completion-llm';

// POST: Trigger LLM to check scan status and announce completion
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Call the LLM to check status and celebrate if complete
    const announcement = await announceScanCompletion(params.id);

    return NextResponse.json(
      {
        sessionId: params.id,
        announcement,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Announce completion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to announce completion',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
