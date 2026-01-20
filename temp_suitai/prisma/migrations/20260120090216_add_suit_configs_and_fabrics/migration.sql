-- CreateTable
CREATE TABLE "Fabric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceModifier" REAL NOT NULL DEFAULT 1.0,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SuitConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "fabricId" TEXT NOT NULL,
    "styleJson" TEXT,
    "calculatedPriceGbp" REAL NOT NULL DEFAULT 599,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "templateLockedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SuitConfig_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
