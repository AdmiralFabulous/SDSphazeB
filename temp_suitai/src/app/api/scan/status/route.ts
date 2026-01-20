import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for scan status query parameters
const ScanStatusQuerySchema = z.object({
  scanId: z.string().min(1),
  sessionId: z.string().min(1).optional(),
});

// Response type for telemetry data
interface ScanTelemetryData {
  scanId: string;
  sessionId: string;
  status: string;
  frameCount: number;
  stableFrameCount: number;
  stabilityScore: number;
  measurementLocked: boolean;
  universalMeasurementId: string | null;
  measurementConfidence: number;
  meanStabilityScore: number;
  variance: number;
  outlierCount: number;
  kalmanCovariance: number;
  meshesInBuffer: number;
  detectedRegions: string[];
  scanDurationMs: number;
  fps: number;
  warnings: string[];
  metadata: Record<string, unknown>;
  startedAt: string;
  completedAt: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = {
      scanId: searchParams.get('scanId') ?? '',
      sessionId: searchParams.get('sessionId') ?? undefined,
    };

    // Validate query parameters
    const validationResult = ScanStatusQuerySchema.safeParse(queryData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { scanId, sessionId } = validationResult.data;

    // Fetch scan with telemetry data
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: { telemetry: true, session: true },
    });

    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      );
    }

    // Verify sessionId matches if provided
    if (sessionId && scan.sessionId !== sessionId) {
      return NextResponse.json(
        { error: 'Session ID does not match scan' },
        { status: 403 }
      );
    }

    // Parse JSON fields from telemetry
    const detectedRegions = scan.telemetry
      ? JSON.parse(scan.telemetry.detectedRegions || '[]')
      : [];
    const warnings = scan.telemetry
      ? JSON.parse(scan.telemetry.warnings || '[]')
      : [];
    const metadata = scan.telemetry
      ? JSON.parse(scan.telemetry.metadata || '{}')
      : {};

    // Build response with telemetry data
    const telemetryData: ScanTelemetryData = {
      scanId: scan.id,
      sessionId: scan.sessionId,
      status: scan.status,
      frameCount: scan.telemetry?.frameCount ?? 0,
      stableFrameCount: scan.telemetry?.stableFrameCount ?? 0,
      stabilityScore: scan.telemetry?.stabilityScore ?? 0.0,
      measurementLocked: scan.telemetry?.measurementLocked ?? false,
      universalMeasurementId: scan.telemetry?.universalMeasurementId ?? null,
      measurementConfidence: scan.telemetry?.measurementConfidence ?? 0.0,
      meanStabilityScore: scan.telemetry?.meanStabilityScore ?? 0.0,
      variance: scan.telemetry?.variance ?? 0.0,
      outlierCount: scan.telemetry?.outlierCount ?? 0,
      kalmanCovariance: scan.telemetry?.kalmanCovariance ?? 0.0,
      meshesInBuffer: scan.telemetry?.meshesInBuffer ?? 0,
      detectedRegions,
      scanDurationMs: scan.telemetry?.scanDurationMs ?? 0,
      fps: scan.telemetry?.fps ?? 0.0,
      warnings,
      metadata,
      startedAt: scan.startedAt.toISOString(),
      completedAt: scan.completedAt?.toISOString() ?? null,
    };

    return NextResponse.json(
      {
        scanId: scan.id,
        sessionId: scan.sessionId,
        telemetry: telemetryData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Scan status endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
