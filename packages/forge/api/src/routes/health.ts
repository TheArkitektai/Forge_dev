import { Hono } from "hono";
import { sql } from "@forge/db";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString() });
});

app.get("/ready", async (c) => {
  try {
    await sql`SELECT 1`;
    return c.json({ status: "ready", checks: { database: "ok" } });
  } catch (e) {
    return c.json({ status: "not_ready", checks: { database: "error" } }, 503);
  }
});

export default app;
