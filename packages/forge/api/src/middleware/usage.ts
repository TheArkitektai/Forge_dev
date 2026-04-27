import { createMiddleware } from "hono/factory";
import type { Variables } from "./auth.js";

export const usageTrackingMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    const user = c.get("user");
    const path = c.req.path;
    const method = c.req.method;
    const status = c.res.status;

    // TODO: Persist to api_usage_events table (Session 16)
    // Fire and forget — do not block response
    if (process.env.NODE_ENV !== "test") {
      console.log(`[API] ${method} ${path} ${status} ${duration}ms org=${user.org} user=${user.sub}`);
    }
  }
);
