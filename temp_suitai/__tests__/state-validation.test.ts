/**
 * Test suite for Order State Machine Validation
 * Tests state transitions, validation, and edge cases
 */

import {
  isValidTransition,
  getValidNextStates,
  getStateLabel,
  validateStateTransition,
  STATE_TRANSITIONS,
  STATE_LABELS,
} from '../src/lib/orders/state-machine';

function runStateValidationTests() {
  console.log('Starting Order State Machine Validation Tests...\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Valid state transitions
  console.log('Test 1: Valid state transitions');
  const validTransitions = [
    ['S01_PAID', 'S02_MEASUREMENT_PENDING'],
    ['S02_MEASUREMENT_PENDING', 'S03_MEASUREMENT_RECEIVED'],
    ['S06_SENT_TO_PRINTER', 'S07_PRINT_COLLECTED'],
    ['S06_SENT_TO_PRINTER', 'S08_PRINT_REJECTED'],
    ['S14_QC_IN_PROGRESS', 'S15_QC_PASSED'],
    ['S14_QC_IN_PROGRESS', 'S16_QC_FAILED'],
  ];

  validTransitions.forEach(([from, to]) => {
    const result = isValidTransition(from, to);
    if (result === true) {
      console.log(`  ✓ ${from} → ${to}`);
      passedTests++;
    } else {
      console.log(`  ✗ ${from} → ${to} (Expected: valid)`);
      failedTests++;
    }
  });
  console.log();

  // Test 2: Invalid state transitions
  console.log('Test 2: Invalid state transitions');
  const invalidTransitions = [
    ['S01_PAID', 'S05_PATTERN_GENERATED'], // Skipping states
    ['S02_MEASUREMENT_PENDING', 'S01_PAID'], // Going backward
    ['S15_QC_PASSED', 'S16_QC_FAILED'], // Wrong branch
    ['S19_COMPLETE', 'S01_PAID'], // From terminal state
  ];

  invalidTransitions.forEach(([from, to]) => {
    const result = isValidTransition(from, to);
    if (result === false) {
      console.log(`  ✓ ${from} → ${to} (Correctly rejected)`);
      passedTests++;
    } else {
      console.log(`  ✗ ${from} → ${to} (Expected: invalid)`);
      failedTests++;
    }
  });
  console.log();

  // Test 3: Get valid next states
  console.log('Test 3: Get valid next states');
  const testCases = [
    { state: 'S01_PAID', expected: ['S02_MEASUREMENT_PENDING'] },
    { state: 'S06_SENT_TO_PRINTER', expected: ['S07_PRINT_COLLECTED', 'S08_PRINT_REJECTED'] },
    { state: 'S14_QC_IN_PROGRESS', expected: ['S15_QC_PASSED', 'S16_QC_FAILED'] },
    { state: 'S19_COMPLETE', expected: [] }, // Terminal state
  ];

  testCases.forEach(({ state, expected }) => {
    const result = getValidNextStates(state);
    const match = JSON.stringify(result) === JSON.stringify(expected);
    if (match) {
      console.log(`  ✓ ${state}: [${expected.join(', ')}]`);
      passedTests++;
    } else {
      console.log(`  ✗ ${state}: Expected [${expected.join(', ')}], Got [${result.join(', ')}]`);
      failedTests++;
    }
  });
  console.log();

  // Test 4: State labels
  console.log('Test 4: State labels');
  const labelTests = [
    { state: 'S01_PAID', expected: 'Paid' },
    { state: 'S02_MEASUREMENT_PENDING', expected: 'Awaiting Measurements' },
    { state: 'S09_DELIVERED_TO_RAJA', expected: 'Delivered to Tailor' },
    { state: 'S14_QC_IN_PROGRESS', expected: 'Quality Check' },
    { state: 'S19_COMPLETE', expected: 'Complete' },
  ];

  labelTests.forEach(({ state, expected }) => {
    const result = getStateLabel(state);
    if (result === expected) {
      console.log(`  ✓ ${state}: "${expected}"`);
      passedTests++;
    } else {
      console.log(`  ✗ ${state}: Expected "${expected}", Got "${result}"`);
      failedTests++;
    }
  });
  console.log();

  // Test 5: Validate state transition with detailed errors
  console.log('Test 5: Validate state transition with detailed errors');

  // Valid transition
  const valid1 = validateStateTransition('S01_PAID', 'S02_MEASUREMENT_PENDING');
  if (valid1.valid === true && !valid1.error) {
    console.log('  ✓ Valid transition returns success');
    passedTests++;
  } else {
    console.log('  ✗ Valid transition should return success');
    failedTests++;
  }

  // Unknown source state
  const invalid1 = validateStateTransition('S99_UNKNOWN', 'S01_PAID');
  if (!invalid1.valid && invalid1.error?.includes('Unknown state')) {
    console.log('  ✓ Unknown source state returns error');
    passedTests++;
  } else {
    console.log('  ✗ Unknown source state should return error');
    failedTests++;
  }

  // Unknown target state
  const invalid2 = validateStateTransition('S01_PAID', 'S99_UNKNOWN');
  if (!invalid2.valid && invalid2.error?.includes('Unknown target state')) {
    console.log('  ✓ Unknown target state returns error');
    passedTests++;
  } else {
    console.log('  ✗ Unknown target state should return error');
    failedTests++;
  }

  // Terminal state
  const invalid3 = validateStateTransition('S19_COMPLETE', 'S01_PAID');
  if (!invalid3.valid && invalid3.error?.includes('terminal state')) {
    console.log('  ✓ Terminal state returns error');
    passedTests++;
  } else {
    console.log('  ✗ Terminal state should return error');
    failedTests++;
  }

  // Invalid transition with valid options
  const invalid4 = validateStateTransition('S01_PAID', 'S05_PATTERN_GENERATED');
  if (!invalid4.valid && invalid4.validOptions && invalid4.validOptions.length > 0) {
    console.log('  ✓ Invalid transition returns valid options');
    console.log(`    Valid options: [${invalid4.validOptions.join(', ')}]`);
    passedTests++;
  } else {
    console.log('  ✗ Invalid transition should return valid options');
    failedTests++;
  }
  console.log();

  // Test 6: Edge cases - retry flows
  console.log('Test 6: Edge cases - Retry/rejection flows');
  const retryFlows = [
    ['S08_PRINT_REJECTED', 'S06_SENT_TO_PRINTER'], // Retry printing
    ['S16_QC_FAILED', 'S12_STITCHING_IN_PROGRESS'], // Retry stitching
  ];

  retryFlows.forEach(([from, to]) => {
    const result = isValidTransition(from, to);
    if (result === true) {
      console.log(`  ✓ Retry flow: ${from} → ${to}`);
      passedTests++;
    } else {
      console.log(`  ✗ Retry flow should be valid: ${from} → ${to}`);
      failedTests++;
    }
  });
  console.log();

  // Test 7: All states have labels
  console.log('Test 7: All states have labels');
  const allStates = Object.keys(STATE_TRANSITIONS);
  allStates.push('S19_COMPLETE'); // Add terminal state

  let missingLabels = 0;
  allStates.forEach((state) => {
    if (!STATE_LABELS[state]) {
      console.log(`  ✗ Missing label for state: ${state}`);
      missingLabels++;
      failedTests++;
    }
  });

  if (missingLabels === 0) {
    console.log('  ✓ All states have labels');
    passedTests++;
  }
  console.log();

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('Test Summary:');
  console.log(`  Total: ${passedTests + failedTests}`);
  console.log(`  ✓ Passed: ${passedTests}`);
  console.log(`  ✗ Failed: ${failedTests}`);
  console.log('═══════════════════════════════════════════\n');

  if (failedTests === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
  }

  return { passedTests, failedTests };
}

export default runStateValidationTests;

// Run tests if executed directly
runStateValidationTests();
