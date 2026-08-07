-- RenameForeignKey
ALTER TABLE "payments" RENAME CONSTRAINT "payments_confirmed_by_fkey" TO "payments_settled_by_fkey";
