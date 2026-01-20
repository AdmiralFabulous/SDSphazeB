/**
 * Test suite for the Scan Status Endpoint
 * Tests GET and POST /api/sessions/:id/scan
 */

import { prisma } from '../src/lib/prisma';

async function testScanStatusEndpoint() {
  console.log('Starting Scan Status Endpoint Tests...\n');

  try {
    // Test 1: GET status for non-existent session
    console.log('Test 1: Getting status for non-existent session');
    const nonExistentId = 'non-existent-' + Date.now();
    const response1 = await fetch(`http://localhost:3000/api/sessions/${nonExistentId}/scan`, {
      method: 'GET',
    });

    if (response1.status === 404) {
      const data1 = await response1.json();
      console.log('✓ Test 1 Passed: Correctly returned 404 for non-existent session');
      console.log('  - Status:', response1.status, '\n');
    } else {
      console.log('✗ Test 1 Failed: Should return 404 for non-existent session\n');
    }

    // Test 2: Create session with rotation_speed
    console.log('Test 2: Creating session with rotation_speed');
    const testSessionId = 'test-session-' + Date.now();
    const response2 = await fetch(`http://localhost:3000/api/sessions/${testSessionId}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rotation_speed: 45.5 }),
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✓ Test 2 Passed: Session created with rotation_speed');
      console.log('  - Session ID:', data2.sessionId);
      console.log('  - Rotation Speed:', data2.rotation_speed, 'degrees/second\n');
    } else {
      console.log('✗ Test 2 Failed: Should create session with rotation_speed\n');
    }

    // Test 3: GET status for created session
    console.log('Test 3: Getting status for created session');
    const response3 = await fetch(`http://localhost:3000/api/sessions/${testSessionId}/scan`, {
      method: 'GET',
    });

    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✓ Test 3 Passed: Retrieved session status');
      console.log('  - Session ID:', data3.sessionId);
      console.log('  - Rotation Speed:', data3.rotation_speed, 'degrees/second');
      console.log('  - Has timestamp:', !!data3.createdAt, '\n');
    } else {
      console.log('✗ Test 3 Failed: Should retrieve session status\n');
    }

    // Test 4: Update rotation_speed
    console.log('Test 4: Updating rotation_speed');
    const response4 = await fetch(`http://localhost:3000/api/sessions/${testSessionId}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rotation_speed: 60.0 }),
    });

    if (response4.ok) {
      const data4 = await response4.json();
      if (data4.rotation_speed === 60.0) {
        console.log('✓ Test 4 Passed: rotation_speed updated successfully');
        console.log('  - New Rotation Speed:', data4.rotation_speed, 'degrees/second\n');
      } else {
        console.log('✗ Test 4 Failed: rotation_speed was not updated correctly\n');
      }
    } else {
      console.log('✗ Test 4 Failed: Should update rotation_speed\n');
    }

    // Test 5: Test zero rotation_speed
    console.log('Test 5: Setting rotation_speed to zero');
    const response5 = await fetch(`http://localhost:3000/api/sessions/${testSessionId}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rotation_speed: 0 }),
    });

    if (response5.ok) {
      const data5 = await response5.json();
      if (data5.rotation_speed === 0) {
        console.log('✓ Test 5 Passed: rotation_speed set to zero');
        console.log('  - Rotation Speed:', data5.rotation_speed, '\n');
      } else {
        console.log('✗ Test 5 Failed: rotation_speed should be zero\n');
      }
    } else {
      console.log('✗ Test 5 Failed: Should accept zero value\n');
    }

    // Test 6: Test negative rotation_speed (should fail)
    console.log('Test 6: Testing validation - negative rotation_speed');
    const response6 = await fetch(`http://localhost:3000/api/sessions/test-negative/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rotation_speed: -10 }),
    });

    if (response6.status === 400) {
      console.log('✓ Test 6 Passed: Correctly rejected negative rotation_speed');
      console.log('  - Status:', response6.status, '\n');
    } else {
      console.log('✗ Test 6 Failed: Should reject negative rotation_speed\n');
    }

    // Test 7: POST without rotation_speed (optional field)
    console.log('Test 7: Creating session without rotation_speed');
    const testSessionId2 = 'test-session-no-speed-' + Date.now();
    const response7 = await fetch(`http://localhost:3000/api/sessions/${testSessionId2}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (response7.ok) {
      const data7 = await response7.json();
      console.log('✓ Test 7 Passed: Session created without rotation_speed');
      console.log('  - Rotation Speed (default):', data7.rotation_speed, '\n');
    } else {
      console.log('✗ Test 7 Failed: Should create session without rotation_speed\n');
    }

    // Test 8: Verify status response structure
    console.log('Test 8: Verifying response structure');
    const response8 = await fetch(`http://localhost:3000/api/sessions/${testSessionId}/scan`, {
      method: 'GET',
    });

    if (response8.ok) {
      const data8 = await response8.json();
      const hasRequiredFields =
        'sessionId' in data8 &&
        'rotation_speed' in data8 &&
        'createdAt' in data8 &&
        'updatedAt' in data8;

      if (hasRequiredFields) {
        console.log('✓ Test 8 Passed: Response contains all required fields');
        console.log('  - Fields:', Object.keys(data8).join(', '), '\n');
      } else {
        console.log('✗ Test 8 Failed: Response missing required fields\n');
      }
    } else {
      console.log('✗ Test 8 Failed: Could not verify response structure\n');
    }

    console.log('All tests completed!');
  } catch (error) {
    console.error('Test Error:', error);
  }
}

export default testScanStatusEndpoint;
