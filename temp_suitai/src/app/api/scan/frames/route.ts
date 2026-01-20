import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for frame data submission
const FrameDataSchema = z.object({
  scanId: z.string().min(1, 'Scan ID is required'),
  frameNumber: z.number().int().min(0, 'Frame number must be non-negative'),
  userInFrame: z.boolean().describe('Whether a user was detected in the frame'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score for user detection (0.0-1.0)'),
  stabilityScore: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Stability score for measurements (0.0-1.0)'),
  iou: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('IoU prediction from SAM (0.0-1.0)'),
  isValid: z
    .boolean()
    .optional()
    .describe('Whether the frame is valid for measurement'),
});

export interface FrameSubmissionResponse {
  frameId: string;
  scanId: string;
  frameNumber: number;
  userInFrame: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = FrameDataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      scanId,
      frameNumber,
      userInFrame,
      confidence,
      stabilityScore = 0.0,
      iou,
      isValid = userInFrame && confidence > 0.5,
    } = validationResult.data;

    // Verify scan exists
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
    });

    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      );
    }

    // Create frame record
    const frame = await prisma.frame.create({
      data: {
        scanId,
        frameNumber,
        userInFrame,
        confidence,
        stabilityScore,
        iou,
        isValid,
      },
    });

    const response: FrameSubmissionResponse = {
      frameId: frame.id,
      scanId: frame.scanId,
      frameNumber: frame.frameNumber,
      userInFrame: frame.userInFrame,
      message: `Frame ${frameNumber} recorded successfully`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Frame submission endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
