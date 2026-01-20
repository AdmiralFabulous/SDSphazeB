import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

export async function validateSession(
  request: NextRequest
): Promise<AuthContext | null> {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    const session = await prisma.authSession.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      await prisma.authSession.delete({
        where: { id: session.id },
      });
      return null;
    }

    // Check if user is still active
    if (!session.user.isActive) {
      return null;
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function requireAuth(
  request: NextRequest,
  requiredRole?: string
): Promise<{ auth: AuthContext | null; response: NextResponse | null }> {
  const auth = await validateSession(request);

  if (!auth) {
    return {
      auth: null,
      response: NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      ),
    };
  }

  if (requiredRole && auth.role !== requiredRole) {
    return {
      auth: null,
      response: NextResponse.json(
        {
          error: 'Insufficient permissions',
          required: requiredRole,
          actual: auth.role,
        },
        { status: 403 }
      ),
    };
  }

  return {
    auth,
    response: null,
  };
}
