-- DB-E03-S01-T03: Create order_state_history Table
-- Maintains an audit log of all order state transitions

-- Create order_state_history table
CREATE TABLE public.order_state_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

    -- State transition
    from_state order_state,
    to_state order_state NOT NULL,

    -- Who made the change
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    changed_by_role VARCHAR(50),  -- 'customer', 'admin', 'system', 'runner'

    -- Context
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,  -- Additional context data

    -- Automatic tracking
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_order_state_history_order_id ON public.order_state_history(order_id);
CREATE INDEX idx_order_state_history_created_at ON public.order_state_history(created_at DESC);
CREATE INDEX idx_order_state_history_to_state ON public.order_state_history(to_state);

-- Enable RLS
ALTER TABLE public.order_state_history ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view history for their own orders
CREATE POLICY "Users can view own order history"
    ON public.order_state_history
    FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM public.orders WHERE user_id = auth.uid()
        )
    );

-- RLS: Service role has full access to history
CREATE POLICY "Service role full access to history"
    ON public.order_state_history
    FOR ALL
    USING (auth.role() = 'service_role');

-- Trigger function to auto-record state changes
CREATE OR REPLACE FUNCTION record_order_state_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.current_state IS DISTINCT FROM NEW.current_state THEN
        INSERT INTO public.order_state_history (order_id, from_state, to_state, changed_by_role)
        VALUES (NEW.id, OLD.current_state, NEW.current_state, 'system');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-record state changes on orders table
CREATE TRIGGER trigger_record_order_state_change
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION record_order_state_change();
