import { Hono } from "hono";
import { sql } from "@forge/db";
import { authMiddleware } from "../middleware/auth.js";
import { requirePermission, requireRole } from "../middleware/rbac.js";
import { subscriptionMiddleware } from "../middleware/subscription.js";
import type { Variables } from "../middleware/auth.js";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);
app.use("*", subscriptionMiddleware);

app.get("/", requirePermission("org:read"), async (c) => {
  const user = c.get("user");
  const rows = await sql`
    SELECT u.id, u.email, u.name, u.role_id, u.created_at, u.updated_at, r.key as role_key
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.organization_id = ${user.org}
    ORDER BY u.created_at DESC
  `;
  return c.json({ data: rows });
});

app.post("/", requireRole("tenant_admin", "platform_admin"), async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const roleRows = await sql`SELECT id FROM roles WHERE key = ${body.role}`;
  if (roleRows.length === 0) {
    return c.json({ code: "BAD_REQUEST", message: "Invalid role" }, 400);
  }
  const rows = await sql`
    INSERT INTO users (organization_id, email, name, role_id, created_at, updated_at)
    VALUES (${user.org}, ${body.email}, ${body.name}, ${roleRows[0].id}, NOW(), NOW())
    RETURNING id, email, name, role_id, created_at, updated_at
  `;
  return c.json({ data: rows[0] }, 201);
});

app.get("/me", async (c) => {
  const user = c.get("user");
  const rows = await sql`
    SELECT u.id, u.email, u.name, u.role_id, r.key as role_key, u.created_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ${user.sub}
  `;
  if (rows.length === 0) return c.json({ code: "NOT_FOUND", message: "User not found" }, 404);
  return c.json({ data: rows[0] });
});

export default app;
