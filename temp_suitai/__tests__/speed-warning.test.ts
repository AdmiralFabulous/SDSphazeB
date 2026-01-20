/**
 * Speed Warning System Tests
 *
 * Tests for VOICE-E01-S03-T03: Implement Speed Warning
 *
 * Covers:
 * - Scan status endpoint (GET/POST)
 * - Vapi check_speed_warning function
 * - Speed threshold validation
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET as getScanStatus, POST as postScanUpdate } from '../src/app/api/sessions/[id]/scan/route';
import { GET as getVapiFunctions, POST as postVapiFunction } from '../src/app/api/vapi/functions/route';
import { prisma } from '../src/lib/prisma';

// Helper to create NextRequest
function createRequest(method: string, url: string, body?: any): NextRequest {
  const request = new NextRequest(url, {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
  });
  return request;
}

describe('Speed Warning System', () => {
  const testSessionId = 'test-session-speed-warning';

  beforeEach(async () => {
    // Clean up test data
    await prisma.session.deleteMany({
      where: { id: testSessionId },
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.session.deleteMany({
      where: { id: testSessionId },
    });
  });

  describe('Scan Status Endpoint - GET /api/sessions/:id/scan', () => {
    it('should return 404 for non-existent session', async () => {
      const request = createRequest('GET', `http://localhost/api/sessions/nonexistent/scan`);
      const params = { id: 'nonexistent' };

      const response = await getScanStatus(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Session not found');
    });

    it('should return session scan status with default rotation_speed of 0', async () => {
      // Create session without rotation_speed
      await prisma.session.create({
        data: { id: testSessionId },
      });

      const request = createRequest('GET', `http://localhost/api/sessions/${testSessionId}/scan`);
      const params = { id: testSessionId };

      const response = await getScanStatus(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe(testSessionId);
      expect(data.rotation_speed).toBe(0);
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
    });

    it('should return current rotation_speed when set', async () => {
      // Create session with rotation_speed
      await prisma.session.create({
        data: {
          id: testSessionId,
          rotation_speed: 25.5,
        },
      });

      const request = createRequest('GET', `http://localhost/api/sessions/${testSessionId}/scan`);
      const params = { id: testSessionId };

      const response = await getScanStatus(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.rotation_speed).toBe(25.5);
    });
  });

  describe('Scan Status Endpoint - POST /api/sessions/:id/scan', () => {
    it('should create session with rotation_speed', async () => {
      const request = createRequest('POST', `http://localhost/api/sessions/${testSessionId}/scan`, {
        rotation_speed: 30.0,
      });
      const params = { id: testSessionId };

      const response = await postScanUpdate(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe(testSessionId);
      expect(data.rotation_speed).toBe(30.0);

      // Verify in database
      const session = await prisma.session.findUnique({
        where: { id: testSessionId },
      });
      expect(session?.rotation_speed).toBe(30.0);
    });

    it('should update existing session rotation_speed', async () => {
      // Create session with initial speed
      await prisma.session.create({
        data: {
          id: testSessionId,
          rotation_speed: 20.0,
        },
      });

      // Update speed
      const request = createRequest('POST', `http://localhost/api/sessions/${testSessionId}/scan`, {
        rotation_speed: 40.0,
      });
      const params = { id: testSessionId };

      const response = await postScanUpdate(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.rotation_speed).toBe(40.0);

      // Verify in database
      const session = await prisma.session.findUnique({
        where: { id: testSessionId },
      });
      expect(session?.rotation_speed).toBe(40.0);
    });

    it('should reject negative rotation_speed', async () => {
      const request = createRequest('POST', `http://localhost/api/sessions/${testSessionId}/scan`, {
        rotation_speed: -5.0,
      });
      const params = { id: testSessionId };

      const response = await postScanUpdate(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should accept rotation_speed of 0', async () => {
      const request = createRequest('POST', `http://localhost/api/sessions/${testSessionId}/scan`, {
        rotation_speed: 0,
      });
      const params = { id: testSessionId };

      const response = await postScanUpdate(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.rotation_speed).toBe(0);
    });
  });

  describe('Vapi Functions - check_speed_warning', () => {
    it('should list check_speed_warning in available functions', async () => {
      const response = await getVapiFunctions();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.functions).toBeDefined();

      const speedWarningFunc = data.functions.find(
        (f: any) => f.name === 'check_speed_warning'
      );

      expect(speedWarningFunc).toBeDefined();
      expect(speedWarningFunc.parameters.required).toContain('sessionId');
    });

    it('should return warning when speed exceeds threshold', async () => {
      // Create session with high speed
      await prisma.session.create({
        data: {
          id: testSessionId,
          rotation_speed: 45.0,
        },
      });

      const request = createRequest('POST', 'http://localhost/api/vapi/functions', {
        functionName: 'check_speed_warning',
        args: {
          sessionId: testSessionId,
          threshold: 30,
        },
      });

      const response = await postVapiFunction(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe(testSessionId);
      expect(data.rotation_speed).toBe(45.0);
      expect(data.threshold).toBe(30);
      expect(data.warning).toBe(true);
      expect(data.message).toContain('exceeds the safe limit');
    });

    it('should return safe status when speed is within limits', async () => {
      // Create session with safe speed
      await prisma.session.create({
        data: {
          id: testSessionId,
          rotation_speed: 25.0,
        },
      });

      const request = createRequest('POST', 'http://localhost/api/vapi/functions', {
        functionName: 'check_speed_warning',
        args: {
          sessionId: testSessionId,
          threshold: 30,
        },
      });

      const response = await postVapiFunction(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.warning).toBe(false);
      expect(data.message).toContain('within safe limits');
    });

    it('should use default threshold of 30 when not specified', async () => {
      // Create session with speed of 35
      await prisma.session.create({
        data: {
          id: testSessionId,
          rotation_speed: 35.0,
        },
      });

      const request = createRequest('POST', 'http://localhost/api/vapi/functions', {
        functionName: 'check_speed_warning',
        args: {
          sessionId: testSessionId,
        },
      });

      const response = await postVapiFunction(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.threshold).toBe(30);
      expect(data.warning).toBe(true); // 35 > 30
    });

    it('should return 404 for non-existent session', async () => {
      const request = createRequest('POST', 'http://localhost/api/vapi/functions', {
        functionName: 'check_speed_warning',
        args: {
          sessionId: 'nonexistent',
        },
      });

      const response = await postVapiFunction(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Session not found');
    });

    it('should handle custom threshold values', async () => {
      // Create session
      await prisma.session.create({
        data: {
          id: testSessionId,
          rotation_speed: 40.0,
        },
      });

      // Test with higher threshold - should be safe
      const request1 = createRequest('POST', 'http://localhost/api/vapi/functions', {
        functionName: 'check_speed_warning',
        args: {
          sessionId: testSessionId,
          threshold: 50,
        },
      });

      const response1 = await postVapiFunction(request1);
      const data1 = await response1.json();

      expect(data1.warning).toBe(false);

      // Test with lower threshold - should warn
      const request2 = createRequest('POST', 'http://localhost/api/vapi/functions', {
        functionName: 'check_speed_warning',
        args: {
          sessionId: testSessionId,
          threshold: 35,
        },
      });

      const response2 = await postVapiFunction(request2);
      const data2 = await response2.json();

      expect(data2.warning).toBe(true);
    });
  });
});
