-- DropForeignKey
ALTER TABLE "templates" DROP CONSTRAINT "templates_category_id_fkey";

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "category_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "request_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
