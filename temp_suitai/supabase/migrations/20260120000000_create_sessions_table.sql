-- Create sessions table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

    -- Session metadata
    status VARCHAR(50) DEFAULT 'active' NOT NULL,  -- active, completed, abandoned
    session_type VARCHAR(50),  -- in_store, online, etc.

    -- Measurement data (collected during session)
    height DECIMAL(5,2),  -- Height in cm

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_sessions_created_at ON public.sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth requirements)
CREATE POLICY "Users can view their own sessions"
    ON public.sessions FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create sessions"
    ON public.sessions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own sessions"
    ON public.sessions FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Create updated_at trigger
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.sessions IS 'Customer suit fitting sessions';
COMMENT ON COLUMN public.sessions.height IS 'Customer height in centimeters';
COMMENT ON COLUMN public.sessions.status IS 'Session status: active, completed, or abandoned';
