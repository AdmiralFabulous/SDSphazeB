export interface CreateOrderParams {
  user_id: string;
  stripe_payment_intent: string;
  track_type: 'A' | 'B';
  wedding_event_id?: string;
  items: {
    suit_config_id: string;
    measurement_id?: string;
    wedding_attendee_id?: string;
    unit_price_gbp: number;
    fabric_modifier: number;
  }[];
  shipping: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  stripe_payment_intent: string;
  track_type: 'A' | 'B';
  wedding_event_id?: string;
  current_state: string;
  subtotal_amount: number;
  vat_amount: number;
  total_amount: number;
  shipping_name: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone?: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  suit_config_id: string;
  measurement_id?: string;
  wedding_attendee_id?: string;
  unit_price_gbp: number;
  fabric_modifier: number;
  total_price_gbp: number;
  status: string;
  created_at: string;
  updated_at: string;
}
