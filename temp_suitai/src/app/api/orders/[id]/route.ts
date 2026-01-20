import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient();
  const orderId = params.id;

  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch order with all related data
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        suit_config:suit_configs (
          *,
          fabric:fabrics (name, code, color_hex)
        ),
        measurement:measurements (
          id,
          chest_circumference,
          waist_circumference,
          hip_circumference,
          shoulder_width,
          created_at
        ),
        pattern_files (
          id,
          file_type,
          file_url,
          calibration_verified,
          created_at
        )
      ),
      state_history:order_state_history (
        from_state,
        to_state,
        notes,
        created_at
      )
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Verify ownership - RLS should handle this, but double-check for security
  if (order.user_id !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  return NextResponse.json(order);
}
