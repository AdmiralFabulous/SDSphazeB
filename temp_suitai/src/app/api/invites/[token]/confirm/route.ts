import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for confirm input
const ConfirmInputSchema = z.object({
  measurement_id: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = ConfirmInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { measurement_id } = validationResult.data;
    const token = params.token;

    // Find attendee by invite token with event details
    const attendee = await prisma.weddingAttendee.findUnique({
      where: { inviteToken: token },
      include: {
        event: {
          select: {
            organizerId: true,
            eventName: true,
          },
        },
      },
    });

    if (!attendee) {
      return NextResponse.json(
        { error: 'Invalid invite' },
        { status: 404 }
      );
    }

    // Verify measurement exists
    const measurement = await prisma.measurement.findUnique({
      where: { id: measurement_id },
      select: { id: true },
    });

    if (!measurement) {
      return NextResponse.json(
        { error: 'Invalid measurement_id' },
        { status: 400 }
      );
    }

    // Update attendee with measurement and status
    const updated = await prisma.weddingAttendee.update({
      where: { id: attendee.id },
      data: {
        status: 'submitted',
        measurementId: measurement_id,
        submittedAt: new Date(),
      },
    });

    // TODO: Send notification to organizer
    // await sendOrganizerNotification(attendee.event.organizerId, {
    //   type: 'measurement_submitted',
    //   event_name: attendee.event.eventName,
    //   attendee_id: attendee.id
    // });

    return NextResponse.json(
      {
        message: 'Measurements confirmed successfully',
        attendee: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Confirm endpoint error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
