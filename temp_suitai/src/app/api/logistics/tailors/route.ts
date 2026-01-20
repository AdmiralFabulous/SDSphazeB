import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating/updating a tailor
const TailorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  workshopAddress: z.string().optional(),
  workshopCoords: z.string().optional(),
  zoneId: z.string().optional(),
  maxConcurrentJobs: z.number().int().min(1).default(2),
  skillLevel: z.enum(['junior', 'senior', 'master']).default('senior'),
  qcPassRate: z.number().min(0).max(1).default(0.95),
  avgProductionMinutes: z.number().int().min(1).default(300),
  upiVpa: z.string().optional(),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/logistics/tailors
 * List all tailors with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');
    const isActive = searchParams.get('isActive');
    const skillLevel = searchParams.get('skillLevel');
    const available = searchParams.get('available'); // Only tailors with capacity

    const where: any = {};

    if (zoneId) where.zoneId = zoneId;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (skillLevel) where.skillLevel = skillLevel;
    if (available === 'true') {
      where.currentJobCount = { lt: prisma.tailor.fields.maxConcurrentJobs };
    }

    const tailors = await prisma.tailor.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { qcPassRate: 'desc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: {
            primaryAssignments: true,
            backupAssignments: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: tailors,
      count: tailors.length,
    });
  } catch (error) {
    console.error('Tailors GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/logistics/tailors
 * Create a new tailor
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = TailorSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const tailor = await prisma.tailor.create({
      data: validationResult.data,
    });

    return NextResponse.json(tailor, { status: 201 });
  } catch (error) {
    console.error('Tailors POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
