/**
 * Wedding party pricing calculation module
 * Handles batch total calculation with bulk discounts and VAT
 */

export interface WeddingPricingInput {
  perSuitPrice: number;
  attendeeCount: number;
  eventId: string;
  vatRate?: number;
}

export interface WeddingPricingResult {
  perSuitPrice: number;
  attendeeCount: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  discountedTotal: number;
  vat: number;
  total: number;
  metadata: {
    eventId: string;
  };
}

/**
 * Calculate bulk discount based on attendee count
 * @param attendeeCount - Number of attendees/suits
 * @returns Discount percentage (0, 5, or 10)
 */
function getBulkDiscount(attendeeCount: number): number {
  if (attendeeCount >= 10) {
    return 10;
  }
  if (attendeeCount >= 6) {
    return 5;
  }
  return 0;
}

/**
 * Calculate wedding party pricing with bulk discounts and VAT
 * @param input - Pricing input parameters
 * @returns Complete pricing breakdown
 */
export function calculateWeddingPricing(
  input: WeddingPricingInput
): WeddingPricingResult {
  const {
    perSuitPrice,
    attendeeCount,
    eventId,
    vatRate = 0.2, // Default 20% VAT
  } = input;

  // Calculate subtotal (per-suit × attendee count)
  const subtotal = perSuitPrice * attendeeCount;

  // Get bulk discount percentage
  const discountPercent = getBulkDiscount(attendeeCount);

  // Calculate discount amount
  const discountAmount = subtotal * (discountPercent / 100);

  // Calculate discounted total
  const discountedTotal = subtotal - discountAmount;

  // Calculate VAT on discounted total
  const vat = discountedTotal * vatRate;

  // Calculate final total
  const total = discountedTotal + vat;

  return {
    perSuitPrice,
    attendeeCount,
    subtotal,
    discountPercent,
    discountAmount,
    discountedTotal,
    vat,
    total,
    metadata: {
      eventId,
    },
  };
}
