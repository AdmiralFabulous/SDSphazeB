-- Create suit_configs table
CREATE TABLE public.suit_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    fabric_id UUID NOT NULL REFERENCES public.fabrics(id),

    -- Style configuration
    style_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    /*
    {
        "jacket": {
            "lapel": "notch",        -- notch, peak, shawl
            "buttons": 2,            -- 1, 2, 3
            "vents": "double",       -- none, single, double
            "pocket_style": "flap",  -- flap, jetted, patch
            "lining_color": "#1a1a2e"
        },
        "trousers": {
            "fit": "slim",           -- slim, regular, relaxed
            "pleats": "flat",        -- flat, single, double
            "cuff": false,
            "waistband": "standard"  -- standard, extended
        },
        "vest": {
            "included": false,
            "buttons": 5,
            "back_material": "lining" -- lining, self
        }
    }
    */

    -- Template settings (for wedding Track B)
    is_template BOOLEAN DEFAULT FALSE,
    template_name VARCHAR(255),  -- e.g., "Groomsman - Navy Classic"
    template_locked_at TIMESTAMPTZ,

    -- Pricing snapshot
    calculated_price_gbp DECIMAL(8,2),

    -- Metadata
    name VARCHAR(255),  -- User-given name for the config
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_suit_configs_session_id ON public.suit_configs(session_id);
CREATE INDEX idx_suit_configs_fabric_id ON public.suit_configs(fabric_id);
CREATE INDEX idx_suit_configs_is_template ON public.suit_configs(is_template) WHERE is_template = TRUE;

-- Trigger
CREATE TRIGGER update_suit_configs_updated_at
    BEFORE UPDATE ON public.suit_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.suit_configs ENABLE ROW LEVEL SECURITY;
