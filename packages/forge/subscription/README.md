# @forge/subscription

Subscription lifecycle, token metering, budget enforcement, and billing for Arkitekt Forge.

**Session 05 — Billing | DAY 1 CRITICAL**

This package is built before any agent execution. Without metering at the API boundary, there is no way to validate that LLM costs stay within the 2% of revenue budget. This is margin protection, not billing convenience.

## Modules

### `tiers.ts` — Subscription Tier Definitions

Four tiers matching the commercial strategy:

| Tier | Annual Price | Tokens / Month | Hard Cap | Overage / M |
|------|-------------|---------------|----------|-------------|
| Forge Team | $14,400 | 5M | 10M | $12 |
| Forge Enterprise | $120K–$175K | 50M | 150M | $10 |
| Partner Edition | $110K–$150K | 40M | 120M | $10 |
| Forge Sovereign | $250K–$400K | 100M | 500M | $9 |

### `metering.ts` — Token Usage Tracking

- `createPreFlightCheck()` — validates usage against hard cap before any LLM call (<5ms)
- `createTokenUsageEvent()` — builds metering event with provider + customer cost attribution
- `aggregateDailyUsage()` — aggregates events into daily totals

### `budgets.ts` — Budget Allocation

Three-level budget hierarchy: Organization → Project → Team

- `checkBudget()` — evaluates usage against configured thresholds (80% / 90% / 100%)
- `createBudget()` — creates budget scope with alert thresholds and limit-reached action
- Actions: `block`, `alert_continue`, `auto_upgrade`

### `lifecycle.ts` — Subscription State Machine

```
Trial ──(payment)──► Active ──(expiry)──► Grace Period ──(renewal)──► Active
                       │                       │
                       │               (grace expiry)
                       │                       │
                  (tier change)                ▼
                       │                  Suspended ──(renewal+payment)──► Active
               Upgraded/Downgraded             │
                                       (retention expiry)
                                               │
                                               ▼
                                          Terminated
```

- `canTransition()` — validates allowed state transitions
- `getEffectiveStatus()` — computes current status accounting for expiry and grace period
- `calculateExpiryDate()` — computes next billing date for monthly/annual cycles

### `worker.ts` — BullMQ Aggregation Worker

- **Rolling aggregation**: every 30 seconds, upserts last 2 minutes of `token_usage_events` into `token_usage_daily`
- **Daily reconcile**: at 01:00 UTC, full re-aggregation of the current day
- Uses `@forge/db` connection pool (no separate pool)

```typescript
import { startAggregationScheduler } from '@forge/subscription';

// Call once at startup
await startAggregationScheduler();
```

## Metering Pipeline

```
1. Pre-flight Check    → reject if hard cap exceeded, warn at 80%/90%
2. Model Selection     → cheapest model meeting quality threshold
3. Execution           → LLM call, tokens counted from provider response
4. Metering Event      → published to Redis Streams via @forge/events
5. Usage Aggregation   → BullMQ worker upserts into token_usage_daily (30s)
6. Budget Enforcement  → alerts + hard cap + admin notifications
```
