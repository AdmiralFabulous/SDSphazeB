import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for tailor assignment request
const AssignTailorsSchema = z.object({
  orderItemId: z.string().min(1, 'Order item ID is required'),
  zoneId: z.string().optional(), // Optional zone filter
  maxDistance: z.number().optional(), // Max distance to QC in minutes
});

interface TailorScore {
  tailor: any;
  score: number;
  factors: {
    qcPassRate: number;
    loadFactor: number;
    skillBonus: number;
  };
}

/**
 * POST /api/logistics/assign-tailors
 * Assign primary and backup tailors to an order item using dual-production model
 *
 * Algorithm:
 * 1. Find available tailors (currentJobCount < maxConcurrentJobs)
 * 2. Score by: QC pass rate (40%), available capacity (40%), skill level (20%)
 * 3. Assign top 2 as primary and backup
 * 4. Update orderItem with tailor assignments
 * 5. Create timeline entry for audit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = AssignTailorsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { orderItemId, zoneId, maxDistance } = validationResult.data;

    // Get the order item with suit config details
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
        suitConfig: true,
        primaryTailor: true,
        backupTailor: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      );
    }

    // Check if tailors are already assigned
    if (orderItem.primaryTailorId && orderItem.backupTailorId) {
      return NextResponse.json(
        {
          error: 'Tailors already assigned',
          primaryTailor: orderItem.primaryTailor,
          backupTailor: orderItem.backupTailor,
        },
        { status: 409 }
      );
    }

    // Build query for available tailors
    const tailorWhere: any = {
      isActive: true,
      // Only tailors with capacity
      currentJobCount: {
        lt: prisma.raw('maxConcurrentJobs'),
      },
    };

    if (zoneId) {
      tailorWhere.zoneId = zoneId;
    }

    // Find available tailors
    const availableTailors = await prisma.tailor.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { qcPassRate: 'desc' },
        { currentJobCount: 'asc' },
      ],
    });

    // Filter to only tailors with capacity
    const tailorsWithCapacity = availableTailors.filter(
      t => t.currentJobCount < t.maxConcurrentJobs
    );

    if (tailorsWithCapacity.length < 2) {
      return NextResponse.json(
        {
          error: 'Insufficient tailors available',
          availableCount: tailorsWithCapacity.length,
          required: 2,
        },
        { status: 503 }
      );
    }

    // Score tailors
    const scoredTailors: TailorScore[] = tailorsWithCapacity.map(tailor => {
      // QC pass rate factor (0-40 points)
      const qcPassRate = tailor.qcPassRate * 40;

      // Load factor - prefer tailors with more capacity (0-40 points)
      const capacityRatio = 1 - (tailor.currentJobCount / tailor.maxConcurrentJobs);
      const loadFactor = capacityRatio * 40;

      // Skill bonus (0-20 points)
      const skillBonus = tailor.skillLevel === 'master' ? 20 :
                        tailor.skillLevel === 'senior' ? 15 : 10;

      const totalScore = qcPassRate + loadFactor + skillBonus;

      return {
        tailor,
        score: totalScore,
        factors: {
          qcPassRate,
          loadFactor,
          skillBonus,
        },
      };
    });

    // Sort by score descending
    scoredTailors.sort((a, b) => b.score - a.score);

    // Select top 2
    const primaryTailor = scoredTailors[0].tailor;
    const backupTailor = scoredTailors[1].tailor;

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order item with tailor assignments
      const updatedOrderItem = await tx.orderItem.update({
        where: { id: orderItemId },
        data: {
          primaryTailorId: primaryTailor.id,
          backupTailorId: backupTailor.id,
        },
        include: {
          primaryTailor: true,
          backupTailor: true,
        },
      });

      // Increment job counts for both tailors
      await tx.tailor.update({
        where: { id: primaryTailor.id },
        data: { currentJobCount: { increment: 1 } },
      });

      await tx.tailor.update({
        where: { id: backupTailor.id },
        data: { currentJobCount: { increment: 1 } },
      });

      // Create timeline entry
      await tx.suitTimeline.create({
        data: {
          orderItemId: orderItemId,
          fromState: orderItem.currentState || 'S09_DELIVERED_TO_RAJA',
          toState: 'TAILORS_ASSIGNED',
          changedBy: 'system',
          notes: `Primary: ${primaryTailor.name}, Backup: ${backupTailor.name}`,
        },
      });

      return updatedOrderItem;
    });

    return NextResponse.json({
      success: true,
      orderItemId: orderItemId,
      primaryTailor: {
        id: primaryTailor.id,
        name: primaryTailor.name,
        phone: primaryTailor.phone,
        skillLevel: primaryTailor.skillLevel,
        qcPassRate: primaryTailor.qcPassRate,
        score: scoredTailors[0].score,
        factors: scoredTailors[0].factors,
      },
      backupTailor: {
        id: backupTailor.id,
        name: backupTailor.name,
        phone: backupTailor.phone,
        skillLevel: backupTailor.skillLevel,
        qcPassRate: backupTailor.qcPassRate,
        score: scoredTailors[1].score,
        factors: scoredTailors[1].factors,
      },
      message: 'Dual tailor assignment complete. Both tailors will work in parallel.',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Assign tailors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/logistics/assign-tailors
 * Get assignment recommendations without actually assigning
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderItemId = searchParams.get('orderItemId');
    const limit = parseInt(searchParams.get('limit') || '5');

    // Find available tailors
    const availableTailors = await prisma.tailor.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { qcPassRate: 'desc' },
        { currentJobCount: 'asc' },
      ],
      take: limit * 2, // Get more to filter
    });

    // Filter to only tailors with capacity
    const tailorsWithCapacity = availableTailors.filter(
      t => t.currentJobCount < t.maxConcurrentJobs
    ).slice(0, limit);

    return NextResponse.json({
      recommendations: tailorsWithCapacity.map((tailor, idx) => ({
        rank: idx + 1,
        id: tailor.id,
        name: tailor.name,
        skillLevel: tailor.skillLevel,
        qcPassRate: tailor.qcPassRate,
        availableSlots: tailor.maxConcurrentJobs - tailor.currentJobCount,
        zoneId: tailor.zoneId,
      })),
      totalAvailable: tailorsWithCapacity.length,
    });

  } catch (error) {
    console.error('Get tailor recommendations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
