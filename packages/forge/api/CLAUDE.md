# @forge/api

Arkitekt Forge API Server — Hono-based REST API with JWT auth, RBAC, subscription enforcement, and feature gating.

## Tech Stack

- Hono (web framework)
- jose (JWT signing/verification)
- @forge/db (PostgreSQL client)
- @forge/contracts (shared types)
- @forge/subscription (tier checks)
- @forge/events (event publishing)

## Middleware Stack (applied in order)

1. **logger** — request logging
2. **cors** — cross-origin headers
3. **secureHeaders** — security headers
4. **usageTracking** — API call metrics
5. **auth** — JWT verification
6. **subscription** — subscription status check
7. **rbac** — permission/role checks
8. **featureGate** — tier-based feature availability

## Routes

| Path | Auth | Description |
|------|------|-------------|
| GET /api/v1/health | No | Health check |
| GET /api/v1/ready | No | Readiness (includes DB check) |
| GET /api/v1/organizations | Yes | Get org (self) |
| PATCH /api/v1/organizations/:id | Yes | Update org |
| GET /api/v1/projects | Yes | List projects |
| POST /api/v1/projects | Yes | Create project |
| GET /api/v1/projects/:id | Yes | Get project |
| PATCH /api/v1/projects/:id | Yes | Update project |
| DELETE /api/v1/projects/:id | Yes | Delete project |
| GET /api/v1/users | Yes | List users |
| POST /api/v1/users | Yes | Create user |
| GET /api/v1/users/me | Yes | Current user |
| GET /api/v1/stories | Yes | List stories |
| POST /api/v1/stories | Yes | Create story |
| GET /api/v1/stories/:id | Yes | Get story |
| PATCH /api/v1/stories/:id | Yes | Update story |
| DELETE /api/v1/stories/:id | Yes | Delete story |
| GET /api/v1/subscription | Yes | Current subscription |
| GET /api/v1/subscription/usage | Yes | Usage summary |
| GET /api/v1/subscription/usage/daily | Yes | Daily usage |
| GET /api/v1/subscription/budgets | Yes | Budgets |
| GET /api/v1/subscription/admin/tiers | Admin | List tiers |
| POST /api/v1/subscription/admin/tenants/:orgId/subscription | Admin | Assign subscription |

## Environment Variables

- PORT — server port (default 4000)
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — JWT signing secret
- CORS_ORIGIN — CORS allowed origin
- NODE_ENV — production/development
