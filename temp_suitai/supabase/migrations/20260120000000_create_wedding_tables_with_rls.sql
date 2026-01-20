-- Create or replace the update_updated_at_column trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- WEDDING EVENTS TABLE
-- ============================================================================

CREATE TABLE public.wedding_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Event Details
    event_name VARCHAR(255) NOT NULL,
    event_date DATE,
    venue_name VARCHAR(255),
    venue_address TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'draft' NOT NULL,
    -- Possible values: 'draft', 'active', 'completed', 'cancelled'

    -- Metadata
    notes TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    /*
    {
        "timezone": "Europe/London",
        "measurement_deadline": "2024-12-01",
        "notifications_enabled": true
    }
    */

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for wedding_events
CREATE INDEX idx_wedding_events_organizer_id ON public.wedding_events(organizer_id);
CREATE INDEX idx_wedding_events_status ON public.wedding_events(status);
CREATE INDEX idx_wedding_events_event_date ON public.wedding_events(event_date);

-- Trigger for wedding_events
CREATE TRIGGER update_wedding_events_updated_at
    BEFORE UPDATE ON public.wedding_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on wedding_events
ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wedding_events
CREATE POLICY "Organizers can manage own events"
    ON public.wedding_events
    FOR ALL
    USING (organizer_id = auth.uid());

CREATE POLICY "Service role full access to events"
    ON public.wedding_events
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- WEDDING TEMPLATES TABLE
-- ============================================================================

CREATE TABLE public.wedding_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,

    -- Template Details
    template_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    -- e.g., 'groomsman', 'bridesmaid', 'best_man', 'maid_of_honor'

    -- Garment Configuration
    garment_type VARCHAR(100) NOT NULL,
    -- e.g., 'suit', 'dress', 'tuxedo'

    fabric_id UUID REFERENCES public.fabrics(id),

    -- Style & Customization
    style_config JSONB DEFAULT '{}'::jsonb,
    /*
    {
        "jacket_style": "single_breasted",
        "lapel_type": "notch",
        "buttons": 2,
        "pockets": ["flap", "breast"],
        "vent": "center",
        "color": "#1a1a1a"
    }
    */

    measurements_required JSONB DEFAULT '[]'::jsonb,
    -- List of required measurement fields

    -- Pricing
    base_price_gbp DECIMAL(8,2),

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for wedding_templates
CREATE INDEX idx_wedding_templates_event_id ON public.wedding_templates(event_id);
CREATE INDEX idx_wedding_templates_role ON public.wedding_templates(role);
CREATE INDEX idx_wedding_templates_is_active ON public.wedding_templates(is_active) WHERE is_active = TRUE;

-- Trigger for wedding_templates
CREATE TRIGGER update_wedding_templates_updated_at
    BEFORE UPDATE ON public.wedding_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on wedding_templates
ALTER TABLE public.wedding_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wedding_templates
CREATE POLICY "Organizers can manage templates for own events"
    ON public.wedding_templates
    FOR ALL
    USING (
        event_id IN (
            SELECT id FROM public.wedding_events
            WHERE organizer_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access to templates"
    ON public.wedding_templates
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- WEDDING ATTENDEES TABLE
-- ============================================================================

CREATE TABLE public.wedding_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.wedding_templates(id) ON DELETE SET NULL,

    -- Attendee Details
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(100),

    -- Invite Token (for secure access without authentication)
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    invite_sent_at TIMESTAMPTZ,
    invite_accepted_at TIMESTAMPTZ,

    -- Measurements
    measurements JSONB DEFAULT '{}'::jsonb,
    /*
    {
        "chest": 102.5,
        "waist": 85.0,
        "hips": 95.0,
        "inseam": 81.0,
        "height": 175.0,
        "weight": 75.0,
        "shoulder_width": 45.0,
        "arm_length": 63.0,
        "neck": 40.0
    }
    */

    measurements_submitted_at TIMESTAMPTZ,
    measurements_approved BOOLEAN DEFAULT FALSE,
    measurements_approved_at TIMESTAMPTZ,

    -- Order Information
    order_status VARCHAR(50) DEFAULT 'pending',
    -- Possible values: 'pending', 'confirmed', 'in_production', 'completed', 'cancelled'

    order_notes TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for wedding_attendees
CREATE INDEX idx_wedding_attendees_event_id ON public.wedding_attendees(event_id);
CREATE INDEX idx_wedding_attendees_template_id ON public.wedding_attendees(template_id);
CREATE INDEX idx_wedding_attendees_invite_token ON public.wedding_attendees(invite_token);
CREATE INDEX idx_wedding_attendees_email ON public.wedding_attendees(email);
CREATE INDEX idx_wedding_attendees_order_status ON public.wedding_attendees(order_status);

-- Trigger for wedding_attendees
CREATE TRIGGER update_wedding_attendees_updated_at
    BEFORE UPDATE ON public.wedding_attendees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on wedding_attendees
ALTER TABLE public.wedding_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wedding_attendees

-- Organizers can manage attendees for own events
CREATE POLICY "Organizers can manage attendees for own events"
    ON public.wedding_attendees
    FOR ALL
    USING (
        event_id IN (
            SELECT id FROM public.wedding_events
            WHERE organizer_id = auth.uid()
        )
    );

-- Attendees can view their own record via invite token
CREATE POLICY "Attendees can view own record via token"
    ON public.wedding_attendees
    FOR SELECT
    USING (
        invite_token = coalesce(
            current_setting('request.jwt.claim.invite_token', true),
            ''
        )
    );

-- Attendees can update their own record (submit measurements)
CREATE POLICY "Attendees can update own record via token"
    ON public.wedding_attendees
    FOR UPDATE
    USING (
        invite_token = coalesce(
            current_setting('request.jwt.claim.invite_token', true),
            ''
        )
    );

-- Service role has full access
CREATE POLICY "Service role full access to attendees"
    ON public.wedding_attendees
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.wedding_events IS 'Wedding events organized by users';
COMMENT ON TABLE public.wedding_templates IS 'Garment templates for different wedding party roles';
COMMENT ON TABLE public.wedding_attendees IS 'Wedding party attendees with measurements and order status';

COMMENT ON COLUMN public.wedding_attendees.invite_token IS 'Secure token for attendees to access their record without authentication';
COMMENT ON COLUMN public.wedding_attendees.measurements IS 'JSONB object containing body measurements in centimeters';
