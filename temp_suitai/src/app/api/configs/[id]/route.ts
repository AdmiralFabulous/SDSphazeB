import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = params.id;

    // Check if config exists
    const config = await prisma.suitConfig.findUnique({
      where: { id: configId },
      select: {
        isTemplate: true,
        templateLockedAt: true,
      },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Check if locked template
    if (config.isTemplate && config.templateLockedAt) {
      return NextResponse.json(
        { error: 'Cannot delete locked template' },
        { status: 403 }
      );
    }

    // Check if linked to any orders
    const orderItemCount = await prisma.orderItem.count({
      where: { suitConfigId: configId },
    });

    if (orderItemCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete configuration linked to orders' },
        { status: 403 }
      );
    }

    // Delete the configuration
    await prisma.suitConfig.delete({
      where: { id: configId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete config endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
