import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating wedding events
const CreateEventSchema = z.object({
  event_name: z.string().min(1, 'Event name is required'),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD'),
  venue_name: z.string().optional(),
  venue_location: z.string().optional(),
  measurement_deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD').optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateEventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { event_name, event_date, venue_name, venue_location, measurement_deadline } = validationResult.data;

    // Validate date is at least 4 weeks in future
    const eventDate = new Date(event_date);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 28);

    if (eventDate < minDate) {
      return NextResponse.json(
        { error: 'Event date must be at least 4 weeks in the future' },
        { status: 400 }
      );
    }

    // Set default measurement deadline (2 weeks before event)
    const deadlineDate = measurement_deadline
      ? new Date(measurement_deadline)
      : new Date(eventDate.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get authenticated user from session/headers
    // For now, using a placeholder until authentication is implemented
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Create user if doesn't exist (for development/testing)
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `user-${userId}@example.com`,
        },
      });
    }

    // Create event
    const event = await prisma.weddingEvent.create({
      data: {
        organizerId: userId,
        eventName: event_name,
        eventDate: eventDate,
        venueName: venue_name,
        venueLocation: venue_location,
        measurementDeadline: deadlineDate,
        status: 'draft',
      },
    });

    return NextResponse.json(
      {
        id: event.id,
        organizer_id: event.organizerId,
        event_name: event.eventName,
        event_date: event.eventDate.toISOString().split('T')[0],
        venue_name: event.venueName,
        venue_location: event.venueLocation,
        measurement_deadline: event.measurementDeadline.toISOString().split('T')[0],
        status: event.status,
        created_at: event.createdAt.toISOString(),
        updated_at: event.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Wedding event creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
