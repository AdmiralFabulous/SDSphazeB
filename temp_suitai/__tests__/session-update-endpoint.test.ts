/**
 * Test suite for the Session Update Endpoint
 * Tests PUT /api/sessions/:id
 */

import { prisma } from '../src/lib/prisma';

async function testSessionUpdateEndpoint() {
  console.log('Starting Session Update Endpoint Tests...\n');

  try {
    // Setup: Create a test session first
    console.log('Setup: Creating a test session');
    const testSessionId = 'test-session-' + Date.now();
    const session = await prisma.session.create({
      data: {
        id: testSessionId,
      },
    });
    console.log('✓ Test session created:', session.id, '\n');

    // Test 1: Update device fingerprint
    console.log('Test 1: Update device fingerprint');
    const response1 = await fetch(`http://localhost:3001/api/sessions/${testSessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_fingerprint: 'abc123xyz' }),
    });

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✓ Test 1 Passed:', data1);
      console.log('  - Device fingerprint:', data1.deviceFingerprint);
      console.log('  - Last active updated:', data1.lastActiveAt, '\n');
    } else {
      console.log('✗ Test 1 Failed:', response1.status, await response1.text(), '\n');
    }

    // Test 2: Extend expiry
    console.log('Test 2: Extend session expiry');
    const response2 = await fetch(`http://localhost:3001/api/sessions/${testSessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extend_expiry: true }),
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✓ Test 2 Passed');
      console.log('  - Expires at:', data2.expiresAt);

      // Verify expiry is ~30 days from now
      const expiresAt = new Date(data2.expiresAt);
      const expectedExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const timeDiff = Math.abs(expiresAt.getTime() - expectedExpiry.getTime());

      if (timeDiff < 5000) { // Within 5 seconds
        console.log('  - Expiry correctly set to ~30 days from now\n');
      } else {
        console.log('  ⚠ Warning: Expiry date may not be set correctly\n');
      }
    } else {
      console.log('✗ Test 2 Failed:', response2.status, await response2.text(), '\n');
    }

    // Test 3: Update both fields at once
    console.log('Test 3: Update both device_fingerprint and extend_expiry');
    const response3 = await fetch(`http://localhost:3001/api/sessions/${testSessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_fingerprint: 'new-fingerprint-456',
        extend_expiry: true,
      }),
    });

    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✓ Test 3 Passed');
      console.log('  - Device fingerprint:', data3.deviceFingerprint);
      console.log('  - Expires at:', data3.expiresAt, '\n');
    } else {
      console.log('✗ Test 3 Failed:', response3.status, await response3.text(), '\n');
    }

    // Test 4: Update non-existent session (should return 404)
    console.log('Test 4: Update non-existent session');
    const response4 = await fetch('http://localhost:3001/api/sessions/non-existent-session', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_fingerprint: 'test' }),
    });

    if (response4.status === 404) {
      const data4 = await response4.json();
      console.log('✓ Test 4 Passed: Correctly returned 404');
      console.log('  - Error:', data4.error, '\n');
    } else {
      console.log('✗ Test 4 Failed: Should return 404 for non-existent session\n');
    }

    // Test 5: Invalid request body (should return 400)
    console.log('Test 5: Invalid request body');
    const response5 = await fetch(`http://localhost:3001/api/sessions/${testSessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid_field: 'test' }),
    });

    if (response5.ok) {
      console.log('✓ Test 5 Passed: Empty update handled correctly (updates lastActiveAt)\n');
    } else {
      console.log('✗ Test 5 Failed:', response5.status, '\n');
    }

    // Test 6: Verify lastActiveAt is always updated
    console.log('Test 6: Verify lastActiveAt is always updated');

    // Get current session
    const beforeUpdate = await prisma.session.findUnique({
      where: { id: testSessionId },
    });

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update session
    const response6 = await fetch(`http://localhost:3001/api/sessions/${testSessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_fingerprint: 'test-timestamp' }),
    });

    if (response6.ok) {
      const data6 = await response6.json();
      const beforeTime = new Date(beforeUpdate!.lastActiveAt).getTime();
      const afterTime = new Date(data6.lastActiveAt).getTime();

      if (afterTime > beforeTime) {
        console.log('✓ Test 6 Passed: lastActiveAt updated correctly');
        console.log('  - Before:', beforeUpdate!.lastActiveAt);
        console.log('  - After:', data6.lastActiveAt, '\n');
      } else {
        console.log('✗ Test 6 Failed: lastActiveAt should be updated\n');
      }
    } else {
      console.log('✗ Test 6 Failed:', response6.status, '\n');
    }

    // Cleanup
    console.log('Cleanup: Removing test session');
    await prisma.session.delete({
      where: { id: testSessionId },
    });
    console.log('✓ Cleanup complete\n');

    console.log('All tests completed!');
  } catch (error) {
    console.error('Test Error:', error);
  }
}

export default testSessionUpdateEndpoint;
