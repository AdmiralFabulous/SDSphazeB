-- Create event status enum
CREATE TYPE wedding_event_status AS ENUM (
    'draft',           -- Organizer still configuring
    'templates_locked', -- Templates finalized, invites can be sent
    'invites_sent',    -- Invites have been sent to attendees
    'measuring',       -- Attendees are submitting measurements
    'confirmed',       -- All measurements received
    'paid',            -- Payment completed
    'in_production',   -- Suits being made
    'completed'        -- Event completed
);

-- Create wedding_events table
CREATE TABLE public.wedding_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Event details
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    venue_name VARCHAR(255),
    venue_location TEXT,

    -- Status tracking
    status wedding_event_status DEFAULT 'draft' NOT NULL,

    -- Settings
    measurement_deadline DATE,
    allow_late_submissions BOOLEAN DEFAULT FALSE,

    -- Metadata
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraint: event_date must be at least 4 weeks in the future
    CONSTRAINT event_date_minimum CHECK (event_date >= CURRENT_DATE + INTERVAL '4 weeks')
);

-- Indexes for performance
CREATE INDEX idx_wedding_events_organizer_id ON public.wedding_events(organizer_id);
CREATE INDEX idx_wedding_events_event_date ON public.wedding_events(event_date);
CREATE INDEX idx_wedding_events_status ON public.wedding_events(status);

-- Trigger for automatic updated_at timestamp
CREATE TRIGGER update_wedding_events_updated_at
    BEFORE UPDATE ON public.wedding_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;
