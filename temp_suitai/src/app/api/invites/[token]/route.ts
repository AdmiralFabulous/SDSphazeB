import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const token = params.token;

    // Find attendee by token
    const { data: attendee, error } = await supabase
      .from('wedding_attendees')
      .select(`
        id,
        email,
        full_name,
        status,
        template:wedding_templates (
          id,
          role,
          role_custom_name,
          suit_config:suit_configs (
            *,
            fabric:fabrics (*)
          )
        ),
        event:wedding_events (
          id,
          event_name,
          event_date,
          venue_name,
          measurement_deadline
        )
      `)
      .eq('invite_token', token)
      .single();

    if (error || !attendee) {
      return NextResponse.json(
        { error: 'Invalid or expired invite' },
        { status: 404 }
      );
    }

    // Update status to viewed if first time
    if (attendee.status === 'invited') {
      await supabase
        .from('wedding_attendees')
        .update({
          status: 'viewed',
          first_viewed_at: new Date().toISOString()
        })
        .eq('id', attendee.id);
    }

    // Don't expose the token in response
    return NextResponse.json({
      attendee_id: attendee.id,
      email: attendee.email,
      full_name: attendee.full_name,
      status: attendee.status,
      event: attendee.event,
      template: attendee.template
    });
  } catch (error) {
    console.error('Invite validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
