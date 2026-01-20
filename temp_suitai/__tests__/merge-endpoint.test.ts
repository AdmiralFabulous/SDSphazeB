import { prisma } from '../src/lib/prisma';

const BASE_URL = 'http://localhost:3000';
const ENDPOINT = `${BASE_URL}/api/sessions/merge`;

describe('POST /api/sessions/merge', () => {
  const TEST_USER_ID = 'endpoint-test-user';
  let anonymousSessionId: string;

  beforeEach(async () => {
    // Clean up test data
    await prisma.auditLog.deleteMany({});
    await prisma.measurement.deleteMany({});
    await prisma.suitConfig.deleteMany({});
    await prisma.session.deleteMany({});

    // Create anonymous session with test data
    const session = await prisma.session.create({
      data: { userId: null, height: 180 }
    });
    anonymousSessionId = session.id;

    await prisma.measurement.createMany({
      data: [
        { sessionId: anonymousSessionId, type: 'chest', value: 102, unit: 'cm' },
        { sessionId: anonymousSessionId, type: 'waist', value: 88, unit: 'cm' }
      ]
    });

    await prisma.suitConfig.create({
      data: {
        sessionId: anonymousSessionId,
        style: 'slim-fit',
        config: JSON.stringify({ fit: 'modern' })
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.auditLog.deleteMany({});
    await prisma.measurement.deleteMany({});
    await prisma.suitConfig.deleteMany({});
    await prisma.session.deleteMany({});
  });

  test('should merge anonymous session successfully', async () => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousSessionId,
        userId: TEST_USER_ID
      })
    });

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.merged.measurements).toBe(2);
    expect(result.merged.configs).toBe(1);
    expect(result.errors).toHaveLength(0);
  });

  test('should return 400 for missing anonymousSessionId', async () => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID
      })
    });

    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('Validation failed');
  });

  test('should return 400 for missing userId', async () => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousSessionId
      })
    });

    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('Validation failed');
  });

  test('should return 400 for empty anonymousSessionId', async () => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousSessionId: '',
        userId: TEST_USER_ID
      })
    });

    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('Validation failed');
  });

  test('should return 400 for empty userId', async () => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousSessionId,
        userId: ''
      })
    });

    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('Validation failed');
  });

  test('should return 500 for non-existent session', async () => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousSessionId: 'non-existent-session-id',
        userId: TEST_USER_ID
      })
    });

    expect(response.status).toBe(500);

    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Anonymous session not found');
  });

  test('should return 500 when session belongs to different user', async () => {
    // Claim session for different user
    await prisma.session.update({
      where: { id: anonymousSessionId },
      data: { userId: 'different-user-789' }
    });

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousSessionId,
        userId: TEST_USER_ID
      })
    });

    expect(response.status).toBe(500);

    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Session already belongs to a different user');
  });

  test('should handle multiple sequential merges for same user', async () => {
    // First merge
    const response1 = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousSessionId,
        userId: TEST_USER_ID
      })
    });

    expect(response1.status).toBe(200);
    const result1 = await response1.json();
    expect(result1.success).toBe(true);

    // Create second anonymous session
    const session2 = await prisma.session.create({
      data: { userId: null }
    });

    await prisma.measurement.create({
      data: {
        sessionId: session2.id,
        type: 'sleeve',
        value: 65,
        unit: 'cm'
      }
    });

    // Second merge
    const response2 = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousSessionId: session2.id,
        userId: TEST_USER_ID
      })
    });

    expect(response2.status).toBe(200);
    const result2 = await response2.json();
    expect(result2.success).toBe(true);
    expect(result2.merged.measurements).toBe(1);

    // Verify all measurements are now under one session
    const userSession = await prisma.session.findFirst({
      where: { userId: TEST_USER_ID },
      include: { measurements: true }
    });

    expect(userSession?.measurements).toHaveLength(3); // 2 from first + 1 from second
  });

  test('should handle invalid JSON in request body', async () => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json'
    });

    expect(response.status).toBe(500);

    const result = await response.json();
    expect(result.success).toBe(false);
  });
});
