// Base price constant for retail suits
export const BASE_PRICE = 100;

// Fabric modifiers (percentage increase from base price)
export const FABRIC_MODIFIERS: Record<string, number> = {
  cotton: 0, // No modifier for cotton
  wool: 0.25, // 25% increase
  silk: 0.5, // 50% increase
  linen: 0.15, // 15% increase
  polyester: -0.1, // 10% discount
};

// VAT rate (20%)
const VAT_RATE = 0.2;

/**
 * Calculates the price with fabric modifier applied
 * @param fabricType - The type of fabric
 * @returns The base price plus fabric modifier, before VAT
 */
export function calculatePriceWithFabric(fabricType: string): number {
  const modifier = FABRIC_MODIFIERS[fabricType.toLowerCase()] ?? 0;
  return BASE_PRICE * (1 + modifier);
}

/**
 * Calculates VAT amount for a given price
 * @param price - The pre-VAT price
 * @returns The VAT amount
 */
export function calculateVAT(price: number): number {
  return price * VAT_RATE;
}

/**
 * Calculates the total price including VAT
 * @param fabricType - The type of fabric
 * @returns The total price including 20% VAT
 */
export function calculateTotalPrice(fabricType: string): number {
  const priceWithFabric = calculatePriceWithFabric(fabricType);
  const vat = calculateVAT(priceWithFabric);
  return priceWithFabric + vat;
}

/**
 * Formats a price as a currency string (USD)
 * @param price - The price to format
 * @returns Formatted price string (e.g., "$120.00")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formats a price with custom currency
 * @param price - The price to format
 * @param currency - The currency code (e.g., 'USD', 'EUR', 'GBP')
 * @returns Formatted price string
 */
export function formatPriceWithCurrency(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Gets a complete pricing breakdown for a fabric type
 * @param fabricType - The type of fabric
 * @returns An object with base price, fabric modifier, price before VAT, VAT, and total price
 */
export interface PricingBreakdown {
  basePrice: number;
  fabricModifier: number;
  priceBeforeVAT: number;
  vat: number;
  totalPrice: number;
}

export function getPricingBreakdown(fabricType: string): PricingBreakdown {
  const modifier = FABRIC_MODIFIERS[fabricType.toLowerCase()] ?? 0;
  const priceWithFabric = calculatePriceWithFabric(fabricType);
  const vat = calculateVAT(priceWithFabric);

  return {
    basePrice: BASE_PRICE,
    fabricModifier: modifier,
    priceBeforeVAT: priceWithFabric,
    vat,
    totalPrice: priceWithFabric + vat,
  };
}
