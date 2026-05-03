# @forge/db

PostgreSQL 15 client, schema migrations, and Row Level Security for Arkitekt Forge.

**Session 03 — Build**

## Schema Overview

26 tables across 9 categories, all with RLS enabled on tenant-scoped tables.

| Category | Tables |
|----------|--------|
| Core | `organizations`, `users`, `projects`, `stories`, `roles` |
| Workflow | `state_transitions` |
| Governance | `gates`, `gate_results`, `approval_records`, `proof_chain_entries`, `audit_events`, `evidence_packs` |
| Agents | `agent_executions`, `memory_nodes` |
| Billing | `subscriptions`, `subscription_tiers`, `subscription_events`, `billing_invoices` |
| Metering | `token_usage_events` (partitioned monthly), `token_usage_daily`, `token_usage_monthly` |
| Budgets | `tenant_budgets` |
| Data Catalog | `data_catalog_assets` |
| Compliance | `compliance_reports` |
| API Tracking | `api_usage_events` |

## Migrations

| File | Description |
|------|-------------|
| `001_schema.sql` | All core tables, metering tables, RLS policies |
| `002_seed.sql` | 4 default subscription tiers, default roles |
| `003_rls.sql` | Row Level Security policies for tenant isolation |
| `004_additional_tables.sql` | `api_usage_events`, `compliance_reports`, `data_catalog_assets` |
| `005_fix_budget_columns.sql` | Rename `alert_threshold_pct1` → `alert_threshold_pct_1` |

## Key Design Decisions

- `token_usage_events` is partitioned by month (`PARTITION BY RANGE (created_at)`) for query performance at scale
- All tenant-scoped tables have RLS policies enforcing `organization_id` isolation
- `proof_chain_entries` uses SHA-256 hash chain — entries are immutable after creation
- 4 default subscription tiers are seeded in `002_seed.sql` matching the commercial tier definitions

## Usage

```typescript
import { sql } from '@forge/db';

const rows = await sql`SELECT * FROM organizations WHERE id = ${orgId}`;
```
