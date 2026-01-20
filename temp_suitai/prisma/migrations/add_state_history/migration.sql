-- CreateTable StateHistory
CREATE TABLE "StateHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stateChangedAt" DATETIME NOT NULL,
    "stableFrameCount" INTEGER NOT NULL,
    "stabilityScore" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "geometricMedian" TEXT,
    "universalMeasurementId" TEXT,
    "changedBy" TEXT,
    "notes" TEXT,
    "warnings" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StateHistory_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE
);

-- CreateIndex StateHistory_sessionId
CREATE INDEX "StateHistory_sessionId_idx" ON "StateHistory"("sessionId");

-- CreateIndex StateHistory_stateChangedAt
CREATE INDEX "StateHistory_stateChangedAt_idx" ON "StateHistory"("stateChangedAt");

-- CreateIndex StateHistory_state
CREATE INDEX "StateHistory_state_idx" ON "StateHistory"("state");
