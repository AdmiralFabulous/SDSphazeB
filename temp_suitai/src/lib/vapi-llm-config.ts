/**
 * Vapi LLM Configuration for Voice Integration
 * Configures GPT-4o with optimal settings for natural voice conversations
 */

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
}

/**
 * GPT-4o Configuration for Vapi
 *
 * Settings:
 * - Model: gpt-4o (latest OpenAI model with vision and audio capabilities)
 * - Temperature: 0.7 (balanced between deterministic and creative responses)
 * - Max Tokens: 1000 (prevents rambling while allowing detailed responses)
 */
export const gpt4oConfig: LLMConfig = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

/**
 * Vapi Assistant Configuration with GPT-4o
 */
export const vapiAssistantConfig = {
  model: {
    provider: 'openai',
    model: gpt4oConfig.model,
    messages: [
      {
        role: 'system',
        content: `You are a helpful voice assistant for the SUIT AI body measurement system.
You provide clear, concise responses to user queries about body measurements and analysis.
Keep responses natural and conversational, avoiding unnecessary jargon.`,
      },
    ],
    temperature: gpt4oConfig.temperature,
    max_tokens: gpt4oConfig.maxTokens,
    top_p: gpt4oConfig.topP,
    frequency_penalty: gpt4oConfig.frequencyPenalty,
    presence_penalty: gpt4oConfig.presencePenalty,
  },
  voice: {
    provider: 'openai',
    voiceId: 'alloy', // OpenAI voice option
  },
  firstMessageMode: 'assistant-speaks',
  clientMessages: ['transcript', 'hang'],
  serverMessages: ['assistant-call', 'function-calls', 'metadata'],
};

/**
 * Validates LLM configuration
 */
export function validateLLMConfig(config: LLMConfig): boolean {
  // Validate temperature is between 0 and 2
  if (config.temperature < 0 || config.temperature > 2) {
    throw new Error('Temperature must be between 0 and 2');
  }

  // Validate maxTokens is positive
  if (config.maxTokens <= 0) {
    throw new Error('Max tokens must be greater than 0');
  }

  // Validate model is GPT-4o
  if (config.model !== 'gpt-4o') {
    throw new Error('Model must be gpt-4o');
  }

  return true;
}

/**
 * Get Vapi initialization config
 */
export function getVapiConfig(apiKey: string) {
  return {
    apiKey,
    assistantConfig: vapiAssistantConfig,
  };
}
