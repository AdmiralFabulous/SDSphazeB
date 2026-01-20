-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'initializing',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scan_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScanTelemetry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "frameCount" INTEGER NOT NULL DEFAULT 0,
    "stableFrameCount" INTEGER NOT NULL DEFAULT 0,
    "stabilityScore" REAL NOT NULL DEFAULT 0.0,
    "measurementLocked" BOOLEAN NOT NULL DEFAULT false,
    "universalMeasurementId" TEXT,
    "measurementConfidence" REAL NOT NULL DEFAULT 0.0,
    "meanStabilityScore" REAL NOT NULL DEFAULT 0.0,
    "variance" REAL NOT NULL DEFAULT 0.0,
    "outlierCount" INTEGER NOT NULL DEFAULT 0,
    "kalmanCovariance" REAL NOT NULL DEFAULT 0.0,
    "meshesInBuffer" INTEGER NOT NULL DEFAULT 0,
    "detectedRegions" TEXT NOT NULL DEFAULT '[]',
    "scanDurationMs" INTEGER NOT NULL DEFAULT 0,
    "fps" REAL NOT NULL DEFAULT 0.0,
    "warnings" TEXT NOT NULL DEFAULT '[]',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScanTelemetry_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Scan_sessionId_idx" ON "Scan"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ScanTelemetry_scanId_key" ON "ScanTelemetry"("scanId");
