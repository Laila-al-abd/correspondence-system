-- Priority becomes a property of the request type -------------------------
-- Declared once per template by an administrator. Nothing on the submit path
-- accepts a priority any more, so a requester cannot start their own request
-- ahead of everyone else's.
ALTER TABLE "templates"
  ADD COLUMN IF NOT EXISTS "default_priority" VARCHAR(30) NOT NULL DEFAULT 'NORMAL';

-- The two request kinds that are urgent by definition. Kept here as well as in
-- the seed so an existing database is corrected by the migration itself.
UPDATE "templates"
   SET "default_priority" = 'URGENT'
 WHERE "code" IN ('MILITARY_DEFER', 'ID_REPLACEMENT');

-- One home for sensitivity ------------------------------------------------
-- The per-request override was never written by any code path, and two columns
-- answering one question is one too many. The template keeps its own.
ALTER TABLE "requests" DROP CONSTRAINT IF EXISTS "requests_sensitivity_level_id_fkey";
ALTER TABLE "requests" DROP COLUMN IF EXISTS "sensitivity_level_id";

-- Payments say what actually happened -------------------------------------
-- A waiver was recorded in confirmed_by / confirmed_at too, so the column
-- names claimed a payment had been confirmed when no money ever changed hands.
-- Renamed rather than re-created: existing rows keep their values.
ALTER TABLE "payments" RENAME COLUMN "confirmed_by" TO "settled_by";
ALTER TABLE "payments" RENAME COLUMN "confirmed_at" TO "settled_at";
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "waiver_reason" TEXT;
