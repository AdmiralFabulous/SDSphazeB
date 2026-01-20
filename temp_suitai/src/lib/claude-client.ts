/**
 * Claude AI Client for Calibration Dialogue
 *
 * Provides conversational AI capabilities for guiding users through
 * the calibration process using Claude's function calling capabilities.
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface CalibrationToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
}

export interface CalibrationDialogueMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CalibrationDialogueResponse {
  message: string;
  toolCalls: CalibrationToolCall[];
  stopReason: string;
}

/**
 * Claude AI function tool definitions for calibration
 */
const CALIBRATION_TOOLS: Anthropic.Tool[] = [
  {
    name: 'check_calibration_status',
    description:
      'Get the current calibration status including stability metrics, frame count, and lock state. Use this to monitor progress and understand the current state.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'process_calibration_frame',
    description:
      'Process a new calibration measurement frame with scale factor from ArUco marker detection. Call this when new measurement data is available.',
    input_schema: {
      type: 'object',
      properties: {
        scale_factor: {
          type: 'number',
          description:
            'The scale factor measurement from ArUco detection (mm per pixel). Must be positive.',
        },
      },
      required: ['scale_factor'],
    },
  },
  {
    name: 'get_stability_progress',
    description:
      'Get progress toward calibration lock including frames remaining and percentage complete. Use this to provide user-friendly progress updates.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'finalize_calibration',
    description:
      'Finalize and lock the calibration once 30 stable frames are achieved. Returns the locked scale factor. Only call when calibration is complete.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reset_calibration',
    description:
      'Reset the calibration state to start over. Use this when the user wants to recalibrate or restart the process.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

/**
 * System prompt for calibration dialogue assistant
 */
const CALIBRATION_SYSTEM_PROMPT = `You are a friendly calibration assistant helping users calibrate their body measurement system using an ArUco calibration marker.

## Your Role
Guide users through the calibration process with clear, encouraging instructions. The process requires holding a calibration paper with an ArUco marker steady until 30 stable frames are captured.

## Calibration Process Overview
1. **Initialization**: Greet the user and explain the calibration process
2. **Marker Detection**: Instruct them to show the calibration paper to the camera
3. **Stabilization**: Guide them to hold steady while frames are captured (30 frames needed)
4. **Lock**: Confirm when calibration is complete and celebrate success

## Communication Style
- **Encouraging**: "Great! Keep holding steady..." / "You're doing awesome!"
- **Specific**: "You've captured 15 out of 30 stable frames" / "Just 5 more frames to go!"
- **Clear**: "Hold the calibration paper about 1 meter from the camera"
- **Patient**: If stability is lost, reassure them it's normal and guide them to try again
- **Concise**: Keep responses brief and actionable - this is voice dialogue

## Function Tool Usage
- Use check_calibration_status() to monitor progress at the start of conversation
- Call get_stability_progress() to provide percentage updates
- When user shows marker, process measurements with process_calibration_frame()
- Call finalize_calibration() once locked to get the final scale factor
- If user requests restart, use reset_calibration()

## Stability Guidance
If frames are unstable (tool reports is_stable: false or warnings):
- "Try holding the paper a bit steadier"
- "Make sure the marker is well-lit and fully visible"
- "Hold the paper at arm's length and keep it flat"
- "Avoid shadows on the marker"
- "Great effort! Let's try again - hold very steady this time"

## Example Dialogue Flow

User: "I'm ready to calibrate"
Assistant: [calls check_calibration_status()] "Perfect! Let's get you calibrated. Please hold the calibration paper in front of the camera at arm's length. Make sure the entire ArUco marker is visible and well-lit. I'll guide you through the process."

[User shows marker, system processes frames]
Assistant: [monitors via check_calibration_status()] "Excellent! I can see the marker. Now hold very steady... You're at 10 out of 30 frames. Keep it up!"

[Frame becomes unstable]
Assistant: "Oops, lost stability for a moment. No worries! Just hold steady again and we'll continue. Try to keep the paper as still as possible."

[Reaches 25/30]
Assistant: [calls get_stability_progress()] "You're almost there! 25 out of 30 frames. Just a few more seconds of steady holding..."

[Reaches 30/30]
Assistant: [calls finalize_calibration()] "Fantastic! Calibration complete! Your system is now calibrated with a scale factor of 0.543210 mm per pixel. You're ready for measurements!"

## Important Guidelines
- Always check status before responding to understand current state
- Provide frequent progress updates to keep user engaged
- Celebrate milestones (10 frames, 20 frames, completion)
- If user seems confused, re-explain the current step clearly
- Use natural, conversational language - you're a helpful voice assistant
- Keep responses to 2-3 sentences max for voice dialogue`;

/**
 * Tool result interface for function execution
 */
export interface ToolExecutionResult {
  success: boolean;
  data: Record<string, any>;
  message: string;
  warnings: string[];
}

/**
 * Run calibration dialogue with Claude AI
 *
 * @param sessionId - Unique session identifier
 * @param userMessage - User's message or system event
 * @param conversationHistory - Previous messages in conversation
 * @param toolExecutor - Function to execute tools and return results
 * @returns Dialogue response with assistant message and tool calls
 */
export async function runCalibrationDialogue(
  sessionId: string,
  userMessage: string,
  conversationHistory: CalibrationDialogueMessage[],
  toolExecutor: (toolName: string, toolInput: any) => Promise<ToolExecutionResult>
): Promise<CalibrationDialogueResponse> {
  // Build messages array from history
  const messages: Anthropic.MessageParam[] = [];

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage,
  });

  // Call Claude API with tools
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: CALIBRATION_SYSTEM_PROMPT,
    tools: CALIBRATION_TOOLS,
    messages,
  });

  let assistantMessage = '';
  const toolCalls: CalibrationToolCall[] = [];

  // Process response content blocks
  for (const block of response.content) {
    if (block.type === 'text') {
      assistantMessage += block.text;
    } else if (block.type === 'tool_use') {
      // Record tool call
      toolCalls.push({
        id: block.id,
        name: block.name,
        input: block.input as Record<string, any>,
      });

      // Execute tool
      try {
        const toolResult = await toolExecutor(block.name, block.input);
        console.log(`[Claude Client] Tool ${block.name} executed:`, toolResult);
      } catch (error) {
        console.error(`[Claude Client] Tool ${block.name} failed:`, error);
      }
    }
  }

  return {
    message: assistantMessage.trim(),
    toolCalls,
    stopReason: response.stop_reason,
  };
}

/**
 * Process tool result and continue conversation if needed
 *
 * This handles the case where Claude makes tool calls and we need to
 * feed the results back for a final response.
 *
 * @param sessionId - Session identifier
 * @param conversationHistory - Conversation history
 * @param toolCalls - Tool calls from previous response
 * @param toolResults - Execution results for each tool call
 * @returns Final dialogue response after processing tool results
 */
export async function continueDialogueWithToolResults(
  sessionId: string,
  conversationHistory: CalibrationDialogueMessage[],
  toolCalls: CalibrationToolCall[],
  toolResults: ToolExecutionResult[]
): Promise<CalibrationDialogueResponse> {
  // Build messages array
  const messages: Anthropic.MessageParam[] = [];

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  // Add tool use blocks and results
  const toolContent: Anthropic.ToolUseBlock[] = toolCalls.map((call) => ({
    type: 'tool_use' as const,
    id: call.id,
    name: call.name,
    input: call.input,
  }));

  const toolResultContent: Anthropic.ToolResultBlockParam[] = toolCalls.map((call, idx) => ({
    type: 'tool_result' as const,
    tool_use_id: call.id,
    content: JSON.stringify(toolResults[idx]),
  }));

  // Add assistant message with tool uses
  messages.push({
    role: 'assistant',
    content: toolContent,
  });

  // Add user message with tool results
  messages.push({
    role: 'user',
    content: toolResultContent,
  });

  // Get final response from Claude
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: CALIBRATION_SYSTEM_PROMPT,
    tools: CALIBRATION_TOOLS,
    messages,
  });

  let assistantMessage = '';

  for (const block of response.content) {
    if (block.type === 'text') {
      assistantMessage += block.text;
    }
  }

  return {
    message: assistantMessage.trim(),
    toolCalls: [],
    stopReason: response.stop_reason,
  };
}
