-- Create file type enum
CREATE TYPE pattern_file_type AS ENUM (
    'dxf',           -- Vector pattern for cutting
    'pdf',           -- Print-ready pattern
    'tech_pack_pdf', -- Technical specifications
    'marker_pdf',    -- Marker layout
    'preview_png'    -- Preview image
);

-- Create pattern_files table
CREATE TABLE public.pattern_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,

    -- File details
    file_type pattern_file_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,  -- Supabase Storage URL
    file_size_bytes BIGINT,

    -- Version tracking
    version INTEGER DEFAULT 1 NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,

    -- Calibration (for printed patterns)
    calibration_verified BOOLEAN DEFAULT FALSE,
    calibration_verified_at TIMESTAMPTZ,
    calibration_verified_by UUID REFERENCES public.users(id),
    calibration_value_cm DECIMAL(4,2),  -- Ruler test result

    -- Generation metadata
    generated_by VARCHAR(100),  -- 'optitex', 'manual', etc.
    generation_params JSONB,    -- Parameters used

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_pattern_files_order_item_id ON public.pattern_files(order_item_id);
CREATE INDEX idx_pattern_files_file_type ON public.pattern_files(file_type);
CREATE INDEX idx_pattern_files_is_current ON public.pattern_files(is_current) WHERE is_current = TRUE;

-- Trigger for updated_at
CREATE TRIGGER update_pattern_files_updated_at
    BEFORE UPDATE ON public.pattern_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.pattern_files ENABLE ROW LEVEL SECURITY;

-- Mark old versions as not current when new version added
CREATE OR REPLACE FUNCTION mark_old_pattern_versions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.pattern_files
    SET is_current = FALSE
    WHERE order_item_id = NEW.order_item_id
      AND file_type = NEW.file_type
      AND id != NEW.id
      AND is_current = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_old_pattern_versions
    AFTER INSERT ON public.pattern_files
    FOR EACH ROW
    EXECUTE FUNCTION mark_old_pattern_versions();
