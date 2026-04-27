# Arkitekt Forge — Developer Guide

## Architecture v12 Alignment

The Arkitekt stack has 9 layers. Each maps to a monorepo package:

| Layer | Name | Package | Status |
|-------|------|---------|--------|
| L1 | Customer Interaction | @forge/dashboard | Integrated (existing UI prototype) |
| L2 | API & Integration | @forge/api | Session 06 |
| L3 | Intelligence & Orchestration | @forge/agents | Sessions 12-14 |
| L4 | Process & Governance | @forge/governance | Session 08 |
| L5 | Data & Context | @forge/db, @forge/context-hub | DB done; Context Hub Session 16 |
| L6 | Infrastructure & Runtime | Docker, K8s | Dev env done; Prod Sessions 26-29 |
| L7 | Workflow Engine | @forge/workflow | Session 07 |
| L8 | Module System | @forge/module-registry, @forge/connector-framework | Sessions 18-20 |
| L9 | Code Execution Loop | @forge/sandbox | Session 15 |

### v12 Key Changes from Earlier Versions
- **22 Kanban States** across 6 phases (added Operate phase: Monitoring -> Incident Detected -> Investigating -> Remediating -> Resolved)
- **Supervised Autonomous Execution** (Principle 1 updated): Agents write/test in sandboxes; humans approve merges
- **Context Budget Awareness** (Principle 18): Hard token ceiling per execution
- **Code Execution Loop**: 7-step flow from approved design to governed PR
- **IDE Integration Layer**: VS Code / JetBrains extension (Session 14)

### 22 States
```
Phase 1 PLAN:       Pending -> Brief -> Ready Design
Phase 2 DESIGN:     Designing -> Design Review -> Ready Dev
Phase 3 DEVELOP:    Coding -> Testing -> Code Review -> Revisions -> Ready CI
Phase 4 TEST/BUILD: CI Running -> CI Pass | CI Fail
Phase 5 SHIP:       Shipped -> Released -> Done
Phase 6 OPERATE:    Monitoring -> Incident Detected -> Investigating -> Remediating -> Resolved
Special:            Blocked (from any), Cancelled
```

## Project Structure

```
packages/forge/
  contracts/       — Shared types (BUILT — Session 01)
  db/              — PostgreSQL schema, migrations, RLS (BUILT — Session 03)
  events/          — Redis Streams event bus (BUILT — Session 04)
  subscription/    — Tiers, metering, billing, lifecycle (BUILT — Session 05)
  dashboard/       — React frontend (INTEGRATED — existing UI)
  api/             — Hono server, middleware, routes (Session 06)
  workflow/        — Parameterised state machine, gates (Session 07)
  governance/      — Proof chain, audit, blocking gates (Session 08)
  context-hub/     — pgvector memory, context compiler (Sessions 09-10)
  agents/          — Claude Agent SDK, orchestrator (Sessions 11-13)
  sandbox/         — OpenSandbox, execution loop (Sessions 14-15)
  connector-framework/ — Tool connectors, bidirectional actions (Sessions 18-19)
  module-registry/ — Manifest schema, hot-swap runtime (Sessions 18-20)
  tenant-manager/  — Onboarding, white-label (Sessions 34-38)
  compliance/      — Evidence export, regulatory templates (Later)
  data-catalog/    — Metadata, lineage (Later)
```

## Tech Stack

- Runtime: Node.js 20+ (ESM)
- Package Manager: pnpm 10+
- Language: TypeScript 5.6 strict mode
- API: Hono
- Database: PostgreSQL 15 + pgvector
- Events: Redis 7 (dev) / Kafka (prod)
- Jobs: BullMQ
- Frontend: React 19 + Vite + Tailwind CSS v4 + Radix UI
- Container: Docker + docker-compose

## Commands

```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
pnpm format           # Format all packages
pnpm test             # Run all tests
```

## Session Types

- **Build** (1-2 days): Implement a module against @forge/contracts
- **Billing** (1-2 days): Work on subscription/metering
- **Config** (2-4 hours): Tenant configuration (NEOM)
- **Infra** (half day): Docker, K8s, CI/CD
- **Test** (half day): Integration testing

## Critical Rules

1. **Subscription First**: Every LLM call must pass pre-flight metering check
2. **Contract First**: Implement against @forge/contracts types only
3. **Architecture v12 wins**: If conflict between plan and v12 doc, v12 doc wins
4. **No code in tenants/**: Configuration only
5. **All modules have CLAUDE.md**: Explaining scope and conventions
6. **Human approves merge**: Agents can write/test code. Only humans merge. Non-negotiable.
7. **PostgreSQL = Source of Truth**: No git-sync. Nightly pg_dump for DR only.

## Environment Variables

Copy .env.example to .env and fill in values:

- DATABASE_URL — PostgreSQL connection string
- REDIS_URL — Redis connection string
- ANTHROPIC_API_KEY — LLM provider key
- STRIPE_SECRET_KEY — Payment processor key
- JWT_SECRET — Auth token signing secret
