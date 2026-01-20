import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for orders
const OrderQuerySchema = z.object({
  status: z.string().nullish().transform(val => val ?? undefined),
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryResult = OrderQuerySchema.safeParse({
      status: searchParams.get('status') || undefined,
      skip: searchParams.get('skip') || 0,
      take: searchParams.get('take') || 10,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: queryResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { status, skip, take } = queryResult.data;

    // Build where clause based on filters
    const whereClause = status ? { status: status as any } : {};

    // Fetch orders with items
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      prisma.order.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json(
      {
        orders,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Orders list endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
