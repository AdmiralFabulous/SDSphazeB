/**
 * Test suite for the Height Input Endpoint
 * Tests POST /api/sessions/:id/height
 */

import { prisma } from '../src/lib/prisma';

async function testHeightEndpoint() {
  console.log('Starting Height Endpoint Tests...\n');

  try {
    // Test 1: Create a session with valid height
    console.log('Test 1: Creating session with valid height (175cm)');
    const testSessionId = 'test-session-' + Date.now();

    const response1 = await fetch('http://localhost:3000/api/sessions/' + testSessionId + '/height', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ height: 175 }),
    });

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✓ Test 1 Passed:', data1);
      console.log('  - Session ID:', data1.sessionId);
      console.log('  - Height stored:', data1.height, 'cm\n');
    } else {
      console.log('✗ Test 1 Failed:', response1.status);
    }

    // Test 2: Test height too low (below 100cm)
    console.log('Test 2: Testing validation - height too low (50cm)');
    const response2 = await fetch('http://localhost:3000/api/sessions/test-session-low/height', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ height: 50 }),
    });

    if (response2.status === 400) {
      const data2 = await response2.json();
      console.log('✓ Test 2 Passed: Correctly rejected height below 100cm');
      console.log('  - Status:', response2.status, '\n');
    } else {
      console.log('✗ Test 2 Failed: Should return 400 for height below 100cm\n');
    }

    // Test 3: Test height too high (above 250cm)
    console.log('Test 3: Testing validation - height too high (300cm)');
    const response3 = await fetch('http://localhost:3000/api/sessions/test-session-high/height', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ height: 300 }),
    });

    if (response3.status === 400) {
      const data3 = await response3.json();
      console.log('✓ Test 3 Passed: Correctly rejected height above 250cm');
      console.log('  - Status:', response3.status, '\n');
    } else {
      console.log('✗ Test 3 Failed: Should return 400 for height above 250cm\n');
    }

    // Test 4: Test valid height at boundaries
    console.log('Test 4: Testing boundary values');
    const testMin = await fetch('http://localhost:3000/api/sessions/test-min/height', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ height: 100 }),
    });

    const testMax = await fetch('http://localhost:3000/api/sessions/test-max/height', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ height: 250 }),
    });

    if (testMin.ok && testMax.ok) {
      console.log('✓ Test 4 Passed: Boundary values accepted');
      const minData = await testMin.json();
      const maxData = await testMax.json();
      console.log('  - Min (100cm):', minData.height);
      console.log('  - Max (250cm):', maxData.height, '\n');
    } else {
      console.log('✗ Test 4 Failed: Boundary values should be accepted\n');
    }

    // Test 5: Update existing session
    console.log('Test 5: Testing session update');
    const updateResponse = await fetch('http://localhost:3000/api/sessions/' + testSessionId + '/height', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ height: 180 }),
    });

    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✓ Test 5 Passed: Session height updated');
      console.log('  - Updated height:', updateData.height, 'cm\n');
    } else {
      console.log('✗ Test 5 Failed: Should update existing session\n');
    }

    console.log('All tests completed!');
  } catch (error) {
    console.error('Test Error:', error);
  }
}

export default testHeightEndpoint;
