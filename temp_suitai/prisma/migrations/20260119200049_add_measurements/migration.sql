-- CreateTable Measurement
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "measurementData" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 1.0,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Measurement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable SmplParameters
CREATE TABLE "SmplParameters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "measurementId" TEXT NOT NULL UNIQUE,
    "beta" TEXT NOT NULL,
    "theta" TEXT NOT NULL,
    "globalRotation" TEXT,
    "globalTranslation" TEXT,
    "poseConfidence" REAL NOT NULL DEFAULT 1.0,
    "shapeConfidence" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SmplParameters_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "Measurement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Measurement_sessionId_idx" ON "Measurement"("sessionId");
