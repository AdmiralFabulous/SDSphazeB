import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Validation constants
const MIN_HEIGHT = 100; // cm
const MAX_HEIGHT = 250; // cm

interface HeightRequest {
  height?: unknown;
}

interface HeightResponse {
  sessionId: string;
  height: number;
}

interface ErrorResponse {
  error: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<HeightResponse | ErrorResponse>> {
  try {
    const { id: sessionId } = await params;

    // Validate session ID format
    if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      );
    }

    // Parse request body
    let body: HeightRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate height exists
    if (body.height === undefined || body.height === null) {
      return NextResponse.json(
        { error: "Height is required" },
        { status: 400 }
      );
    }

    // Validate height is a number
    const height = typeof body.height === "number" ? body.height : parseFloat(String(body.height));
    if (isNaN(height)) {
      return NextResponse.json(
        { error: "Height must be a valid number" },
        { status: 400 }
      );
    }

    // Validate height range
    if (height < MIN_HEIGHT || height > MAX_HEIGHT) {
      return NextResponse.json(
        {
          error: `Height must be between ${MIN_HEIGHT}cm and ${MAX_HEIGHT}cm`,
        },
        { status: 400 }
      );
    }

    // Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Update session with height
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { height: Math.round(height) },
    });

    return NextResponse.json(
      {
        sessionId: updatedSession.id,
        height: updatedSession.height || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating session height:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
