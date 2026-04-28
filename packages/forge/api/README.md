# @forge/api

Hono REST API server — the gateway for all Arkitekt Forge operations.

**Session 06 — Build**

## Middleware Stack (applied in order)

| Middleware | File | What It Does |
|-----------|------|-------------|
| Error handler | `middleware/error.ts` | Catches all unhandled errors, returns structured JSON |
| JWT Auth | `middleware/auth.ts` | Validates Bearer token, sets `user` on context |
| RBAC | `middleware/rbac.ts` | Enforces role-based permissions per route |
| Subscription | `middleware/subscription.ts` | Blocks requests if tenant is suspended or hard-capped |
| Feature Gate | `middleware/feature-gate.ts` | Blocks access to features not included in subscription tier |
| Usage Tracking | `middleware/usage.ts` | Records API call to `api_usage_events` |

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| GET | `/ready` | Readiness check (DB + Redis) |
| GET/POST | `/organizations` | Org CRUD |
| GET/POST | `/projects` | Project CRUD |
| GET/POST/PATCH | `/users` | User management |
| GET/POST/PATCH | `/stories` | Story CRUD + state transitions |
| GET | `/subscription` | Current subscription status |
| GET | `/subscription/usage` | Current period token usage |
| GET | `/subscription/usage/daily` | Daily usage breakdown |
| GET | `/subscription/usage/projects` | Usage by project |
| GET | `/budgets` | Tenant budget configurations |
| POST | `/budgets` | Create project/team budget |
| POST | `/admin/tiers` | (Platform admin) Create/update tier |
| POST | `/admin/tenants/:id/subscription` | (Platform admin) Assign subscription |
| POST | `/admin/tenants/:id/override` | (Platform admin) Per-tenant allocation override |

## Auth

JWT signed with HS256. Token payload:
```json
{ "sub": "<user_id>", "org": "<org_id>", "role": "<role_key>", "iat": 0, "exp": 0 }
```

## Roles and Permissions

5 roles: `platform_admin`, `org_admin`, `project_lead`, `developer`, `viewer`  
19 permissions covering all resource operations.
