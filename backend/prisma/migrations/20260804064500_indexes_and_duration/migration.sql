-- How long a request actually took, in *working* minutes: nights, weekends and
-- holidays removed. Computed once when the request completes rather than derived
-- on demand, because deriving it means replaying the working-hours policy and
-- the holiday calendar over the whole history -- and if the policy is ever
-- edited, the same finished request would silently report a different duration.
-- This is the raw material for "how long does this kind of request usually
-- take": an average over completed rows of the same template.
ALTER TABLE "requests" ADD COLUMN "business_duration_minutes" INTEGER;

-- Indexes. Postgres does not index a foreign key automatically, and Prisma only
-- creates what the schema declares, so these columns were being scanned.

-- The staff queue's exact sort order: status filter, then the four ORDER BY
-- expressions. The single-column index on current_status is dropped because
-- this composite begins with the same column and answers those queries too --
-- keeping both would cost writes and buy nothing.
CREATE INDEX "requests_created_at_idx" ON "requests"("created_at");
CREATE INDEX "requests_current_status_priority_sla_risk_sla_due_at_id_idx" ON "requests"("current_status", "priority", "sla_risk", "sla_due_at", "id");
DROP INDEX IF EXISTS "requests_current_status_idx";

-- The SLA sweep filters on status and due date together.
CREATE INDEX "request_step_instances_status_sla_due_at_idx" ON "request_step_instances"("status", "sla_due_at");
DROP INDEX IF EXISTS "request_step_instances_status_idx";

-- "My unread notifications", and the retention sweep that deletes by age.
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");
DROP INDEX IF EXISTS "notifications_user_id_idx";
