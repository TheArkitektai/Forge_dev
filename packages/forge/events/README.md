# @forge/events

Redis Streams event bus with typed events, consumer groups, and dead letter queue.

**Session 04 — Build**

## Event Types

| Event | When Published | Consumer |
|-------|---------------|----------|
| `token_consumed` | After every LLM call | `@forge/subscription` aggregation worker |
| `budget_alert` | At 80% / 90% threshold | Dashboard, admin webhooks |
| `budget_exceeded` | At hard cap | `@forge/api` (blocks execution) |
| `subscription_changed` | Tier change / renewal / suspension | `@forge/api`, `@forge/dashboard` |

## Usage

```typescript
import { publish, subscribe } from '@forge/events';

// Publish a metering event
await publish('token_consumed', {
  tenantId, projectId, storyId, agentExecutionId,
  modelUsed, inputTokens, outputTokens,
  costAtProviderRate, timestamp,
});

// Subscribe with consumer group
subscribe('forge-subscription-group', 'token_consumed', async (event) => {
  await aggregateUsage(event);
});
```

## Reliability

- Consumer groups ensure each event is processed exactly once per group
- Dead letter queue captures events that fail after 3 retry attempts
- Redis AOF persistence — zero metering data loss on restart
