/**
 * Test suite for the Config Retrieval Endpoint
 * Tests GET /api/configs/:id
 */

import { prisma } from '../src/lib/prisma';

async function testConfigEndpoint() {
  console.log('Starting Config Endpoint Tests...\n');

  try {
    // Setup: Create test data
    console.log('Setup: Creating test data...');

    const testSession = await prisma.session.create({
      data: {
        id: 'test-session-config',
        userId: 'test-user-123',
        height: 175,
      },
    });

    const testFabric = await prisma.fabric.create({
      data: {
        name: 'Premium Wool',
        type: 'wool',
        color: 'Navy Blue',
        textureUrl: 'https://example.com/textures/wool-navy.jpg',
        normalMapUrl: 'https://example.com/textures/wool-navy-normal.jpg',
      },
    });

    const testConfig = await prisma.suitConfig.create({
      data: {
        id: 'test-config-123',
        sessionId: testSession.id,
        fabricId: testFabric.id,
        style: 'slim-fit',
        notes: 'Customer requested extra slim fit',
      },
    });

    console.log('✓ Test data created');
    console.log('  - Session ID:', testSession.id);
    console.log('  - Fabric ID:', testFabric.id);
    console.log('  - Config ID:', testConfig.id, '\n');

    // Test 1: Get existing config
    console.log('Test 1: Retrieving existing config');
    const response1 = await fetch('http://localhost:3000/api/configs/' + testConfig.id);

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✓ Test 1 Passed: Config retrieved successfully');
      console.log('  - Config ID:', data1.id);
      console.log('  - Style:', data1.style);
      console.log('  - Fabric:', data1.fabric.name, `(${data1.fabric.type})`);
      console.log('  - Texture URL:', data1.fabric.textureUrl);
      console.log('  - Session ID:', data1.session.id, '\n');
    } else {
      console.log('✗ Test 1 Failed:', response1.status, '\n');
    }

    // Test 2: Get non-existent config (404)
    console.log('Test 2: Testing non-existent config');
    const response2 = await fetch('http://localhost:3000/api/configs/non-existent-id');

    if (response2.status === 404) {
      const data2 = await response2.json();
      console.log('✓ Test 2 Passed: Returns 404 for non-existent config');
      console.log('  - Status:', response2.status);
      console.log('  - Error:', data2.error, '\n');
    } else {
      console.log('✗ Test 2 Failed: Should return 404 for non-existent config\n');
    }

    // Test 3: Access permission validation (matching user)
    console.log('Test 3: Testing access permissions with matching user');
    const response3 = await fetch('http://localhost:3000/api/configs/' + testConfig.id, {
      headers: { 'x-user-id': 'test-user-123' },
    });

    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✓ Test 3 Passed: Access granted for matching user');
      console.log('  - Config ID:', data3.id, '\n');
    } else {
      console.log('✗ Test 3 Failed: Should allow access for matching user\n');
    }

    // Test 4: Access permission validation (different user)
    console.log('Test 4: Testing access permissions with different user');
    const response4 = await fetch('http://localhost:3000/api/configs/' + testConfig.id, {
      headers: { 'x-user-id': 'different-user-456' },
    });

    if (response4.status === 403) {
      const data4 = await response4.json();
      console.log('✓ Test 4 Passed: Access denied for different user');
      console.log('  - Status:', response4.status);
      console.log('  - Error:', data4.error, '\n');
    } else {
      console.log('✗ Test 4 Failed: Should deny access for different user\n');
    }

    // Test 5: Verify fabric details and texture URLs
    console.log('Test 5: Verifying fabric details and texture URLs');
    const response5 = await fetch('http://localhost:3000/api/configs/' + testConfig.id);

    if (response5.ok) {
      const data5 = await response5.json();
      const hasFabric = !!data5.fabric;
      const hasTextureUrl = !!data5.fabric?.textureUrl;
      const hasNormalMap = !!data5.fabric?.normalMapUrl;

      if (hasFabric && hasTextureUrl) {
        console.log('✓ Test 5 Passed: Fabric details included');
        console.log('  - Fabric name:', data5.fabric.name);
        console.log('  - Fabric type:', data5.fabric.type);
        console.log('  - Fabric color:', data5.fabric.color);
        console.log('  - Texture URL:', data5.fabric.textureUrl);
        console.log('  - Normal map URL:', data5.fabric.normalMapUrl, '\n');
      } else {
        console.log('✗ Test 5 Failed: Missing fabric details or texture URLs\n');
      }
    } else {
      console.log('✗ Test 5 Failed:', response5.status, '\n');
    }

    // Cleanup
    console.log('Cleanup: Removing test data...');
    await prisma.suitConfig.delete({ where: { id: testConfig.id } });
    await prisma.fabric.delete({ where: { id: testFabric.id } });
    await prisma.session.delete({ where: { id: testSession.id } });
    console.log('✓ Test data cleaned up\n');

    console.log('All tests completed!');
  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default testConfigEndpoint;
