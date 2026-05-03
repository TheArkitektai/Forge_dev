# Arkitekt Forge — Session Context Reference

**Created:** 2026-04-27  
**Architecture Version:** v12  
**Plan:** ARKITEKT_FORGE_IMPLEMENTATION_PLAN.md (43 primary + 7 contingency sessions)  
**Git Commit:** 8930b3e (Sessions 01-05 complete)  

---

## 1. Architecture v12 to Package Mapping

| Layer | Name | Package | Status |
|-------|------|---------|--------|
| L1 | Customer Interaction | `@forge/web` (React UI) | Existing — to integrate |
| L2 | API & Integration | `@forge/api` (Hono server) | Session 06 |
| L3 | Intelligence & Orchestration | `@forge/agent` (Claude SDK wrapper) | Session 12-14 |
| L4 | Process & Governance | `@forge/governance` (State machine, gates) | Session 08 |
| L5 | Data & Context | `@forge/db`, `@forge/context` | DB done, Context Hub Session 16 |
| L6 | Infrastructure & Runtime | Docker Compose, K8s configs | Session 02 done, Infra sprint later |
| L7 | Workflow Engine | `@forge/workflow` | Session 07 |
| L8 | Module System | `@forge/modules` | Session 18-20 |
| L9 | Code Execution Loop | `@forge/execution` | Session 15 |

### Supporting Packages (Built)
| Package | Description | Depends On |
|---------|-------------|------------|
| `@forge/contracts` | Shared TypeScript types | — |
| `@forge/db` | PostgreSQL schema, migrations, RLS | contracts |
| `@forge/events` | Redis Streams event bus | contracts |
| `@forge/subscription` | Tiers, metering, budgets, lifecycle | contracts, db, events |

---

## 2. Current Build State (Sessions 01-05 Complete)

### `@forge/contracts`
- All shared types exported from `src/index.ts`
- Key interfaces: Organization, Project, Story, User, Role, AgentExecution, TokenUsageEvent, SubscriptionTier, Subscription, TenantBudget, BillingInvoice, MeteringCheckResult
- Enums: SubscriptionStatus (trial, active, grace_period, suspended, terminated, upgraded, downgraded)

### `@forge/db`
- **23 tables** in `001_schema.sql`:
  - Core: organizations, users, projects, stories, agent_executions
  - Governance: gates, proof_chain_entries, audit_events, memory_nodes (pgvector)
  - Billing: subscriptions, subscription_tiers, subscription_events
  - Metering: token_usage_events (partitioned by created_at range), token_usage_daily, token_usage_monthly
  - Budgets: tenant_budgets, billing_invoices
  - Workflow: workflow_definitions, workflow_instances
  - Modules: module_registry
- **Seed data** (`002_seed.sql`): 4 tiers (Forge Team, Enterprise, Partner, Sovereign), test org, test project, test story, test user
- **RLS** (`003_rls.sql`): Row Level Security on all tenant-scoped tables

### `@forge/events`
- EventBus class with publish() / subscribe()
- Consumer groups with dead letter queue
- Tenant-aware routing via Redis Streams
- Metering events: token_consumed, budget_alert, budget_exceeded, subscription_changed

### `@forge/subscription`
- tiers.ts: Default tier definitions matching Commercial Strategy v2
- metering.ts: Pre-flight checkBudget() (<5ms), recordTokenUsage(), aggregateUsage() BullMQ worker
- lifecycle.ts: Subscription FSM (Trial -> Active -> Grace -> Suspended -> Terminated + Upgraded/Downgraded)
- budgets.ts: BudgetManager with tenant/project/team allocation

---

## 3. Architecture v12 Key Details

### 22 Kanban States (6 Phases)
```
Phase 1 PLAN:       Pending -> Brief -> Ready Design
Phase 2 DESIGN:     Designing -> Design Review -> Ready Dev
Phase 3 DEVELOP:    Coding -> Testing -> Code Review -> Revisions -> Ready CI
Phase 4 TEST/BUILD: CI Running -> CI Pass | CI Fail
Phase 5 SHIP:       Shipped -> Released -> Done
Phase 6 OPERATE:    Monitoring -> Incident Detected -> Investigating -> Remediating -> Resolved
Special:            Blocked (from any), Cancelled
```

### 18 Principles
1. Supervised Autonomous Execution (v12 update)
2. Human Governance at Every Gate
3. Immutable Audit Trail
4. Least Privilege for Agents
5. Complete Context Compilation
6. Transparent Decision Making
7. LLM Provider Abstraction
8. API-First Design
9. Proof Chain Verification
10. Governance Blocking Gates (10 mandatory + 3 advisory)
11. Single Source of Truth (PostgreSQL)
12. Observability by Default
13. Infrastructure Abstraction
14. Cloud Native, Cloud Agnostic
15. Tenant Isolation Scales with Sensitivity
16. Configurable Workflow, Not Hardcoded Process
17. Supervised Autonomous Execution (detailed)
18. Context Budget Awareness

### 9 Agent Tools
read_file, write_file, context_graph_query, sandbox_exec, get_secret, log_metric, execute_code (v12), connector_action (v12), explain_reasoning (v12)

### Default Workflow Templates
- Standard SDLC (6 phases, 22 states, full gates)
- Lightweight Agile (3 phases, 9 states, essential gates)
- Enterprise Governed (7 phases, 24 states, dual approval)
- Compliance Heavy (8 phases, 30 states, triple approval)
- AI Accelerated (6 phases, 22 states, supervised execution + explainability)

### Multi-Tenancy Tiers
- Tier 1 Logical: RLS in PostgreSQL, keyspace prefix in Redis, path partition in S3
- Tier 2 Database: Dedicated DB instance, dedicated Redis, dedicated S3 bucket
- Tier 3 Full Infra: Dedicated clusters, VPC/VNet

---

## 4. Existing UI (arkitekt-forge-ui-refresh)

**Server Location:** /var/www/arkitekt-forge (PM2 app, port 3000)  
**Local Source:** client/src/ (in working directory)  
**Stack:** Vite + React 19 + TypeScript 5.6 + Tailwind CSS v4 + Radix UI primitives + wouter + Express static server  
**Nginx:** forge.thearkitekt.ai -> 127.0.0.1:3000 with basic auth + SSL  

### UI Screens (8)
| Screen | Route | Description |
|--------|-------|-------------|
| Portfolio | /portfolio | Project cards, story kanban, KPIs |
| Command Center | /command | Agent panel, notifications, metrics |
| Delivery Flow | /delivery | Phase tracker, approval gates, CI status |
| Context Hub | /context | Memory events, patterns, search |
| Architecture | /architecture | Design artifacts, diagram viewer, API specs |
| Governance | /governance | Controls, audit trail, policy rules |
| Config Studio | /config | Connectors, workflow builder, personas |
| Output | /output | Artifact viewer, previews, evidence export |

### UI Type System (client/src/forge/types.ts)
Core types: Story, Project, Tenant, Connector, DesignArtifact, CodeExecutionRun, ExplainabilityReport, OperateEvent, AuditEvent, PolicyRule, PersonaPreset

### UI Components (20+)
AIAgentPanel, ApiSpecViewer, ApprovalActionDialog, AuditTrailPanel, ConnectorSetupWizard, ContextBudgetGauge, DeliveryModeSwitcher, DemoAppPreview, DesignArtifactCard, DesignArtifactModal, ExecutionLoopPanel, ExplainabilityModal, GitHubPanel, IDEStatusBar, PersonaBuilderDialog, ProductionRightRail, ProductionStoryCard, ProjectCreateWizard, ServiceHealthSparkline, StoryCreateDialog, StoryDetailDrawer, StoryTransitionDialog, TestReportViewer

---

## 5. Session Roadmap (Pending)

| Session | Topic | Package | Key Deliverables |
|---------|-------|---------|------------------|
| 06 | API Server | @forge/api | Hono, JWT auth, RBAC middleware, subscription gates |
| 07 | Workflow Engine | @forge/workflow | Parameterised FSM, transition validator, gate executor |
| 08 | Basic Governance | @forge/governance | Proof chain, 3 blocking gates, audit trail |
| 09 | Context Hub Core | @forge/context | Memory nodes, context compiler, pgvector search |
| 10 | Context Hub Advanced | @forge/context | Code understanding index, cross-project deps |
| 11 | Agent Runtime Skeleton | @forge/agent | Orchestrator base, subagent spawning |
| 12 | Agent Runtime Tools | @forge/agent | Tool registry, execution sandbox interface |
| 13 | Model Router | @forge/agent | OpenRouter + Anthropic abstraction |
| 14 | IDE Integration | @forge/ide | VS Code extension API, gate status panel |
| 15 | Code Execution Loop | @forge/execution | Sandbox runner, CI feedback, iteration engine |
| 16 | Dashboard UI v1 | @forge/web | Real data wiring, WebSocket updates |
| 17 | Advanced Governance | @forge/governance | 10 gates + 3 advisory, Giskard integration |
| 18 | Module Registry | @forge/modules | Manifest schema, registry API, hot-swap |
| 19 | Connector Framework | @forge/modules | Tool connectors, bidirectional actions |
| 20 | Module Runtime | @forge/modules | Agent modules, language sandboxes |
| 21-25 | Testing & Polish | All | E2E, performance, security audit |
| 26-29 | Config & Deploy | Ops | K8s manifests, Helm, CI/CD |
| 30-33 | Billing & Metering UI | @forge/web | Cost dashboard, usage reports |
| 34-38 | Tenant Manager | @forge/tenant | Onboarding, white-label, provisioning |
| 39-43 | Final Integration | All | End-to-end demo, docs, launch prep |

---

## 6. Environment

**Server:** 109.228.52.108 (Ubuntu 24.04, 32GB RAM, 727GB disk)  
**User:** sysadmin (sudo password: F4vdv$83y=FG)  
**Node:** v20.20.2, **pnpm:** 10.33.2, **Git:** 2.43.0  
**Project:** /home/sysadmin/arkitekt-forge-platform  

### Docker Services (Running)
| Service | Container | Port |
|---------|-----------|------|
| PostgreSQL 15 + pgvector | forge-postgres | 5432 |
| Redis 7 | forge-redis | 6379 |
| MinIO | forge-minio | 9000/9001 |
| HashiCorp Vault | forge-vault | 8200 |

### PM2
- arkitekt-forge running at /var/www/arkitekt-forge/dist/index.js, port 3000

### DB
- Database: forge
- User: forge
- Migrated with 23 tables + RLS + seed data

---

## 7. Key Decisions & Constraints

1. Subscription First: Every LLM call must pass metering pre-flight before execution
2. Contract First: Every module starts with @forge/contracts type definitions
3. PostgreSQL = Source of Truth: No git-sync. Nightly pg_dump for DR only.
4. API-First: UI is just a client. All functionality exposed via REST + WebSocket.
5. Human Approves Merge: Agents can write/test code. Only humans merge. Non-negotiable.
6. NEOM: Configuration-only tenant at tenants/neom/. 11 gap closures mapped.
7. IP in Layers 1-3: UI, API, Intelligence are proprietary. Infrastructure is swappable.

---

## 8. Known Issues / Notes

- ioredis import syntax: use `import Redis from "ioredis"` (not namespace import)
- SQL arrays use DEFAULT '{}' with proper quoting
- Partitioned table PK must include partition column (created_at)
- token_usage_events is range-partitioned by month
- All 4 packages compile with tsc and pass typecheck
- Legacy UI source is in the local working directory client/src/ — only dist/ exists on server
- UI uses vite-plugin-manus-runtime (Manus-built prototype)

---

## 9. Quick Reference Commands

```bash
# Build all packages
cd /home/sysadmin/arkitekt-forge-platform && pnpm -r build

# Check Docker services
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check PM2
pm2 list && pm2 logs arkitekt-forge

# DB access
docker exec -it forge-postgres psql -U forge -d forge

# Git status
cd /home/sysadmin/arkitekt-forge-platform && git status && git log --oneline -5
```
