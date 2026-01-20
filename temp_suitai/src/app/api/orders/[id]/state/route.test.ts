/**
 * Test file for PATCH /api/orders/:id/state endpoint
 *
 * This endpoint allows administrators to transition orders between states.
 * The state machine is enforced by database triggers.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from './route';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  createRouteHandlerClient: vi.fn(),
}));

describe('PATCH /api/orders/:id/state', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };

    const { createRouteHandlerClient } = require('@/lib/supabase');
    createRouteHandlerClient.mockReturnValue(mockSupabase);
  });

  it('should reject unauthenticated requests', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const request = new NextRequest('http://localhost/api/orders/123/state', {
      method: 'PATCH',
      body: JSON.stringify({ new_state: 'in_production' }),
    });

    const response = await PATCH(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should reject non-admin users', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'user' },
            error: null,
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost/api/orders/123/state', {
      method: 'PATCH',
      body: JSON.stringify({ new_state: 'in_production' }),
    });

    const response = await PATCH(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Admin access required');
  });

  it('should validate state transition input', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost/api/orders/123/state', {
      method: 'PATCH',
      body: JSON.stringify({ new_state: 'invalid_state' }),
    });

    const response = await PATCH(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should successfully transition state for admin users', async () => {
    const mockOrder = {
      id: '123',
      current_state: 'in_production',
      updated_at: new Date().toISOString(),
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null,
    });

    const mockFromChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockOrder,
              error: null,
            }),
          }),
        }),
      }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: mockFromChain.select,
        };
      }
      return mockFromChain;
    });

    const request = new NextRequest('http://localhost/api/orders/123/state', {
      method: 'PATCH',
      body: JSON.stringify({ new_state: 'in_production', notes: 'Test note' }),
    });

    const response = await PATCH(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('123');
    expect(data.current_state).toBe('in_production');
  });

  it('should handle invalid state transitions', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null,
    });

    const mockFromChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: {
                message: 'Invalid state transition from delivered to draft',
                code: '23514',
              },
            }),
          }),
        }),
      }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: mockFromChain.select,
        };
      }
      return mockFromChain;
    });

    const request = new NextRequest('http://localhost/api/orders/123/state', {
      method: 'PATCH',
      body: JSON.stringify({ new_state: 'draft' }),
    });

    const response = await PATCH(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid state transition');
  });

  it('should handle non-existent orders', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null,
    });

    const mockFromChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: mockFromChain.select,
        };
      }
      return mockFromChain;
    });

    const request = new NextRequest('http://localhost/api/orders/999/state', {
      method: 'PATCH',
      body: JSON.stringify({ new_state: 'in_production' }),
    });

    const response = await PATCH(request, { params: { id: '999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Order not found');
  });
});
