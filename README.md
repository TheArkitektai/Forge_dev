# Arkitekt Forge

> Production-grade AI-native software delivery platform. Agents propose. Humans approve. Meters track. Always.

Arkitekt Forge is a multi-tenant SaaS platform that orchestrates AI agents through a governed, 22-state software delivery lifecycle. Every agent execution is metered, every decision is auditable, and every merge requires human approval.

---

## Architecture

Forge is built on **Architecture v12** — nine layers, 22 Kanban states, 18 principles.

```
L1  Customer Interaction     @forge/dashboard
L2  API & Integration        @forge/api
L3  Intelligence & Orch.     @forge/agents
L4  Process & Governance     @forge/governance + @forge/workflow
L5  Data & Context           @forge/db + @forge/context-hub
L6  Infrastructure           Docker + Kubernetes (GKE, me-central2)
L7  Workflow Engine          @forge/workflow
L8  Module System            @forge/module-registry + @forge/connector-framework
L9  Code Execution Loop      @forge/sandbox
```

### 22 Kanban States (6 Phases)

| Phase | States |
|-------|--------|
| Plan | Pending → Brief → Ready Design |
| Design | Designing → Design Review → Ready Dev |
| Develop | Coding → Testing → Code Review → Revisions → Ready CI |
| Test/Build | CI Running → CI Pass \| CI Fail |
| Ship | Shipped → Released → Done |
| Operate | Monitoring → Incident Detected → Investigating → Remediating → Resolved |
| Special | Blocked (from any), Cancelled |

---

## Repository Structure

```
arkitekt-forge/
├── packages/forge/
│   ├── contracts/           # Shared types, OpenAPI 3.1, AsyncAPI v3
│   ├── db/                  # PostgreSQL 15 schema, migrations, RLS
│   ├── events/              # Redis Streams event bus
│   ├── subscription/        # Tiers, metering, billing, lifecycle (DAY 1)
│   ├── api/                 # Hono REST server, JWT, RBAC, middleware
│   ├── workflow/            # 22-state FSM, BullMQ, gate executor
│   ├── governance/          # Proof chain, audit, blocking gates
│   ├── agents/              # Claude Agent SDK, model router, context budget
│   ├── connector-framework/ # Plugin SDK, GitHub/TOS/FASAH connectors
│   ├── dashboard/           # React 19 + Tailwind 4 + shadcn/ui
│   ├── data-catalog/        # Metadata, lineage, classification
│   ├── compliance/          # PDPL, NCA_ECC, SOC2, ISO_27001, NDMO reports
│   ├── context-hub/         # pgvector embeddings, memory (Q2)
│   ├── sandbox/             # OpenSandbox, code execution (Q2)
│   ├── tenant-manager/      # Multi-tenancy, white label (Q3)
│   ├── module-registry/     # Hot-swap module marketplace (Q3)
│   └── sdk/                 # TypeScript + Python SDKs (Q3)
├── tenants/neom/            # NEOM configuration (zero code)
├── tests/integration/       # Integration test suite
├── infra/                   # Kubernetes, Terraform (Q3)
└── .github/workflows/       # CI/CD pipeline
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ (ESM) |
| Language | TypeScript 5.6 strict mode |
| Package Manager | pnpm 10+ (workspaces) |
| API Framework | Hono |
| Frontend | React 19 + Vite + Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL 15 + pgvector |
| Cache / Events (dev) | Redis 7 |
| Cache / Events (prod) | Kafka |
| Job Queue | BullMQ |
| Agent Runtime | Claude Agent SDK (Anthropic) |
| LLM Access | Anthropic API + OpenRouter |
| Object Storage | MinIO (dev) / GCS (prod) |
| Secrets | HashiCorp Vault |
| Payments | Stripe Billing + manual invoicing |
| Containers | Docker + Kubernetes (GKE, GCP me-central2 Dammam) |

---

## Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm 10+, Docker

# Clone and install
git clone https://github.com/TheArkitektai/Forge_dev.git
cd Forge_dev
pnpm install

# Start infrastructure
docker-compose up -d

# Build all packages
pnpm build

# Type check
pnpm typecheck

# Run linter
pnpm lint
```

### Environment Variables

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL=postgres://forge:forge@localhost:5432/arkitekt_forge
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_...
JWT_SECRET=your-secret-here
```

---

## Subscription Tiers

Every LLM call is metered at the Execution Service choke point. Hard caps protect margins.

| Tier | Price | Tokens / Month | Hard Cap |
|------|-------|---------------|----------|
| Forge Team | $14,400 / yr | 5M | 10M |
| Forge Enterprise | $120K–$175K / yr | 50M | 150M |
| Partner Edition | $110K–$150K / yr | 40M | 120M |
| Forge Sovereign | $250K–$400K / yr | 100M | 500M |

---

## Implemented Packages (Q1 — Sessions 01–16)

| Package | Session | Status | Description |
|---------|---------|--------|-------------|
| `@forge/contracts` | 01 | ✅ | Shared TypeScript types, OpenAPI + AsyncAPI specs |
| `@forge/db` | 03 | ✅ | 26-table schema, 5 migrations, RLS, seed data |
| `@forge/events` | 04 | ✅ | Redis Streams publisher, consumer groups, DLQ |
| `@forge/subscription` | 05 | ✅ | Tiers, lifecycle FSM, metering, budgets, BullMQ worker |
| `@forge/api` | 06 | ✅ | Hono server, JWT, RBAC, 3 enforcement middleware |
| `@forge/workflow` | 07 | ✅ | 22-state FSM, 4 templates, BullMQ, gate executor |
| `@forge/governance` | 08 | ✅ | SHA-256 proof chain, 3 blocking gates, audit log |
| `@forge/agents` | 09 | ✅ | Model router, pre-flight metering, context budget |
| `@forge/connector-framework` | 10 | ✅ | Plugin SDK, GitHub + TOS + FASAH connectors |
| `@forge/dashboard` | 11 | ✅ | React UI, real API client, subscription widgets |
| `@forge/data-catalog` | 13 | ✅ | Asset registration, lineage, classification |
| `@forge/compliance` | 14 | ✅ | 5 frameworks, evidence packs, findings reports |

---

## Guiding Principles

1. **Subscription First** — `@forge/subscription` built before any agent execution. Every LLM call metered. Hard caps protect margins.
2. **Forge is the product, NEOM is the proof** — all code is generic. Tenant configuration customises the platform.
3. **Contract First** — every module starts with `@forge/contracts` defining its API. All sessions implement against those contracts. This prevents interface drift.
4. **Architecture v12 is canonical** — nine layers, 22 states, 18 principles govern all decisions. If a conflict arises between any plan and the v12 document, the v12 document wins.
5. **Prototype as UI Reference, Not Codebase** — the existing UI prototype validates layouts and component patterns. The production build reuses its design system but replaces all mocked data with real API integration.

---

## CI/CD

GitHub Actions runs on every push and pull request to `master`:

```
Checkout → pnpm install → Lint → Typecheck → Build → Integration Tests
```

Services: PostgreSQL 15, Redis 7 (for integration tests).

---

## Build Status

`pnpm -r build` — all 12 workspace packages compile clean.  
`pnpm typecheck` — zero TypeScript errors.

---

## Roadmap

| Quarter | Sessions | Focus |
|---------|----------|-------|
| Q1 ✅ | 01–16 | Foundation: contracts, DB, events, subscription, API, workflow, governance, agents, connectors, dashboard, data catalog, compliance |
| Q2 🚧 | 17–28 | Intelligence: full agents, context hub, sandbox, 10 governance gates, NEOM gap modules |
| Q3 📋 | 29–43 | Enterprise: multi-tenancy, Kafka, module registry, white label, SDKs, IDE extension, production K8s, GA |

Full plan: [ARKITEKT_FORGE_IMPLEMENTATION_PLAN.md](./ARKITEKT_FORGE_IMPLEMENTATION_PLAN.md)

---

*"Agents propose. Humans approve. Meters track. Always."*
