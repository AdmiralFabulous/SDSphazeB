/**
 * Vapi Client Initialization and Management
 * Handles voice conversation with GPT-4o powered assistant
 */

import { vapiAssistantConfig, validateLLMConfig, gpt4oConfig } from './vapi-llm-config';

/**
 * Initialize Vapi client with GPT-4o configuration
 */
export function initializeVapi() {
  const apiKey = process.env.VAPI_API_KEY;
  const assistantId = process.env.VAPI_ASSISTANT_ID;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Validate environment variables
  if (!apiKey) {
    throw new Error('VAPI_API_KEY is not configured in environment variables');
  }

  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY is not configured for GPT-4o');
  }

  // Validate LLM configuration
  validateLLMConfig(gpt4oConfig);

  return {
    apiKey,
    assistantId,
    openaiKey,
    assistantConfig: vapiAssistantConfig,
  };
}

/**
 * Get configured assistant settings
 */
export function getAssistantConfig() {
  return vapiAssistantConfig;
}

/**
 * Get LLM configuration details
 */
export function getLLMConfig() {
  return {
    model: gpt4oConfig.model,
    temperature: gpt4oConfig.temperature,
    maxTokens: gpt4oConfig.maxTokens,
    description: `GPT-4o configured for natural voice conversations with temperature ${gpt4oConfig.temperature} and max ${gpt4oConfig.maxTokens} tokens`,
  };
}
