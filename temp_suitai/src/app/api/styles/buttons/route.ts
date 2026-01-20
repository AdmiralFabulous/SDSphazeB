import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const buttons = await prisma.buttonOption.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      {
        data: buttons,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Button options endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
