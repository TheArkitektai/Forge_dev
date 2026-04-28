# @forge/governance

Immutable proof chain, blocking governance gates, and audit logging.

**Session 08 — Build**

## Proof Chain

SHA-256 hash chain. Each entry links to the previous hash, creating a tamper-evident audit trail for every story.

```typescript
import { createProofChainEntry, validateChain } from '@forge/governance';

await createProofChainEntry(storyId, JSON.stringify(artifact), userId);
const { valid, brokenAt } = await validateChain(storyId);
```

Entries are **immutable** — no UPDATE or DELETE on `proof_chain_entries`.

## Blocking Gates

Gates that must pass before a story can transition to the next phase. Availability is gated by subscription tier.

| Gate | Forge Team | Enterprise / Sovereign |
|------|-----------|----------------------|
| `pii_scan` | ✅ | ✅ |
| `code_quality` | ✅ | ✅ |
| `test_coverage` | ✅ | ✅ |
| `security_scan` | — | ✅ |
| `hallucination_check` | — | ✅ |
| `license_scan` | — | ✅ |
| `accessibility_check` | — | ✅ |
| `performance_budget` | — | ✅ |
| `dependency_check` | — | ✅ |
| `api_contract_check` | — | ✅ |

```typescript
import { getGatesForTier, isGateAvailable } from '@forge/governance';

const gates = getGatesForTier('forge_enterprise'); // all 10 gate keys
```

## Audit Logging

Every governance action (gate run, approval, rejection, escalation) is written to `audit_events` with full context.

```typescript
import { getAuditEvents } from '@forge/governance';

const events = await getAuditEvents(organizationId, { limit: 100 });
```

Audit events are consumed by `@forge/compliance` to generate evidence packs.
