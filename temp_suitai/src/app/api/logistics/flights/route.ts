import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating/updating a flight
const FlightSchema = z.object({
  flightNumber: z.string().optional(),
  aircraftType: z.string().default('Saab340F'),
  departureAirport: z.string().default('ATQ'),
  arrivalAirport: z.string().default('DXB'),
  scheduledDeparture: z.string().transform(s => new Date(s)),
  actualDeparture: z.string().transform(s => new Date(s)).optional(),
  status: z.enum(['SCHEDULED', 'LOADING', 'IN_FLIGHT', 'LANDED', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  costGbp: z.number().optional(),
  suitsOnBoard: z.number().int().min(0).default(0),
  manifestUrl: z.string().url().optional(),
});

/**
 * GET /api/logistics/flights
 * List all flights with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = {};

    if (status) where.status = status;
    if (fromDate || toDate) {
      where.scheduledDeparture = {};
      if (fromDate) where.scheduledDeparture.gte = new Date(fromDate);
      if (toDate) where.scheduledDeparture.lte = new Date(toDate);
    }

    const flights = await prisma.flight.findMany({
      where,
      orderBy: { scheduledDeparture: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json({
      data: flights,
      count: flights.length,
    });
  } catch (error) {
    console.error('Flights GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/logistics/flights
 * Create a new flight
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = FlightSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const flight = await prisma.flight.create({
      data: validationResult.data,
    });

    return NextResponse.json(flight, { status: 201 });
  } catch (error) {
    console.error('Flights POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
