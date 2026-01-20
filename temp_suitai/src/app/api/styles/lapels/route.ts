import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const lapels = await prisma.lapelStyle.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      {
        data: lapels,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lapel styles endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
