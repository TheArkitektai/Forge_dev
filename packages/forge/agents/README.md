# @forge/agents

Claude Agent SDK integration — model router, metered execution service, and context budget manager.

**Session 09 — Build**

## Model Router

Selects the cheapest model that meets the quality threshold for each task type.

| Task Type | Default Model | Quality Score |
|-----------|--------------|---------------|
| `classify` | Claude Haiku | 60 |
| `review` | Claude Haiku | 60 |
| `code` | Claude Sonnet | 85 |
| `reason` | Claude Sonnet | 85 |
| `test` | Claude Sonnet | 85 |
| `architect` | Claude Opus | 95 |

If a quality threshold is specified and the default model doesn't meet it, the router upgrades to the next tier automatically.

```typescript
import { selectModel } from '@forge/agents';

const model = selectModel('architect'); // → Claude Opus
const model = selectModel('classify', 80); // → upgrades to Sonnet (quality 85 ≥ 80)
```

## Execution Service

Every agent execution goes through a mandatory pre-flight check before the LLM call:

```typescript
import { executeAgent, preFlightCheck } from '@forge/agents';

// Pre-flight check (called automatically by executeAgent)
const check = await preFlightCheck(organizationId, estimatedTokens);
if (!check.allowed) throw new Error('Token budget exceeded');

// Execute with full metering
const result = await executeAgent({
  storyId,
  organizationId,
  taskType: 'code',
  prompt: '...',
  contextBudget: 150_000,
});
```

The execution service:
1. Queries current subscription and usage from PostgreSQL
2. Rejects if projected usage would exceed the hard cap
3. Selects the appropriate model
4. Executes the LLM call
5. Records the token usage event (writes to `token_usage_events`)
6. Returns result with cost attribution

## Context Budget Manager

Implements the v12 Context Budget Manager — allocates the total token budget across 4 categories:

| Category | Default Allocation |
|----------|--------------------|
| Design Artifact | 40% |
| Codebase Understanding | 25% |
| Related Patterns | 20% |
| Governance Rules | 15% |

```typescript
import { allocateBudget, spendBudget, isOverBudget } from '@forge/agents';

const budget = allocateBudget(150_000);
const updated = spendBudget(budget, 'designArtifact', 45_000);
```

## Concurrency Limiter

Enforces the `max_concurrent_agents` limit from the subscription tier. Requests exceeding the limit are queued.
