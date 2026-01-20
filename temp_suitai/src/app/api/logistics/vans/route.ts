import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating/updating a van
const VanSchema = z.object({
  licensePlate: z.string().min(1, 'License plate is required'),
  driverName: z.string().min(1, 'Driver name is required'),
  driverPhone: z.string().min(1, 'Driver phone is required'),
  currentCoords: z.string().optional(),
  capacity: z.number().int().min(1).default(20),
  currentLoad: z.number().int().min(0).default(0),
  status: z.enum(['AVAILABLE', 'EN_ROUTE', 'DELIVERING', 'RETURNING', 'OFFLINE']).default('AVAILABLE'),
});

/**
 * GET /api/logistics/vans
 * List all vans with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const available = searchParams.get('available'); // Only vans with capacity

    const where: any = {};

    if (status) where.status = status;
    if (available === 'true') {
      where.status = 'AVAILABLE';
      where.currentLoad = { lt: prisma.van.fields.capacity };
    }

    const vans = await prisma.van.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { currentLoad: 'asc' },
      ],
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    return NextResponse.json({
      data: vans,
      count: vans.length,
    });
  } catch (error) {
    console.error('Vans GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/logistics/vans
 * Create a new van
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = VanSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const van = await prisma.van.create({
      data: validationResult.data,
    });

    return NextResponse.json(van, { status: 201 });
  } catch (error: any) {
    console.error('Vans POST error:', error);

    // Handle unique constraint violation for license plate
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A van with this license plate already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
