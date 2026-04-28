# @forge/connector-framework

Plugin SDK for bidirectional integrations with external systems.

**Session 10 — Build**

## Connector Architecture

Each connector is a `ConnectorManifest` registered in the `ConnectorRegistry`. The manifest declares the connector's actions (things Forge can do in the external system) and events (things the external system can push to Forge).

```typescript
import { registry } from '@forge/connector-framework';

// List all registered connectors
const all = registry.list();

// Get a specific connector
const github = registry.get('github');

// List connectors by category
const govConnectors = registry.listByCategory('government');
```

## Registered Connectors

| ID | Name | Category | Auth |
|----|------|----------|------|
| `github` | GitHub | vcs | OAuth |
| `tos` | TOS (Transport Operations System) | government | API Key |
| `fasah` | FASAH / ZATCA | government | API Key |

## Manifest Schema

```typescript
interface ConnectorManifest {
  id: string;
  name: string;
  version: string;
  category: string;
  authType: 'oauth' | 'apikey' | 'basic' | 'none';
  actions: ConnectorAction[];   // things Forge can do in the external system
  events: ConnectorEvent[];     // things the external system pushes to Forge
}
```

## NEOM Gap Coverage

| NEOM Gap | Connector | Session |
|----------|-----------|---------|
| G04 — FASAH/ZATCA | `fasah` | 10 |
| G11 — OT Connectors | `tos` + future OT connectors | 10, 26 |

## Adding a New Connector

```typescript
import { registry } from '@forge/connector-framework';

registry.register({
  id: 'my-system',
  name: 'My System',
  version: '1.0.0',
  category: 'erp',
  authType: 'apikey',
  actions: [
    {
      id: 'create-record',
      name: 'Create Record',
      description: 'Creates a record in My System',
      inputSchema: { type: 'object', properties: { name: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { id: { type: 'string' } } },
      rateLimit: { requests: 100, window: '1m' },
    },
  ],
  events: [],
});
```
