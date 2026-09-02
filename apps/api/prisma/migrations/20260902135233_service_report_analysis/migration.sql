-- CreateEnum
CREATE TYPE "REPORT_SEVERITY" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "service_report_analyses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "severity" "REPORT_SEVERITY",
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_report_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_report_analyses_user_id_idx" ON "service_report_analyses"("user_id");

-- AddForeignKey
ALTER TABLE "service_report_analyses" ADD CONSTRAINT "service_report_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
