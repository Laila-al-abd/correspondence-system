-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "sla_risk" VARCHAR(30) NOT NULL DEFAULT 'ON_TRACK';
