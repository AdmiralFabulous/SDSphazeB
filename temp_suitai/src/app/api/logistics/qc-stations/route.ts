import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating/updating a QC station
const QcStationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  coords: z.string().optional(),
  zoneId: z.string().optional(),
  capacity: z.number().int().min(1).default(50),
  currentLoad: z.number().int().min(0).default(0),
  avgProcessingMinutes: z.number().int().min(1).default(15),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/logistics/qc-stations
 * List all QC stations with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');
    const isActive = searchParams.get('isActive');
    const available = searchParams.get('available'); // Only stations with capacity

    const where: any = {};

    if (zoneId) where.zoneId = zoneId;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (available === 'true') {
      where.isActive = true;
      where.currentLoad = { lt: prisma.qcStation.fields.capacity };
    }

    const stations = await prisma.qcStation.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { currentLoad: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      data: stations,
      count: stations.length,
    });
  } catch (error) {
    console.error('QC Stations GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/logistics/qc-stations
 * Create a new QC station
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = QcStationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const station = await prisma.qcStation.create({
      data: validationResult.data,
    });

    return NextResponse.json(station, { status: 201 });
  } catch (error) {
    console.error('QC Stations POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
