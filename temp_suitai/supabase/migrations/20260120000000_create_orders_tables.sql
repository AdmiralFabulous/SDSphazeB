-- Create enum for order states
CREATE TYPE order_state AS ENUM (
    'draft',
    'pending_measurement',
    'measuring',
    'measurement_complete',
    'pending_pattern',
    'generating_pattern',
    'pattern_ready',
    'in_production',
    'quality_check',
    'shipped',
    'delivered',
    'cancelled'
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Order details
    order_number VARCHAR(50) UNIQUE NOT NULL,
    state order_state DEFAULT 'draft' NOT NULL,

    -- Pricing
    subtotal_gbp DECIMAL(10,2),
    tax_gbp DECIMAL(10,2),
    total_gbp DECIMAL(10,2),

    -- Shipping
    shipping_address JSONB,
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(255),

    -- Payment
    payment_intent_id VARCHAR(255),
    payment_status VARCHAR(50),

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create suit_configs table (configuration for each suit item)
CREATE TABLE public.suit_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Style selections
    jacket_style VARCHAR(100),
    trouser_style VARCHAR(100),
    vest_style VARCHAR(100),

    -- Fabric
    fabric_id UUID REFERENCES public.fabrics(id),

    -- Customizations
    customizations JSONB DEFAULT '{}'::jsonb,
    /*
    {
        "lapel_width": "standard",
        "button_count": 2,
        "pocket_style": "flap",
        "lining_color": "#333333",
        "monogram": "ABC"
    }
    */

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create measurements table
CREATE TABLE public.measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Body measurements (in cm)
    chest_circumference DECIMAL(6,2),
    waist_circumference DECIMAL(6,2),
    hip_circumference DECIMAL(6,2),
    shoulder_width DECIMAL(6,2),
    arm_length DECIMAL(6,2),
    inseam DECIMAL(6,2),
    neck_circumference DECIMAL(6,2),

    -- Additional measurements stored as JSONB
    additional_measurements JSONB DEFAULT '{}'::jsonb,

    -- Measurement metadata
    measurement_method VARCHAR(50), -- 'manual', 'ai_scan', 'hybrid'
    confidence_score DECIMAL(3,2),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create pattern_files table
CREATE TABLE public.pattern_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL, -- Will reference order_items(id)

    -- File details
    file_type VARCHAR(50) NOT NULL, -- 'dxf', 'pdf', 'svg', etc.
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,

    -- Pattern metadata
    calibration_verified BOOLEAN DEFAULT FALSE,
    pattern_version VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create order_items table (items within an order)
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

    -- Item details
    item_type VARCHAR(50) NOT NULL, -- 'jacket', 'trousers', 'vest', 'full_suit'
    quantity INTEGER DEFAULT 1 NOT NULL,

    -- References
    suit_config_id UUID REFERENCES public.suit_configs(id),
    measurement_id UUID REFERENCES public.measurements(id),

    -- Pricing for this item
    unit_price_gbp DECIMAL(10,2),
    total_price_gbp DECIMAL(10,2),

    -- Item-specific notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint for pattern_files now that order_items exists
ALTER TABLE public.pattern_files
    ADD CONSTRAINT fk_pattern_files_order_item
    FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;

-- Create order_state_history table (audit trail of state changes)
CREATE TABLE public.order_state_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

    -- State transition
    from_state order_state,
    to_state order_state NOT NULL,

    -- Metadata
    notes TEXT,
    changed_by UUID REFERENCES public.users(id),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suit_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_state_history ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_state ON public.orders(state);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_measurements_user_id ON public.measurements(user_id);
CREATE INDEX idx_pattern_files_order_item_id ON public.pattern_files(order_item_id);
CREATE INDEX idx_order_state_history_order_id ON public.order_state_history(order_id);

-- Create triggers for updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suit_configs_updated_at
    BEFORE UPDATE ON public.suit_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_measurements_updated_at
    BEFORE UPDATE ON public.measurements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pattern_files_updated_at
    BEFORE UPDATE ON public.pattern_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies: Users can only see their own orders and measurements
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own measurements"
    ON public.measurements FOR SELECT
    USING (auth.uid() = user_id);

-- Order items can be viewed if the user owns the parent order
CREATE POLICY "Users can view items from their orders"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Pattern files can be viewed if the user owns the parent order
CREATE POLICY "Users can view pattern files from their orders"
    ON public.pattern_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.order_items
            JOIN public.orders ON orders.id = order_items.order_id
            WHERE order_items.id = pattern_files.order_item_id
            AND orders.user_id = auth.uid()
        )
    );

-- Suit configs can be viewed if referenced by user's order items
CREATE POLICY "Users can view suit configs from their orders"
    ON public.suit_configs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.order_items
            JOIN public.orders ON orders.id = order_items.order_id
            WHERE order_items.suit_config_id = suit_configs.id
            AND orders.user_id = auth.uid()
        )
    );

-- Order state history can be viewed if the user owns the order
CREATE POLICY "Users can view state history from their orders"
    ON public.order_state_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_state_history.order_id
            AND orders.user_id = auth.uid()
        )
    );
