# @forge/contracts

Shared TypeScript types, OpenAPI 3.1 specs, and AsyncAPI v3 event schemas for the entire Arkitekt Forge platform.

**Session 01 — Build**

## Purpose

Every other package imports from `@forge/contracts`. No package defines its own domain types. This is the single source of truth that prevents interface drift across the monorepo.

## Exported Types

| Category | Types |
|----------|-------|
| Core | `Organization`, `Project`, `Story`, `User`, `UUID`, `Timestamp` |
| Auth | `RoleKey`, `Role`, `PermissionKey` |
| Workflow | `StoryPhase`, `PhaseState`, `StateTransition` |
| Governance | `Gate`, `GateResult`, `ApprovalRecord`, `ProofChainEntry`, `AuditEvent`, `EvidencePack` |
| Agents | `AgentStatus`, `AgentExecution`, `Tool`, `ToolResult`, `ContextBrief`, `TokenBudget` |
| Subscription | `SubscriptionTierSlug`, `SubscriptionStatus`, `SubscriptionTier`, `Subscription` |
| Metering | `TokenUsageEvent`, `TokenUsageDaily`, `TokenUsageMonthly`, `MeteringCheckResult` |
| Budgets | `BudgetScope`, `OnLimitReached`, `TenantBudget`, `BillingInvoice` |
| Events | `MeteringEventPayload`, `SubscriptionEvent` |

## Usage

```typescript
import type { Organization, Story, MeteringCheckResult } from '@forge/contracts';
```

## Rules

- No runtime code in this package — types and interfaces only
- No circular dependencies — this package imports nothing from the monorepo
- Every breaking change here requires updating all downstream packages
