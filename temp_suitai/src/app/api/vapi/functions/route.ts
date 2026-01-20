import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas for function parameters
const GetScanStatusSchema = z.object({
  scanId: z.string(),
  sessionId: z.string(),
});

const StartScanSchema = z.object({
  sessionId: z.string(),
  scanType: z.string().optional(),
});

const CompleteScanSchema = z.object({
  scanId: z.string(),
  result: z.record(z.any()).optional(),
  error: z.string().optional(),
});

// Vapi function handler types
interface VapiFunction {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

interface VapiFunctionCall {
  functionName: string;
  arguments: Record<string, any>;
}

interface VapiFunctionResult {
  name: string;
  result: any;
}

/**
 * GET /api/vapi/functions - Returns available function definitions
 * Vapi uses this to understand what functions it can call
 */
export async function GET() {
  const functions: VapiFunction[] = [
    {
      name: 'get_scan_status',
      description: 'Get the current status of a scan for a session',
      parameters: {
        type: 'object',
        properties: {
          scanId: {
            type: 'string',
            description: 'The unique identifier of the scan',
          },
          sessionId: {
            type: 'string',
            description: 'The session ID associated with the scan',
          },
        },
        required: ['scanId', 'sessionId'],
      },
    },
    {
      name: 'start_scan',
      description: 'Initiate a new scan for a session',
      parameters: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'The session ID to start a scan for',
          },
          scanType: {
            type: 'string',
            description: 'Type of scan to perform (e.g., full_body, posture)',
          },
        },
        required: ['sessionId'],
      },
    },
    {
      name: 'complete_scan',
      description: 'Mark a scan as complete and store results',
      parameters: {
        type: 'object',
        properties: {
          scanId: {
            type: 'string',
            description: 'The scan ID to complete',
          },
          result: {
            type: 'object',
            description: 'The scan results data',
          },
          error: {
            type: 'string',
            description: 'Error message if scan failed',
          },
        },
        required: ['scanId'],
      },
    },
  ];

  return NextResponse.json({ functions });
}

/**
 * POST /api/vapi/functions - Execute a function call from Vapi
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { function: functionCall } = body as { function: VapiFunctionCall };

    if (!functionCall || !functionCall.functionName) {
      return NextResponse.json(
        { error: 'Invalid function call format' },
        { status: 400 }
      );
    }

    let result: any;

    switch (functionCall.functionName) {
      case 'get_scan_status':
        result = await handleGetScanStatus(functionCall.arguments);
        break;

      case 'start_scan':
        result = await handleStartScan(functionCall.arguments);
        break;

      case 'complete_scan':
        result = await handleCompleteScan(functionCall.arguments);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown function: ${functionCall.functionName}` },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        name: functionCall.functionName,
        result,
      } as VapiFunctionResult,
      { status: 200 }
    );
  } catch (error) {
    console.error('Vapi functions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handler: get_scan_status
 * Retrieves the current status and details of a scan
 */
async function handleGetScanStatus(args: Record<string, any>) {
  const validation = GetScanStatusSchema.safeParse(args);

  if (!validation.success) {
    throw new Error(`Validation failed: ${JSON.stringify(validation.error.format())}`);
  }

  const { scanId, sessionId } = validation.data;

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    select: {
      id: true,
      sessionId: true,
      status: true,
      scanType: true,
      result: true,
      error: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!scan) {
    throw new Error(`Scan not found: ${scanId}`);
  }

  if (scan.sessionId !== sessionId) {
    throw new Error('Scan does not belong to the specified session');
  }

  // Parse result if it's JSON string
  const parsedResult = scan.result ? JSON.parse(scan.result) : null;

  return {
    scanId: scan.id,
    sessionId: scan.sessionId,
    status: scan.status,
    scanType: scan.scanType,
    result: parsedResult,
    error: scan.error,
    createdAt: scan.createdAt.toISOString(),
    updatedAt: scan.updatedAt.toISOString(),
  };
}

/**
 * Handler: start_scan
 * Initiates a new scan for a session
 */
async function handleStartScan(args: Record<string, any>) {
  const validation = StartScanSchema.safeParse(args);

  if (!validation.success) {
    throw new Error(`Validation failed: ${JSON.stringify(validation.error.format())}`);
  }

  const { sessionId, scanType } = validation.data;

  // Verify session exists
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  // Create new scan
  const scan = await prisma.scan.create({
    data: {
      sessionId,
      scanType: scanType || 'full_body',
      status: 'pending',
    },
    select: {
      id: true,
      sessionId: true,
      status: true,
      scanType: true,
      createdAt: true,
    },
  });

  return {
    scanId: scan.id,
    sessionId: scan.sessionId,
    status: scan.status,
    scanType: scan.scanType,
    message: 'Scan started successfully',
    createdAt: scan.createdAt.toISOString(),
  };
}

/**
 * Handler: complete_scan
 * Marks a scan as complete and stores the results
 */
async function handleCompleteScan(args: Record<string, any>) {
  const validation = CompleteScanSchema.safeParse(args);

  if (!validation.success) {
    throw new Error(`Validation failed: ${JSON.stringify(validation.error.format())}`);
  }

  const { scanId, result, error } = validation.data;

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
  });

  if (!scan) {
    throw new Error(`Scan not found: ${scanId}`);
  }

  // Update scan with completion data
  const updatedScan = await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: error ? 'failed' : 'completed',
      result: result ? JSON.stringify(result) : null,
      error: error || null,
    },
    select: {
      id: true,
      sessionId: true,
      status: true,
      scanType: true,
      updatedAt: true,
    },
  });

  return {
    scanId: updatedScan.id,
    sessionId: updatedScan.sessionId,
    status: updatedScan.status,
    message: `Scan ${error ? 'failed' : 'completed'} successfully`,
    updatedAt: updatedScan.updatedAt.toISOString(),
  };
}
