-- Create measurements table
-- Task: DB-E01-S02-T01
-- Description: Store all 28 body measurements from vision pipeline with SMPL-X parameters
-- Prerequisites: sessions table must exist (created in DB-E01-S01)

CREATE TABLE public.measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,

    -- Core measurements (all in millimeters)
    height DECIMAL(6,1),
    weight_kg DECIMAL(5,1),

    -- Torso measurements
    chest_circumference DECIMAL(5,1),
    waist_circumference DECIMAL(5,1),
    hip_circumference DECIMAL(5,1),
    shoulder_width DECIMAL(5,1),
    back_width DECIMAL(5,1),
    chest_width DECIMAL(5,1),
    torso_length DECIMAL(5,1),

    -- Arm measurements
    shoulder_to_wrist DECIMAL(5,1),
    shoulder_to_elbow DECIMAL(5,1),
    elbow_to_wrist DECIMAL(5,1),
    bicep_circumference DECIMAL(5,1),
    forearm_circumference DECIMAL(5,1),
    wrist_circumference DECIMAL(5,1),

    -- Neck measurements
    neck_circumference DECIMAL(5,1),
    neck_to_shoulder DECIMAL(5,1),

    -- Leg measurements
    inseam DECIMAL(5,1),
    outseam DECIMAL(5,1),
    thigh_circumference DECIMAL(5,1),
    knee_circumference DECIMAL(5,1),
    calf_circumference DECIMAL(5,1),
    ankle_circumference DECIMAL(5,1),

    -- Additional measurements
    rise DECIMAL(5,1),
    across_back DECIMAL(5,1),
    armhole_depth DECIMAL(5,1),
    sleeve_length DECIMAL(5,1),

    -- Raw data from vision pipeline
    smplx_beta JSONB,  -- 10-dimensional shape vector
    smplx_theta JSONB, -- Pose parameters (optional)
    confidence_scores JSONB, -- Per-measurement confidence

    -- User corrections
    user_overrides JSONB DEFAULT '{}'::jsonb,

    -- Metadata
    source VARCHAR(50) DEFAULT 'vision', -- 'vision', 'manual', 'imported'
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.users(id),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_measurements_session_id ON public.measurements(session_id);
CREATE INDEX idx_measurements_source ON public.measurements(source);
CREATE INDEX idx_measurements_is_verified ON public.measurements(is_verified);
CREATE INDEX idx_measurements_created_at ON public.measurements(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_measurements_updated_at
    BEFORE UPDATE ON public.measurements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own measurements"
    ON public.measurements
    FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM public.sessions
            WHERE user_id = auth.uid()
            OR id::text = coalesce(current_setting('request.jwt.claim.session_id', true), '')
        )
    );

CREATE POLICY "Users can insert own measurements"
    ON public.measurements
    FOR INSERT
    WITH CHECK (
        session_id IN (
            SELECT id FROM public.sessions
            WHERE user_id = auth.uid()
            OR id::text = coalesce(current_setting('request.jwt.claim.session_id', true), '')
        )
    );

CREATE POLICY "Users can update own measurements"
    ON public.measurements
    FOR UPDATE
    USING (
        session_id IN (
            SELECT id FROM public.sessions
            WHERE user_id = auth.uid()
            OR id::text = coalesce(current_setting('request.jwt.claim.session_id', true), '')
        )
    );

CREATE POLICY "Users can delete own measurements"
    ON public.measurements
    FOR DELETE
    USING (
        session_id IN (
            SELECT id FROM public.sessions
            WHERE user_id = auth.uid()
            OR id::text = coalesce(current_setting('request.jwt.claim.session_id', true), '')
        )
    );

-- Add helpful comment
COMMENT ON TABLE public.measurements IS 'Stores all 28 body measurements extracted from vision pipeline with SMPL-X parameters and user overrides';
COMMENT ON COLUMN public.measurements.smplx_beta IS '10-dimensional SMPL-X shape parameter vector';
COMMENT ON COLUMN public.measurements.smplx_theta IS 'SMPL-X pose parameters (optional)';
COMMENT ON COLUMN public.measurements.confidence_scores IS 'Per-measurement confidence scores from vision pipeline';
COMMENT ON COLUMN public.measurements.user_overrides IS 'User manual corrections to measurements in JSONB format';
