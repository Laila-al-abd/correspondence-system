-- The requester's own acceptance of what the models produced. A request may not
-- enter a workflow until this is stamped: a template chosen by a classifier and
-- fields written by an extractor are proposals, and staff should never be
-- approving values no human ever read.
--
-- Nullable by necessity: every existing row predates confirmation, and there is
-- no honest value to backfill -- nobody confirmed them. They stay unconfirmed.
ALTER TABLE "requests" ADD COLUMN "confirmed_at" TIMESTAMPTZ(6);
