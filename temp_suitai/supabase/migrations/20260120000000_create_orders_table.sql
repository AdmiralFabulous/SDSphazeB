-- Create track type enum
CREATE TYPE order_track_type AS ENUM ('A', 'B');

-- Create order state enum (S01-S19)
CREATE TYPE order_state AS ENUM (
    'S01_PAID',
    'S02_MEASUREMENT_PENDING',
    'S03_MEASUREMENT_RECEIVED',
    'S04_PATTERN_PENDING',
    'S05_PATTERN_GENERATED',
    'S06_SENT_TO_PRINTER',
    'S07_PRINT_COLLECTED',
    'S08_PRINT_REJECTED',
    'S09_DELIVERED_TO_RAJA',
    'S10_CUTTING_IN_PROGRESS',
    'S11_CUTTING_COMPLETE',
    'S12_STITCHING_IN_PROGRESS',
    'S13_STITCHING_COMPLETE',
    'S14_QC_IN_PROGRESS',
    'S15_QC_PASSED',
    'S16_QC_FAILED',
    'S17_SHIPPED',
    'S18_DELIVERED',
    'S19_COMPLETE'
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,

    -- Order classification
    track_type order_track_type NOT NULL,
    wedding_event_id UUID REFERENCES public.wedding_events(id) ON DELETE SET NULL,

    -- Payment
    stripe_payment_intent VARCHAR(255) UNIQUE,
    stripe_charge_id VARCHAR(255),

    -- State machine
    current_state order_state DEFAULT 'S01_PAID' NOT NULL,

    -- Financials (all in GBP)
    subtotal_amount DECIMAL(10,2) NOT NULL,
    vat_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP' NOT NULL,

    -- Shipping
    shipping_name VARCHAR(255),
    shipping_address_line1 VARCHAR(255),
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(2) DEFAULT 'GB',
    shipping_phone VARCHAR(20),

    -- Tracking
    tracking_number VARCHAR(100),
    carrier VARCHAR(50),
    estimated_delivery DATE,

    -- Metadata
    notes TEXT,
    internal_notes TEXT,  -- Admin only

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_current_state ON public.orders(current_state);
CREATE INDEX idx_orders_track_type ON public.orders(track_type);
CREATE INDEX idx_orders_stripe_payment_intent ON public.orders(stripe_payment_intent);
CREATE INDEX idx_orders_wedding_event_id ON public.orders(wedding_event_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Trigger
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own orders"
    ON public.orders
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Service role full access to orders"
    ON public.orders
    FOR ALL
    USING (auth.role() = 'service_role');
