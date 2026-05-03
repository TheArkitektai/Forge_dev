-- Seed default subscription tiers aligned to Commercial Strategy v2

INSERT INTO subscription_tiers (
  slug, name, annual_price_usd, monthly_price_usd,
  included_tokens_monthly, overage_rate_per_million, hard_cap_tokens_monthly,
  max_projects, max_users, max_concurrent_agents,
  grace_period_days, data_retention_days, features
) VALUES
('forge_team', 'Forge Team', 14400, 1200, 5000000, 12.00, 10000000, 3, 10, 2, 30, 90, '{}'),
('forge_enterprise', 'Forge Enterprise', 120000, 10000, 50000000, 10.00, 150000000, 25, 100, 10, 30, 90, '{}'),
('forge_partner', 'Partner Edition', 110000, 9167, 40000000, 10.00, 120000000, 999999, 50, 8, 30, 90, '{}'),
('forge_sovereign', 'Forge Sovereign', 250000, 20833, 100000000, 9.00, 500000000, 999999, 999999, 20, 60, 365, '{}');

-- Seed default roles
INSERT INTO roles (key, name, permissions) VALUES
('platform_admin', 'Platform Administrator', ARRAY['org:read','org:write','project:create','project:read','project:write','project:delete','story:create','story:read','story:write','story:delete','subscription:read','subscription:write','budget:read','budget:write','agent:execute','agent:configure','admin:tiers','admin:tenants','admin:overrides']),
('tenant_admin', 'Tenant Administrator', ARRAY['org:read','org:write','project:create','project:read','project:write','story:create','story:read','story:write','subscription:read','budget:read','budget:write','agent:execute','agent:configure']),
('project_lead', 'Project Lead', ARRAY['org:read','project:read','project:write','story:create','story:read','story:write','budget:read','agent:execute']),
('developer', 'Developer', ARRAY['org:read','project:read','story:read','story:write','agent:execute']),
('viewer', 'Viewer', ARRAY['org:read','project:read','story:read']);

-- Seed test organization
INSERT INTO organizations (name, slug, region) VALUES ('Uxbert Test Tenant', 'uxbert-test', 'me-central2');

-- Seed test user
INSERT INTO users (organization_id, email, name, role_id)
SELECT o.id, 'admin@uxbert.test', 'Test Admin', r.id
FROM organizations o, roles r
WHERE o.slug = 'uxbert-test' AND r.key = 'platform_admin';

-- Seed test subscription (Forge Enterprise tier, active)
INSERT INTO subscriptions (organization_id, tier_id, status, started_at, expires_at, billing_cycle)
SELECT o.id, t.id, 'active', NOW(), NOW() + INTERVAL '1 year', 'annual'
FROM organizations o, subscription_tiers t
WHERE o.slug = 'uxbert-test' AND t.slug = 'forge_enterprise';

-- Seed test budget
INSERT INTO tenant_budgets (organization_id, scope_type, scope_id, monthly_token_limit, on_limit_reached)
SELECT o.id, 'organization', o.id, 50000000, 'alert_continue'
FROM organizations o WHERE o.slug = 'uxbert-test';

-- Seed test project
INSERT INTO projects (organization_id, name, description, phase, status, owner_id)
SELECT o.id, 'National Digital Permits Platform', 'NEOM digital transformation proof of concept', 'Plan', 'Active', u.id
FROM organizations o, users u
WHERE o.slug = 'uxbert-test' AND u.email = 'admin@uxbert.test';

-- Seed test story
INSERT INTO stories (project_id, title, description, phase, owner_id, risk, confidence)
SELECT p.id, 'Citizen Authentication Flow', 'Implement national ID + OTP + biometric fallback authentication', 'Plan', u.id, 'Medium', 72
FROM projects p, users u
WHERE p.name = 'National Digital Permits Platform' AND u.email = 'admin@uxbert.test';
