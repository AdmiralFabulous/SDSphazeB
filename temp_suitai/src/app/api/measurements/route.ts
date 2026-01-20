import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for SMPL-X beta parameters (10D shape vector)
const BetaSchema = z.array(z.number()).length(10);

// Validation schema for SMPL-X theta parameters (72D pose vector: 24 joints × 3 axis-angle)
const ThetaSchema = z.array(z.number()).length(72);

// Validation schema for global rotation (3×3 rotation matrix = 9 values)
const GlobalRotationSchema = z.array(z.number()).length(9).optional();

// Validation schema for global translation (3D vector)
const GlobalTranslationSchema = z.array(z.number()).length(3).optional();

// Validation schema for measurements input
const MeasurementsInputSchema = z.object({
  sessionId: z.string(),
  // 28 measurements: 12 lengths/widths + 16 circumferences
  measurements: z.array(z.number()).length(28),
  confidence: z.number().min(0).max(1).optional().default(1.0),
  // SMPL-X beta parameters for re-optimization
  smplBeta: BetaSchema,
  // SMPL-X pose parameters for re-optimization
  smplTheta: ThetaSchema,
  // Optional global transformation parameters
  smplGlobalRotation: GlobalRotationSchema,
  smplGlobalTranslation: GlobalTranslationSchema,
  // Confidence metrics
  poseConfidence: z.number().min(0).max(1).optional().default(1.0),
  shapeConfidence: z.number().min(0).max(1).optional().default(1.0),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = MeasurementsInputSchema.safeParse(body);

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
      sessionId,
      measurements,
      confidence,
      smplBeta,
      smplTheta,
      smplGlobalRotation,
      smplGlobalTranslation,
      poseConfidence,
      shapeConfidence,
    } = validationResult.data;

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Create measurement record with SMPL parameters
    const measurement = await prisma.measurement.create({
      data: {
        sessionId,
        measurementData: JSON.stringify(measurements),
        confidence,
        smplParameters: {
          create: {
            beta: JSON.stringify(smplBeta),
            theta: JSON.stringify(smplTheta),
            globalRotation: smplGlobalRotation ? JSON.stringify(smplGlobalRotation) : null,
            globalTranslation: smplGlobalTranslation ? JSON.stringify(smplGlobalTranslation) : null,
            poseConfidence,
            shapeConfidence,
          },
        },
      },
      include: {
        smplParameters: true,
      },
    });

    return NextResponse.json(
      {
        measurementId: measurement.id,
        sessionId: measurement.sessionId,
        measurementCount: measurements.length,
        timestamp: measurement.timestamp,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Measurements endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
