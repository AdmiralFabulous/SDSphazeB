-- Create suit_configs table
CREATE TABLE public.suit_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    fabric_id UUID NOT NULL REFERENCES public.fabrics(id) ON DELETE RESTRICT,

    -- Configuration name
    name VARCHAR(255),

    -- Style customization (JSON structure for flexible style options)
    style_json JSONB DEFAULT '{}'::jsonb NOT NULL,

    -- Calculated pricing
    calculated_price_gbp DECIMAL(10,2) NOT NULL,

    -- Status and metadata
    is_finalized BOOLEAN DEFAULT FALSE NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_suit_configs_session_id ON public.suit_configs(session_id);
CREATE INDEX idx_suit_configs_fabric_id ON public.suit_configs(fabric_id);
CREATE INDEX idx_suit_configs_created_at ON public.suit_configs(created_at DESC);
CREATE INDEX idx_suit_configs_style_json ON public.suit_configs USING GIN (style_json);

-- Enable Row Level Security
ALTER TABLE public.suit_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Note: These policies allow access if the session is accessible
-- Adjust based on your authentication requirements
CREATE POLICY "Users can view configs for their sessions"
    ON public.suit_configs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = suit_configs.session_id
            AND (auth.uid() = sessions.user_id OR sessions.user_id IS NULL)
        )
    );

CREATE POLICY "Users can create configs for their sessions"
    ON public.suit_configs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = suit_configs.session_id
            AND (auth.uid() = sessions.user_id OR sessions.user_id IS NULL)
        )
    );

CREATE POLICY "Users can update configs for their sessions"
    ON public.suit_configs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = suit_configs.session_id
            AND (auth.uid() = sessions.user_id OR sessions.user_id IS NULL)
        )
    );

-- Create updated_at trigger
CREATE TRIGGER update_suit_configs_updated_at
    BEFORE UPDATE ON public.suit_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.suit_configs IS 'Suit configuration with fabric and style choices';
COMMENT ON COLUMN public.suit_configs.style_json IS 'JSON object containing jacket, trousers, and vest style options';
COMMENT ON COLUMN public.suit_configs.calculated_price_gbp IS 'Total price calculated from base price and fabric modifier';
COMMENT ON COLUMN public.suit_configs.is_finalized IS 'Whether this configuration has been finalized for order';
