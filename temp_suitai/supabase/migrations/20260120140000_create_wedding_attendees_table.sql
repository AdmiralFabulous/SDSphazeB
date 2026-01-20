-- Create attendee status enum
CREATE TYPE attendee_status AS ENUM (
    'invited',          -- Invite sent, not yet accessed
    'viewed',           -- Viewed the invite link
    'measuring',        -- Started measurement process
    'submitted',        -- Measurements submitted
    'confirmed',        -- Organizer confirmed measurements
    'needs_revision'    -- Organizer requested re-measurement
);

-- Create wedding_attendees table
CREATE TABLE public.wedding_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.wedding_templates(id) ON DELETE RESTRICT,

    -- Attendee info
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),

    -- Invite token (URL-safe, unique)
    invite_token VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),

    -- Status tracking
    status attendee_status DEFAULT 'invited' NOT NULL,
    invite_sent_at TIMESTAMPTZ,
    first_viewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,

    -- Linked measurement (once submitted)
    measurement_id UUID REFERENCES public.measurements(id) ON DELETE SET NULL,

    -- Notes
    organizer_notes TEXT,
    attendee_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Unique email per event
    CONSTRAINT unique_attendee_email_per_event UNIQUE (event_id, email)
);

-- Indexes
CREATE INDEX idx_wedding_attendees_event_id ON public.wedding_attendees(event_id);
CREATE INDEX idx_wedding_attendees_template_id ON public.wedding_attendees(template_id);
CREATE INDEX idx_wedding_attendees_invite_token ON public.wedding_attendees(invite_token);
CREATE INDEX idx_wedding_attendees_email ON public.wedding_attendees(email);
CREATE INDEX idx_wedding_attendees_status ON public.wedding_attendees(status);

-- Trigger
CREATE TRIGGER update_wedding_attendees_updated_at
    BEFORE UPDATE ON public.wedding_attendees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.wedding_attendees ENABLE ROW LEVEL SECURITY;
