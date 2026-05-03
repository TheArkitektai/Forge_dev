# Arkitekt Forge — Full Integration Plan v5

**Date:** 2026-04-29  
**Status:** APPROVED — 6 rounds of audit completed. This is the authoritative reference.  
**Auditor:** Claude (permanent QA lead). Every developer submission is checked against this file.

---

## QA Audit Rules (Claude enforces these on every developer submission)

1. Verify against live schema, not assumptions. If a developer claims a table or column exists, SSH and check.
2. Check SQL column names literally. Past bugs: `input_tokens` (wrong → `total_input_tokens`), `period` (wrong → `month`), `s.organization_id` (wrong → stories has no such column).
3. Check NOT NULL constraints in every INSERT. `state_transitions` requires `from_phase`, `to_phase`, `from_state`, `to_state`, `proof_hash`, `triggered_by` — all NOT NULL.
4. Check package names exactly. Past bug: `@anthropic-ai-sdk` → correct: `@anthropic-ai/sdk` (forward slash).
5. Check phase ordering. Packages must be installed BEFORE the API starts. Pre-flight items must complete BEFORE integration phases begin.
6. Check for placeholder values. bcrypt hashes like `$2a$10$...` must be replaced with real generated hashes before migration is committed.
7. Check that `await` is used on async DB functions. Missing `await` on `createTokenUsageEvent` = silent data loss.
8. Check RLS completeness. New tables need both `CREATE POLICY` and `ALTER TABLE ENABLE ROW LEVEL SECURITY`. RLS policies on tables that join through other tables must use the correct join path (stories → projects → organizations, not stories → organizations directly).
9. Never approve work that skips a pre-flight item. All 6 PF items must complete before Phase 2 begins.
10. Demand verification commands, not just claims. A developer saying "gates table has 5 rows" must be backed by `SELECT COUNT(*) FROM gates;` output.

---

## Verified Live Facts (from SSH inspection 2026-04-29)

| Item | State |
|------|-------|
| `@forge/contracts` | Types-only. `dist/index.js` is `export {}`. Cannot import for runtime values. |
| `@forge/subscription` | Exports `createPreFlightCheck()`, `createTokenUsageEvent()`. `createTokenUsageEvent` writes to DB. |
| `@forge/workflow` | Gate query has SQL bug: `WHERE type = blocking` (unquoted). `gates` table: **0 rows**. |
| `@forge/governance` | Exports `createProofChainEntry(storyId, data, signedBy)`. Returns `{ hash, ... }`. |
| `@forge/context-hub` | **EMPTY src directory.** Not implemented. |
| `state_transitions` | No RLS policy. `proof_hash`, `from_phase`, `to_phase`, `from_state`, `to_state`, `triggered_by` all **NOT NULL**. |
| `stories` table | Has `risk text`, `confidence integer`, `project_id uuid`. **No `organization_id` column. No `current_state`. No `summary`. No `agent_outputs`.** |
| `users` table | Has `id, organization_id, email, name, role_id`. **No password column.** |
| `user_credentials` | **Does not exist.** Created by PF-6. |
| `token_usage_monthly` | Columns: `organization_id`, `project_id`, `month` (text), `total_input_tokens`, `total_output_tokens`. |
| `tenant_budgets` | Column: `monthly_token_limit` (not `monthly_limit`). |
| `story_attachments` | **Does not exist.** Created by Phase 3. |
| `story_links` | **Does not exist.** Created by Phase 3. |
| `gates` | 0 rows. |
| Database | 26 tables. 1 org, 1 user (admin@uxbert.test), 1 project, 1 story, 4 tiers, 5 roles seeded. |
| Backend .env | Missing `JWT_SECRET`, `ANTHROPIC_API_KEY`. `PORT=3000` conflicts with UI — must change to 4000. |
| Backend monorepo | Missing packages: `@anthropic-ai/sdk`, `@hono/node-server`. |
| UI server | Express at `server/index.ts`. Two Claude endpoints. No DB connection anywhere. In-memory state only. |
| Hono backend | Compiled but **never started**. No PM2 entry. |

**Verified function signatures:**
- `createTokenUsageEvent({ organizationId, projectId, storyId, modelProvider, modelName, inputTokens, outputTokens, providerRatePerMillion, customerRatePerMillion })`
- `createProofChainEntry(storyId: string, data: string, signedBy: string): Promise<{ hash, ... }>`

---

## Pre-Flight Checklist (All 6 Must Complete Before Any Integration Phase)

### PF-1: Fix Workflow Engine SQL Bug
**File:** `packages/forge/workflow/src/engine.ts`  
**Bug:** `WHERE type = blocking` → `WHERE type = 'blocking'`  
**Verify:** `grep -rn "WHERE type = blocking" packages/forge/workflow/src/`

### PF-2: Seed Gates Table
**File:** New migration `packages/forge/db/migrations/007_seed_gates.sql`
```sql
INSERT INTO gates (id, phase, type, name, auto_pass, notes) VALUES
  ('gate-plan-to-design',    'Plan',    'blocking', 'Brief Approval Gate',  true, 'integration_placeholder'),
  ('gate-design-to-develop', 'Design',  'blocking', 'Design Review Gate',   true, 'integration_placeholder'),
  ('gate-develop-to-test',   'Develop', 'blocking', 'Code Review Gate',     true, 'integration_placeholder'),
  ('gate-test-to-ship',      'Test',    'blocking', 'QA Sign-off Gate',     true, 'integration_placeholder'),
  ('gate-ship-to-done',      'Ship',    'advisory', 'Release Confirmation', true, 'integration_placeholder');
```
**Verify:** `SELECT COUNT(*) FROM gates;` returns 5.  
**Also verify:** `gate_results.gate_id → gates(id)` FK works. `proof_chain_entries` accepts inserts.

### PF-3: Write Metered Agent Call Wrapper
**File:** `packages/forge/subscription/src/metering.ts` (new function)

```typescript
export async function executeMeteredAgentCall(params: {
  organizationId: string;
  projectId?: string;
  storyId?: string;
  modelProvider: string;
  modelName: string;
  estimatedTokens: number;
  callClaude: () => Promise<{ inputTokens: number; outputTokens: number; parsed: any }>;
}): Promise<{ allowed: boolean; result?: any; error?: string }> {
  // 1. Look up current usage
  const [usageRow] = await sql`
    SELECT COALESCE(SUM(total_input_tokens + total_output_tokens), 0) as total
    FROM token_usage_monthly
    WHERE organization_id = ${params.organizationId}
    AND month = TO_CHAR(NOW(), 'YYYY-MM')
  `;
  const currentUsage = Number(usageRow?.total || 0);

  // 2. Look up monthly limit
  const [budgetRow] = await sql`
    SELECT monthly_token_limit FROM tenant_budgets
    WHERE organization_id = ${params.organizationId}
  `;
  const monthlyLimit = Number(budgetRow?.monthly_token_limit || 0);

  // 3. Look up rates from subscription tier
  const [tierRow] = await sql`
    SELECT st.provider_rate_per_million, st.customer_rate_per_million
    FROM subscriptions s
    JOIN subscription_tiers st ON st.id = s.tier_id
    WHERE s.organization_id = ${params.organizationId}
    AND s.status = 'active'
  `;
  const providerRate = Number(tierRow?.provider_rate_per_million || 0);
  const customerRate = Number(tierRow?.customer_rate_per_million || 0);

  // 4. Pre-flight check
  const check = createPreFlightCheck(
    params.organizationId,
    currentUsage,
    monthlyLimit,
    params.modelName,
    params.estimatedTokens
  );
  if (!check.allowed) {
    return { allowed: false, error: "Token budget exceeded" };
  }

  // 5. Call Claude — returns inputTokens, outputTokens, AND parsed content
  const claudeResult = await params.callClaude();

  // 6. Record usage — MUST await to prevent silent data loss
  await createTokenUsageEvent({
    organizationId: params.organizationId,
    projectId: params.projectId,
    storyId: params.storyId,
    modelProvider: params.modelProvider,
    modelName: params.modelName,
    inputTokens: claudeResult.inputTokens,
    outputTokens: claudeResult.outputTokens,
    providerRatePerMillion: providerRate,
    customerRatePerMillion: customerRate,
  });

  return { allowed: true, result: claudeResult };
}
```

**Critical:** `callClaude` must return `{ inputTokens, outputTokens, parsed }` — three fields. Returning only token counts breaks the route.

### PF-4: Add current_state Column to stories
**File:** `packages/forge/db/migrations/008_story_state_column.sql`
```sql
ALTER TABLE stories ADD COLUMN current_state text NOT NULL DEFAULT 'pending';
```
Existing rows get `'pending'` automatically. No UPDATE needed.

### PF-5: Fix Backend .env
**File:** `/home/sysadmin/arkitekt-forge-platform/.env`
```
JWT_SECRET=forge_jwt_secret_change_in_production_2026
ANTHROPIC_API_KEY=<actual key>
PORT=4000
```

### PF-6: Add User Credentials Table with Real Hash
**File:** `packages/forge/db/migrations/010_user_credentials.sql`

**Step 1 — Generate REAL bcrypt hash first (do not commit placeholder):**
```bash
node -e "import('bcryptjs').then(b => b.hash('admin123', 10).then(console.log))"
```

**Step 2 — Write migration with real hash output from step 1:**
```sql
CREATE TABLE user_credentials (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO user_credentials (user_id, password_hash)
VALUES (
  (SELECT id FROM users WHERE email = 'admin@uxbert.test'),
  '<REAL_HASH_FROM_STEP_1>'
);
```

**Also install bcrypt in API package:**
```bash
cd packages/forge/api && pnpm add bcryptjs && pnpm add -D @types/bcryptjs
```

---

## Phase 0: Infrastructure (1 Session)

### 0.1 Fix Vault Health Check
Recreate Vault container with HTTP health command and `--health-start-period 30s`. Wait for `healthy`.

### 0.2 Fix Redis TLS
```bash
grep -rn "new Redis" packages/forge/
```
For each localhost connection, ensure TLS is not forced. Fix both subscription worker and workflow queue.

### 0.3 Add RLS Policy to state_transitions
**File:** `packages/forge/db/migrations/006_rls_state_transitions.sql`
```sql
CREATE POLICY state_transition_isolation ON state_transitions
  USING (EXISTS (
    SELECT 1 FROM stories s
    JOIN projects p ON p.id = s.project_id
    WHERE s.id = state_transitions.story_id
    AND p.organization_id = (current_setting('app.current_org_id', true))::uuid
  ));
ALTER TABLE state_transitions ENABLE ROW LEVEL SECURITY;
```
**Critical:** `stories` has NO `organization_id` column. Must JOIN through `projects`. Direct `s.organization_id` = hard failure.

### 0.4 Install Missing Packages
**Must happen BEFORE 0.5 (starting the API).**
```bash
cd /home/sysadmin/arkitekt-forge-platform
pnpm add -w @anthropic-ai/sdk
pnpm add -w @hono/node-server
```

### 0.5 Start API with PM2
Create `ecosystem.api.config.js`. Start Hono API on port 4000. Verify `/api/v1/health` returns 200.

### 0.6 Update Documentation
Rewrite `IMPLEMENTATION_STATUS.md` to honestly state what is running, what compiled but is broken, and what is not written.

---

## Phase 1: Backend Correction (2 Sessions)

### 1.1 Execute All Six Pre-Flight Items
PF-1 through PF-6 must all complete before proceeding. No partial approval.

### 1.2 Fix Model IDs in @forge/agents
Read `packages/forge/agents/src/model-router.ts`. Verify IDs against Anthropic API. Fix if wrong. Rebuild.

### 1.3 Verify Package Compile Status
For each of the 24 packages: check `src/` exists, run `pnpm build`, document result. Skip `context-hub` (empty src — known deferred).

### 1.4 Fix Gate Executor SQL + Seed Gates
Fix `WHERE type = blocking` → `WHERE type = 'blocking'`. Run gate seed migration. Rebuild `@forge/workflow`.

### 1.5 Verify Gate Executor Export Name
```bash
node --input-type=module <<< "import * as w from '/home/sysadmin/arkitekt-forge-platform/packages/forge/workflow/dist/index.js'; console.log(Object.keys(w))"
```
Confirm the gate execution function exists. Note its exact export name. Phase 7 must use this exact name.

### 1.6 Implement executeMeteredAgentCall()
Write the function from PF-3 in `@forge/subscription/src/metering.ts`. Rebuild. Verify it appears in `dist/metering.js`.

### 1.7 Verify subscription_tiers Column Names
```bash
docker exec forge-postgres psql -U forge -d arkitekt_forge -c "\d subscription_tiers"
```
Confirm exact column names for billing rates. If different from `provider_rate_per_million`/`customer_rate_per_million`, update PF-3 query.

---

## Phase 2: Authentication (2 Sessions)

### 2.1 Add Login Endpoint
**File:** `packages/forge/api/src/routes/auth.ts`  
`POST /api/v1/auth/login`
- Read `{ email, password }`
- Query: `SELECT u.id, u.name, u.email, u.role_id, u.organization_id, c.password_hash FROM users u JOIN user_credentials c ON c.user_id = u.id WHERE u.email = ${email}`
- Compare with `bcrypt.compare(password, hash)`
- Sign JWT: `{ sub: user.id, org: user.organization_id, role: user.role_id }`
- Set `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
- Return `{ user: { id, name, email } }`

### 2.2 Add Logout + Me Endpoints
`POST /api/v1/auth/logout` — clear cookie with `Max-Age=0`.  
`GET /api/v1/auth/me` — read cookie, verify JWT, return user object.

### 2.3 Add Auth Middleware
**File:** `packages/forge/api/src/middleware/auth.ts`
- Read `token` cookie
- Verify with `JWT_SECRET`
- Extract `{ sub: userId, org: orgId, role: roleId }`
- Set `c.set("user", payload)` and `c.set("orgId", orgId)`

### 2.4 Add RLS Transaction Wrapper
**File:** `packages/forge/api/src/middleware/rls.ts`
```typescript
export const rlsMiddleware = createMiddleware(async (c, next) => {
  const orgId = c.get("orgId");
  if (!orgId) return next();

  await sql.begin(async (tx) => {
    await tx`SET LOCAL app.current_org_id = ${orgId}`;
    c.set("tx", tx);
    await next();
  });
});
```
**Critical:** `SET LOCAL` only works inside a transaction. Calling it outside `sql.begin()` silently does nothing. Never call `SET LOCAL` outside the transaction wrapper.

### 2.5 CORS Config
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://forge.thearkitekt.ai",
  credentials: true
}));
```

### 2.6 Build UI Login Screen
**File:** `client/src/forge/screens/LoginScreen.tsx`
- Email + password inputs
- `fetch('/api/v1/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })`
- On success: set user in context, navigate to `/portfolio`

### 2.7 Add Auth Guard
On app mount: `fetch('/api/v1/auth/me', { credentials: 'include' })`. If 401, redirect to `/login`.

---

## Phase 3: Schema Reconciliation (1 Session)

### 3.1 Write Migration for Story Fields
**File:** `packages/forge/db/migrations/009_story_fields.sql`

**Do NOT add:** `current_state` (already in 008), `risk` (already exists), `confidence` (already exists).

```sql
ALTER TABLE stories ADD COLUMN acceptance_criteria jsonb DEFAULT '[]';
ALTER TABLE stories ADD COLUMN agent_outputs jsonb DEFAULT '{}';
ALTER TABLE stories ADD COLUMN feedback_history jsonb DEFAULT '[]';
ALTER TABLE stories ADD COLUMN memory_events jsonb DEFAULT '[]';
ALTER TABLE stories ADD COLUMN governance_queue jsonb DEFAULT '[]';
ALTER TABLE stories ADD COLUMN next_gate text;
ALTER TABLE stories ADD COLUMN memory_links integer DEFAULT 0;
ALTER TABLE stories ADD COLUMN evidence_score integer;
ALTER TABLE stories ADD COLUMN summary text;

CREATE TABLE story_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  filename text NOT NULL,
  url text NOT NULL,
  size_bytes integer,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE story_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  type text
);

CREATE POLICY story_attachments_isolation ON story_attachments
  USING (story_id IN (
    SELECT s.id FROM stories s
    JOIN projects p ON p.id = s.project_id
    WHERE p.organization_id = (current_setting('app.current_org_id', true))::uuid
  ));

CREATE POLICY story_links_isolation ON story_links
  USING (story_id IN (
    SELECT s.id FROM stories s
    JOIN projects p ON p.id = s.project_id
    WHERE p.organization_id = (current_setting('app.current_org_id', true))::uuid
  ));

ALTER TABLE story_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_links ENABLE ROW LEVEL SECURITY;
```

### 3.2 Update UI Types
**File:** `client/src/forge/types.ts`  
Align Story interface with backend schema. Keep `risk` and `confidence` as-is (do not rename). Add comment `// Aligned with backend schema v009`.

---

## Phase 4: Server Consolidation — Step 2 (2 Sessions)

### 4.1 Move Claude Routes to Hono
**File:** `packages/forge/api/src/routes/agents.ts`

```typescript
import { executeMeteredAgentCall } from "@forge/subscription";

app.post("/breakdown", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const result = await executeMeteredAgentCall({
    organizationId: user.org,
    projectId: body.projectId,
    storyId: body.storyId,
    modelProvider: "anthropic",
    modelName: "claude-haiku-4-5-20251001",
    estimatedTokens: 4000,
    callClaude: async () => {
      const response = await anthropic.messages.create({ /* ... */ });
      const raw = response.content[0].text;
      const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, ""));
      return {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        parsed,  // MUST be included — route reads result.result.parsed
      };
    }
  });

  if (!result.allowed) return c.json({ error: result.error }, 402);
  return c.json({
    ...result.result.parsed,
    tokensUsed: result.result.inputTokens + result.result.outputTokens,
  });
});
```

**Claude routes use:** auth middleware + metering. **No `rlsMiddleware`** (Claude calls are not tenant-DB-scoped).

### 4.2 Update Nginx
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
}

location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
}
```

### 4.3 Verify Metering Works
Call `/api/story/breakdown` via Hono. Confirm: `createPreFlightCheck` runs, Claude executes if allowed, `createTokenUsageEvent` writes a row to `token_usage_events`, response returns content.

### 4.4 Keep Relative URLs in UI
UI `fetch('/api/story/breakdown', { credentials: 'include' })` stays relative. Nginx handles routing.

---

## Phase 5: Server Consolidation — Step 3 (1 Session)

### 5.1 Add serveStatic + SPA Fallback to Hono
**File:** `packages/forge/api/src/server.ts`

Route order is mandatory:
```typescript
import { serveStatic } from "@hono/node-server/serve-static";
import { readFile } from "node:fs/promises";

// 1. Static files — no middleware
app.use("/*", serveStatic({ root: "./dist/public" }));

// 2. Health + Auth — no auth middleware
app.route("/api/v1/health", healthRoutes);
app.route("/api/v1/auth", authRoutes);

// 3. Claude routes — auth + metering, NO rlsMiddleware
app.use("/api/story/*", authMiddleware);
app.use("/api/story/*", meteringMiddleware);
app.route("/api/story", agentRoutes);

// 4. Data routes — auth + RLS
app.use("/api/v1/*", authMiddleware);
app.use("/api/v1/*", rlsMiddleware);
app.route("/api/v1/organizations", orgRoutes);
app.route("/api/v1/projects", projectRoutes);
app.route("/api/v1/users", userRoutes);
app.route("/api/v1/stories", storyRoutes);
app.route("/api/v1/subscription", subscriptionRoutes);
app.route("/api/v1/billing", billingRoutes);

// 5. SPA fallback — MUST be last, after all API routes
app.get("*", async (c) => {
  const html = await readFile("./dist/public/index.html", "utf-8");
  return c.html(html);
});
```

### 5.2 Switch Nginx to Port 4000
All traffic → Hono port 4000. Stop Express.

### 5.3 Verify App Loads
- `/` serves UI
- `/api/v1/health` returns 200
- `/delivery` (direct navigation) serves `index.html` (SPA fallback working)

---

## Phase 6: Server Consolidation — Step 4 (0.5 Session)

### 6.1 Delete Express Server
Remove `server/index.ts`. Remove Express dependency from UI `package.json`.

### 6.2 Update PM2
Point PM2 to Hono entry point. Single process on port 4000.

---

## Phase 7: Workflow-First Transitions (3 Sessions)

### 7.1 Create Transition Endpoint
`POST /api/v1/stories/:id/transition`  
**Request:** `{ toPhase: "Design", reason?: string }`

**10-step logic (steps 6-10 should be wrapped in a DB transaction):**
1. Load story (including `current_state`)
2. Map `toPhase` to target state (e.g., `"Design"` → `"designing"`)
3. `workflow.validateTransition(currentState, targetState)`
4. If invalid → return 422
5. `gateExecutor.executeGates(storyId)` — auto-pass with logging
6. For each gate result → INSERT `gate_results`
7. `const entry = await governance.createProofChainEntry(storyId, JSON.stringify({ fromState, toState, gates }), userId)`
8. INSERT `state_transitions`:
   ```sql
   INSERT INTO state_transitions (story_id, from_phase, to_phase, from_state, to_state, proof_hash, triggered_by)
   VALUES ($storyId, $currentPhase, $toPhase, $currentState, $targetState, $entry.hash, $userId)
   ```
   **All 6 columns are NOT NULL. Missing any one is a hard DB error.**
9. UPDATE `stories SET phase = $toPhase, current_state = $targetState`
10. INSERT `audit_events`
11. Return `{ story, transition, gateResults }`

### 7.2 Wire UI advanceStory()
Call transition endpoint. Handle 422 (gate failure). Update local state from response.

### 7.3 Wire UI rejectStory()
Call transition endpoint with previous phase + reason.

### 7.4 Wire Feedback Endpoint
`POST /api/v1/stories/:id/feedback` — append to `feedback_history` JSONB.

### 7.5 Wire Design Artifact Endpoints
`POST /api/v1/stories/:id/artifacts/:artifactId/approve`  
`POST /api/v1/stories/:id/artifacts/:artifactId/reject`

---

## Phase 8: Core Persistence (2 Sessions)

### 8.1 Wire Organization + Projects
`GET /api/v1/organizations` → set active tenant  
`GET /api/v1/projects` → replace in-memory seed list  
`POST /api/v1/projects` → create project

### 8.2 Wire Stories (Read)
`GET /api/v1/stories?projectId=X` → replace in-memory seed list

### 8.3 Wire Story Creation
1. `POST /api/v1/stories` — create DB row  
   **Note:** Current UI sends `owner: "Sara Malik"` (text name). DB requires `owner_id` (UUID). Update UI dropdown to send UUID from `GET /api/v1/users`.
2. Call metered Claude endpoint for initial breakdown
3. `PATCH /api/v1/stories/:id` → save `agent_outputs`
4. Refresh list

### 8.4 Wire Users
`GET /api/v1/users` → populate owner dropdowns with real UUIDs

---

## Phase 9: Extended + Polish (2 Sessions)

### 9.1 Wire Design Artifacts
Read/write `agent_outputs` JSONB via story endpoints.

### 9.2 Wire Governance Queue
`GET /api/v1/governance/queue` — query `gate_results` + `stories.governance_queue`.

### 9.3 Wire Audit Trail
`GET /api/v1/audit-events?storyId=X`

### 9.4 Add Error Boundaries + Loading States
Per screen. Handle 401 (redirect to login), 402 (budget exceeded), 422 (gate failure), 500 (generic).

### 9.5 Evidence Export (Real Download)
Generate Blob from artifacts + audit events. Trigger browser download.

---

## Phase 10: Documentation (0.5 Session)

Rewrite all docs to honestly reflect what works and what is deferred.

---

## Execution Order Summary

| Phase | Sessions | Deliverable |
|-------|----------|-------------|
| 0 | 1 | Vault healthy, API on PM2 port 4000, RLS migration applied |
| 1 | 2 | All PF-1 to PF-6 resolved, all packages compile |
| 2 | 2 | Cookie auth, login screen, RLS middleware |
| 3 | 1 | Schema migration 009, UI types aligned |
| 4 | 2 | Claude routes in Hono with metering, Nginx split |
| 5 | 1 | serveStatic + SPA fallback in Hono |
| 6 | 0.5 | Express deleted, single server on port 4000 |
| 7 | 3 | Workflow transitions, proof chain, gate results |
| 8 | 2 | Core persistence wired |
| 9 | 2 | Extended entities, error boundaries, evidence export |
| 10 | 0.5 | Honest documentation |
| **Total** | **17 sessions** | |

---

## Open Notes (Not Blockers)

1. **Migration number conflicts:** Verify migrations 006–010 do not conflict with existing migration files before running.
2. **Phase 7 transaction safety:** Steps 6–10 of the transition endpoint (gate_results → proof chain → state_transitions → stories update → audit_events) should ideally be wrapped in a single DB transaction to prevent partial state on failure.

---

## Deferred (Acknowledged — Not in Scope)

| Item | Why Deferred |
|------|-------------|
| `@forge/context-hub` | Empty package. Needs full implementation. |
| Real gate logic (SonarQube, Snyk) | External scanners not integrated. |
| 22-state FSM in UI | UI shows 6 phases. Sub-states require separate redesign. |
| Real connectors / OAuth | OAuth apps not configured. |
| Billing / Stripe | 501 stubs are intentional. |
