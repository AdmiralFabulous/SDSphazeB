-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "height" REAL,
    "scanIsLocked" BOOLEAN NOT NULL DEFAULT false,
    "scanProgress" REAL NOT NULL DEFAULT 0.0,
    "scanStableFrameCount" INTEGER NOT NULL DEFAULT 0,
    "scanConfidence" REAL NOT NULL DEFAULT 0.0,
    "scanUniversalMeasurementId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Session" ("createdAt", "height", "id", "updatedAt") SELECT "createdAt", "height", "id", "updatedAt" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
