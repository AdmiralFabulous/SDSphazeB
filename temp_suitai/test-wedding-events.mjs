#!/usr/bin/env node

// Test script for POST /api/wedding-events endpoint

const BASE_URL = 'http://localhost:3000';

async function testCreateWeddingEvent() {
  console.log('Testing POST /api/wedding-events\n');

  // Test 1: Valid event creation
  console.log('Test 1: Valid event (4+ weeks in future)');
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30); // 30 days in future
  const eventDate = futureDate.toISOString().split('T')[0];

  try {
    const response = await fetch(`${BASE_URL}/api/wedding-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-123', // Mock authentication
      },
      body: JSON.stringify({
        event_name: 'Smith-Jones Wedding',
        event_date: eventDate,
        venue_name: 'The Grand Hotel',
        venue_location: 'London, UK',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log(response.status === 201 ? '✓ PASS\n' : '✗ FAIL\n');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('✗ FAIL\n');
  }

  // Test 2: Event date too soon (should fail)
  console.log('Test 2: Event date < 4 weeks (should fail with 400)');
  const tooSoonDate = new Date();
  tooSoonDate.setDate(tooSoonDate.getDate() + 20); // Only 20 days
  const tooSoon = tooSoonDate.toISOString().split('T')[0];

  try {
    const response = await fetch(`${BASE_URL}/api/wedding-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-123',
      },
      body: JSON.stringify({
        event_name: 'Test Wedding',
        event_date: tooSoon,
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log(response.status === 400 ? '✓ PASS\n' : '✗ FAIL\n');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('✗ FAIL\n');
  }

  // Test 3: Missing required fields (should fail)
  console.log('Test 3: Missing required fields (should fail with 400)');
  try {
    const response = await fetch(`${BASE_URL}/api/wedding-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-123',
      },
      body: JSON.stringify({
        event_name: 'Test Wedding',
        // Missing event_date
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log(response.status === 400 ? '✓ PASS\n' : '✗ FAIL\n');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('✗ FAIL\n');
  }

  // Test 4: No authentication (should fail)
  console.log('Test 4: No authentication header (should fail with 401)');
  try {
    const response = await fetch(`${BASE_URL}/api/wedding-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No x-user-id header
      },
      body: JSON.stringify({
        event_name: 'Test Wedding',
        event_date: eventDate,
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log(response.status === 401 ? '✓ PASS\n' : '✗ FAIL\n');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('✗ FAIL\n');
  }
}

testCreateWeddingEvent();
