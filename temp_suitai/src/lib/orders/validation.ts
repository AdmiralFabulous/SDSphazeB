import { z } from 'zod';

export const CreateOrderItemSchema = z.object({
  suit_config_id: z.string().uuid('Invalid suit_config_id'),
  measurement_id: z.string().uuid('Invalid measurement_id').optional(),
  wedding_attendee_id: z.string().uuid('Invalid wedding_attendee_id').optional(),
  unit_price_gbp: z.number().min(0, 'Unit price must be non-negative'),
  fabric_modifier: z.number().min(0.01, 'Fabric modifier must be positive'),
});

export const CreateOrderShippingSchema = z.object({
  name: z.string().min(1, 'Shipping name is required'),
  address_line1: z.string().min(1, 'Address line 1 is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().length(2, 'Country must be ISO 3166-1 alpha-2 code').default('GB'),
  phone: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  user_id: z.string().uuid('Invalid user_id'),
  stripe_payment_intent: z.string().min(1, 'Stripe payment intent is required'),
  track_type: z.enum(['A', 'B'], {
    errorMap: () => ({ message: 'Track type must be either A or B' }),
  }),
  wedding_event_id: z.string().uuid('Invalid wedding_event_id').optional(),
  items: z.array(CreateOrderItemSchema).min(1, 'At least one item is required'),
  shipping: CreateOrderShippingSchema,
}).refine(
  (data) => {
    // If track_type is B, wedding_event_id should be provided
    if (data.track_type === 'B' && !data.wedding_event_id) {
      return false;
    }
    return true;
  },
  {
    message: 'wedding_event_id is required for Track B orders',
    path: ['wedding_event_id'],
  }
);

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
