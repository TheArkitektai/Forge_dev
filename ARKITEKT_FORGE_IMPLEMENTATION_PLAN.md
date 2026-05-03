# Arkitekt Forge: Production Platform Implementation Plan

> Derived from `09 Arkitekt Forge Claude Code Implementation Plan v2.html`
> Strategy: Fresh monorepo. Current UI prototype (`arkitekt-forge-ui-refreshv2.0`) is UI reference only.
> Scope: Full 9-month roadmap (Q1-Q3, 43 sessions, 16 sprints)

---

## 1. Guiding Principles

- **Subscription First**: `@forge/subscription` is built before any agent execution. Every LLM call is metered. Hard caps protect margins.
- **Forge is the product, NEOM is the proof**: All code is generic. Tenant configuration (`tenants/neom/`) customizes the platform.
- **Contract First**: Every module starts with `@forge/contracts` defining its API (OpenAPI + AsyncAPI). All subsequent sessions implement against those contracts. This prevents interface drift.
- **Architecture v12 is canonical**: Nine layers, 22 Kanban states, 18 principles govern all decisions. If a conflict arises between this plan and the v12 document, the v12 document wins.
- **Prototype as UI Reference, Not Codebase**: The `arkitekt-forge-ui-refreshv2.0` prototype validates screen layouts, component patterns, persona flows, and interaction models. The production build reuses its design system (shadcn/ui + Tailwind + Framer Motion) and component naming conventions, but replaces all mocked data with real API integration.

---

## 2. Subscription and Metering Architecture (Day 1 Priority)

> **Why Day 1:** Your financial model budgets LLM inference at 2% of subscription revenue in Year 1, ramping to 3.5% by Year 5. At $8 per million tokens (Year 1 blended rate), that translates to tight but workable token allocations per tier. Without metering enforced at the API boundary from the very first deployment, there is no way to validate that actual LLM costs stay within the 2% budget. This is not a billing convenience. It is margin protection.

### 2.1 The Cost Problem

Every agent execution in Forge calls an LLM provider (Claude, Kimi, or via OpenRouter). Uxbert pays per token. The model mix uses Haiku for classifiers (cheapest), Sonnet for reasoning (mid tier), and Opus for complex architecture (most expensive). Costs vary by model, context length, and execution complexity. A single story averages 150,000 tokens, but a complex architecture story with 5 iteration cycles could consume 750,000 tokens or more.

Without controls, the risk profile is:

| Scenario | Token Impact | Cost at $8/M | Risk |
|----------|-------------|--------------|------|
| Normal story execution | 150,000 | $1.20 | Expected |
| Complex story with 5 iterations | 750,000 | $6.00 | Elevated |
| Agent loop failure, retries until max | 3,750,000 | $30.00 | High |
| Misconfigured tenant: 100 stories/day unthrottled | 15,000,000/day | $120/day | Critical |
| Compromised API key, unlimited agent spawning | Unbounded | Unbounded | Existential |

### 2.2 Subscription Tiers (Aligned to Commercial Strategy v2)

All allocations below are **configurable defaults**. Uxbert can adjust any allocation per tenant, per project, or per team from the admin console.

| Attribute | Forge Team | Forge Enterprise | Partner Edition | Forge Sovereign |
|-----------|-----------|------------------|-----------------|-----------------|
| Base Price | $14,400/yr ($1,200/mo) | $120K to $175K/yr | $110K to $150K/yr | $250K to $400K/yr |
| Billing Cycle | Monthly, billed annually | Annual subscription | Annual platform baseline | Annual subscription |
| Included Tokens/Month | 5,000,000 | 50,000,000 | 40,000,000 | 100,000,000 |
| ~Stories/Month at 150K avg | ~33 | ~333 | ~266 | ~666 |
| Overage Rate (per M tokens) | $12 | $10 | $10 | $9 |
| Hard Cap/Month (configurable) | 10,000,000 | 150,000,000 | 120,000,000 | 500,000,000 |
| Budget Alerts | 80%, 90%, 100% | 80%, 90%, 100% | 80%, 90%, 100% | 80%, 90%, 100% |
| On Hard Cap Reached | Block new executions | Alert admin, continue | Alert admin, continue | Alert admin, continue |
| Max Projects | 3 | 25 | Unlimited (per client) | Unlimited |
| Max Users | 10 | 100 | 50 per client instance | Unlimited |
| Max Concurrent Agents | 2 | 10 | 8 | 20 |
| Workflow Templates | Standard, Lightweight | All 4 + custom | All 4 + custom | All 4 + custom + visual builder |
| Governance Gates | 3 basic | All 10 + Giskard | All 10 + Giskard | All 10 + Giskard + custom |
| Tenant Isolation | Tier 1 (RLS) | Tier 1 or 2 | Tier 1 | Tier 2 or 3 |
| Subscription Expiry | Monthly renewal | Annual with 30 day grace | Annual with 30 day grace | Annual with 60 day grace |
| On Expiry (grace period) | Read only access | Read only access | Read only access | Read only, data export enabled |
| On Expiry (post grace) | Account suspended | Account suspended, data retained 90 days | Account suspended, data retained 90 days | Account suspended, data retained 365 days |

### 2.3 Metering Architecture

The metering system intercepts every LLM call at the Execution Service layer (the abstraction that wraps Claude SDK, Kimi, OpenRouter, or any provider). This is the single choke point where all token consumption flows through.

**Metering Pipeline (6 Steps):**

| Step | What Happens | Where |
|------|-------------|-------|
| 1. Pre-flight Check | Query tenant usage vs allocation. Reject if hard cap exceeded. Emit warning at 80%/90%. | `@forge/subscription` (middleware in `@forge/agents`) |
| 2. Model Selection | Select cheapest model meeting quality threshold. Classifiers to Haiku, reasoning to Sonnet, complex architecture to Opus. | `@forge/agents` (Model Router) |
| 3. Execution | LLM call executes. Input/output tokens counted from provider response. | `@forge/agents` (Execution Service) |
| 4. Metering Event | Publish to Redis Streams: tenant_id, project_id, story_id, agent_execution_id, model_used, input_tokens, output_tokens, cost_at_provider_rate, timestamp. | `@forge/events` |
| 5. Usage Aggregation | BullMQ worker aggregates into PostgreSQL counters. Running totals every 30s. Daily/weekly/monthly rollups. | `@forge/subscription` (BullMQ worker) |
| 6. Budget Enforcement | Alerts at thresholds. Hard cap enforcement. Admin notification via webhook and dashboard. | `@forge/subscription` + `@forge/events` |

### 2.4 Subscription Lifecycle State Machine

| State | Description | Transitions |
|-------|-------------|-------------|
| Trial | Time-limited free access with reduced allocations. No payment method required. | Trial -> Active (on payment), Trial -> Expired (on timeout) |
| Active | Paid subscription. Full tier allocations. Usage metered. | Active -> Grace Period (on expiry), Active -> Upgraded/Downgraded (on tier change) |
| Grace Period | Subscription expired but within grace window (30 or 60 days by tier). Read only access. No new agent executions. Data fully accessible. Export enabled. | Grace -> Active (on renewal), Grace -> Suspended (on grace expiry) |
| Suspended | Past grace period. Account locked. Data retained per tier policy (90 to 365 days). No access except admin contact. | Suspended -> Active (on renewal + payment), Suspended -> Terminated (on retention expiry) |
| Terminated | Data purged after retention window. Tenant record archived. Irreversible. | Terminal state |
| Upgraded | Tier change to higher tier. Immediate allocation increase. Prorated billing. | Instant transition within Active state |
| Downgraded | Tier change to lower tier. Takes effect at next billing cycle. Current allocation maintained until then. | Queued transition at billing cycle boundary |

### 2.5 Cost Attribution Hierarchy

| Level | What It Answers | Configurable Budget? |
|-------|----------------|---------------------|
| Tenant (Organization) | How much is this customer consuming against their subscription allocation? | Yes: hard cap, included allocation, overage rate, alert thresholds. |
| Project | Which project within the tenant is consuming the most? Should this project have its own sub-budget? | Yes: optional project-level budget (subset of tenant allocation). Configurable by tenant admin. |
| Team/User Group | Which team is driving consumption? Is one team consuming disproportionately? | Yes: optional team-level budget. Configurable by project lead. |
| Story/Execution | Which specific story or agent execution consumed how many tokens? What model was used? | Yes: per-execution token ceiling (v12 Context Budget Manager). Default from workflow template, overridable per story. |

### 2.6 Admin Configuration Console

**What Uxbert Admins Can Configure (Platform Level):**

- Tier definitions: name, included tokens, overage rate, hard cap, max projects, max users, max concurrent agents
- Subscription duration and renewal terms per tier
- Grace period duration per tier
- Data retention period per tier after suspension
- LLM provider cost rates (updated when provider pricing changes)
- Model routing rules: which models available per tier, cost/quality thresholds
- Global rate limits: max tokens per minute, max concurrent LLM calls per tenant
- Feature flags: which modules and governance gates are available per tier
- Trial settings: duration, allocation, feature restrictions
- Overage behavior: allow overage (bill later) or block at cap
- Per-tenant overrides: any allocation can be overridden for a specific tenant

**What Tenant Admins Can Configure (Within Their Allocation):**

- Project budgets: allocate portions of tenant token budget to specific projects
- Team budgets: allocate portions of project budget to specific teams
- Per-story execution ceilings: max tokens per agent execution
- Alert recipients: who gets notified at each threshold (email, webhook, dashboard)
- Model preferences: prefer cheaper models for certain story types
- Auto-scaling rules: automatically request tier upgrade when approaching limits (Enterprise/Sovereign)

### 2.7 Database Schema for Subscription

```sql
-- Core subscription tables
subscriptions (
  id, tenant_id, tier_id, status, started_at, expires_at,
  grace_period_days, billing_cycle, payment_method_id,
  created_at, updated_at
)

subscription_tiers (
  id, name, slug, annual_price_usd, monthly_price_usd,
  included_tokens_monthly, overage_rate_per_million,
  hard_cap_tokens_monthly, max_projects, max_users,
  max_concurrent_agents, grace_period_days,
  data_retention_days, features_json, is_active,
  created_at, updated_at
)

-- Metering tables
token_usage_events (
  id, tenant_id, project_id, story_id, agent_execution_id,
  model_provider, model_name, input_tokens, output_tokens,
  cost_at_provider_rate, cost_at_customer_rate,
  created_at
) PARTITION BY RANGE (created_at)  -- monthly partitions for performance

token_usage_daily (
  tenant_id, project_id, date, total_input_tokens,
  total_output_tokens, total_cost_provider, total_cost_customer,
  story_count, execution_count
)

token_usage_monthly (
  tenant_id, project_id, month, total_input_tokens,
  total_output_tokens, total_cost_provider, total_cost_customer,
  included_allocation, overage_tokens, overage_cost
)

-- Budget configuration
tenant_budgets (
  id, tenant_id, scope_type, scope_id, -- scope: tenant, project, team
  monthly_token_limit, alert_threshold_pct_1,
  alert_threshold_pct_2, alert_threshold_pct_3,
  on_limit_reached, -- block, alert_continue, auto_upgrade
  created_at, updated_at
)

-- Subscription events (audit trail)
subscription_events (
  id, tenant_id, subscription_id, event_type,
  -- types: created, activated, renewed, upgraded, downgraded,
  --        grace_entered, suspended, terminated, payment_received,
  --        payment_failed, allocation_changed, overage_triggered
  details_json, created_at
)
```

### 2.8 API Endpoints for Subscription

```
-- Subscription Management (Uxbert Admin)
POST   /api/v1/admin/tiers                    -- create/update tier definitions
GET    /api/v1/admin/tiers                    -- list all tiers
PUT    /api/v1/admin/tiers/:id               -- update tier
POST   /api/v1/admin/tenants/:id/subscription -- assign/change subscription
POST   /api/v1/admin/tenants/:id/override    -- per-tenant allocation override

-- Subscription Management (Tenant)
GET    /api/v1/subscription                   -- current subscription status
GET    /api/v1/subscription/usage             -- current period usage summary
GET    /api/v1/subscription/usage/daily       -- daily breakdown
GET    /api/v1/subscription/usage/projects    -- usage by project
GET    /api/v1/subscription/usage/teams       -- usage by team
GET    /api/v1/subscription/invoices          -- billing history

-- Budget Configuration (Tenant Admin)
GET    /api/v1/budgets                        -- all budgets for tenant
POST   /api/v1/budgets                        -- create project/team budget
PUT    /api/v1/budgets/:id                    -- update budget
GET    /api/v1/budgets/:id/usage              -- usage against budget

-- Metering (Internal, not exposed to customers directly)
POST   /api/v1/internal/meter                 -- record token consumption
GET    /api/v1/internal/meter/check           -- pre-flight budget check
POST   /api/v1/internal/meter/aggregate       -- trigger aggregation
```

### 2.9 Stripe Integration (or Alternative)

For automated billing, Stripe is the recommended payment processor. The integration handles:
- Subscription creation and management via Stripe Billing
- Automatic invoice generation
- Payment method management (card, bank transfer for Enterprise/Sovereign)
- Overage billing as metered usage items on the Stripe subscription
- Webhook handling for payment success/failure/dispute events
- Prorated upgrades and downgrades
- Tax calculation via Stripe Tax

For Saudi government accounts where Stripe may not apply, the system supports **manual invoicing mode** where usage is tracked but billing is handled offline through procurement processes.

---

## 3. Existing Assets Inventory

| Asset | Status | Reuse Strategy |
|-------|--------|---------------|
| UI Prototype v2.0 | Complete | Reuse design system, 8 screen layouts, 50+ components. Replace mocked data with real API integration. |
| Architecture v12 | Complete | Canonical reference. Nine layers, twenty two states, eighteen principles. |
| NEOM Implementation Plan v2 | Complete | Eleven gaps map to eleven Forge product features. Dual track approach. |
| Commercial Strategy v2 | Complete | Four tiers, three sales motions, partner economics. Drives subscription tier definitions. |
| Financial Model v2 | Complete | LLM at 2% of subscription, $8/M tokens, 150K/story. Drives metering thresholds. |
| Pricing Summary v2 | Complete | $14.4K to $400K tier pricing. Drives subscription configuration defaults. |

---

## 4. Repository Structure

```
arkitekt-forge/
├── packages/forge/
│   ├── contracts/           # @forge/contracts: shared types, OpenAPI, AsyncAPI
│   ├── subscription/        # @forge/subscription: tiers, metering, billing (DAY 1)
│   │   ├── src/tiers/       # tier definitions, feature gating
│   │   ├── src/metering/    # token counting, aggregation, pre-flight
│   │   ├── src/billing/     # Stripe integration, invoicing, payment
│   │   ├── src/budgets/     # project/team budget allocation
│   │   ├── src/lifecycle/   # subscription state machine, expiry, grace
│   │   ├── src/middleware/  # API middleware for tier enforcement
│   │   └── CLAUDE.md
│   ├── db/                  # @forge/db: PostgreSQL schema, migrations, RLS
│   ├── api/                 # @forge/api: Hono server, middleware, routes
│   ├── events/              # @forge/events: Redis Streams, pub/sub
│   ├── workflow/            # @forge/workflow: state machine, BullMQ, gates
│   ├── governance/          # @forge/governance: proof chain, gates, audit
│   ├── agents/              # @forge/agents: Claude Agent SDK, orchestrator
│   ├── context-hub/         # @forge/context-hub: pgvector, memory
│   ├── sandbox/             # @forge/sandbox: OpenSandbox, code execution
│   ├── dashboard/           # @forge/dashboard: React frontend (rebuild from prototype)
│   ├── connector-framework/ # @forge/connector-framework: plugin SDK
│   ├── data-catalog/        # @forge/data-catalog: metadata, lineage
│   ├── compliance/          # @forge/compliance: regulatory mapping
│   ├── data-product-framework/
│   ├── master-data/
│   ├── bi-connector/
│   ├── protocol-adapter/
│   ├── mft/
│   ├── analytics-transform/
│   ├── module-registry/
│   ├── tenant-manager/
│   └── sdk/                 # TypeScript + Python SDKs
├── tenants/neom/            # Configuration only, zero code
├── infra/                   # Docker, K8s, Terraform, CI/CD
└── .github/workflows/
```

---

## 5. Claude Code Session Protocol

| Type | Duration | Context | Output |
|------|----------|---------|--------|
| Build | 1-2 days | `@forge/contracts` + target module | Working module with tests and CLAUDE.md |
| Billing | 1-2 days | `@forge/subscription` + financial model | Metering, billing, tier enforcement |
| Config | 2-4 hours | Module + tenant config | NEOM configuration files |
| Infra | Half day | Docker, K8s, CI/CD | Infrastructure as code |
| Test | Half day | Multiple modules | Integration test results |

---

## 6. Build Dependency Chain

```
contracts -> db -> events -> subscription -> api -> workflow -> governance -> agents -> dashboard -> context-hub -> connector-framework -> tenant-manager -> module-registry
```

**Critical**: `subscription` is inserted between `events` and `api`. API middleware enforces tier limits on every request. Agent execution queries subscription status before every LLM call.

---

## 7. Quarterly Roadmap

### Quarter 1: Foundation and MVP (Months 1-3)

**Sprint 1 (Weeks 1-2): Contracts, Database, Events, Subscription**

| Session | Type | Module | Focus |
|---------|------|--------|-------|
| 01 | Build | `@forge/contracts` | Monorepo bootstrap (pnpm workspaces, TS strict, ESLint, Prettier). Shared types: Organization, Project, Story, User, Role, Permission, State Machine, Agent, Governance, Subscription. OpenAPI 3.1 + AsyncAPI v3 specs. |
| 02 | Infra | `infra/` | Docker Compose: PostgreSQL 15 + pgvector, Redis 7, MinIO, Vault dev mode. GitHub repo with branch protection, CI pipeline (lint, type check, test). Seed scripts for dev data. Root CLAUDE.md. |
| 03 | Build | `@forge/db` | Core tables, state machine tables, governance tables, context tables. Subscription tables: `subscription_tiers`, `subscriptions`, `subscription_events`. Metering tables: `token_usage_events` (partitioned by month), `token_usage_daily`, `token_usage_monthly`. Budget tables: `tenant_budgets`. RLS on all tenant-scoped tables. Seed 4 default tiers. |
| 04 | Build | `@forge/events` | Redis Streams publisher with typed events. Subscriber framework with consumer groups and dead letter queue. Metering event types: `token_consumed`, `budget_alert`, `budget_exceeded`, `subscription_changed`. Tenant-aware event routing. |
| 05 | Billing | `@forge/subscription` | **DAY 1 CRITICAL**: Tier CRUD, subscription lifecycle FSM (Trial/Active/Grace/Suspended/Terminated/Upgraded/Downgraded), automated expiry detection via BullMQ, grace period enforcement, read-only mode, account suspension, data retention timer. Pre-flight budget check (<5ms). Token usage event recording. Usage aggregation worker (30s intervals). Daily/monthly rollups. Tenant/project/team budget allocation. Feature gating. Cost tracking. Overage handling. Stripe integration. Manual invoicing mode. Admin overrides. Emergency kill switch. All API endpoints from Section 2.8. Dashboard widget data. |

**Sprint 2 (Weeks 3-4): API Server, Workflow, Basic Governance**

| Session | Type | Module | Focus |
|---------|------|--------|-------|
| 06 | Build | `@forge/api` | Hono server with TypeScript strict mode. JWT authentication, RBAC middleware, rate limiting, request validation. **Subscription enforcement middleware** (checks tenant status on every request). **Feature gate middleware**. **Usage tracking middleware**. CRUD routes for organizations, projects, users, stories. Subscription and billing routes mounted. Health check, readiness, OpenAPI spec generation. |
| 07 | Build | `@forge/workflow` | 22-state Kanban state machine with transition validation. BullMQ job queue with priority queues and exponential backoff. Gate executor framework, approval gate types. Default templates: Standard SDLC and Lightweight Agile. **Workflow template availability gated by subscription tier.** |
| 08 | Build | `@forge/governance` | Proof chain (hash chain audit trail), immutable. 3 initial blocking gates: PII scan, code quality, test coverage. **Gate availability gated by subscription tier (Team gets 3, Enterprise/Sovereign gets all 10).** |

**Sprint 3 (Weeks 5-8): Agents, Connectors, Dashboard, NEOM Config**

| Session | Type | Module | Focus |
|---------|------|--------|-------|
| 09 | Build | `@forge/agents` | Claude Agent SDK integration, orchestrator, 6 core tools. Model router (Haiku/Sonnet/Opus selection by task type). **Pre-flight metering check before every LLM call.** **Post-execution metering event emission.** **Token budget management per execution (v12 Context Budget Manager).** **Max concurrent agents enforcement per subscription tier.** Execution logging with full cost attribution. |
| 10 | Build | `@forge/connector-framework` | Generic connector plugin SDK, manifests, lifecycle, auth. Bidirectional action framework, rate limiting, health monitoring. GitHub connector as reference implementation. |
| 11 | Build | `@forge/dashboard` | Rebuild from prototype patterns: real API integration, WebSocket for real-time updates, JWT auth flow, persona system with RBAC. **Subscription dashboard widget**: usage gauge, cost to date, stories executed, budget alert banner, days until renewal. **Admin settings**: tier display, budget configuration UI, usage breakdown. **Usage analytics**: daily/weekly/monthly charts, per-project breakdown, model mix visualization, cost trend. **Subscription status indicator** in header. |
| 12 | Config | `tenants/neom/` | TOS and FASAH adapter plugins. NEOM tenant configuration (entity schemas, RBAC roles). **NEOM subscription assignment: Forge Sovereign tier with custom allocation override.** Integration test: TOS data through pipeline. |

**Sprint 4 (Weeks 9-12): Data Catalog, Compliance, Integration, Testing**

| Session | Type | Module | Focus |
|---------|------|--------|-------|
| 13 | Build | `@forge/data-catalog` | Generic metadata catalog, lineage, classification, stewardship. Gated by tier (full catalog Enterprise+ only). |
| 14 | Build | `@forge/compliance` | Regulatory mapping, evidence packs (PDF, JSON, CSV), scheduled exports. Gated by tier. |
| 15 | Config | `tenants/neom/` | NDMO/NCA compliance config, business glossary, 3 OT sources streaming. **Validate metering captures all NEOM agent token consumption accurately.** |
| 16 | Billing/Test | `@forge/subscription` | End-to-end subscription lifecycle: create tenant, assign tier, execute stories, verify metering. Budget enforcement: verify hard cap blocks execution for Team tier. Overage calculation. Expiry flow: grace period, read-only mode, suspension, data retention. Tier upgrade/downgrade: prorated allocation changes. Multi-tenant isolation. Stripe webhook simulation. **Stress test: simulate 100 concurrent agent executions, verify metering accuracy within 0.1%.** |

### Quarter 2: Intelligence and Governance (Months 4-6)

**Sprint 5-6 (Weeks 13-16): Full Agent System, Context Hub, Sandbox**

| Session | Type | Module | Focus |
|---------|------|--------|-------|
| 17 | Build | `@forge/agents` (full) | Parallel subagents, 8-step context compilation, context budget management. **Every subagent's token consumption metered and attributed to parent story/project/tenant.** |
| 18 | Build | `@forge/context-hub` | pgvector embeddings, project memory, code index, vector search, memory compaction. **Embedding generation token costs metered separately (classified as "platform overhead").** |
| 19 | Build | `@forge/sandbox` | OpenSandbox, multi-language, CI feedback loop, v12 code execution loop. **Sandbox compute metered separately from LLM tokens (counted against a separate "compute budget" configurable per tier).** |
| 20 | Build | `@forge/governance` (full) | All 10 blocking gates, Giskard advisory signals, governance dashboard. **Giskard scan costs (~$0.40/scan) metered as platform overhead, not customer token allocation.** |

**Sprint 7-8 (Weeks 17-20): NEOM Gap Modules, Phase 2 Config**

| Session | Type | Module | Focus |
|---------|------|--------|-------|
| 21 | Build | `@forge/data-product-framework` | Generic data product builder (NEOM gap G03). |
| 22 | Build | `@forge/master-data` | Port/entity master data management (NEOM gap G02). |
| 23 | Build | `@forge/bi-connector` | Power BI / Tableau connector (NEOM gap G01). |
| 24 | Build | `@forge/protocol-adapter` + `@forge/mft` | EDI/EDIFACT protocol adapter, managed file transfer (NEOM gaps G05, G06). |
| 25 | Build | `@forge/analytics-transform` | OLAP cube builder (NEOM gap G09). |
| 26 | Config | `tenants/neom/` | 8 data products, 7 OT connectors, Power BI config, EDI/EDIFACT, ZATCA, MFT schedules. |
| 27 | Billing | `@forge/subscription` | Usage analytics dashboard with charts, cost forecasting, model mix analysis. Automated alerts (email/webhook) at thresholds. Expiry reminders (30, 14, 7, 3, 1 days). Self-service tier change. Usage export (CSV/JSON). Cost comparison across tiers. Partner billing: per-client usage tracking, revenue share calculation, partner dashboard. |
| 28 | Test | All | Q2 integration + NEOM Phase 2 validation. Full PDAS + PIS operational. All governance gates. Metering accuracy. Subscription tier enforcement across all modules. |

### Quarter 3: Enterprise and Scale (Months 7-9)

**Sprint 9-10 (Weeks 21-24): Multi-Tenancy, Advanced Workflow, Kafka**

| Session | Type | Module | Focus |
|---------|------|--------|-------|
| 29 | Build | `@forge/tenant-manager` | Tier 1-2 multi-tenancy. **Tenant manager integrates with subscription: provisioning a tenant automatically creates a subscription record. Tenant isolation tier determined by subscription tier.** |
| 30 | Build | `@forge/workflow` (full) | Advanced workflow templates, visual builder (Sovereign tier). |
| 31 | Build | `@forge/events` (full) | Kafka event backbone upgrade for production durability. |
| 32 | Config | `tenants/neom/` | NEOM production migration, Tier 2 isolation. |

**Sprint 11-12 (Weeks 25-28): Module Registry, White Label, SDKs**

| Session | Type | Module | Focus |
|---------|------|--------|-------|
| 33 | Build | `@forge/module-registry` | Module marketplace (module installation gated by tier). |
| 34 | Build | Dashboard + Tenant | White label branding engine. |
| 35 | Build | `@forge/tenant-manager` (full) | Tier 3 dedicated infrastructure isolation. |
| 36 | Build | `@forge/sdk` | TypeScript and Python SDK generation from OpenAPI. |

**Sprint 13-14 (Weeks 29-32): IDE, Dashboard Completion**

| Session | Type | Module | Focus |
|---------|------|--------|-------|
| 37 | Build | VS Code Extension | IDE integration: context injection, gate approval, inline governance, memory sidebar. |
| 38 | Build | `@forge/dashboard` (full) | Billing admin portal, invoice history, payment method management, subscription comparison tool. |

**Sprint 15-16 (Weeks 33-36): Production, GA**

| Session | Type | Module | Focus |
|---------|------|--------|-------|
| 39 | Infra | `infra/` | Production K8s Helm charts, autoscaling, DR (<5min RPO). |
| 40 | Infra | `infra/` | Observability: monitoring dashboards with **revenue metrics** (MRR, ARR, token cost margin, overage revenue, churn risk). |
| 41 | Billing | `@forge/subscription` | Revenue recognition (MRR/ARR calculation). Churn detection (declining usage, approaching expiry, payment failures). Usage-based pricing validation at scale. Complete audit trail of every subscription change. Financial reporting dashboard for Uxbert finance team. Rate card updates without code deployment. |
| 42 | Test | All | Security hardening: penetration testing, RLS isolation validation, load testing, DR drill. **Subscription abuse scenarios: token flooding, API key sharing, tier spoofing.** |
| 43 | Test | All | GA readiness validation. |

---

## 8. Session Summary

| Quarter | Build | Config | Test | Infra | Billing | Total |
|---------|-------|--------|------|-------|---------|-------|
| Q1 | 11 | 2 | 0 | 1 | 2 | 16 |
| Q2 | 9 | 1 | 1 | 0 | 1 | 12 |
| Q3 | 9 | 1 | 2 | 2 | 1 | 15 |
| **Total** | **29** | **4** | **3** | **3** | **4** | **43** |

Plus 7 contingency sessions = **~50 sessions total**.

---

## 9. NEOM Validation Overlay

| Gap | NEOM Need | Forge Module | Build Session | Config Session | Priority |
|-----|-----------|-------------|---------------|----------------|----------|
| G04 | FASAH/ZATCA | `@forge/connector-framework` | 10 | 12 | P0 |
| G01 | Power BI | `@forge/bi-connector` | 23 | 26 | P1 |
| G02 | Port master data | `@forge/master-data` | 22 | 26 | P1 |
| G03 | 8 data products | `@forge/data-product-framework` | 21 | 26 | P1 |
| G05 | EDI/EDIFACT | `@forge/protocol-adapter` | 24 | 26 | P1 |
| G06 | Managed File Transfer | `@forge/mft` | 24 | 26 | P1 |
| G07 | Durable events | `@forge/events` (Kafka) | 31 | 32 | P2 |
| G08 | Canonical model | `@forge/data-catalog` | 13 | 15 | P1 |
| G09 | OLAP cubes | `@forge/analytics-transform` | 25 | 26 | P2 |
| G10 | NDMO/NCA compliance | `@forge/compliance` | 14 | 15 | P1 |
| G11 | OT connectors | `@forge/connector-framework` | 10 | 12, 26 | P1 |

---

## 10. Testing Strategy

| Level | Tool | Coverage | Runs When |
|-------|------|----------|-----------|
| Unit Tests | Vitest | 80% per module | Every commit |
| Integration Tests | Vitest + Testcontainers | Critical paths | Every PR |
| API Contract Tests | OpenAPI validator | 100% endpoints | Every PR |
| Metering Accuracy | Custom suite | 0.1% variance max | Every subscription PR |
| E2E Tests | Playwright | Core journeys | Sprint boundaries |
| Load Tests | k6 | SLO targets | Quarterly |
| Security Tests | CodeQL | Zero critical | Every PR |

---

## 11. Deployment and DR

| Component | Technology |
|-----------|-----------|
| API Server | Hono on Node.js, TypeScript 5.6+ |
| Frontend | React 19 + Tailwind 4 + shadcn/ui |
| Database | PostgreSQL 15 + pgvector |
| Cache/Events (dev) | Redis 7 |
| Cache/Events (prod) | Kafka |
| Object Storage | MinIO (dev), GCS (prod) |
| Secrets | HashiCorp Vault |
| Agent Runtime | Claude Agent SDK |
| Job Queue | BullMQ |
| LLM Access | OpenRouter + Anthropic API |
| Payments | Stripe Billing (SaaS/Enterprise), manual invoicing (Government) |
| Container Orchestration | Kubernetes (GKE, GCP me-central2 Dammam) |

| Metric | Target |
|--------|--------|
| RPO | < 5 minutes |
| Platform RTO | < 30 minutes |
| DB Failover | < 15 minutes |
| Metering Data Loss | Zero (Redis AOF + PostgreSQL WAL) |

---

## 12. Risk Register

| Risk | Severity | Mitigation |
|------|----------|------------|
| LLM Cost Overrun | Critical | Pre-flight metering on every call. Hard caps. Emergency kill switch. Model router prefers cheapest viable model. Provider cost rate configurable without code deploy. |
| Metering Inaccuracy | High | Meter at Execution Service choke point. Reconciliation job compares Redis event stream totals against PostgreSQL aggregates. Alert on >0.1% variance. Monthly provider invoice reconciliation. |
| Subscription Bypass | High | Subscription check is mandatory API middleware. No execution path bypasses metering. API key rotation on subscription status change. |
| Solo Founder Bottleneck | Medium | Claude Code for all implementation. CLAUDE.md per module for future team onboarding. |
| Context Window Limits | Medium | Strict session scoping. CLAUDE.md summaries instead of full source. |
| NEOM Timeline | Medium | Product first: NEOM config waits for stable modules. |
| Provider Price Changes | Medium | LLM cost rates stored as config, not code. Tier allocations adjustable via admin console. Overage rates provide margin buffer. |

---

## 13. Complete Session Index

| # | Session | Type | Module | Sprint | Week |
|---|---------|------|--------|--------|------|
| 01 | Repository Bootstrap and Contracts | Build | `@forge/contracts` | 1 | 1-2 |
| 02 | Development Infrastructure | Infra | `infra/` | 1 | 1-2 |
| 03 | Database Schema (incl. subscription tables) | Build | `@forge/db` | 1 | 1-2 |
| 04 | Event Bus | Build | `@forge/events` | 1 | 1-2 |
| 05 | **Subscription and Metering Engine** | **Billing** | **`@forge/subscription`** | **1** | **1-2** |
| 06 | API Server (with subscription middleware) | Build | `@forge/api` | 2 | 3-4 |
| 07 | Workflow Engine and State Machine | Build | `@forge/workflow` | 2 | 3-4 |
| 08 | Basic Governance and Proof Chain | Build | `@forge/governance` | 2 | 3-4 |
| 09 | Agent Orchestration (with metering) | Build | `@forge/agents` | 3 | 5-8 |
| 10 | Connector Framework | Build | `@forge/connector-framework` | 3 | 5-8 |
| 11 | Dashboard (with subscription UI) | Build | `@forge/dashboard` | 3 | 5-8 |
| 12 | NEOM Connector Plugins + Config | Config | `tenants/neom/` | 3 | 5-8 |
| 13 | Data Catalog Engine | Build | `@forge/data-catalog` | 4 | 9-12 |
| 14 | Compliance Module | Build | `@forge/compliance` | 4 | 9-12 |
| 15 | NEOM Phase 1 Validation | Config | `tenants/neom/` | 4 | 9-12 |
| 16 | **Subscription Integration Testing** | **Billing** | **`@forge/subscription`** | **4** | **12** |
| 17 | Full Agent Orchestration | Build | `@forge/agents` (full) | 5 | 13-16 |
| 18 | Context Hub | Build | `@forge/context-hub` | 5 | 13-16 |
| 19 | Sandbox Execution Engine | Build | `@forge/sandbox` | 5 | 13-16 |
| 20 | Full Governance Pipeline | Build | `@forge/governance` (full) | 6 | 13-16 |
| 21 | Data Product Framework | Build | `@forge/data-product-framework` | 7 | 17-20 |
| 22 | Master Data Module | Build | `@forge/master-data` | 7 | 17-20 |
| 23 | BI Connector | Build | `@forge/bi-connector` | 7 | 17-20 |
| 24 | Protocol Adapter and MFT | Build | `@forge/protocol-adapter` + `@forge/mft` | 7 | 17-20 |
| 25 | Analytics Transform | Build | `@forge/analytics-transform` | 8 | 17-20 |
| 26 | NEOM Phase 2 Configuration | Config | `tenants/neom/` | 8 | 17-20 |
| 27 | **Subscription Advanced Features** | **Billing** | **`@forge/subscription`** | **8** | **17-20** |
| 28 | Q2 Integration + NEOM Phase 2 | Test | All | 8 | 20 |
| 29 | Tenant Manager (Tier 1 and 2) | Build | `@forge/tenant-manager` | 9 | 21-24 |
| 30 | Advanced Workflow Templates | Build | `@forge/workflow` (full) | 9 | 21-24 |
| 31 | Event Backbone (Kafka) | Build | `@forge/events` (full) | 9 | 21-24 |
| 32 | NEOM Production Migration | Config | `tenants/neom/` | 10 | 21-24 |
| 33 | Module Registry | Build | `@forge/module-registry` | 11 | 25-28 |
| 34 | White Label Engine | Build | Dashboard + Tenant | 11 | 25-28 |
| 35 | Tenant Manager (Tier 3) | Build | `@forge/tenant-manager` (full) | 11 | 25-28 |
| 36 | SDK Generation | Build | `@forge/sdk` | 12 | 25-28 |
| 37 | IDE Integration | Build | VS Code extension | 13 | 29-32 |
| 38 | Dashboard Full Completion | Build | `@forge/dashboard` (full) | 13 | 29-32 |
| 39 | Production K8s and DR | Infra | `infra/` | 15 | 33-36 |
| 40 | Observability and Monitoring | Infra | `infra/` | 15 | 33-36 |
| 41 | **Subscription Production Hardening** | **Billing** | **`@forge/subscription`** | **15** | **33-36** |
| 42 | Security Hardening | Test | All | 16 | 33-36 |
| 43 | GA Readiness Validation | Test | All | 16 | 36 |

---

## 14. Immediate Next Steps (Post-Approval)

1. **Session 01**: Initialize `arkitekt-forge` monorepo with pnpm workspaces, TypeScript strict mode, ESLint, Prettier
2. **Session 02**: Set up Docker Compose development environment
3. **Session 03**: Design and implement PostgreSQL schema including all subscription/metering tables
4. **Session 04**: Build Redis Streams event bus with typed consumers
5. **Session 05**: Build `@forge/subscription` — the Day 1 critical path module

---

*"Agents propose. Humans approve. Meters track. Always."*
