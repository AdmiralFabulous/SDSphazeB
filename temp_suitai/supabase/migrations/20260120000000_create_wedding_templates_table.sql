-- Create or replace the update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create role enum
CREATE TYPE wedding_party_role AS ENUM (
    'groom',
    'best_man',
    'groomsman',
    'father_of_bride',
    'father_of_groom',
    'usher',
    'ring_bearer',
    'other'
);

-- Create wedding_templates table
CREATE TABLE public.wedding_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
    suit_config_id UUID NOT NULL REFERENCES public.suit_configs(id) ON DELETE RESTRICT,

    -- Role assignment
    role wedding_party_role NOT NULL,
    role_custom_name VARCHAR(100),  -- For 'other' role or custom naming

    -- Template settings
    is_locked BOOLEAN DEFAULT FALSE,
    locked_at TIMESTAMPTZ,

    -- Pricing (may differ by role)
    price_override_gbp DECIMAL(8,2),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Ensure unique role per event (except 'groomsman' which can have multiple)
    CONSTRAINT unique_singular_roles UNIQUE (event_id, role)
        WHERE role NOT IN ('groomsman', 'usher', 'other')
);

-- Indexes
CREATE INDEX idx_wedding_templates_event_id ON public.wedding_templates(event_id);
CREATE INDEX idx_wedding_templates_suit_config_id ON public.wedding_templates(suit_config_id);

-- Trigger
CREATE TRIGGER update_wedding_templates_updated_at
    BEFORE UPDATE ON public.wedding_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.wedding_templates ENABLE ROW LEVEL SECURITY;
