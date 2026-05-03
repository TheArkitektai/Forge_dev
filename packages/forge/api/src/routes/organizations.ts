import { Hono } from "hono";
import { sql } from "@forge/db";
import { authMiddleware } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { subscriptionMiddleware } from "../middleware/subscription.js";
import type { Variables } from "../middleware/auth.js";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);
app.use("*", subscriptionMiddleware);

app.get("/", requirePermission("org:read"), async (c) => {
  const user = c.get("user");
  const rows = await sql`
    SELECT id, name, slug, region, created_at, updated_at
    FROM organizations
    WHERE id = ${user.org}
  `;
  if (rows.length === 0) return c.json({ code: "NOT_FOUND", message: "Organization not found" }, 404);
  return c.json({ data: rows[0] });
});

app.patch("/:id", requirePermission("org:write"), async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const user = c.get("user");
  if (id !== user.org) {
    return c.json({ code: "FORBIDDEN", message: "Cannot modify other organizations" }, 403);
  }
  const rows = await sql`
    UPDATE organizations
    SET name = COALESCE(${body.name ?? null}, name),
        region = COALESCE(${body.region ?? null}, region),
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, slug, region, created_at, updated_at
  `;
  if (rows.length === 0) return c.json({ code: "NOT_FOUND", message: "Organization not found" }, 404);
  return c.json({ data: rows[0] });
});

export default app;
