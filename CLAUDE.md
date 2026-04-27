# Arkitekt Forge — Developer Guide

## Project Structure

This is a pnpm monorepo containing the Arkitekt Forge production platform.

```
packages/forge/
  contracts/       — Shared types, OpenAPI specs, AsyncAPI specs
  db/              — PostgreSQL schema, migrations, RLS policies
  api/             — Hono server, middleware, routes
  events/          — Redis Streams publisher/subscriber
  subscription/    — Tiers, metering, billing, lifecycle (DAY 1 CRITICAL)
  workflow/        — State machine, BullMQ, gates
  governance/      — Proof chain, gates, audit
  agents/          — Claude Agent SDK, orchestrator
  context-hub/     — pgvector, memory, code index
  sandbox/         — OpenSandbox, code execution
  dashboard/       — React frontend
  connector-framework/ — Plugin SDK
  data-catalog/    — Metadata, lineage
  compliance/      — Regulatory mapping
  ...
```

## Tech Stack

- Runtime: Node.js 20+ (ESM)
- Package Manager: pnpm 10+
- Language: TypeScript 5.6 strict mode
- API: Hono
- Database: PostgreSQL 15 + pgvector
- Events: Redis 7 (dev) / Kafka (prod)
- Jobs: BullMQ
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

1. Subscription First: Every LLM call must pass pre-flight metering check
2. Contract First: Implement against @forge/contracts types only
3. Architecture v12 wins: If conflict between plan and v12 doc, v12 doc wins
4. No code in tenants/: Configuration only
5. All modules have CLAUDE.md explaining their scope and conventions

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `ANTHROPIC_API_KEY` — LLM provider key
- `STRIPE_SECRET_KEY` — Payment processor key
- `JWT_SECRET` — Auth token signing secret
