-- Add role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Create order states enum
DO $$ BEGIN
    CREATE TYPE order_state AS ENUM (
        'draft',
        'pending_payment',
        'payment_confirmed',
        'in_production',
        'quality_check',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    current_state order_state DEFAULT 'draft' NOT NULL,
    total_amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_current_state ON public.orders(current_state);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Create order state history table
CREATE TABLE IF NOT EXISTS public.order_state_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_state order_state,
    to_state order_state NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for state history
CREATE INDEX IF NOT EXISTS idx_order_state_history_order_id ON public.order_state_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_state_history_created_at ON public.order_state_history(created_at DESC);

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- State transition validation function
CREATE OR REPLACE FUNCTION validate_order_state_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions JSONB;
BEGIN
    -- Define valid state transitions
    valid_transitions := '{
        "draft": ["pending_payment", "cancelled"],
        "pending_payment": ["payment_confirmed", "cancelled"],
        "payment_confirmed": ["in_production", "refunded"],
        "in_production": ["quality_check", "cancelled"],
        "quality_check": ["shipped", "in_production"],
        "shipped": ["delivered", "refunded"],
        "delivered": ["refunded"],
        "cancelled": [],
        "refunded": []
    }'::JSONB;

    -- Allow any transition if OLD.current_state is NULL (new record)
    IF OLD.current_state IS NULL THEN
        RETURN NEW;
    END IF;

    -- Check if transition is valid
    IF NOT (valid_transitions->OLD.current_state::TEXT) ? NEW.current_state::TEXT THEN
        RAISE EXCEPTION 'Invalid state transition from % to %', OLD.current_state, NEW.current_state;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger for state transition validation
DROP TRIGGER IF EXISTS validate_order_state_change ON public.orders;
CREATE TRIGGER validate_order_state_change
    BEFORE UPDATE OF current_state ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_order_state_transition();

-- Function to record state history
CREATE OR REPLACE FUNCTION record_order_state_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only record if state actually changed
    IF OLD.current_state IS DISTINCT FROM NEW.current_state THEN
        INSERT INTO public.order_state_history (
            order_id,
            from_state,
            to_state,
            changed_by
        ) VALUES (
            NEW.id,
            OLD.current_state,
            NEW.current_state,
            NEW.user_id  -- In production, you'd want to track the actual user making the change
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger to auto-record state history
DROP TRIGGER IF EXISTS record_order_state_change ON public.orders;
CREATE TRIGGER record_order_state_change
    AFTER UPDATE OF current_state ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION record_order_state_history();

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_state_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders (users can view their own orders, admins can view all)
CREATE POLICY orders_select_own ON public.orders
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY orders_insert_own ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY orders_update_own ON public.orders
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for state history (readable by order owner and admins)
CREATE POLICY order_state_history_select ON public.order_state_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id
            AND (user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.users
                WHERE id = auth.uid() AND role = 'admin'
            ))
        )
    );
