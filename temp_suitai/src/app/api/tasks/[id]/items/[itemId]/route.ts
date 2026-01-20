import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateItemSchema = z.object({
  completed: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const body = await request.json();
    const validationResult = UpdateItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Verify the item belongs to the task
    const item = await prisma.deliveryItem.findUnique({
      where: { id: params.itemId },
    });

    if (!item || item.taskId !== params.id) {
      return NextResponse.json(
        { error: 'Item not found or does not belong to this task' },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.deliveryItem.update({
      where: { id: params.itemId },
      data: validationResult.data,
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('Update item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
