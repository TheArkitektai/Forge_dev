import { createMiddleware } from "hono/factory";
import { verifyToken } from "../lib/jwt.js";
import type { TokenPayload } from "../lib/jwt.js";
import type { SubscriptionCheck } from "./subscription.js";

export interface Variables {
  user: TokenPayload;
  subscription: SubscriptionCheck;
}

export const authMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const header = c.req.header("authorization");
    if (!header || !header.startsWith("Bearer ")) {
      return c.json({ code: "UNAUTHORIZED", message: "Missing or invalid authorization header" }, 401);
    }
    const token = header.slice(7);
    try {
      const payload = await verifyToken(token);
      c.set("user", payload);
      await next();
    } catch {
      return c.json({ code: "UNAUTHORIZED", message: "Invalid or expired token" }, 401);
    }
  }
);
