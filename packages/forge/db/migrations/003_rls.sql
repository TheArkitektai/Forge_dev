-- Row Level Security policies for multi-tenant isolation

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_chain_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation ON organizations
  FOR ALL USING (id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY user_isolation ON users
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY project_isolation ON projects
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY story_isolation ON stories
  FOR ALL USING (project_id IN (
    SELECT id FROM projects
    WHERE organization_id = current_setting('app.current_org_id', true)::UUID
  ));

CREATE POLICY agent_execution_isolation ON agent_executions
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY audit_event_isolation ON audit_events
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY memory_node_isolation ON memory_nodes
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY subscription_isolation ON subscriptions
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY token_usage_event_isolation ON token_usage_events
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY token_usage_daily_isolation ON token_usage_daily
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY token_usage_monthly_isolation ON token_usage_monthly
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY budget_isolation ON tenant_budgets
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY invoice_isolation ON billing_invoices
  FOR ALL USING (organization_id = current_setting('app.current_org_id', true)::UUID);
