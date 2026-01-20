-- Test file for DB-E02-S01-T02: Wedding Date Constraint
-- This file contains test cases to verify the wedding_events_min_lead_time constraint

-- Prerequisites: This assumes the wedding_events table exists and the constraint has been applied

-- ============================================================================
-- TEST 1: Insert with date < NOW() + 4 weeks (28 days) - SHOULD FAIL
-- ============================================================================

-- Test with 7 days in the future (should fail)
INSERT INTO public.wedding_events (organizer_id, event_name, event_date)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Test Wedding - Too Soon',
    CURRENT_DATE + INTERVAL '7 days'
);
-- Expected: ERROR: new row for relation "wedding_events" violates check constraint "wedding_events_min_lead_time"

-- Test with exactly 27 days in the future (should fail)
INSERT INTO public.wedding_events (organizer_id, event_name, event_date)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Test Wedding - One Day Too Soon',
    CURRENT_DATE + INTERVAL '27 days'
);
-- Expected: ERROR: new row for relation "wedding_events" violates check constraint "wedding_events_min_lead_time"

-- Test with today's date (should fail)
INSERT INTO public.wedding_events (organizer_id, event_name, event_date)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Test Wedding - Today',
    CURRENT_DATE
);
-- Expected: ERROR: new row for relation "wedding_events" violates check constraint "wedding_events_min_lead_time"

-- ============================================================================
-- TEST 2: Insert with date >= NOW() + 4 weeks (28 days) - SHOULD SUCCEED
-- ============================================================================

-- Test with exactly 28 days in the future (should succeed)
INSERT INTO public.wedding_events (organizer_id, event_name, event_date)
VALUES (
    'valid-user-uuid-here',
    'Test Wedding - Exactly 28 Days',
    CURRENT_DATE + INTERVAL '28 days'
);
-- Expected: SUCCESS - 1 row inserted

-- Test with 30 days in the future (should succeed)
INSERT INTO public.wedding_events (organizer_id, event_name, event_date)
VALUES (
    'valid-user-uuid-here',
    'Test Wedding - 30 Days Out',
    CURRENT_DATE + INTERVAL '30 days'
);
-- Expected: SUCCESS - 1 row inserted

-- Test with 60 days in the future (should succeed)
INSERT INTO public.wedding_events (organizer_id, event_name, event_date)
VALUES (
    'valid-user-uuid-here',
    'Test Wedding - Two Months Out',
    CURRENT_DATE + INTERVAL '60 days'
);
-- Expected: SUCCESS - 1 row inserted

-- ============================================================================
-- Cleanup (optional)
-- ============================================================================

-- Remove test data if needed
-- DELETE FROM public.wedding_events WHERE event_name LIKE 'Test Wedding%';

-- ============================================================================
-- NOTES FOR TESTING
-- ============================================================================

-- Before running these tests:
-- 1. Ensure the wedding_events table exists (prerequisite: DB-E02-S01-T01)
-- 2. Ensure the constraint has been applied (this task: DB-E02-S01-T02)
-- 3. Replace 'valid-user-uuid-here' with an actual UUID from the users table
--    OR create a test user first:
--
--    INSERT INTO public.users (id, email, full_name)
--    VALUES (
--        'valid-user-uuid-here'::uuid,
--        'test@example.com',
--        'Test User'
--    );

-- To verify the constraint exists, run:
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.wedding_events'::regclass
-- AND conname = 'wedding_events_min_lead_time';
