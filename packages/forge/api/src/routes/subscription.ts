import { Hono } from "hono";
import { sql } from "@forge/db";
import { authMiddleware } from "../middleware/auth.js";
import { requirePermission, requireRole } from "../middleware/rbac.js";
import { subscriptionMiddleware } from "../middleware/subscription.js";
import type { Variables } from "../middleware/auth.js";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);
app.use("*", subscriptionMiddleware);

// Tenant: get current subscription
app.get("/", requirePermission("subscription:read"), async (c) => {
  const user = c.get("user");
  const rows = await sql`
    SELECT s.id, s.status, s.started_at, s.expires_at, s.grace_period_days, s.billing_cycle,
           t.id as tier_id, t.name as tier_name, t.slug as tier_slug,
           t.included_tokens_monthly, t.hard_cap_tokens_monthly, t.max_projects, t.max_users, t.max_concurrent_agents
    FROM subscriptions s
    JOIN subscription_tiers t ON s.tier_id = t.id
    WHERE s.organization_id = ${user.org}
    ORDER BY s.created_at DESC
    LIMIT 1
  `;
  if (rows.length === 0) return c.json({ code: "NOT_FOUND", message: "No subscription found" }, 404);
  return c.json({ data: rows[0] });
});

// Tenant: get usage summary
app.get("/usage", requirePermission("subscription:read"), async (c) => {
  const user = c.get("user");
  const period = c.req.query("period") || "current_month";
  
  const subRows = await sql`
    SELECT t.included_tokens_monthly, t.hard_cap_tokens_monthly
    FROM subscriptions s
    JOIN subscription_tiers t ON s.tier_id = t.id
    WHERE s.organization_id = ${user.org}
    ORDER BY s.created_at DESC
    LIMIT 1
  `;
  if (subRows.length === 0) return c.json({ code: "NOT_FOUND", message: "No subscription found" }, 404);
  
  const included = Number(subRows[0].included_tokens_monthly);
  const hardCap = Number(subRows[0].hard_cap_tokens_monthly);
  
  const usageRows = await sql`
    SELECT COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens
    FROM token_usage_events
    WHERE organization_id = ${user.org}
      AND created_at >= DATE_TRUNC("month", NOW())
      AND created_at < DATE_TRUNC("month", NOW()) + INTERVAL "1 month"
  `;
  
  const totalTokens = Number(usageRows[0].total_tokens);
  const usagePercent = included > 0 ? Math.round((totalTokens / included) * 100) : 0;
  
  return c.json({
    data: {
      includedTokensMonthly: included,
      hardCapTokensMonthly: hardCap,
      usedTokens: totalTokens,
      remainingTokens: Math.max(0, included - totalTokens),
      usagePercent,
      period,
    },
  });
});

// Tenant: get daily breakdown
app.get("/usage/daily", requirePermission("subscription:read"), async (c) => {
  const user = c.get("user");
  const rows = await sql`
    SELECT date, total_input_tokens, total_output_tokens, total_cost_provider, total_cost_customer, story_count, execution_count
    FROM token_usage_daily
    WHERE organization_id = ${user.org}
      AND date >= DATE_TRUNC("month", NOW())
    ORDER BY date DESC
  `;
  return c.json({ data: rows });
});

// Tenant: get budgets
app.get("/budgets", requirePermission("budget:read"), async (c) => {
  const user = c.get("user");
  const rows = await sql`
    SELECT id, scope_type, scope_id, monthly_token_limit, alert_threshold_pct_1, alert_threshold_pct_2, alert_threshold_pct_3, on_limit_reached, created_at, updated_at
    FROM tenant_budgets
    WHERE organization_id = ${user.org}
    ORDER BY scope_type, created_at
  `;
  return c.json({ data: rows });
});

// Admin: list tiers
app.get("/admin/tiers", requireRole("platform_admin"), async (c) => {
  const rows = await sql`
    SELECT id, slug, name, annual_price_usd, monthly_price_usd, included_tokens_monthly,
           overage_rate_per_million, hard_cap_tokens_monthly, max_projects, max_users,
           max_concurrent_agents, grace_period_days, data_retention_days, features, is_active
    FROM subscription_tiers
    WHERE is_active = true
    ORDER BY annual_price_usd
  `;
  return c.json({ data: rows });
});

// Admin: assign subscription to tenant
app.post("/admin/tenants/:orgId/subscription", requireRole("platform_admin"), async (c) => {
  const orgId = c.req.param("orgId");
  const body = await c.req.json();
  const tierRows = await sql`SELECT id FROM subscription_tiers WHERE id = ${body.tierId}`;
  if (tierRows.length === 0) return c.json({ code: "BAD_REQUEST", message: "Invalid tier" }, 400);
  
  const rows = await sql`
    INSERT INTO subscriptions (organization_id, tier_id, status, started_at, expires_at, grace_period_days, billing_cycle, created_at, updated_at)
    VALUES (${orgId}, ${body.tierId}, ${body.status || "active"}, ${body.startedAt || new Date().toISOString()}, ${body.expiresAt}, ${body.gracePeriodDays || 30}, ${body.billingCycle || "annual"}, NOW(), NOW())
    RETURNING id, organization_id, tier_id, status, started_at, expires_at, billing_cycle
  `;
  return c.json({ data: rows[0] }, 201);
});

export default app;
