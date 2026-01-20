import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vents = await prisma.ventStyle.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      {
        data: vents,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Vent styles endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
