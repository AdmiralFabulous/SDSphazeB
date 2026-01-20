-- Migration: DB-E03-S01-T05 - Create State Transition Function
-- Description: Create PostgreSQL functions to validate legal state transitions
--              according to the order state machine rules
-- Prerequisite: DB-E03-S01-T01 (order_state enum and orders table must exist)

-- ============================================================================
-- STATE MACHINE DOCUMENTATION
-- ============================================================================
--
-- This state machine enforces the following order lifecycle:
--
-- MAIN FLOW:
-- S01_PAID → S02_MEASUREMENT_PENDING → S03_MEASUREMENT_RECEIVED →
-- S04_PATTERN_PENDING → S05_PATTERN_GENERATED → S06_SENT_TO_PRINTER →
-- S07_PRINT_COLLECTED → S09_DELIVERED_TO_RAJA → S10_CUTTING_IN_PROGRESS →
-- S11_CUTTING_COMPLETE → S12_STITCHING_IN_PROGRESS → S13_STITCHING_COMPLETE →
-- S14_QC_IN_PROGRESS → S15_QC_PASSED → S17_SHIPPED → S18_DELIVERED →
-- S19_COMPLETE
--
-- ERROR RECOVERY FLOWS:
-- - S06_SENT_TO_PRINTER → S08_PRINT_REJECTED → S06_SENT_TO_PRINTER (retry)
-- - S14_QC_IN_PROGRESS → S16_QC_FAILED → S12_STITCHING_IN_PROGRESS (rework)
--
-- TERMINAL STATES:
-- - S19_COMPLETE (no further transitions allowed)
--
-- ============================================================================

-- ============================================================================
-- FUNCTION: validate_order_state_transition
-- ============================================================================
-- Validates whether a state transition is legal according to the state machine
--
-- Parameters:
--   current_state: The current state of the order
--   new_state: The desired new state
--
-- Returns:
--   BOOLEAN - TRUE if transition is valid, FALSE otherwise
--
CREATE OR REPLACE FUNCTION validate_order_state_transition(
    current_state order_state,
    new_state order_state
) RETURNS BOOLEAN AS $$
DECLARE
    valid_transitions JSONB := '{
        "S01_PAID": ["S02_MEASUREMENT_PENDING"],
        "S02_MEASUREMENT_PENDING": ["S03_MEASUREMENT_RECEIVED"],
        "S03_MEASUREMENT_RECEIVED": ["S04_PATTERN_PENDING"],
        "S04_PATTERN_PENDING": ["S05_PATTERN_GENERATED"],
        "S05_PATTERN_GENERATED": ["S06_SENT_TO_PRINTER"],
        "S06_SENT_TO_PRINTER": ["S07_PRINT_COLLECTED", "S08_PRINT_REJECTED"],
        "S07_PRINT_COLLECTED": ["S09_DELIVERED_TO_RAJA"],
        "S08_PRINT_REJECTED": ["S06_SENT_TO_PRINTER"],
        "S09_DELIVERED_TO_RAJA": ["S10_CUTTING_IN_PROGRESS"],
        "S10_CUTTING_IN_PROGRESS": ["S11_CUTTING_COMPLETE"],
        "S11_CUTTING_COMPLETE": ["S12_STITCHING_IN_PROGRESS"],
        "S12_STITCHING_IN_PROGRESS": ["S13_STITCHING_COMPLETE"],
        "S13_STITCHING_COMPLETE": ["S14_QC_IN_PROGRESS"],
        "S14_QC_IN_PROGRESS": ["S15_QC_PASSED", "S16_QC_FAILED"],
        "S15_QC_PASSED": ["S17_SHIPPED"],
        "S16_QC_FAILED": ["S12_STITCHING_IN_PROGRESS"],
        "S17_SHIPPED": ["S18_DELIVERED"],
        "S18_DELIVERED": ["S19_COMPLETE"],
        "S19_COMPLETE": []
    }'::jsonb;
BEGIN
    -- Check if new_state is in the array of valid transitions for current_state
    RETURN valid_transitions->current_state::text ? new_state::text;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment for documentation
COMMENT ON FUNCTION validate_order_state_transition IS
    'Validates if a state transition is legal according to the order state machine rules. Returns TRUE for valid transitions, FALSE otherwise.';

-- ============================================================================
-- TRIGGER FUNCTION: enforce_valid_order_transition
-- ============================================================================
-- Trigger function that prevents invalid state transitions
-- Raises an exception if an invalid transition is attempted
--
CREATE OR REPLACE FUNCTION enforce_valid_order_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate if we're actually changing the state
    -- (OLD.current_state IS NOT NULL ensures we're not on INSERT)
    IF OLD.current_state IS NOT NULL AND
       OLD.current_state != NEW.current_state AND
       NOT validate_order_state_transition(OLD.current_state, NEW.current_state) THEN
        RAISE EXCEPTION 'Invalid state transition from % to %. Use get_valid_next_states(''%'') to see valid transitions.',
            OLD.current_state, NEW.current_state, OLD.current_state;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION enforce_valid_order_transition IS
    'Trigger function that enforces valid state transitions on the orders table. Raises an exception with helpful error message if invalid transition is attempted.';

-- ============================================================================
-- TRIGGER: trigger_enforce_order_transition
-- ============================================================================
-- Automatically enforces state machine rules on every order state update
--
CREATE TRIGGER trigger_enforce_order_transition
    BEFORE UPDATE OF current_state ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION enforce_valid_order_transition();

-- Add comment for documentation
COMMENT ON TRIGGER trigger_enforce_order_transition ON public.orders IS
    'Enforces the order state machine by validating all state transitions before they occur.';

-- ============================================================================
-- HELPER FUNCTION: get_valid_next_states
-- ============================================================================
-- Returns an array of valid next states for a given current state
-- Useful for UI/API to show available actions
--
-- Parameters:
--   current: The current order state
--
-- Returns:
--   order_state[] - Array of valid next states (empty array if none)
--
CREATE OR REPLACE FUNCTION get_valid_next_states(current order_state)
RETURNS order_state[] AS $$
DECLARE
    valid_transitions JSONB := '{
        "S01_PAID": ["S02_MEASUREMENT_PENDING"],
        "S02_MEASUREMENT_PENDING": ["S03_MEASUREMENT_RECEIVED"],
        "S03_MEASUREMENT_RECEIVED": ["S04_PATTERN_PENDING"],
        "S04_PATTERN_PENDING": ["S05_PATTERN_GENERATED"],
        "S05_PATTERN_GENERATED": ["S06_SENT_TO_PRINTER"],
        "S06_SENT_TO_PRINTER": ["S07_PRINT_COLLECTED", "S08_PRINT_REJECTED"],
        "S07_PRINT_COLLECTED": ["S09_DELIVERED_TO_RAJA"],
        "S08_PRINT_REJECTED": ["S06_SENT_TO_PRINTER"],
        "S09_DELIVERED_TO_RAJA": ["S10_CUTTING_IN_PROGRESS"],
        "S10_CUTTING_IN_PROGRESS": ["S11_CUTTING_COMPLETE"],
        "S11_CUTTING_COMPLETE": ["S12_STITCHING_IN_PROGRESS"],
        "S12_STITCHING_IN_PROGRESS": ["S13_STITCHING_COMPLETE"],
        "S13_STITCHING_COMPLETE": ["S14_QC_IN_PROGRESS"],
        "S14_QC_IN_PROGRESS": ["S15_QC_PASSED", "S16_QC_FAILED"],
        "S15_QC_PASSED": ["S17_SHIPPED"],
        "S16_QC_FAILED": ["S12_STITCHING_IN_PROGRESS"],
        "S17_SHIPPED": ["S18_DELIVERED"],
        "S18_DELIVERED": ["S19_COMPLETE"],
        "S19_COMPLETE": []
    }'::jsonb;
    result order_state[];
BEGIN
    -- Extract valid transitions for current state and convert to array
    SELECT ARRAY(
        SELECT jsonb_array_elements_text(valid_transitions->current::text)::order_state
    ) INTO result;
    RETURN COALESCE(result, ARRAY[]::order_state[]);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment for documentation
COMMENT ON FUNCTION get_valid_next_states IS
    'Returns an array of valid next states for a given order state. Useful for generating UI action lists and API validation.';

-- ============================================================================
-- TEST QUERIES
-- ============================================================================
-- Uncomment to run tests after migration

-- Test valid transitions (should return TRUE)
-- SELECT validate_order_state_transition('S01_PAID', 'S02_MEASUREMENT_PENDING'); -- TRUE
-- SELECT validate_order_state_transition('S06_SENT_TO_PRINTER', 'S07_PRINT_COLLECTED'); -- TRUE
-- SELECT validate_order_state_transition('S06_SENT_TO_PRINTER', 'S08_PRINT_REJECTED'); -- TRUE
-- SELECT validate_order_state_transition('S14_QC_IN_PROGRESS', 'S15_QC_PASSED'); -- TRUE
-- SELECT validate_order_state_transition('S14_QC_IN_PROGRESS', 'S16_QC_FAILED'); -- TRUE

-- Test invalid transitions (should return FALSE)
-- SELECT validate_order_state_transition('S01_PAID', 'S05_PATTERN_GENERATED'); -- FALSE (skip states)
-- SELECT validate_order_state_transition('S01_PAID', 'S01_PAID'); -- FALSE (same state)
-- SELECT validate_order_state_transition('S18_DELIVERED', 'S01_PAID'); -- FALSE (backward)
-- SELECT validate_order_state_transition('S19_COMPLETE', 'S01_PAID'); -- FALSE (from terminal)

-- Test get_valid_next_states
-- SELECT get_valid_next_states('S01_PAID'); -- {S02_MEASUREMENT_PENDING}
-- SELECT get_valid_next_states('S06_SENT_TO_PRINTER'); -- {S07_PRINT_COLLECTED, S08_PRINT_REJECTED}
-- SELECT get_valid_next_states('S14_QC_IN_PROGRESS'); -- {S15_QC_PASSED, S16_QC_FAILED}
-- SELECT get_valid_next_states('S19_COMPLETE'); -- {} (empty array)

-- ============================================================================
-- EXAMPLES OF STATE TRANSITIONS
-- ============================================================================
--
-- Valid transition example:
-- UPDATE orders SET current_state = 'S02_MEASUREMENT_PENDING'
-- WHERE id = 'some-order-id' AND current_state = 'S01_PAID';
--
-- Invalid transition example (will raise exception):
-- UPDATE orders SET current_state = 'S05_PATTERN_GENERATED'
-- WHERE id = 'some-order-id' AND current_state = 'S01_PAID';
-- ERROR: Invalid state transition from S01_PAID to S05_PATTERN_GENERATED
--
-- Get available actions for UI:
-- SELECT get_valid_next_states(current_state) FROM orders WHERE id = 'some-order-id';
--
-- ============================================================================
