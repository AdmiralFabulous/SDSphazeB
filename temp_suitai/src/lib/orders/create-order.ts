import { SupabaseClient } from '@supabase/supabase-js';
import { CreateOrderParams, Order } from './types';

const VAT_RATE = 0.20; // 20% UK VAT

export async function createOrder(
  supabase: SupabaseClient,
  params: CreateOrderParams
): Promise<Order> {
  // Calculate totals
  const subtotal = params.items.reduce(
    (sum, item) => sum + (item.unit_price_gbp * item.fabric_modifier),
    0
  );
  const vatAmount = subtotal * VAT_RATE;
  const totalAmount = subtotal + vatAmount;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: params.user_id,
      track_type: params.track_type,
      wedding_event_id: params.wedding_event_id,
      stripe_payment_intent: params.stripe_payment_intent,
      current_state: 'S01_PAID',
      subtotal_amount: subtotal,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      shipping_name: params.shipping.name,
      shipping_address_line1: params.shipping.address_line1,
      shipping_address_line2: params.shipping.address_line2,
      shipping_city: params.shipping.city,
      shipping_postal_code: params.shipping.postal_code,
      shipping_country: params.shipping.country,
      shipping_phone: params.shipping.phone,
      paid_at: new Date().toISOString()
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = params.items.map(item => ({
    order_id: order.id,
    suit_config_id: item.suit_config_id,
    measurement_id: item.measurement_id,
    wedding_attendee_id: item.wedding_attendee_id,
    unit_price_gbp: item.unit_price_gbp,
    fabric_modifier: item.fabric_modifier,
    total_price_gbp: item.unit_price_gbp * item.fabric_modifier,
    status: item.measurement_id ? 'ready_for_production' : 'pending_measurement'
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  // State history is auto-recorded by trigger

  return order;
}
