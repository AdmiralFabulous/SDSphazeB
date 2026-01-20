import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      update: vi.fn(),
    },
  },
}));

// Import the handler
import { PATCH } from '@/app/api/orders/[id]/state/route';

describe('PATCH /api/orders/:id/state', () => {
  const mockOrderId = 'test-order-123';
  const mockUpdatedAt = new Date('2026-01-19T12:00:00Z');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Valid state transitions', () => {
    it('should update order state to processing', async () => {
      const mockOrder = {
        id: mockOrderId,
        state: 'processing',
        updatedAt: mockUpdatedAt,
      };

      vi.mocked(prisma.order.update).mockResolvedValueOnce(mockOrder as any);

      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'processing' }),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        id: mockOrderId,
        state: 'processing',
        updatedAt: mockUpdatedAt.toISOString(),
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: { state: 'processing' },
      });
    });

    it('should update order state to completed', async () => {
      const mockOrder = {
        id: mockOrderId,
        state: 'completed',
        updatedAt: mockUpdatedAt,
      };

      vi.mocked(prisma.order.update).mockResolvedValueOnce(mockOrder as any);

      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'completed' }),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.state).toBe('completed');
    });

    it('should update order state to failed', async () => {
      const mockOrder = {
        id: mockOrderId,
        state: 'failed',
        updatedAt: mockUpdatedAt,
      };

      vi.mocked(prisma.order.update).mockResolvedValueOnce(mockOrder as any);

      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'failed' }),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.state).toBe('failed');
    });

    it('should update order state to pending', async () => {
      const mockOrder = {
        id: mockOrderId,
        state: 'pending',
        updatedAt: mockUpdatedAt,
      };

      vi.mocked(prisma.order.update).mockResolvedValueOnce(mockOrder as any);

      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'pending' }),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.state).toBe('pending');
    });
  });

  describe('Validation errors', () => {
    it('should reject invalid state value', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'invalid_state' }),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('should reject missing state field', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({}),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject non-string state value', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 123 }),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject empty string state', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: '' }),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });
  });

  describe('Not found errors', () => {
    it('should return 404 when order not found', async () => {
      vi.mocked(prisma.order.update).mockRejectedValueOnce({
        code: 'P2025',
        message: 'Record not found',
      });

      const request = new NextRequest('http://localhost:3000/api/orders/nonexistent-id/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'completed' }),
      });

      const response = await PATCH(request, { params: { id: 'nonexistent-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Order not found');
    });
  });

  describe('Server errors', () => {
    it('should return 500 on unexpected error', async () => {
      vi.mocked(prisma.order.update).mockRejectedValueOnce(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'completed' }),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Response format', () => {
    it('should return correct response structure', async () => {
      const mockOrder = {
        id: mockOrderId,
        state: 'completed',
        updatedAt: mockUpdatedAt,
      };

      vi.mocked(prisma.order.update).mockResolvedValueOnce(mockOrder as any);

      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'completed' }),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('state');
      expect(data).toHaveProperty('updatedAt');
      expect(Object.keys(data)).toEqual(['id', 'state', 'updatedAt']);
    });

    it('should format updatedAt as ISO string', async () => {
      const mockOrder = {
        id: mockOrderId,
        state: 'completed',
        updatedAt: mockUpdatedAt,
      };

      vi.mocked(prisma.order.update).mockResolvedValueOnce(mockOrder as any);

      const request = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'completed' }),
      });

      const response = await PATCH(request, { params: { id: mockOrderId } });
      const data = await response.json();

      expect(typeof data.updatedAt).toBe('string');
      expect(() => new Date(data.updatedAt)).not.toThrow();
    });
  });

  describe('Idempotency', () => {
    it('should allow setting same state multiple times', async () => {
      const mockOrder = {
        id: mockOrderId,
        state: 'completed',
        updatedAt: mockUpdatedAt,
      };

      vi.mocked(prisma.order.update).mockResolvedValue(mockOrder as any);

      const request1 = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'completed' }),
      });

      const response1 = await PATCH(request1, { params: { id: mockOrderId } });
      expect(response1.status).toBe(200);

      const request2 = new NextRequest('http://localhost:3000/api/orders/test-order-123/state', {
        method: 'PATCH',
        body: JSON.stringify({ state: 'completed' }),
      });

      const response2 = await PATCH(request2, { params: { id: mockOrderId } });
      expect(response2.status).toBe(200);
    });
  });
});
