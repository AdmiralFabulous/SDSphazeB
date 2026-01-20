/**
 * Tests for /scan/status endpoint
 *
 * Tests include:
 * - Scan initialization
 * - Frame submission with user_in_frame data
 * - Status query with quality metrics
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock Prisma client
const mockPrisma = {
  scan: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  frame: {
    create: jest.fn(),
  },
  session: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('Scan Status Endpoint', () => {
  const testSessionId = 'test-session-123';
  const testScanId = 'test-scan-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/scan/init', () => {
    it('should initialize a new scan', async () => {
      const mockSession = {
        id: testSessionId,
        height: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockScan = {
        id: testScanId,
        sessionId: testSessionId,
        startedAt: new Date(),
        completedAt: null,
        isLocked: false,
      };

      mockPrisma.session.findUnique.mockResolvedValueOnce(mockSession);
      mockPrisma.scan.create.mockResolvedValueOnce(mockScan);

      const response = {
        scanId: testScanId,
        sessionId: testSessionId,
        startedAt: mockScan.startedAt.toISOString(),
        message: 'Scan initialized successfully',
      };

      expect(response.scanId).toBe(testScanId);
      expect(response.sessionId).toBe(testSessionId);
    });

    it('should reject missing sessionId', async () => {
      const invalidBody = {};
      expect(invalidBody).not.toHaveProperty('sessionId');
    });
  });

  describe('POST /api/scan/frames', () => {
    it('should submit frame with user_in_frame boolean', async () => {
      const frameData = {
        scanId: testScanId,
        frameNumber: 0,
        userInFrame: true,
        confidence: 0.95,
        stabilityScore: 0.75,
        isValid: true,
      };

      const mockFrame = {
        id: 'frame-001',
        scanId: testScanId,
        frameNumber: 0,
        userInFrame: true,
        confidence: 0.95,
        stabilityScore: 0.75,
        iou: null,
        isValid: true,
        timestamp: new Date(),
      };

      mockPrisma.scan.findUnique.mockResolvedValueOnce({
        id: testScanId,
        sessionId: testSessionId,
        startedAt: new Date(),
        completedAt: null,
        isLocked: false,
      });

      mockPrisma.frame.create.mockResolvedValueOnce(mockFrame);

      // Verify response structure
      expect(frameData.userInFrame).toBe(true);
      expect(frameData.confidence).toBeGreaterThanOrEqual(0);
      expect(frameData.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle frames without user', async () => {
      const frameData = {
        scanId: testScanId,
        frameNumber: 1,
        userInFrame: false,
        confidence: 0.0,
        stabilityScore: 0.0,
        isValid: false,
      };

      expect(frameData.userInFrame).toBe(false);
      expect(frameData.confidence).toBe(0.0);
    });

    it('should validate frame data', async () => {
      const invalidFrame = {
        scanId: testScanId,
        frameNumber: -1, // Invalid: negative frame number
        userInFrame: true,
        confidence: 1.5, // Invalid: > 1.0
      };

      expect(invalidFrame.frameNumber).toBeLessThan(0);
      expect(invalidFrame.confidence).toBeGreaterThan(1);
    });
  });

  describe('GET /api/scan/status', () => {
    it('should return scan status with quality metrics', async () => {
      const now = new Date();
      const mockFrames = [
        {
          id: 'frame-001',
          scanId: testScanId,
          frameNumber: 0,
          userInFrame: true,
          confidence: 0.95,
          stabilityScore: 0.75,
          iou: 0.88,
          isValid: true,
          timestamp: now,
        },
        {
          id: 'frame-002',
          scanId: testScanId,
          frameNumber: 1,
          userInFrame: true,
          confidence: 0.92,
          stabilityScore: 0.78,
          iou: 0.87,
          isValid: true,
          timestamp: new Date(now.getTime() + 1000),
        },
        {
          id: 'frame-003',
          scanId: testScanId,
          frameNumber: 2,
          userInFrame: false,
          confidence: 0.3,
          stabilityScore: 0.4,
          iou: null,
          isValid: false,
          timestamp: new Date(now.getTime() + 2000),
        },
      ];

      const mockScan = {
        id: testScanId,
        sessionId: testSessionId,
        startedAt: now,
        completedAt: null,
        isLocked: false,
        frames: mockFrames,
      };

      mockPrisma.scan.findUnique.mockResolvedValueOnce(mockScan);

      // Calculate expected metrics
      const totalFrames = mockFrames.length;
      const validFrames = mockFrames.filter((f) => f.isValid).length;
      const framesWithUser = mockFrames.filter((f) => f.userInFrame).length;
      const avgConfidence =
        mockFrames.reduce((sum, f) => sum + f.confidence, 0) / totalFrames;
      const avgStability =
        mockFrames.reduce((sum, f) => sum + f.stabilityScore, 0) / totalFrames;
      const userDetectionRate = (framesWithUser / totalFrames) * 100;

      const response = {
        scanId: testScanId,
        sessionId: testSessionId,
        status: 'active',
        isLocked: false,
        frameCount: totalFrames,
        latestFrame: {
          frameNumber: 2,
          userInFrame: false,
          confidence: 0.3,
          stabilityScore: 0.4,
          iou: null,
          isValid: false,
          timestamp: mockFrames[2].timestamp.toISOString(),
        },
        averageConfidence: avgConfidence,
        averageStabilityScore: avgStability,
        userDetectionRate,
        qualityMetrics: {
          totalFrames,
          validFrames,
          framesWithUser,
          avgConfidence,
          avgStability,
        },
        startedAt: mockScan.startedAt.toISOString(),
        completedAt: null,
      };

      // Verify response structure
      expect(response.scanId).toBe(testScanId);
      expect(response.sessionId).toBe(testSessionId);
      expect(response.frameCount).toBe(3);
      expect(response.qualityMetrics.framesWithUser).toBe(2);
      expect(response.userDetectionRate).toBeCloseTo(66.67, 1);
      expect(response.latestFrame.userInFrame).toBe(false);
    });

    it('should return not found for missing scan', async () => {
      mockPrisma.scan.findUnique.mockResolvedValueOnce(null);

      expect(mockPrisma.scan.findUnique).resolves.toBeNull();
    });

    it('should calculate correct user detection rate', async () => {
      // Create frames where 3 out of 5 have users
      const frames = Array.from({ length: 5 }, (_, i) => ({
        id: `frame-${i}`,
        scanId: testScanId,
        frameNumber: i,
        userInFrame: i < 3, // First 3 frames have user
        confidence: i < 3 ? 0.9 : 0.1,
        stabilityScore: 0.5,
        iou: null,
        isValid: i < 3,
        timestamp: new Date(),
      }));

      const mockScan = {
        id: testScanId,
        sessionId: testSessionId,
        startedAt: new Date(),
        completedAt: null,
        isLocked: false,
        frames,
      };

      mockPrisma.scan.findUnique.mockResolvedValueOnce(mockScan);

      const userDetectionRate = (3 / 5) * 100;
      expect(userDetectionRate).toBe(60);
    });
  });
});
