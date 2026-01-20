import { PrismaClient } from '@prisma/client';

export interface MergeResult {
  success: boolean;
  merged: {
    measurements: number;
    configs: number;
  };
  errors: string[];
}

export async function mergeAnonymousSession(
  prisma: PrismaClient,
  anonymousSessionId: string,
  userId: string
): Promise<MergeResult> {
  const result: MergeResult = {
    success: true,
    merged: { measurements: 0, configs: 0 },
    errors: []
  };

  try {
    // 1. Verify the anonymous session exists and is actually anonymous
    const anonymousSession = await prisma.session.findUnique({
      where: { id: anonymousSessionId },
      include: {
        measurements: true,
        suitConfigs: true
      }
    });

    if (!anonymousSession) {
      result.success = false;
      result.errors.push('Anonymous session not found');
      return result;
    }

    if (anonymousSession.userId && anonymousSession.userId !== userId) {
      result.success = false;
      result.errors.push('Session already belongs to a different user');
      return result;
    }

    // 2. Get or create user's primary session
    let userSession = await prisma.session.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!userSession) {
      // Create new session for user
      userSession = await prisma.session.create({
        data: { userId }
      });
    }

    // 3. Transfer measurements
    try {
      const measurementUpdates = await prisma.measurement.updateMany({
        where: { sessionId: anonymousSessionId },
        data: { sessionId: userSession.id }
      });
      result.merged.measurements = measurementUpdates.count;
    } catch (error: any) {
      result.errors.push(`Measurements: ${error.message}`);
      result.success = false;
    }

    // 4. Transfer suit configurations
    try {
      const configUpdates = await prisma.suitConfig.updateMany({
        where: { sessionId: anonymousSessionId },
        data: { sessionId: userSession.id }
      });
      result.merged.configs = configUpdates.count;
    } catch (error: any) {
      result.errors.push(`Configs: ${error.message}`);
      result.success = false;
    }

    // 5. Mark anonymous session as claimed
    await prisma.session.update({
      where: { id: anonymousSessionId },
      data: {
        userId,
        updatedAt: new Date()
      }
    });

    // 6. Log the merge
    await prisma.auditLog.create({
      data: {
        action: 'session_merge',
        userId,
        sessionId: userSession.id,
        metadata: JSON.stringify({
          anonymousSessionId,
          targetSessionId: userSession.id,
          merged: result.merged
        })
      }
    });

    return result;

  } catch (error: any) {
    result.success = false;
    result.errors.push(`Unexpected error: ${error.message}`);
    return result;
  }
}
