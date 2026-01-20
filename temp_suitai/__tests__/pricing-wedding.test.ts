import { calculateWeddingPricing } from '../src/lib/pricing-wedding';

describe('Wedding Pricing Calculation', () => {
  describe('Basic pricing without discounts', () => {
    it('should calculate subtotal for 5 attendees (no discount)', () => {
      const result = calculateWeddingPricing({
        perSuitPrice: 100,
        attendeeCount: 5,
        eventId: 'event-001',
      });

      expect(result.subtotal).toBe(500);
      expect(result.discountPercent).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.discountedTotal).toBe(500);
      expect(result.vat).toBe(100); // 20% of 500
      expect(result.total).toBe(600);
      expect(result.metadata.eventId).toBe('event-001');
    });
  });

  describe('Pricing with 5% bulk discount', () => {
    it('should apply 5% discount for 6 attendees', () => {
      const result = calculateWeddingPricing({
        perSuitPrice: 100,
        attendeeCount: 6,
        eventId: 'event-002',
      });

      expect(result.subtotal).toBe(600);
      expect(result.discountPercent).toBe(5);
      expect(result.discountAmount).toBe(30); // 5% of 600
      expect(result.discountedTotal).toBe(570);
      expect(result.vat).toBe(114); // 20% of 570
      expect(result.total).toBe(684);
    });

    it('should apply 5% discount for 9 attendees', () => {
      const result = calculateWeddingPricing({
        perSuitPrice: 50,
        attendeeCount: 9,
        eventId: 'event-003',
      });

      expect(result.subtotal).toBe(450);
      expect(result.discountPercent).toBe(5);
      expect(result.discountAmount).toBe(22.5); // 5% of 450
      expect(result.discountedTotal).toBe(427.5);
      expect(result.vat).toBe(85.5); // 20% of 427.5
      expect(result.total).toBe(513);
    });
  });

  describe('Pricing with 10% bulk discount', () => {
    it('should apply 10% discount for 10 attendees', () => {
      const result = calculateWeddingPricing({
        perSuitPrice: 100,
        attendeeCount: 10,
        eventId: 'event-004',
      });

      expect(result.subtotal).toBe(1000);
      expect(result.discountPercent).toBe(10);
      expect(result.discountAmount).toBe(100); // 10% of 1000
      expect(result.discountedTotal).toBe(900);
      expect(result.vat).toBe(180); // 20% of 900
      expect(result.total).toBe(1080);
    });

    it('should apply 10% discount for 20 attendees', () => {
      const result = calculateWeddingPricing({
        perSuitPrice: 150,
        attendeeCount: 20,
        eventId: 'event-005',
      });

      expect(result.subtotal).toBe(3000);
      expect(result.discountPercent).toBe(10);
      expect(result.discountAmount).toBe(300); // 10% of 3000
      expect(result.discountedTotal).toBe(2700);
      expect(result.vat).toBe(540); // 20% of 2700
      expect(result.total).toBe(3240);
    });
  });

  describe('Custom VAT rates', () => {
    it('should apply custom VAT rate', () => {
      const result = calculateWeddingPricing({
        perSuitPrice: 100,
        attendeeCount: 10,
        eventId: 'event-006',
        vatRate: 0.15, // 15% VAT
      });

      expect(result.discountedTotal).toBe(900);
      expect(result.vat).toBe(135); // 15% of 900
      expect(result.total).toBe(1035);
    });

    it('should handle 0% VAT', () => {
      const result = calculateWeddingPricing({
        perSuitPrice: 100,
        attendeeCount: 6,
        eventId: 'event-007',
        vatRate: 0,
      });

      expect(result.vat).toBe(0);
      expect(result.total).toBe(570); // Just the discounted total
    });
  });

  describe('Event ID metadata', () => {
    it('should include eventId in metadata', () => {
      const eventId = 'wedding-event-xyz';
      const result = calculateWeddingPricing({
        perSuitPrice: 100,
        attendeeCount: 5,
        eventId,
      });

      expect(result.metadata.eventId).toBe(eventId);
    });
  });

  describe('Edge cases', () => {
    it('should handle single attendee', () => {
      const result = calculateWeddingPricing({
        perSuitPrice: 100,
        attendeeCount: 1,
        eventId: 'event-008',
      });

      expect(result.subtotal).toBe(100);
      expect(result.discountPercent).toBe(0);
      expect(result.total).toBe(120);
    });

    it('should handle large number of attendees', () => {
      const result = calculateWeddingPricing({
        perSuitPrice: 75,
        attendeeCount: 100,
        eventId: 'event-009',
      });

      expect(result.subtotal).toBe(7500);
      expect(result.discountPercent).toBe(10);
      expect(result.discountAmount).toBe(750);
      expect(result.discountedTotal).toBe(6750);
      expect(result.total).toBe(8100); // 6750 + 20% VAT
    });

    it('should handle decimal prices', () => {
      const result = calculateWeddingPricing({
        perSuitPrice: 99.99,
        attendeeCount: 6,
        eventId: 'event-010',
      });

      expect(result.subtotal).toBeCloseTo(599.94, 2);
      expect(result.discountAmount).toBeCloseTo(29.997, 2);
      expect(result.discountedTotal).toBeCloseTo(569.943, 2);
    });
  });
});
