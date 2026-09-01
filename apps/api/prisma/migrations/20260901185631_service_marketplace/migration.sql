-- CreateEnum
CREATE TYPE "SERVICE_STATUS" AS ENUM ('PENDING', 'VERIFIED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "service_providers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "phone" TEXT NOT NULL,
    "telegram" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "working_hours" TEXT,
    "status" "SERVICE_STATUS" NOT NULL DEFAULT 'PENDING',
    "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_catalog_items" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_offerings" (
    "id" TEXT NOT NULL,
    "service_provider_id" TEXT NOT NULL,
    "service_catalog_item_id" TEXT NOT NULL,
    "price_min" INTEGER,
    "price_max" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_offerings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BrandToServiceProvider" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BrandToServiceProvider_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_providers_user_id_key" ON "service_providers"("user_id");

-- CreateIndex
CREATE INDEX "service_providers_city_idx" ON "service_providers"("city");

-- CreateIndex
CREATE INDEX "service_providers_status_idx" ON "service_providers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "service_catalog_items_slug_key" ON "service_catalog_items"("slug");

-- CreateIndex
CREATE INDEX "service_offerings_service_provider_id_idx" ON "service_offerings"("service_provider_id");

-- CreateIndex
CREATE INDEX "service_offerings_service_catalog_item_id_idx" ON "service_offerings"("service_catalog_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_offerings_service_provider_id_service_catalog_item__key" ON "service_offerings"("service_provider_id", "service_catalog_item_id");

-- CreateIndex
CREATE INDEX "_BrandToServiceProvider_B_index" ON "_BrandToServiceProvider"("B");

-- AddForeignKey
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_offerings" ADD CONSTRAINT "service_offerings_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_offerings" ADD CONSTRAINT "service_offerings_service_catalog_item_id_fkey" FOREIGN KEY ("service_catalog_item_id") REFERENCES "service_catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToServiceProvider" ADD CONSTRAINT "_BrandToServiceProvider_A_fkey" FOREIGN KEY ("A") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToServiceProvider" ADD CONSTRAINT "_BrandToServiceProvider_B_fkey" FOREIGN KEY ("B") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
