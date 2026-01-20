-- CreateTable Scan
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "isLocked" BOOLEAN NOT NULL DEFAULT 0,
    CONSTRAINT "Scan_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE
);

-- CreateTable Frame
CREATE TABLE "Frame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "frameNumber" INTEGER NOT NULL,
    "userInFrame" BOOLEAN NOT NULL DEFAULT 0,
    "confidence" REAL NOT NULL DEFAULT 0.0,
    "stabilityScore" REAL NOT NULL DEFAULT 0.0,
    "iou" REAL,
    "isValid" BOOLEAN NOT NULL DEFAULT 0,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Frame_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX "Scan_sessionId_idx" ON "Scan"("sessionId");

-- CreateIndex
CREATE INDEX "Frame_scanId_idx" ON "Frame"("scanId");
