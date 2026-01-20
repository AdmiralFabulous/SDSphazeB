import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Validation schema for TTS input
const TTSInputSchema = z.object({
  text: z.string().min(1).max(500),
});

/**
 * POST /api/tts
 *
 * Generates text-to-speech audio using the Python voice service.
 * Returns a URL to the generated audio file.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = TTSInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { text } = validationResult.data;

    // Generate unique audio ID
    const audioId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const audioPath = path.join(process.cwd(), 'public', 'audio', `${audioId}.mp3`);

    // Ensure audio directory exists
    await fs.mkdir(path.dirname(audioPath), { recursive: true });

    // Call Python TTS synthesis script
    const pythonScript = path.join(
      process.cwd(),
      'vision_service',
      'dialogue',
      'synthesize_speech.py'
    );

    // Escape text for command line
    const escapedText = text.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');

    const command = `python "${pythonScript}" --text "${escapedText}" --output "${audioPath}"`;

    console.log('[TTS API] Executing:', command);

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 10000, // 10 second timeout
      });

      if (stderr) {
        console.error('[TTS API] Python stderr:', stderr);
      }

      console.log('[TTS API] Python stdout:', stdout);

      // Verify file was created
      try {
        await fs.access(audioPath);
      } catch {
        throw new Error('Audio file was not created');
      }

      const audioUrl = `/audio/${audioId}.mp3`;

      return NextResponse.json({
        audioUrl,
        audioId,
        text,
      });
    } catch (execError: any) {
      console.error('[TTS API] Python execution error:', execError);

      // Return mock response for development if voice service not available
      if (process.env.NODE_ENV === 'development') {
        console.warn('[TTS API] Voice service unavailable, returning mock audio URL');
        return NextResponse.json({
          audioUrl: '/audio/mock.mp3',
          audioId: 'mock',
          text,
          mock: true,
        });
      }

      throw execError;
    }
  } catch (error) {
    console.error('[TTS API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
