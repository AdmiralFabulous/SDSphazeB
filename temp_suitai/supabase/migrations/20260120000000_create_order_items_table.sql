-- Create order_items table
-- Task: DB-E03-S01-T02
-- Description: Store individual suit items within an order, linking to configurations and measurements
-- Prerequisites: orders, suit_configs, measurements, wedding_attendees tables must exist

-- Create order item status enum
CREATE TYPE order_item_status AS ENUM (
    'pending_measurement',
    'ready_for_production',
    'in_production',
    'completed',
    'cancelled'
);

-- Create order_items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    suit_config_id UUID NOT NULL REFERENCES public.suit_configs(id) ON DELETE RESTRICT,
    measurement_id UUID REFERENCES public.measurements(id) ON DELETE SET NULL,

    -- For wedding orders, link to attendee
    wedding_attendee_id UUID REFERENCES public.wedding_attendees(id) ON DELETE SET NULL,

    -- Item details
    quantity INTEGER DEFAULT 1 NOT NULL,

    -- Pricing (snapshot at time of order)
    unit_price_gbp DECIMAL(8,2) NOT NULL,
    fabric_modifier DECIMAL(3,2) NOT NULL,
    total_price_gbp DECIMAL(8,2) NOT NULL,

    -- Status
    status order_item_status DEFAULT 'pending_measurement' NOT NULL,

    -- Production tracking
    pattern_generated_at TIMESTAMPTZ,
    production_started_at TIMESTAMPTZ,
    production_completed_at TIMESTAMPTZ,

    -- Notes
    special_instructions TEXT,
    internal_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_suit_config_id ON public.order_items(suit_config_id);
CREATE INDEX idx_order_items_measurement_id ON public.order_items(measurement_id);
CREATE INDEX idx_order_items_status ON public.order_items(status);
CREATE INDEX idx_order_items_wedding_attendee_id ON public.order_items(wedding_attendee_id);

-- Trigger for updated_at
CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view order items for their own orders
CREATE POLICY "Users can view their own order items"
    ON public.order_items
    FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM public.orders WHERE user_id = auth.uid()
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access to order items"
    ON public.order_items
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');
