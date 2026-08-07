-- The AI service's extraction backlog was "classified requests whose
-- filled_data is empty". That cannot distinguish a request nobody has tried
-- yet from one the extractor read and found nothing in, so the second kind was
-- served again on every poll, forever, burning a model pass each time and
-- never changing anything.
--
-- This column records the attempt itself, so the backlog can ask the question
-- it actually means. Nullable with no default and no backfill: every existing
-- row is genuinely unattempted, which is exactly what NULL says.
ALTER TABLE "requests" ADD COLUMN "extraction_attempted_at" TIMESTAMPTZ(6);
