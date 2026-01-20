import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const FabricFilterSchema = z.object({
  category: z.string().optional(),
  inStock: z.enum(['true', 'false']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const inStock = searchParams.get('inStock');

    const validationResult = FabricFilterSchema.safeParse({
      category: category || undefined,
      inStock: inStock || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid filter parameters',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { category: categoryFilter, inStock: inStockFilter } = validationResult.data;

    const where: any = {};

    if (categoryFilter) {
      where.category = categoryFilter;
    }

    if (inStockFilter !== undefined) {
      where.inStock = inStockFilter === 'true';
    }

    const fabrics = await prisma.fabric.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ fabrics }, { status: 200 });
  } catch (error) {
    console.error('Error fetching fabrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fabrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const FabricSchema = z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      imageUrl: z.string().url().optional(),
      inStock: z.boolean().optional(),
    });

    const validationResult = FabricSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const fabric = await prisma.fabric.create({
      data: {
        ...validationResult.data,
        inStock: validationResult.data.inStock ?? true,
      },
    });

    return NextResponse.json({ fabric }, { status: 201 });
  } catch (error) {
    console.error('Error creating fabric:', error);
    return NextResponse.json(
      { error: 'Failed to create fabric' },
      { status: 500 }
    );
  }
}
