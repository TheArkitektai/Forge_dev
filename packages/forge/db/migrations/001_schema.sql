-- Arkitekt Forge v12 Core Schema
-- PostgreSQL 15 + pgvector

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  region TEXT NOT NULL DEFAULT 'me-central2',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL DEFAULT 'Plan',
  status TEXT NOT NULL DEFAULT 'Planning',
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL DEFAULT 'Plan',
  owner_id UUID REFERENCES users(id),
  risk TEXT NOT NULL DEFAULT 'Low',
  confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE state_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  from_phase TEXT NOT NULL,
  to_phase TEXT NOT NULL,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  triggered_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  proof_hash TEXT NOT NULL
);

CREATE TABLE gates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'blocking',
  check_fn TEXT NOT NULL,
  required_approvers INTEGER NOT NULL DEFAULT 1,
  allowed_roles TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE gate_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gate_id UUID NOT NULL REFERENCES gates(id),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  details TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  executed_by UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE approval_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gate_result_id UUID NOT NULL REFERENCES gate_results(id),
  action TEXT NOT NULL,
  actor_id UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'idle',
  model_used TEXT,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE proof_chain_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  previous_hash TEXT NOT NULL,
  data TEXT NOT NULL,
  hash TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  signed_by UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  actor_id UUID NOT NULL REFERENCES users(id),
  actor_role TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  proof_hash TEXT NOT NULL
);

CREATE TABLE evidence_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  scope TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  download_url TEXT NOT NULL
);

CREATE TABLE memory_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX memory_nodes_embedding_idx ON memory_nodes USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  annual_price_usd INTEGER NOT NULL,
  monthly_price_usd INTEGER NOT NULL,
  included_tokens_monthly BIGINT NOT NULL,
  overage_rate_per_million NUMERIC(10, 2) NOT NULL,
  hard_cap_tokens_monthly BIGINT NOT NULL,
  max_projects INTEGER NOT NULL,
  max_users INTEGER NOT NULL,
  max_concurrent_agents INTEGER NOT NULL,
  grace_period_days INTEGER NOT NULL DEFAULT 30,
  data_retention_days INTEGER NOT NULL DEFAULT 90,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
  status TEXT NOT NULL DEFAULT 'trial',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  grace_period_days INTEGER NOT NULL DEFAULT 30,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  payment_method_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

CREATE TABLE token_usage_events (
  id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  agent_execution_id UUID REFERENCES agent_executions(id) ON DELETE SET NULL,
  model_provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_at_provider_rate NUMERIC(12, 6) NOT NULL DEFAULT 0,
  cost_at_customer_rate NUMERIC(12, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE token_usage_events_default PARTITION OF token_usage_events DEFAULT;

CREATE TABLE token_usage_daily (
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  total_input_tokens BIGINT NOT NULL DEFAULT 0,
  total_output_tokens BIGINT NOT NULL DEFAULT 0,
  total_cost_provider NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_cost_customer NUMERIC(12, 2) NOT NULL DEFAULT 0,
  story_count INTEGER NOT NULL DEFAULT 0,
  execution_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, project_id, date)
);

CREATE TABLE token_usage_monthly (
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  month TEXT NOT NULL,
  total_input_tokens BIGINT NOT NULL DEFAULT 0,
  total_output_tokens BIGINT NOT NULL DEFAULT 0,
  total_cost_provider NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_cost_customer NUMERIC(12, 2) NOT NULL DEFAULT 0,
  included_allocation BIGINT NOT NULL DEFAULT 0,
  overage_tokens BIGINT NOT NULL DEFAULT 0,
  overage_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, project_id, month)
);

CREATE TABLE tenant_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  scope_type TEXT NOT NULL DEFAULT 'organization',
  scope_id UUID NOT NULL,
  monthly_token_limit BIGINT NOT NULL,
  alert_threshold_pct_1 INTEGER NOT NULL DEFAULT 80,
  alert_threshold_pct_2 INTEGER NOT NULL DEFAULT 90,
  alert_threshold_pct_3 INTEGER NOT NULL DEFAULT 100,
  on_limit_reached TEXT NOT NULL DEFAULT 'block',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE billing_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  base_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  overage_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft',
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
