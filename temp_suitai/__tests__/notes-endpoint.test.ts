/**
 * Test suite for the Notes Endpoint
 * Tests POST/GET /api/sessions/:id/notes
 */

import { prisma } from '../src/lib/prisma';

async function testNotesEndpoint() {
  console.log('Starting Notes Endpoint Tests...\n');

  try {
    // Test 1: Add notes to a new session
    console.log('Test 1: Adding notes to a new session');
    const testSessionId = 'test-session-notes-' + Date.now();
    const testNote = 'This is a test note for the session.';

    const response1 = await fetch(
      'http://localhost:3000/api/sessions/' + testSessionId + '/notes',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: testNote }),
      }
    );

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✓ Test 1 Passed: Notes added successfully');
      console.log('  - Session ID:', data1.sessionId);
      console.log('  - Notes:', data1.notes, '\n');
    } else {
      console.log('✗ Test 1 Failed:', response1.status);
      console.log('  - Response:', await response1.text(), '\n');
    }

    // Test 2: Retrieve notes from a session
    console.log('Test 2: Retrieving notes from a session');
    const response2 = await fetch(
      'http://localhost:3000/api/sessions/' + testSessionId + '/notes',
      {
        method: 'GET',
      }
    );

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✓ Test 2 Passed: Notes retrieved successfully');
      console.log('  - Session ID:', data2.sessionId);
      console.log('  - Notes:', data2.notes);
      console.log(
        '  - Notes match:',
        data2.notes === testNote ? 'Yes' : 'No',
        '\n'
      );
    } else {
      console.log('✗ Test 2 Failed:', response2.status);
      console.log('  - Response:', await response2.text(), '\n');
    }

    // Test 3: Update existing notes
    console.log('Test 3: Updating existing notes');
    const updatedNote = 'This is an updated note.';
    const response3 = await fetch(
      'http://localhost:3000/api/sessions/' + testSessionId + '/notes',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: updatedNote }),
      }
    );

    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✓ Test 3 Passed: Notes updated successfully');
      console.log('  - Updated notes:', data3.notes, '\n');
    } else {
      console.log('✗ Test 3 Failed:', response3.status, '\n');
    }

    // Test 4: Test empty/null notes
    console.log('Test 4: Setting notes to null');
    const response4 = await fetch(
      'http://localhost:3000/api/sessions/' + testSessionId + '/notes',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: null }),
      }
    );

    if (response4.ok) {
      const data4 = await response4.json();
      console.log('✓ Test 4 Passed: Notes set to null');
      console.log('  - Notes value:', data4.notes, '\n');
    } else {
      console.log('✗ Test 4 Failed:', response4.status, '\n');
    }

    // Test 5: Test maximum length validation (5000 characters)
    console.log('Test 5: Testing maximum length validation');
    const longNote = 'A'.repeat(5000);
    const response5 = await fetch(
      'http://localhost:3000/api/sessions/test-session-long/notes',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: longNote }),
      }
    );

    if (response5.ok) {
      console.log('✓ Test 5 Passed: 5000 character note accepted');
      const data5 = await response5.json();
      console.log('  - Note length:', data5.notes.length, 'characters\n');
    } else {
      console.log('✗ Test 5 Failed:', response5.status, '\n');
    }

    // Test 6: Test exceeding maximum length (5001 characters)
    console.log('Test 6: Testing validation - exceeding maximum length');
    const tooLongNote = 'A'.repeat(5001);
    const response6 = await fetch(
      'http://localhost:3000/api/sessions/test-session-toolong/notes',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: tooLongNote }),
      }
    );

    if (response6.status === 400) {
      console.log(
        '✓ Test 6 Passed: Correctly rejected note exceeding 5000 characters'
      );
      console.log('  - Status:', response6.status, '\n');
    } else {
      console.log('✗ Test 6 Failed: Should return 400 for note > 5000 chars\n');
    }

    // Test 7: Test invalid JSON format
    console.log('Test 7: Testing invalid JSON format');
    const response7 = await fetch(
      'http://localhost:3000/api/sessions/test-session-invalid/notes',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      }
    );

    if (response7.status === 400 || response7.status === 500) {
      console.log('✓ Test 7 Passed: Correctly rejected invalid JSON');
      console.log('  - Status:', response7.status, '\n');
    } else {
      console.log('✗ Test 7 Failed: Should reject invalid JSON\n');
    }

    // Test 8: Retrieve notes from non-existent session
    console.log('Test 8: Retrieving notes from non-existent session');
    const response8 = await fetch(
      'http://localhost:3000/api/sessions/non-existent-session/notes',
      {
        method: 'GET',
      }
    );

    if (response8.status === 404) {
      console.log('✓ Test 8 Passed: Correctly returned 404 for non-existent session');
      console.log('  - Status:', response8.status, '\n');
    } else {
      console.log('✗ Test 8 Failed: Should return 404 for non-existent session\n');
    }

    // Test 9: Test special characters in notes
    console.log('Test 9: Testing special characters in notes');
    const specialNote =
      'Note with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/~`™©®';
    const response9 = await fetch(
      'http://localhost:3000/api/sessions/test-special-chars/notes',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: specialNote }),
      }
    );

    if (response9.ok) {
      const data9 = await response9.json();
      console.log('✓ Test 9 Passed: Special characters handled correctly');
      console.log('  - Notes:', data9.notes, '\n');
    } else {
      console.log('✗ Test 9 Failed:', response9.status, '\n');
    }

    // Test 10: Test unicode characters in notes
    console.log('Test 10: Testing unicode characters in notes');
    const unicodeNote = '你好世界 🌍 مرحبا بالعالم Привет мир';
    const response10 = await fetch(
      'http://localhost:3000/api/sessions/test-unicode/notes',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: unicodeNote }),
      }
    );

    if (response10.ok) {
      const data10 = await response10.json();
      console.log('✓ Test 10 Passed: Unicode characters handled correctly');
      console.log('  - Notes:', data10.notes, '\n');
    } else {
      console.log('✗ Test 10 Failed:', response10.status, '\n');
    }

    console.log('All tests completed!');
  } catch (error) {
    console.error('Test Error:', error);
  }
}

export default testNotesEndpoint;
