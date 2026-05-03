-- Sentinel organization and project for platform-level token usage aggregation.
-- When token_usage_events have no project_id (org-level executions), the
-- aggregation worker uses '00000000-0000-0000-0000-000000000000' as the
-- project_id sentinel so the NOT NULL FK constraint on token_usage_daily
-- and token_usage_monthly is satisfied.

INSERT INTO organizations (id, name, slug, region)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '_platform',
  '_platform',
  'global'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, organization_id, name, phase, status)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '_unassigned',
  'Plan',
  'Planning'
) ON CONFLICT (id) DO NOTHING;
