-- Fix latent schema bug: project_id is nullable but part of PRIMARY KEY.
-- PostgreSQL enforces NOT NULL on PK columns. ON DELETE SET NULL on the FK
-- will cause a constraint violation when any project is deleted.
-- Solution: make project_id NOT NULL with a default zero-UUID for unassigned
-- aggregated rows, and change ON DELETE to CASCADE.

ALTER TABLE token_usage_daily
  ALTER COLUMN project_id SET NOT NULL,
  ALTER COLUMN project_id SET DEFAULT '00000000-0000-0000-0000-000000000000',
  DROP CONSTRAINT token_usage_daily_project_id_fkey,
  ADD CONSTRAINT token_usage_daily_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

UPDATE token_usage_daily
  SET project_id = '00000000-0000-0000-0000-000000000000'
  WHERE project_id IS NULL;

ALTER TABLE token_usage_monthly
  ALTER COLUMN project_id SET NOT NULL,
  ALTER COLUMN project_id SET DEFAULT '00000000-0000-0000-0000-000000000000',
  DROP CONSTRAINT token_usage_monthly_project_id_fkey,
  ADD CONSTRAINT token_usage_monthly_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

UPDATE token_usage_monthly
  SET project_id = '00000000-0000-0000-0000-000000000000'
  WHERE project_id IS NULL;
