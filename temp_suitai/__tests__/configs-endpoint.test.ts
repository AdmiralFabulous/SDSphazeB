/**
 * Test suite for the Suit Configuration Endpoint
 * Tests POST /api/configs
 *
 * Prerequisites:
 * 1. Supabase must be configured with environment variables
 * 2. Database migrations must be applied
 * 3. Test data (sessions and fabrics) must exist in the database
 * 4. Next.js dev server must be running on port 3000
 */

async function testConfigsEndpoint() {
  console.log('Starting Suit Configs Endpoint Tests...\n');

  // Note: These UUIDs should exist in your test database
  // You may need to create test data first or update these IDs
  const testSessionId = 'test-session-uuid';  // Replace with actual session ID
  const testFabricId = 'test-fabric-uuid';    // Replace with actual fabric ID
  const invalidSessionId = '00000000-0000-0000-0000-000000000000';
  const invalidFabricId = '00000000-0000-0000-0000-000000000001';

  try {
    // Test 1: Create config with minimal required fields
    console.log('Test 1: Creating config with minimal fields');
    const response1 = await fetch('http://localhost:3000/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: testSessionId,
        fabric_id: testFabricId
      }),
    });

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✓ Test 1 Passed:', data1);
      console.log('  - Config ID:', data1.id);
      console.log('  - Calculated Price:', data1.calculated_price_gbp, 'GBP');
      console.log('  - Name:', data1.name);
      console.log('  - Fabric:', data1.fabric?.name, '\n');
    } else {
      const error1 = await response1.json();
      console.log('✗ Test 1 Failed:', response1.status, error1, '\n');
    }

    // Test 2: Create config with full style customization
    console.log('Test 2: Creating config with custom styling');
    const response2 = await fetch('http://localhost:3000/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: testSessionId,
        fabric_id: testFabricId,
        name: 'Custom Wedding Suit',
        style_json: {
          jacket: {
            lapel: 'peak',
            buttons: 2,
            vents: 'double',
            pocket_style: 'jetted',
            lining_color: '#2c3e50'
          },
          trousers: {
            fit: 'slim',
            pleats: 'flat',
            cuff: true
          },
          vest: {
            included: true,
            buttons: 5
          }
        }
      }),
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✓ Test 2 Passed: Custom styling applied');
      console.log('  - Jacket lapel:', data2.style_json.jacket.lapel);
      console.log('  - Vest included:', data2.style_json.vest.included);
      console.log('  - Custom name:', data2.name, '\n');
    } else {
      const error2 = await response2.json();
      console.log('✗ Test 2 Failed:', response2.status, error2, '\n');
    }

    // Test 3: Test validation - missing session_id
    console.log('Test 3: Testing validation - missing session_id');
    const response3 = await fetch('http://localhost:3000/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fabric_id: testFabricId
      }),
    });

    if (response3.status === 400) {
      const data3 = await response3.json();
      console.log('✓ Test 3 Passed: Correctly rejected missing session_id');
      console.log('  - Error:', data3.error, '\n');
    } else {
      console.log('✗ Test 3 Failed: Should return 400 for missing session_id\n');
    }

    // Test 4: Test validation - missing fabric_id
    console.log('Test 4: Testing validation - missing fabric_id');
    const response4 = await fetch('http://localhost:3000/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: testSessionId
      }),
    });

    if (response4.status === 400) {
      const data4 = await response4.json();
      console.log('✓ Test 4 Passed: Correctly rejected missing fabric_id');
      console.log('  - Error:', data4.error, '\n');
    } else {
      console.log('✗ Test 4 Failed: Should return 400 for missing fabric_id\n');
    }

    // Test 5: Test validation - invalid session_id
    console.log('Test 5: Testing validation - invalid session_id');
    const response5 = await fetch('http://localhost:3000/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: invalidSessionId,
        fabric_id: testFabricId
      }),
    });

    if (response5.status === 400) {
      const data5 = await response5.json();
      console.log('✓ Test 5 Passed: Correctly rejected invalid session_id');
      console.log('  - Error:', data5.error, '\n');
    } else {
      console.log('✗ Test 5 Failed: Should return 400 for invalid session_id\n');
    }

    // Test 6: Test validation - invalid fabric_id
    console.log('Test 6: Testing validation - invalid fabric_id');
    const response6 = await fetch('http://localhost:3000/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: testSessionId,
        fabric_id: invalidFabricId
      }),
    });

    if (response6.status === 400) {
      const data6 = await response6.json();
      console.log('✓ Test 6 Passed: Correctly rejected invalid fabric_id');
      console.log('  - Error:', data6.error, '\n');
    } else {
      console.log('✗ Test 6 Failed: Should return 400 for invalid fabric_id\n');
    }

    // Test 7: Test partial style customization (defaults should be merged)
    console.log('Test 7: Testing partial style customization');
    const response7 = await fetch('http://localhost:3000/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: testSessionId,
        fabric_id: testFabricId,
        style_json: {
          jacket: {
            lapel: 'shawl'  // Only customize lapel
          }
        }
      }),
    });

    if (response7.ok) {
      const data7 = await response7.json();
      console.log('✓ Test 7 Passed: Partial customization merged with defaults');
      console.log('  - Custom lapel:', data7.style_json.jacket.lapel);
      console.log('  - Default buttons:', data7.style_json.jacket.buttons);
      console.log('  - Default vents:', data7.style_json.jacket.vents, '\n');
    } else {
      const error7 = await response7.json();
      console.log('✗ Test 7 Failed:', response7.status, error7, '\n');
    }

    // Test 8: Test invalid JSON body
    console.log('Test 8: Testing invalid JSON body');
    const response8 = await fetch('http://localhost:3000/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    });

    if (response8.status === 400) {
      console.log('✓ Test 8 Passed: Correctly rejected invalid JSON\n');
    } else {
      console.log('✗ Test 8 Failed: Should return 400 for invalid JSON\n');
    }

    console.log('All tests completed!');
    console.log('\nNote: Some tests may fail if test data (sessions/fabrics) does not exist in database.');
    console.log('To set up test data, create a session and fabric in your Supabase database first.');

  } catch (error) {
    console.error('Test Error:', error);
  }
}

export default testConfigsEndpoint;

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConfigsEndpoint();
}
