# @forge/dashboard

React 19 frontend — rebuilt from the UI prototype with real API integration.

**Session 11 — Build**

## Stack

- React 19 + Vite
- Tailwind CSS v4
- shadcn/ui component system
- Framer Motion for animations
- WebSocket for real-time updates

## API Integration

All data fetches go through `src/lib/api/client.ts`. The client:
- Reads `VITE_API_URL` (defaults to `http://localhost:4000/api/v1`)
- Attaches JWT token from `localStorage` on every request
- Returns typed responses or throws with error details

```typescript
import { api } from '@/lib/api/client';

const subscription = await api.getSubscription();
const usage = await api.getUsage();
const projects = await api.getProjects();
```

## Subscription Widgets

Three real-data widgets injected into every persona sidebar layout:

| Component | Data Source | What It Shows |
|-----------|-------------|---------------|
| `SubscriptionWidget` | `GET /subscription` | Tier name, status badge (active/grace/suspended/trial), token allocation |
| `UsageGauge` | `GET /subscription/usage` | Token usage gauge, % used, remaining tokens |
| `BudgetAlertBanner` | `GET /budgets` | Budget threshold alerts (80%/90%/100%) with colour-coded severity |

```typescript
import { useApiData } from '@/forge/hooks/useApiData';

const { subscription, usage, budgets, loading, error } = useApiData();
```

## Personas

10 persona sidebar layouts in CommandCenter — all wired to live subscription data:
CTO, Delivery Lead, Solution Architect, Developer, QA Lead, Security Officer, Compliance Officer, Product Owner, DevOps Lead, Programme Director.

## Environment Variables

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_ANALYTICS_ENDPOINT=   # optional — Umami analytics
VITE_ANALYTICS_WEBSITE_ID= # optional
```

## Build

```bash
pnpm build   # outputs to dist/
```

Production bundle: ~1.4MB JS (388KB gzip), ~159KB CSS (25KB gzip).
