import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export function getVapiClient(): Vapi {
  if (!vapiInstance) {
    vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");
  }
  return vapiInstance;
}

export function cleanupVapiClient(): void {
  if (vapiInstance) {
    vapiInstance.stop();
    vapiInstance = null;
  }
}

// ============================================================================
// Phase B Extension: Tailor and Customer Call Functions
// ============================================================================

export interface SuitDetails {
  suitId: string;
  fabricType: string;
  fabricCode: string;
  style: string;
  deadline: Date;
  paymentAmount: number; // INR 8,500 per suit
  customerName?: string;
}

export interface ReworkDetails {
  suitId: string;
  issueDescription: string;
  requiredFixes: string[];
  originalDeadline: Date;
  newDeadline: Date;
}

export interface CallResult {
  success: boolean;
  recipientId: string;
  recipientName: string;
  accepted?: boolean;
  reason?: string;
  estimatedCompletionHours?: number;
  callDuration?: number;
  error?: string;
}

export interface TailorInfo {
  id: string;
  name: string;
  phone: string;
}

/**
 * Call multiple tailors in parallel to offer a job
 * Uses Promise.allSettled to handle partial failures
 *
 * @param tailors - Array of tailor info to call
 * @param suitDetails - Details of the suit job
 * @returns Array of call results
 */
export async function callTailorsParallel(
  tailors: TailorInfo[],
  suitDetails: SuitDetails,
): Promise<CallResult[]> {
  const callPromises = tailors.map((tailor) =>
    callTailorForJob(tailor, suitDetails),
  );

  const results = await Promise.allSettled(callPromises);

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return {
        success: false,
        recipientId: tailors[index].id,
        recipientName: tailors[index].name,
        error: result.reason?.message || "Call failed",
      };
    }
  });
}

/**
 * Call a single tailor to offer a job
 *
 * @param tailor - Tailor info
 * @param suitDetails - Details of the suit job
 * @returns Call result with acceptance status
 */
export async function callTailorForJob(
  tailor: TailorInfo,
  suitDetails: SuitDetails,
): Promise<CallResult> {
  try {
    // In production, this would use VAPI's outbound call API
    // For now, we simulate the call structure
    const callConfig = {
      assistant: {
        model: {
          provider: "openai",
          model: "gpt-4",
          systemPrompt: getTailorJobOfferPrompt(tailor.name, suitDetails),
        },
        voice: {
          provider: "11labs",
          voiceId: "hindi-male-1", // Hindi/Punjabi voice
        },
        firstMessage: getFirstMessage(tailor.name),
      },
      phoneNumber: tailor.phone,
      timeout: 60000, // 60 second timeout
    };

    // Placeholder for actual VAPI outbound call
    // const response = await vapiOutboundCall(callConfig);

    console.log(`[VAPI] Calling tailor ${tailor.name} at ${tailor.phone}`);
    console.log(
      `[VAPI] Suit: ${suitDetails.suitId}, Fabric: ${suitDetails.fabricType}`,
    );
    console.log(`[VAPI] Payment: INR ${suitDetails.paymentAmount}`);

    // Simulated response structure
    return {
      success: true,
      recipientId: tailor.id,
      recipientName: tailor.name,
      accepted: undefined, // Would be extracted from call
      callDuration: 0,
    };
  } catch (error: any) {
    return {
      success: false,
      recipientId: tailor.id,
      recipientName: tailor.name,
      error: error.message,
    };
  }
}

/**
 * Call a tailor about rework on a previously made suit
 *
 * @param tailor - Tailor info
 * @param reworkDetails - Details about the rework needed
 * @returns Call result
 */
export async function callTailorForRework(
  tailor: TailorInfo,
  reworkDetails: ReworkDetails,
): Promise<CallResult> {
  try {
    console.log(`[VAPI] Calling tailor ${tailor.name} for rework`);
    console.log(`[VAPI] Suit: ${reworkDetails.suitId}`);
    console.log(`[VAPI] Issue: ${reworkDetails.issueDescription}`);
    console.log(
      `[VAPI] Fixes needed: ${reworkDetails.requiredFixes.join(", ")}`,
    );

    // Placeholder for actual VAPI outbound call
    return {
      success: true,
      recipientId: tailor.id,
      recipientName: tailor.name,
      accepted: undefined,
      callDuration: 0,
    };
  } catch (error: any) {
    return {
      success: false,
      recipientId: tailor.id,
      recipientName: tailor.name,
      error: error.message,
    };
  }
}

/**
 * Call customer with delivery update
 *
 * @param customer - Customer info
 * @param deliveryEta - Estimated delivery time
 * @param suitId - Suit identifier
 * @returns Call result
 */
export async function callCustomerDeliveryUpdate(
  customer: { id: string; name: string; phone: string },
  deliveryEta: Date,
  suitId: string,
): Promise<CallResult> {
  try {
    console.log(
      `[VAPI] Calling customer ${customer.name} with delivery update`,
    );
    console.log(`[VAPI] Suit: ${suitId}`);
    console.log(`[VAPI] ETA: ${deliveryEta.toISOString()}`);

    // Placeholder for actual VAPI outbound call
    return {
      success: true,
      recipientId: customer.id,
      recipientName: customer.name,
      callDuration: 0,
    };
  } catch (error: any) {
    return {
      success: false,
      recipientId: customer.id,
      recipientName: customer.name,
      error: error.message,
    };
  }
}

// ============================================================================
// Helper Functions for Prompts
// ============================================================================

function getTailorJobOfferPrompt(
  tailorName: string,
  suitDetails: SuitDetails,
): string {
  return `You are calling a tailor named ${tailorName} about a suit job.
Speak in Hindi/Punjabi. Be respectful and professional.

Job Details:
- Suit ID: ${suitDetails.suitId}
- Fabric: ${suitDetails.fabricType} (${suitDetails.fabricCode})
- Style: ${suitDetails.style}
- Deadline: ${suitDetails.deadline.toLocaleString("en-IN")}
- Payment: INR ${suitDetails.paymentAmount.toLocaleString("en-IN")}

Your task:
1. Greet the tailor respectfully
2. Explain the job details clearly
3. Ask if they can accept this job
4. If yes, confirm the deadline and thank them
5. If no, thank them politely and end the call

Extract:
- Whether they accepted (yes/no)
- If no, the reason
- If yes, their estimated completion time in hours`;
}

function getFirstMessage(tailorName: string): string {
  return `Namaste, ${tailorName} ji. Same Day Suits se bol raha hoon. Aapke liye ek suit ka kaam hai. Kya aap abhi baat kar sakte hain?`;
}
