import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const BASE_SUIT_PRICE_GBP = 599;

interface CreateConfigRequest {
  session_id: string;
  fabric_id: string;
  style_json?: {
    jacket?: {
      lapel?: 'notch' | 'peak' | 'shawl';
      buttons?: 1 | 2 | 3;
      vents?: 'none' | 'single' | 'double';
      pocket_style?: 'flap' | 'jetted' | 'patch';
      lining_color?: string;
    };
    trousers?: {
      fit?: 'slim' | 'regular' | 'relaxed';
      pleats?: 'flat' | 'single' | 'double';
      cuff?: boolean;
    };
    vest?: {
      included?: boolean;
      buttons?: number;
    };
  };
  name?: string;
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const body: CreateConfigRequest = await request.json();

    // Validate required fields
    if (!body.session_id || !body.fabric_id) {
      return NextResponse.json(
        { error: 'session_id and fabric_id are required' },
        { status: 400 }
      );
    }

    // Verify session exists
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', body.session_id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session_id' },
        { status: 400 }
      );
    }

    // Verify fabric exists and is in stock
    const { data: fabric } = await supabase
      .from('fabrics')
      .select('id, price_modifier, in_stock, name')
      .eq('id', body.fabric_id)
      .single();

    if (!fabric) {
      return NextResponse.json(
        { error: 'Invalid fabric_id' },
        { status: 400 }
      );
    }

    if (!fabric.in_stock) {
      return NextResponse.json(
        { error: 'Selected fabric is out of stock' },
        { status: 400 }
      );
    }

    // Calculate price
    const calculatedPrice = BASE_SUIT_PRICE_GBP * fabric.price_modifier;

    // Default style options
    const defaultStyle = {
      jacket: {
        lapel: 'notch',
        buttons: 2,
        vents: 'double',
        pocket_style: 'flap',
        lining_color: '#1a1a2e'
      },
      trousers: {
        fit: 'slim',
        pleats: 'flat',
        cuff: false
      },
      vest: {
        included: false
      }
    };

    const styleJson = {
      ...defaultStyle,
      ...body.style_json,
      jacket: { ...defaultStyle.jacket, ...body.style_json?.jacket },
      trousers: { ...defaultStyle.trousers, ...body.style_json?.trousers },
      vest: { ...defaultStyle.vest, ...body.style_json?.vest }
    };

    // Create config
    const { data: config, error } = await supabase
      .from('suit_configs')
      .insert({
        session_id: body.session_id,
        fabric_id: body.fabric_id,
        style_json: styleJson,
        calculated_price_gbp: calculatedPrice,
        name: body.name || `${fabric.name} Suit`
      })
      .select(`
        *,
        fabric:fabrics (*)
      `)
      .single();

    if (error) {
      console.error('Config creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json(config, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
