-- DropForeignKey
ALTER TABLE "templates" DROP CONSTRAINT "templates_sensitivity_level_id_fkey";

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "sensitivity_level_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_sensitivity_level_id_fkey" FOREIGN KEY ("sensitivity_level_id") REFERENCES "sensitivity_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
