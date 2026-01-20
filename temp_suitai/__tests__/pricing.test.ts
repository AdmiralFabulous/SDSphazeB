import {
  BASE_PRICE,
  FABRIC_MODIFIERS,
  calculatePriceWithFabric,
  calculateVAT,
  calculateTotalPrice,
  formatPrice,
  formatPriceWithCurrency,
  getPricingBreakdown,
} from '../src/lib/pricing';

describe('Pricing Module', () => {
  describe('Constants', () => {
    it('should have a base price constant', () => {
      expect(BASE_PRICE).toBe(100);
    });

    it('should have fabric modifiers defined', () => {
      expect(FABRIC_MODIFIERS).toBeDefined();
      expect(FABRIC_MODIFIERS.cotton).toBe(0);
      expect(FABRIC_MODIFIERS.wool).toBe(0.25);
      expect(FABRIC_MODIFIERS.silk).toBe(0.5);
      expect(FABRIC_MODIFIERS.linen).toBe(0.15);
      expect(FABRIC_MODIFIERS.polyester).toBe(-0.1);
    });
  });

  describe('calculatePriceWithFabric', () => {
    it('should calculate price with no modifier for cotton', () => {
      expect(calculatePriceWithFabric('cotton')).toBe(100);
    });

    it('should calculate price with 25% modifier for wool', () => {
      expect(calculatePriceWithFabric('wool')).toBe(125);
    });

    it('should calculate price with 50% modifier for silk', () => {
      expect(calculatePriceWithFabric('silk')).toBe(150);
    });

    it('should calculate price with 15% modifier for linen', () => {
      expect(calculatePriceWithFabric('linen')).toBe(115);
    });

    it('should calculate price with -10% modifier for polyester', () => {
      expect(calculatePriceWithFabric('polyester')).toBe(90);
    });

    it('should be case-insensitive', () => {
      expect(calculatePriceWithFabric('WOOL')).toBe(125);
      expect(calculatePriceWithFabric('Silk')).toBe(150);
    });

    it('should return base price for unknown fabric types', () => {
      expect(calculatePriceWithFabric('unknown')).toBe(BASE_PRICE);
    });
  });

  describe('calculateVAT', () => {
    it('should calculate 20% VAT correctly', () => {
      expect(calculateVAT(100)).toBe(20);
    });

    it('should calculate 20% VAT for different amounts', () => {
      expect(calculateVAT(125)).toBe(25);
      expect(calculateVAT(150)).toBe(30);
    });

    it('should handle decimal prices', () => {
      expect(calculateVAT(99.99)).toBeCloseTo(19.998);
    });
  });

  describe('calculateTotalPrice', () => {
    it('should calculate total price for cotton (100 + 20 VAT)', () => {
      expect(calculateTotalPrice('cotton')).toBe(120);
    });

    it('should calculate total price for wool (125 + 25 VAT)', () => {
      expect(calculateTotalPrice('wool')).toBe(150);
    });

    it('should calculate total price for silk (150 + 30 VAT)', () => {
      expect(calculateTotalPrice('silk')).toBe(180);
    });

    it('should calculate total price for linen (115 + 23 VAT)', () => {
      expect(calculateTotalPrice('linen')).toBeCloseTo(138);
    });

    it('should calculate total price for polyester (90 + 18 VAT)', () => {
      expect(calculateTotalPrice('polyester')).toBe(108);
    });
  });

  describe('formatPrice', () => {
    it('should format price as USD currency', () => {
      expect(formatPrice(100)).toBe('$100.00');
    });

    it('should format decimal prices', () => {
      expect(formatPrice(99.99)).toBe('$99.99');
    });

    it('should format large prices', () => {
      expect(formatPrice(1000)).toBe('$1,000.00');
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('$0.00');
    });
  });

  describe('formatPriceWithCurrency', () => {
    it('should format price with USD by default', () => {
      expect(formatPriceWithCurrency(100)).toBe('$100.00');
    });

    it('should format price with specified currency', () => {
      const eurPrice = formatPriceWithCurrency(100, 'EUR');
      expect(eurPrice).toContain('100');
    });

    it('should format price with GBP', () => {
      const gbpPrice = formatPriceWithCurrency(100, 'GBP');
      expect(gbpPrice).toContain('100');
    });
  });

  describe('getPricingBreakdown', () => {
    it('should return complete breakdown for cotton', () => {
      const breakdown = getPricingBreakdown('cotton');
      expect(breakdown.basePrice).toBe(100);
      expect(breakdown.fabricModifier).toBe(0);
      expect(breakdown.priceBeforeVAT).toBe(100);
      expect(breakdown.vat).toBe(20);
      expect(breakdown.totalPrice).toBe(120);
    });

    it('should return complete breakdown for wool', () => {
      const breakdown = getPricingBreakdown('wool');
      expect(breakdown.basePrice).toBe(100);
      expect(breakdown.fabricModifier).toBe(0.25);
      expect(breakdown.priceBeforeVAT).toBe(125);
      expect(breakdown.vat).toBe(25);
      expect(breakdown.totalPrice).toBe(150);
    });

    it('should return complete breakdown for silk', () => {
      const breakdown = getPricingBreakdown('silk');
      expect(breakdown.basePrice).toBe(100);
      expect(breakdown.fabricModifier).toBe(0.5);
      expect(breakdown.priceBeforeVAT).toBe(150);
      expect(breakdown.vat).toBe(30);
      expect(breakdown.totalPrice).toBe(180);
    });

    it('should handle unknown fabric types', () => {
      const breakdown = getPricingBreakdown('unknown');
      expect(breakdown.basePrice).toBe(100);
      expect(breakdown.fabricModifier).toBe(0);
      expect(breakdown.priceBeforeVAT).toBe(100);
      expect(breakdown.vat).toBe(20);
      expect(breakdown.totalPrice).toBe(120);
    });
  });

  describe('Integration Tests', () => {
    it('should provide consistent pricing across all functions', () => {
      const fabricType = 'wool';
      const breakdown = getPricingBreakdown(fabricType);
      const totalPrice = calculateTotalPrice(fabricType);
      const formattedPrice = formatPrice(totalPrice);

      expect(breakdown.totalPrice).toBe(totalPrice);
      expect(formattedPrice).toBe('$150.00');
    });

    it('should handle edge cases with decimal calculations', () => {
      const breakdown = getPricingBreakdown('linen');
      expect(breakdown.priceBeforeVAT).toBe(115);
      expect(breakdown.vat).toBeCloseTo(23, 1);
      expect(breakdown.totalPrice).toBeCloseTo(138, 1);
    });
  });
});
