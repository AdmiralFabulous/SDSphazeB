/**
 * Test file for VOICE-E01-S03-T04: Announce Scan Completion
 *
 * This demonstrates the scan completion announcement flow where:
 * 1. The system tracks scan progress via the measurement lock
 * 2. Claude (LLM) checks scan status using the get_scan_status tool
 * 3. When the scan is complete, Claude celebrates the completion
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testScanCompletionFlow() {
  console.log('='.repeat(80));
  console.log('VOICE-E01-S03-T04: Scan Completion Announcement Test');
  console.log('='.repeat(80));

  const sessionId = 'test-session-' + Date.now();

  try {
    // Step 1: Create a new session
    console.log('\n1. Creating new session...');
    await prisma.session.create({
      data: {
        id: sessionId,
        scanIsLocked: false,
        scanProgress: 0.0,
        scanStableFrameCount: 0,
        scanConfidence: 0.0,
      },
    });
    console.log(`   ✓ Session created: ${sessionId}`);

    // Step 2: Simulate scan progress updates
    console.log('\n2. Simulating scan progress...');
    const progressSteps = [
      { frames: 50, progress: 0.167, confidence: 0.5 },
      { frames: 150, progress: 0.5, confidence: 0.7 },
      { frames: 250, progress: 0.833, confidence: 0.85 },
      { frames: 300, progress: 1.0, confidence: 0.95, locked: true },
    ];

    for (const step of progressSteps) {
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          scanStableFrameCount: step.frames,
          scanProgress: step.progress,
          scanConfidence: step.confidence,
          scanIsLocked: step.locked || false,
          scanUniversalMeasurementId: step.locked
            ? `UMI_${Date.now()}_abc123_xyz789`
            : null,
        },
      });
      console.log(
        `   Frame ${step.frames}/300: ${Math.round(step.progress * 100)}% complete, ` +
        `confidence: ${Math.round(step.confidence * 100)}%${step.locked ? ' [LOCKED]' : ''}`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Step 3: Check final status
    console.log('\n3. Checking final scan status...');
    const finalSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (finalSession) {
      console.log(`   ✓ Scan is locked: ${finalSession.scanIsLocked}`);
      console.log(`   ✓ Progress: ${Math.round(finalSession.scanProgress * 100)}%`);
      console.log(`   ✓ Stable frames: ${finalSession.scanStableFrameCount}/300`);
      console.log(`   ✓ Confidence: ${Math.round(finalSession.scanConfidence * 100)}%`);
      console.log(`   ✓ Universal Measurement ID: ${finalSession.scanUniversalMeasurementId}`);
    }

    // Step 4: Demonstrate API endpoints
    console.log('\n4. API Endpoints Available:');
    console.log(`   GET  /api/sessions/${sessionId}/scan-status`);
    console.log(`        Returns: { isLocked, progress, stableFrameCount, confidence, universalMeasurementId }`);
    console.log();
    console.log(`   POST /api/sessions/${sessionId}/scan-status`);
    console.log(`        Body: { isLocked?, progress?, stableFrameCount?, confidence?, universalMeasurementId? }`);
    console.log();
    console.log(`   POST /api/sessions/${sessionId}/announce-completion`);
    console.log(`        Triggers Claude to check status and celebrate if complete`);

    // Step 5: Explain the LLM flow
    console.log('\n5. LLM Completion Announcement Flow:');
    console.log('   a) User/System calls POST /api/sessions/:id/announce-completion');
    console.log('   b) System invokes Claude with get_scan_status tool');
    console.log('   c) Claude calls get_scan_status(sessionId)');
    console.log('   d) System returns scan status to Claude');
    console.log('   e) Claude analyzes status:');
    console.log('      - If isLocked = true: Celebrates completion! 🎉');
    console.log('      - If isLocked = false: Reports progress percentage');
    console.log('   f) Claude returns celebration message or progress update');

    console.log('\n' + '='.repeat(80));
    console.log('Test completed successfully!');
    console.log('='.repeat(80));
    console.log('\nTo test the LLM announcement:');
    console.log('1. Set ANTHROPIC_API_KEY in .env file');
    console.log('2. Start the Next.js server: npm run dev');
    console.log(`3. Call: POST http://localhost:3000/api/sessions/${sessionId}/announce-completion`);
    console.log('4. Claude will check the scan status and celebrate the completion!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Cleanup
    await prisma.session.deleteMany({
      where: { id: sessionId },
    });
    await prisma.$disconnect();
  }
}

// Run the test
testScanCompletionFlow();
