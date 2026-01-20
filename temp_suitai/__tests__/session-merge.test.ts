import { mergeAnonymousSession } from '../src/lib/session-merge';
import { prisma } from '../src/lib/prisma';

describe('Session Merge Functionality', () => {
  const TEST_USER_ID = 'test-user-123';
  let anonymousSessionId: string;
  let userSessionId: string;

  beforeEach(async () => {
    // Clean up test data
    await prisma.auditLog.deleteMany({});
    await prisma.measurement.deleteMany({});
    await prisma.suitConfig.deleteMany({});
    await prisma.session.deleteMany({});

    // Create an anonymous session with data
    const anonymousSession = await prisma.session.create({
      data: {
        userId: null,
        height: 175.5
      }
    });
    anonymousSessionId = anonymousSession.id;

    // Add measurements to anonymous session
    await prisma.measurement.createMany({
      data: [
        { sessionId: anonymousSessionId, type: 'chest', value: 100, unit: 'cm' },
        { sessionId: anonymousSessionId, type: 'waist', value: 85, unit: 'cm' },
        { sessionId: anonymousSessionId, type: 'height', value: 175.5, unit: 'cm' }
      ]
    });

    // Add suit config to anonymous session
    await prisma.suitConfig.create({
      data: {
        sessionId: anonymousSessionId,
        fabricId: 'fabric-001',
        style: 'single-breasted',
        config: JSON.stringify({ buttons: 2, vents: 'double' })
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

  test('should successfully merge anonymous session to new user', async () => {
    const result = await mergeAnonymousSession(prisma, anonymousSessionId, TEST_USER_ID);

    expect(result.success).toBe(true);
    expect(result.merged.measurements).toBe(3);
    expect(result.merged.configs).toBe(1);
    expect(result.errors).toHaveLength(0);

    // Verify user session was created
    const userSession = await prisma.session.findFirst({
      where: { userId: TEST_USER_ID },
      include: { measurements: true, suitConfigs: true }
    });

    expect(userSession).toBeTruthy();
    expect(userSession?.measurements).toHaveLength(3);
    expect(userSession?.suitConfigs).toHaveLength(1);

    // Verify anonymous session was claimed
    const claimedSession = await prisma.session.findUnique({
      where: { id: anonymousSessionId }
    });

    expect(claimedSession?.userId).toBe(TEST_USER_ID);

    // Verify audit log was created
    const auditLog = await prisma.auditLog.findFirst({
      where: { action: 'session_merge' }
    });

    expect(auditLog).toBeTruthy();
    expect(auditLog?.userId).toBe(TEST_USER_ID);
  });

  test('should merge to existing user session', async () => {
    // Create existing user session
    const existingSession = await prisma.session.create({
      data: { userId: TEST_USER_ID }
    });
    userSessionId = existingSession.id;

    // Add existing measurement to user session
    await prisma.measurement.create({
      data: {
        sessionId: userSessionId,
        type: 'inseam',
        value: 80,
        unit: 'cm'
      }
    });

    const result = await mergeAnonymousSession(prisma, anonymousSessionId, TEST_USER_ID);

    expect(result.success).toBe(true);
    expect(result.merged.measurements).toBe(3);
    expect(result.merged.configs).toBe(1);

    // Verify measurements were merged to existing session
    const userSession = await prisma.session.findUnique({
      where: { id: userSessionId },
      include: { measurements: true, suitConfigs: true }
    });

    expect(userSession?.measurements).toHaveLength(4); // 3 merged + 1 existing
    expect(userSession?.suitConfigs).toHaveLength(1);
  });

  test('should fail when anonymous session does not exist', async () => {
    const result = await mergeAnonymousSession(prisma, 'non-existent-id', TEST_USER_ID);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Anonymous session not found');
    expect(result.merged.measurements).toBe(0);
    expect(result.merged.configs).toBe(0);
  });

  test('should fail when session belongs to different user', async () => {
    // Assign session to different user
    await prisma.session.update({
      where: { id: anonymousSessionId },
      data: { userId: 'different-user-456' }
    });

    const result = await mergeAnonymousSession(prisma, anonymousSessionId, TEST_USER_ID);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Session already belongs to a different user');
  });

  test('should handle empty anonymous session', async () => {
    // Create empty anonymous session
    const emptySession = await prisma.session.create({
      data: { userId: null }
    });

    const result = await mergeAnonymousSession(prisma, emptySession.id, TEST_USER_ID);

    expect(result.success).toBe(true);
    expect(result.merged.measurements).toBe(0);
    expect(result.merged.configs).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  test('should preserve measurement metadata during merge', async () => {
    // Create measurement with metadata
    await prisma.measurement.create({
      data: {
        sessionId: anonymousSessionId,
        type: 'shoulder',
        value: 45,
        unit: 'cm',
        metadata: JSON.stringify({ confidence: 0.95, source: 'camera' })
      }
    });

    const result = await mergeAnonymousSession(prisma, anonymousSessionId, TEST_USER_ID);

    expect(result.success).toBe(true);

    const userSession = await prisma.session.findFirst({
      where: { userId: TEST_USER_ID },
      include: { measurements: true }
    });

    const shoulderMeasurement = userSession?.measurements.find(m => m.type === 'shoulder');
    expect(shoulderMeasurement).toBeTruthy();
    expect(shoulderMeasurement?.metadata).toBe(JSON.stringify({ confidence: 0.95, source: 'camera' }));
  });

  test('should handle suit config with complex configuration', async () => {
    const complexConfig = {
      lapel: 'notch',
      buttons: 3,
      pockets: { breast: true, flap: 2, ticket: false },
      lining: 'full',
      monogram: { text: 'JD', position: 'inside', color: 'gold' }
    };

    await prisma.suitConfig.create({
      data: {
        sessionId: anonymousSessionId,
        fabricId: 'fabric-premium-001',
        style: 'double-breasted',
        config: JSON.stringify(complexConfig)
      }
    });

    const result = await mergeAnonymousSession(prisma, anonymousSessionId, TEST_USER_ID);

    expect(result.success).toBe(true);
    expect(result.merged.configs).toBe(2); // 1 from beforeEach + 1 new

    const userSession = await prisma.session.findFirst({
      where: { userId: TEST_USER_ID },
      include: { suitConfigs: true }
    });

    const premiumConfig = userSession?.suitConfigs.find(c => c.fabricId === 'fabric-premium-001');
    expect(premiumConfig).toBeTruthy();
    expect(JSON.parse(premiumConfig?.config || '{}')).toEqual(complexConfig);
  });

  test('should create audit log with correct metadata', async () => {
    const result = await mergeAnonymousSession(prisma, anonymousSessionId, TEST_USER_ID);

    expect(result.success).toBe(true);

    const auditLog = await prisma.auditLog.findFirst({
      where: { action: 'session_merge', userId: TEST_USER_ID }
    });

    expect(auditLog).toBeTruthy();

    const metadata = JSON.parse(auditLog?.metadata || '{}');
    expect(metadata.anonymousSessionId).toBe(anonymousSessionId);
    expect(metadata.merged.measurements).toBe(3);
    expect(metadata.merged.configs).toBe(1);
  });
});
