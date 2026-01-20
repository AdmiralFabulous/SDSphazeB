/**
 * Measurement Export API Endpoint
 *
 * POST /api/sessions/{id}/export?format=optitex|csv|json
 *
 * Exports measurement data in the specified format
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { exportMeasurements, generateExportFilename } from '@/lib/export/measurement_export';
import type { ExportFormat, MeasurementData } from '@/lib/export/types';

// Validation schema for export request
const ExportRequestSchema = z.object({
  format: z.enum(['optitex', 'csv', 'json']).default('optitex'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const formatParam = searchParams.get('format') || 'optitex';

    // Validate format parameter
    const validation = ExportRequestSchema.safeParse({ format: formatParam });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid export format',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { format } = validation.data as { format: ExportFormat };

    // Fetch session data
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // TODO: Fetch actual measurements from the vision service or database
    // For now, create a mock measurement data structure
    // In production, this would query the measurements table and include actual values
    const measurementData: MeasurementData = {
      sessionId: sessionId,
      universalMeasurementId: session.universalMeasurementId || undefined,
      measurements: getMockMeasurements(),
      confidence: session.measurementConfidence || 0.95,
      timestamp: new Date().toISOString(),
    };

    // Generate export content
    const content = exportMeasurements(measurementData, format);
    const filename = generateExportFilename(format, measurementData.universalMeasurementId);

    // Determine content type
    const contentTypes = {
      optitex: 'text/plain; charset=utf-8',
      csv: 'text/csv; charset=utf-8',
      json: 'application/json; charset=utf-8',
    };

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentTypes[format],
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(content, 'utf-8').toString(),
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export measurements',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Mock measurements for demonstration
 * In production, these would come from actual measurement calculations
 */
function getMockMeasurements(): Record<string, number> {
  return {
    // Head & Neck
    head_circumference: 57.5,
    neck_circumference: 38.2,
    head_length: 23.1,
    head_width: 15.8,

    // Torso & Chest
    shoulder_circumference: 112.5,
    chest_circumference: 98.6,
    waist_circumference: 82.3,
    hip_circumference: 95.4,
    shoulder_width: 41.2,
    torso_length: 58.9,

    // Arms & Hands
    left_arm_circumference: 28.5,
    right_arm_circumference: 28.7,
    left_wrist_circumference: 18.1,
    right_wrist_circumference: 18.3,
    arm_length: 72.4,

    // Legs & Feet
    left_thigh_circumference: 54.2,
    right_thigh_circumference: 54.5,
    left_calf_circumference: 38.6,
    right_calf_circumference: 38.8,
    left_ankle_circumference: 23.4,
    right_ankle_circumference: 23.6,
    leg_length: 98.2,
  };
}

/**
 * GET endpoint to retrieve export metadata
 * Returns available formats and examples
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: sessionId,
      availableFormats: ['optitex', 'csv', 'json'],
      descriptions: {
        optitex: 'Tab-separated values format for Optitex fashion CAD software',
        csv: 'Comma-separated values format for spreadsheet applications',
        json: 'JSON format for API integration and programmatic access',
      },
      examples: {
        optitexUrl: `/api/sessions/${sessionId}/export?format=optitex`,
        csvUrl: `/api/sessions/${sessionId}/export?format=csv`,
        jsonUrl: `/api/sessions/${sessionId}/export?format=json`,
      },
    });
  } catch (error) {
    console.error('Get export metadata error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve export metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
