import Anthropic from '@anthropic-ai/sdk';

// Tool definition for get_scan_status
const getScanStatusTool: Anthropic.Tool = {
  name: 'get_scan_status',
  description: 'Retrieves the current status of a body scan session, including whether the scan is locked (complete), progress percentage, frame count, and confidence scores.',
  input_schema: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'The unique identifier for the scan session',
      },
    },
    required: ['sessionId'],
  },
};

// Interface for scan status
export interface ScanStatus {
  sessionId: string;
  isLocked: boolean;
  progress: number;
  stableFrameCount: number;
  confidence: number;
  universalMeasurementId: string | null;
  updatedAt: Date;
}

// Function to fetch scan status from API
async function fetchScanStatus(sessionId: string): Promise<ScanStatus> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/sessions/${sessionId}/scan-status`);

  if (!response.ok) {
    throw new Error(`Failed to fetch scan status: ${response.statusText}`);
  }

  return await response.json();
}

// Handle tool calls from Claude
async function handleToolCall(
  toolName: string,
  toolInput: Record<string, any>
): Promise<string> {
  if (toolName === 'get_scan_status') {
    const sessionId = toolInput.sessionId as string;
    const status = await fetchScanStatus(sessionId);

    return JSON.stringify({
      isLocked: status.isLocked,
      progress: Math.round(status.progress * 100),
      stableFrameCount: status.stableFrameCount,
      confidence: Math.round(status.confidence * 100),
      universalMeasurementId: status.universalMeasurementId,
      message: status.isLocked
        ? 'Scan is complete and locked!'
        : `Scan in progress: ${Math.round(status.progress * 100)}% complete`,
    });
  }

  throw new Error(`Unknown tool: ${toolName}`);
}

// Main function to announce scan completion
export async function announceScanCompletion(sessionId: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const client = new Anthropic({ apiKey });

  // Initial message to Claude
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Please check the scan status for session "${sessionId}" and let me know if it's complete. If the scan is complete (locked), celebrate the completion with an enthusiastic announcement!`,
    },
  ];

  // Agentic loop - Claude will use tools until done
  let response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    tools: [getScanStatusTool],
    messages,
  });

  // Process tool calls in a loop
  while (response.stop_reason === 'tool_use') {
    // Find the tool use block
    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (!toolUseBlock) break;

    // Execute the tool
    const toolResult = await handleToolCall(
      toolUseBlock.name,
      toolUseBlock.input as Record<string, any>
    );

    // Add assistant's response to messages
    messages.push({
      role: 'assistant',
      content: response.content,
    });

    // Add tool result to messages
    messages.push({
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: toolUseBlock.id,
          content: toolResult,
        },
      ],
    });

    // Continue the conversation
    response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      tools: [getScanStatusTool],
      messages,
    });
  }

  // Extract final text response
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  return textBlock?.text || 'Scan status checked.';
}

// Export for testing
export { getScanStatusTool, handleToolCall, fetchScanStatus };
