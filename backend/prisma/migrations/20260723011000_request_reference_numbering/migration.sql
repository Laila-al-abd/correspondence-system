-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "reference_no" VARCHAR(50);

-- CreateTable
CREATE TABLE "request_number_sequences" (
    "scope" VARCHAR(50) NOT NULL,
    "current_value" BIGINT NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_number_sequences_pkey" PRIMARY KEY ("scope")
);

-- CreateIndex
CREATE UNIQUE INDEX "requests_reference_no_key" ON "requests"("reference_no");
