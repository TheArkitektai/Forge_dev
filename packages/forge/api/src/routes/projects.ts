import { Hono } from "hono";
import { sql } from "@forge/db";
import { authMiddleware } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { subscriptionMiddleware } from "../middleware/subscription.js";
import type { Variables } from "../middleware/auth.js";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);
app.use("*", subscriptionMiddleware);

app.get("/", requirePermission("project:read"), async (c) => {
  const user = c.get("user");
  const rows = await sql`
    SELECT id, name, description, phase, status, owner_id, created_at, updated_at
    FROM projects
    WHERE organization_id = ${user.org}
    ORDER BY created_at DESC
  `;
  return c.json({ data: rows });
});

app.post("/", requirePermission("project:create"), async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const rows = await sql`
    INSERT INTO projects (organization_id, name, description, phase, status, owner_id, created_at, updated_at)
    VALUES (${user.org}, ${body.name}, ${body.description ?? ""}, ${body.phase ?? "Plan"}, ${body.status ?? "Planning"}, ${user.sub}, NOW(), NOW())
    RETURNING id, name, description, phase, status, owner_id, created_at, updated_at
  `;
  return c.json({ data: rows[0] }, 201);
});

app.get("/:id", requirePermission("project:read"), async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const rows = await sql`
    SELECT id, name, description, phase, status, owner_id, created_at, updated_at
    FROM projects
    WHERE id = ${id} AND organization_id = ${user.org}
  `;
  if (rows.length === 0) return c.json({ code: "NOT_FOUND", message: "Project not found" }, 404);
  return c.json({ data: rows[0] });
});

app.patch("/:id", requirePermission("project:write"), async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const user = c.get("user");
  const rows = await sql`
    UPDATE projects
    SET name = COALESCE(${body.name ?? null}, name),
        description = COALESCE(${body.description ?? null}, description),
        phase = COALESCE(${body.phase ?? null}, phase),
        status = COALESCE(${body.status ?? null}, status),
        updated_at = NOW()
    WHERE id = ${id} AND organization_id = ${user.org}
    RETURNING id, name, description, phase, status, owner_id, created_at, updated_at
  `;
  if (rows.length === 0) return c.json({ code: "NOT_FOUND", message: "Project not found" }, 404);
  return c.json({ data: rows[0] });
});

app.delete("/:id", requirePermission("project:delete"), async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const rows = await sql`
    DELETE FROM projects
    WHERE id = ${id} AND organization_id = ${user.org}
    RETURNING id
  `;
  if (rows.length === 0) return c.json({ code: "NOT_FOUND", message: "Project not found" }, 404);
  return c.json({ data: { deleted: true } });
});

export default app;
