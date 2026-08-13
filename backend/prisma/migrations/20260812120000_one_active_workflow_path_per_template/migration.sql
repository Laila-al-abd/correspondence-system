-- One active workflow path per template, enforced by the database.
--
-- The application already assumed this rule -- findActiveByTemplate uses
-- findFirst -- but nothing stopped two concurrent activations from both
-- committing, after which the reader silently picked whichever id sorted
-- first. A partial unique index makes the assumption true instead of hopeful.

-- Step 1: stand down any duplicates already in the data, keeping the most
-- recently created active path for each template.
UPDATE "workflow_paths" p
SET "is_active" = false
WHERE p."is_active"
  AND p."deleted_at" IS NULL
  AND p."id" <> (
    SELECT q."id"
    FROM "workflow_paths" q
    WHERE q."template_id" = p."template_id"
      AND q."is_active"
      AND q."deleted_at" IS NULL
    ORDER BY q."created_at" DESC, q."id" DESC
    LIMIT 1
  );

-- Step 2: the invariant itself. Retired and soft-deleted paths are exempt, so
-- a template can keep any number of historical paths alive for the requests
-- that started on them.
CREATE UNIQUE INDEX "one_active_workflow_path_per_template"
  ON "workflow_paths" ("template_id")
  WHERE "is_active" AND "deleted_at" IS NULL;
