import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runCalibrationDialogue, continueDialogueWithToolResults, type CalibrationDialogueMessage, type ToolExecutionResult } from '@/lib/claude-client';
import { z } from 'zod';

// Validation schema for dialogue input
const DialogueInputSchema = z.object({
  message: z.string().min(1),
  scaleFactor: z.number().positive().optional(),
});

/**
 * Execute a calibration tool via Python service
 */
async function executeCalibrationTool(
  sessionId: string,
  toolName: string,
  toolInput: any
): Promise<ToolExecutionResult> {
  const toolServiceUrl = process.env.TOOL_SERVICE_URL || 'http://127.0.0.1:8000';

  const response = await fetch(`${toolServiceUrl}/calibration/tools/${toolName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      ...toolInput,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tool execution failed: ${response.statusText}`);
  }

  return response.json();
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    const validationResult = DialogueInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { message, scaleFactor } = validationResult.data;

    // Get or create calibration session
    let calibrationSession = await prisma.calibrationSession.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    if (!calibrationSession) {
      calibrationSession = await prisma.calibrationSession.create({
        data: {
          sessionId,
          state: 'INITIALIZING',
          conversationHistory: JSON.stringify([]),
        },
      });
    }

    // Parse conversation history
    const conversationHistory: CalibrationDialogueMessage[] = JSON.parse(
      (calibrationSession.conversationHistory as string) || '[]'
    );

    // Run dialogue with Claude
    const dialogueResponse = await runCalibrationDialogue(
      sessionId,
      message,
      conversationHistory,
      (toolName, toolInput) => executeCalibrationTool(sessionId, toolName, toolInput)
    );

    let finalMessage = dialogueResponse.message;
    let audioUrl: string | null = null;

    // If tools were called, continue dialogue with results
    if (dialogueResponse.toolCalls.length > 0) {
      console.log(`[Dialogue API] Tools called: ${dialogueResponse.toolCalls.map(t => t.name).join(', ')}`);

      // Execute all tools and collect results
      const toolResults: ToolExecutionResult[] = [];
      for (const toolCall of dialogueResponse.toolCalls) {
        const result = await executeCalibrationTool(
          sessionId,
          toolCall.name,
          toolCall.input
        );
        toolResults.push(result);

        // Update session state based on tool results
        if (toolCall.name === 'check_calibration_status' || toolCall.name === 'get_stability_progress') {
          await prisma.calibrationSession.update({
            where: { id: calibrationSession.id },
            data: {
              stabilityScore: result.data.stability_score || null,
              stableFrameCount: result.data.stable_frame_count || 0,
            },
          });
        } else if (toolCall.name === 'finalize_calibration' && result.success) {
          await prisma.calibrationSession.update({
            where: { id: calibrationSession.id },
            data: {
              state: 'LOCKED',
              lockedScaleFactor: result.data.locked_scale_factor || null,
            },
          });
        } else if (toolCall.name === 'reset_calibration') {
          await prisma.calibrationSession.update({
            where: { id: calibrationSession.id },
            data: {
              state: 'INITIALIZING',
              stabilityScore: null,
              stableFrameCount: 0,
              lockedScaleFactor: null,
            },
          });
        }
      }

      // Continue dialogue with tool results to get final response
      const finalResponse = await continueDialogueWithToolResults(
        sessionId,
        conversationHistory,
        dialogueResponse.toolCalls,
        toolResults
      );

      finalMessage = finalResponse.message || dialogueResponse.message;
    }

    // Update conversation history
    conversationHistory.push({ role: 'user', content: message });
    if (finalMessage) {
      conversationHistory.push({ role: 'assistant', content: finalMessage });
    }

    // Update calibration session
    await prisma.calibrationSession.update({
      where: { id: calibrationSession.id },
      data: {
        conversationHistory: JSON.stringify(conversationHistory),
        updatedAt: new Date(),
      },
    });

    // Generate audio for response if message exists
    if (finalMessage) {
      try {
        const ttsResponse = await fetch(`${request.nextUrl.origin}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: finalMessage }),
        });

        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json();
          audioUrl = ttsData.audioUrl;
        } else {
          console.error('[Dialogue API] TTS generation failed:', await ttsResponse.text());
        }
      } catch (error) {
        console.error('[Dialogue API] TTS request failed:', error);
        // Continue without audio - not critical
      }
    }

    return NextResponse.json({
      message: finalMessage,
      audioUrl,
      toolCalls: dialogueResponse.toolCalls.map(t => ({
        name: t.name,
        input: t.input,
      })),
      sessionState: {
        state: calibrationSession.state,
        stabilityScore: calibrationSession.stabilityScore,
        stableFrameCount: calibrationSession.stableFrameCount,
        isLocked: calibrationSession.state === 'LOCKED',
      },
    });
  } catch (error) {
    console.error('[Dialogue API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
