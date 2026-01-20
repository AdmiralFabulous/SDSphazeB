-- DB-E02-S01-T02: Add Wedding Date Constraint
-- Ensures wedding events must be scheduled at least 4 weeks (28 days) in the future
-- to allow sufficient time for measurement collection and suit production

-- Add check constraint for minimum lead time
ALTER TABLE public.wedding_events
ADD CONSTRAINT wedding_events_min_lead_time
CHECK (event_date >= CURRENT_DATE + INTERVAL '28 days');

-- Comments for documentation
COMMENT ON CONSTRAINT wedding_events_min_lead_time ON public.wedding_events IS
'Ensures wedding event dates are at least 28 days (4 weeks) in the future to allow time for measurement collection and suit production';
