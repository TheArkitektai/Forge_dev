import { Hono } from "hono";
import { sql } from "@forge/db";
import { authMiddleware } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { subscriptionMiddleware } from "../middleware/subscription.js";
import type { Variables } from "../middleware/auth.js";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);
app.use("*", subscriptionMiddleware);

app.get("/", requirePermission("story:read"), async (c) => {
  const user = c.get("user");
  const projectId = c.req.query("projectId");
  let rows;
  if (projectId) {
    rows = await sql`
      SELECT s.id, s.project_id, s.title, s.description, s.phase, s.owner_id, s.risk, s.confidence, s.created_at, s.updated_at
      FROM stories s
      JOIN projects p ON s.project_id = p.id
      WHERE p.organization_id = ${user.org} AND s.project_id = ${projectId}
      ORDER BY s.created_at DESC
    `;
  } else {
    rows = await sql`
      SELECT s.id, s.project_id, s.title, s.description, s.phase, s.owner_id, s.risk, s.confidence, s.created_at, s.updated_at
      FROM stories s
      JOIN projects p ON s.project_id = p.id
      WHERE p.organization_id = ${user.org}
      ORDER BY s.created_at DESC
    `;
  }
  return c.json({ data: rows });
});

app.post("/", requirePermission("story:create"), async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const projCheck = await sql`
    SELECT id FROM projects WHERE id = ${body.projectId} AND organization_id = ${user.org}
  `;
  if (projCheck.length === 0) {
    return c.json({ code: "FORBIDDEN", message: "Project not found or not in your organization" }, 403);
  }
  const rows = await sql`
    INSERT INTO stories (project_id, title, description, phase, owner_id, risk, confidence, created_at, updated_at)
    VALUES (${body.projectId}, ${body.title}, ${body.description ?? ""}, ${body.phase ?? "Plan"}, ${user.sub}, ${body.risk ?? "Low"}, ${body.confidence ?? 0}, NOW(), NOW())
    RETURNING id, project_id, title, description, phase, owner_id, risk, confidence, created_at, updated_at
  `;
  return c.json({ data: rows[0] }, 201);
});

app.get("/:id", requirePermission("story:read"), async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const rows = await sql`
    SELECT s.id, s.project_id, s.title, s.description, s.phase, s.owner_id, s.risk, s.confidence, s.created_at, s.updated_at
    FROM stories s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = ${id} AND p.organization_id = ${user.org}
  `;
  if (rows.length === 0) return c.json({ code: "NOT_FOUND", message: "Story not found" }, 404);
  return c.json({ data: rows[0] });
});

app.patch("/:id", requirePermission("story:write"), async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const user = c.get("user");
  const rows = await sql`
    UPDATE stories s
    SET title = COALESCE(${body.title ?? null}, title),
        description = COALESCE(${body.description ?? null}, description),
        phase = COALESCE(${body.phase ?? null}, phase),
        risk = COALESCE(${body.risk ?? null}, risk),
        confidence = COALESCE(${body.confidence ?? null}, confidence),
        updated_at = NOW()
    FROM projects p
    WHERE s.id = ${id} AND s.project_id = p.id AND p.organization_id = ${user.org}
    RETURNING s.id, s.project_id, s.title, s.description, s.phase, s.owner_id, s.risk, s.confidence, s.created_at, s.updated_at
  `;
  if (rows.length === 0) return c.json({ code: "NOT_FOUND", message: "Story not found" }, 404);
  return c.json({ data: rows[0] });
});

app.delete("/:id", requirePermission("story:delete"), async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const rows = await sql`
    DELETE FROM stories s
    USING projects p
    WHERE s.id = ${id} AND s.project_id = p.id AND p.organization_id = ${user.org}
    RETURNING s.id
  `;
  if (rows.length === 0) return c.json({ code: "NOT_FOUND", message: "Story not found" }, 404);
  return c.json({ data: { deleted: true } });
});

export default app;
