import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for session update
const SessionUpdateSchema = z.object({
  device_fingerprint: z.string().optional(),
  extend_expiry: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // Validate CUID format (basic check)
    if (!sessionId || sessionId.length < 20) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    // Fetch session with related data
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        measurements: true,
        suitConfigs: {
          include: {
            fabric: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 410 }
      );
    }

    // Update last_active_at
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastActiveAt: new Date() },
    });

    // Transform the response to match the API contract
    const response = {
      id: session.id,
      user_id: session.userId,
      created_at: session.createdAt.toISOString(),
      expires_at: session.expiresAt.toISOString(),
      last_active_at: new Date().toISOString(),
      measurements: session.measurements.map((m) => ({
        id: m.id,
        chest_circumference: m.chestCircumference,
        waist_circumference: m.waistCircumference,
        hip_circumference: m.hipCircumference,
        shoulder_width: m.shoulderWidth,
        sleeve_length: m.sleeveLength,
        inseam: m.inseam,
        created_at: m.createdAt.toISOString(),
        updated_at: m.updatedAt.toISOString(),
      })),
      suit_configs: session.suitConfigs.map((sc) => ({
        id: sc.id,
        fabric: sc.fabric
          ? {
              id: sc.fabric.id,
              name: sc.fabric.name,
              code: sc.fabric.code,
              description: sc.fabric.description,
              price: sc.fabric.price,
            }
          : null,
        style_json: JSON.parse(sc.styleJson),
        created_at: sc.createdAt.toISOString(),
        updated_at: sc.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Session GET endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = SessionUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { device_fingerprint, extend_expiry } = validationResult.data;

    // Build update data object
    const updateData: Record<string, any> = {
      lastActiveAt: new Date(),
    };

    if (device_fingerprint !== undefined) {
      updateData.deviceFingerprint = device_fingerprint;
    }

    if (extend_expiry) {
      // Extend by 30 days from now
      updateData.expiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );
    }

    // Update the session
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json(session);
  } catch (error: any) {
    // Handle Prisma "Record not found" error
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.error('Session PUT endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
