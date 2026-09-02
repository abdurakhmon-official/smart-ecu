-- CreateEnum
CREATE TYPE "TUNING_ORDER_STATUS" AS ENUM ('NEW', 'IN_PROGRESS', 'WAITING_FOR_LOG', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ECU_FILE_KIND" AS ENUM ('ORIGINAL', 'MODIFIED', 'LOG');

-- CreateTable
CREATE TABLE "tuner_profiles" (
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

    CONSTRAINT "tuner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tuning_orders" (
    "id" TEXT NOT NULL,
    "tuner_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_vehicle_id" TEXT,
    "service_catalog_item_id" TEXT NOT NULL,
    "problem_description" TEXT NOT NULL,
    "status" "TUNING_ORDER_STATUS" NOT NULL DEFAULT 'NEW',
    "power_before_hp" INTEGER,
    "power_after_hp" INTEGER,
    "torque_before_nm" INTEGER,
    "torque_after_nm" INTEGER,
    "fuel_consumption_before" DOUBLE PRECISION,
    "fuel_consumption_after" DOUBLE PRECISION,
    "results_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tuning_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecu_files" (
    "id" TEXT NOT NULL,
    "tuning_order_id" TEXT NOT NULL,
    "kind" "ECU_FILE_KIND" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "ecu_id" TEXT,
    "software" TEXT,
    "hardware" TEXT,
    "checksum" TEXT,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecu_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BrandToTunerProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BrandToTunerProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tuner_profiles_user_id_key" ON "tuner_profiles"("user_id");

-- CreateIndex
CREATE INDEX "tuner_profiles_city_idx" ON "tuner_profiles"("city");

-- CreateIndex
CREATE INDEX "tuner_profiles_status_idx" ON "tuner_profiles"("status");

-- CreateIndex
CREATE INDEX "tuning_orders_tuner_id_idx" ON "tuning_orders"("tuner_id");

-- CreateIndex
CREATE INDEX "tuning_orders_user_id_idx" ON "tuning_orders"("user_id");

-- CreateIndex
CREATE INDEX "tuning_orders_status_idx" ON "tuning_orders"("status");

-- CreateIndex
CREATE INDEX "ecu_files_tuning_order_id_idx" ON "ecu_files"("tuning_order_id");

-- CreateIndex
CREATE INDEX "_BrandToTunerProfile_B_index" ON "_BrandToTunerProfile"("B");

-- AddForeignKey
ALTER TABLE "tuner_profiles" ADD CONSTRAINT "tuner_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuning_orders" ADD CONSTRAINT "tuning_orders_tuner_id_fkey" FOREIGN KEY ("tuner_id") REFERENCES "tuner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuning_orders" ADD CONSTRAINT "tuning_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuning_orders" ADD CONSTRAINT "tuning_orders_user_vehicle_id_fkey" FOREIGN KEY ("user_vehicle_id") REFERENCES "user_vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuning_orders" ADD CONSTRAINT "tuning_orders_service_catalog_item_id_fkey" FOREIGN KEY ("service_catalog_item_id") REFERENCES "service_catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecu_files" ADD CONSTRAINT "ecu_files_tuning_order_id_fkey" FOREIGN KEY ("tuning_order_id") REFERENCES "tuning_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecu_files" ADD CONSTRAINT "ecu_files_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToTunerProfile" ADD CONSTRAINT "_BrandToTunerProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToTunerProfile" ADD CONSTRAINT "_BrandToTunerProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "tuner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
