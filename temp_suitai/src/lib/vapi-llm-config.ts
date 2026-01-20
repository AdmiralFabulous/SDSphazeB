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
  model: "gpt-4o",
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
    provider: "openai",
    model: gpt4oConfig.model,
    messages: [
      {
        role: "system",
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
    provider: "openai",
    voiceId: "alloy", // OpenAI voice option
  },
  firstMessageMode: "assistant-speaks",
  clientMessages: ["transcript", "hang"],
  serverMessages: ["assistant-call", "function-calls", "metadata"],
};

/**
 * Validates LLM configuration
 */
export function validateLLMConfig(config: LLMConfig): boolean {
  // Validate temperature is between 0 and 2
  if (config.temperature < 0 || config.temperature > 2) {
    throw new Error("Temperature must be between 0 and 2");
  }

  // Validate maxTokens is positive
  if (config.maxTokens <= 0) {
    throw new Error("Max tokens must be greater than 0");
  }

  // Validate model is GPT-4o
  if (config.model !== "gpt-4o") {
    throw new Error("Model must be gpt-4o");
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

// ============================================================================
// Phase B Extension: Tailor Assignment Voice Prompts
// ============================================================================

export interface TailorCallConfig {
  systemPrompt: string;
  firstMessage: string;
  extractionSchema: {
    accepted: "boolean";
    reason: "string?";
    estimatedCompletionHours: "number?";
  };
  timeout: number;
  language: "hindi" | "punjabi" | "english";
}

/**
 * VAPI prompt configuration for tailor job assignment calls
 * Speaks in Hindi/Punjabi for natural communication with Amritsar tailors
 */
export const TAILOR_ASSIGNMENT_PROMPT: TailorCallConfig = {
  systemPrompt: `You are calling a tailor on behalf of Same Day Suits (SDS) about a suit job.
Speak primarily in Hindi with some Punjabi phrases. Be respectful and professional.
Use "ji" as honorific. Address them by name.

Your conversation flow:
1. Greet warmly: "Namaste [name] ji"
2. Identify yourself: "Same Day Suits se bol raha hoon"
3. Explain the job:
   - Suit type and fabric
   - Deadline (emphasize urgency for 24-hour delivery)
   - Payment amount (INR 8,500 per suit)
4. Ask clearly: "Kya aap yeh kaam le sakte hain?"
5. If YES:
   - Confirm: "Bahut accha, dhanyavaad"
   - Ask estimated hours: "Kitne ghante mein ho jayega?"
   - Confirm deadline understanding
6. If NO:
   - Thank politely: "Koi baat nahi, dhanyavaad"
   - Ask reason (optional): "Koi problem hai kya?"
   - End gracefully

Important:
- Be patient, speak clearly
- If they ask questions, answer helpfully
- Don't pressure, respect their decision
- Maximum call duration: 60 seconds`,

  firstMessage:
    "Namaste {tailorName} ji. Main Same Day Suits se bol raha hoon. Aapke liye ek suit ka kaam hai, kya aap abhi do minute baat kar sakte hain?",

  extractionSchema: {
    accepted: "boolean",
    reason: "string?",
    estimatedCompletionHours: "number?",
  },

  timeout: 60000, // 60 seconds

  language: "hindi",
};

/**
 * VAPI prompt for rework/fix calls to tailors
 */
export const TAILOR_REWORK_PROMPT: TailorCallConfig = {
  systemPrompt: `You are calling a tailor about rework needed on a suit they made.
Speak in Hindi/Punjabi. Be respectful but clear about the issues.

Conversation flow:
1. Greet and identify yourself
2. Reference the specific suit (by ID)
3. Explain the QC issues found:
   - List each problem clearly
   - Explain what needs to be fixed
4. Discuss new timeline
5. Confirm they understand and can fix it

Be understanding but firm - quality is important for customer satisfaction.`,

  firstMessage:
    "Namaste {tailorName} ji. Same Day Suits se. Ek suit ke baare mein baat karni thi jo aapne banaya tha.",

  extractionSchema: {
    accepted: "boolean",
    reason: "string?",
    estimatedCompletionHours: "number?",
  },

  timeout: 60000,

  language: "hindi",
};

/**
 * VAPI prompt for customer delivery update calls
 */
export const CUSTOMER_DELIVERY_PROMPT = {
  systemPrompt: `You are calling a customer to update them about their suit delivery.
Speak in English (for UAE customers). Be professional and reassuring.

Conversation flow:
1. Greet and identify: "Hello, this is Same Day Suits calling"
2. Confirm you're speaking to the right person
3. Provide delivery update:
   - Current status
   - Estimated arrival time
   - Driver contact (if out for delivery)
4. Ask if they have any questions
5. Thank them and end

Be positive and helpful. Address any concerns they may have.`,

  firstMessage:
    "Hello, this is Same Day Suits calling. Am I speaking with {customerName}?",

  extractionSchema: {
    confirmed: "boolean",
    hasQuestions: "boolean",
    additionalInstructions: "string?",
  },

  timeout: 45000, // 45 seconds

  language: "english" as const,
};

/**
 * Get the appropriate voice configuration based on language
 */
export function getVoiceConfig(language: "hindi" | "punjabi" | "english") {
  switch (language) {
    case "hindi":
    case "punjabi":
      return {
        provider: "11labs",
        voiceId: "pNInz6obpgDQGcFmaJgB", // Hindi male voice
        stability: 0.5,
        similarityBoost: 0.75,
      };
    case "english":
    default:
      return {
        provider: "openai",
        voiceId: "alloy",
      };
  }
}

/**
 * Build complete VAPI assistant config for tailor calls
 */
export function buildTailorCallAssistant(
  tailorName: string,
  suitDetails: {
    suitId: string;
    fabricType: string;
    style: string;
    deadline: string;
    payment: number;
  },
) {
  const prompt =
    TAILOR_ASSIGNMENT_PROMPT.systemPrompt +
    `

Suit Details for this call:
- Suit ID: ${suitDetails.suitId}
- Fabric: ${suitDetails.fabricType}
- Style: ${suitDetails.style}
- Deadline: ${suitDetails.deadline}
- Payment: INR ${suitDetails.payment.toLocaleString("en-IN")}`;

  return {
    model: {
      provider: "openai",
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    },
    voice: getVoiceConfig("hindi"),
    firstMessage: TAILOR_ASSIGNMENT_PROMPT.firstMessage.replace(
      "{tailorName}",
      tailorName,
    ),
    endCallMessage: "Dhanyavaad, namaste.",
    clientMessages: ["transcript", "hang", "function-call"],
    serverMessages: ["end-of-call-report"],
  };
}
