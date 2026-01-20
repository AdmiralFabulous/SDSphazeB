-- Create or replace the update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create fabrics table
CREATE TABLE public.fabrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,  -- e.g., 'RAY-NVY-001'
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Pricing
    price_modifier DECIMAL(3,2) DEFAULT 1.00 NOT NULL,  -- Multiplier
    base_price_gbp DECIMAL(8,2),

    -- Visuals
    texture_url TEXT,  -- URL to PBR texture set
    thumbnail_url TEXT,
    color_hex VARCHAR(7),  -- Primary color for UI

    -- Availability
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER,
    lead_time_days INTEGER DEFAULT 14,

    -- Physical properties
    properties JSONB DEFAULT '{}'::jsonb,
    /*
    {
        "weight_gsm": 280,
        "composition": "100% Wool",
        "weave": "Plain",
        "stretch": false,
        "season": ["autumn", "winter"],
        "care": ["dry clean only"]
    }
    */

    -- Supplier info
    supplier VARCHAR(255),  -- e.g., 'Raymond'
    supplier_code VARCHAR(100),

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_fabrics_code ON public.fabrics(code);
CREATE INDEX idx_fabrics_in_stock ON public.fabrics(in_stock) WHERE in_stock = TRUE;
CREATE INDEX idx_fabrics_is_active ON public.fabrics(is_active) WHERE is_active = TRUE;

-- Trigger
CREATE TRIGGER update_fabrics_updated_at
    BEFORE UPDATE ON public.fabrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
