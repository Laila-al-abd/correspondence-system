-- Fees become part of the workflow definition ------------------------------
-- A step may declare what it costs. Null means free, which is every step that
-- exists today, so this migration cannot change the behaviour of a live
-- request: nothing is charged until an administrator declares a fee (or the
-- seed does, for the three certificate templates that carry one).
ALTER TABLE "workflow_steps"
  ADD COLUMN IF NOT EXISTS "fee_amount" NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS "fee_currency" VARCHAR(3);
