# @forge/workflow

22-state Kanban state machine, BullMQ job queues, gate executor, and workflow templates.

**Session 07 — Build**

## State Machine

All 22 states across 6 phases, as defined in Architecture v12:

```
Phase 1 PLAN:       Pending → Brief → Ready Design
Phase 2 DESIGN:     Designing → Design Review → Ready Dev
Phase 3 DEVELOP:    Coding → Testing → Code Review → Revisions → Ready CI
Phase 4 TEST/BUILD: CI Running → CI Pass | CI Fail
Phase 5 SHIP:       Shipped → Released → Done
Phase 6 OPERATE:    Monitoring → Incident Detected → Investigating → Remediating → Resolved
Special:            Blocked (from any state), Cancelled (terminal)
```

Each state is tagged with:
- `isAgentDriven` — agent executes this phase autonomously
- `isHumanGate` — human approval required before transition
- `isTerminal` — no further transitions

## Workflow Templates

| Template | Phases | States | Gate Type | Min Tier |
|----------|--------|--------|-----------|----------|
| Standard SDLC | 6 | 22 | Single approval | Forge Team |
| Lightweight Agile | 3 | 9 | Single approval | Forge Team |
| Enterprise Governed | 7 | 24 | Dual approval | Forge Enterprise |
| Compliance Heavy | 8 | 30 | Triple approval | Forge Enterprise |

```typescript
import { getTemplatesForTier } from '@forge/workflow';

const available = getTemplatesForTier('forge_sovereign'); // all 4 templates
```

## BullMQ Queues

- Priority queue for state transitions
- Exponential backoff on failures (3 attempts)
- Dead letter queue for permanently failed transitions

## Gate Executor

Pluggable gate framework. Each gate receives story context and returns pass/fail/advisory:

```typescript
import { executeGate } from '@forge/workflow';

const result = await executeGate('pii_scan', { storyId, code });
```
