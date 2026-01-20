-- CreateTable
CREATE TABLE "fabrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_modifier" REAL,
    "base_price_gbp" REAL,
    "texture_url" TEXT,
    "thumbnail_url" TEXT,
    "color_hex" TEXT,
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "stock_quantity" INTEGER,
    "lead_time_days" INTEGER,
    "properties" TEXT,
    "supplier" TEXT,
    "supplier_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "suit_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "fabric_id" TEXT NOT NULL,
    "style_json" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "suit_configs_fabric_id_fkey" FOREIGN KEY ("fabric_id") REFERENCES "fabrics" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "fabrics_code_key" ON "fabrics"("code");
