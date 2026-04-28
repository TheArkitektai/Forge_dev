# @forge/data-catalog

Generic metadata catalog with lineage tracking, classification, and stewardship.

**Session 13 — Build | Tier: Enterprise+**

## What It Does

Registers and tracks data assets flowing through Forge pipelines — tables, views, streams, and files. Provides lineage to trace where data came from and where it goes.

## Asset Types

`table` | `view` | `stream` | `file`

## Classification Levels

`public` | `internal` | `confidential` | `restricted`

## API

```typescript
import { registerAsset, getAssets, getAssetLineage } from '@forge/data-catalog';

// Register a new asset
const asset = await registerAsset({
  name: 'port_manifests',
  type: 'table',
  source: 'TOS',
  classification: 'confidential',
  owner: 'data-team',
  organizationId,
  lineage: ['tos_raw_events'],
});

// Get all assets for an org
const assets = await getAssets(organizationId);

// Trace lineage
const { upstream, downstream } = await getAssetLineage(assetId);
```

## Tier Gating

Full catalog features (lineage, classification, stewardship) are available on **Forge Enterprise** and above. Forge Team gets basic asset registration only.

## NEOM Coverage

NEOM Gap G08 — Canonical model / metadata management.
Config session: Session 15.
