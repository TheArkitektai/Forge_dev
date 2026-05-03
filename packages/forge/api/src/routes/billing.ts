import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import type { Variables } from "../middleware/auth.js";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);

// Placeholder: Stripe customer creation (Session 05 gap)
app.post("/customer", requirePermission("subscription:write"), async (c) => {
  return c.json({
    code: "NOT_IMPLEMENTED",
    message: "Stripe customer creation is a Session 05 placeholder. Requires STRIPE_SECRET_KEY env var.",
    data: { customerId: null, status: "placeholder" },
  }, 501);
});

// Placeholder: Payment intent creation (Session 05 gap)
app.post("/payment-intent", requirePermission("subscription:write"), async (c) => {
  return c.json({
    code: "NOT_IMPLEMENTED",
    message: "Stripe payment intent is a Session 05 placeholder. Requires STRIPE_SECRET_KEY env var.",
    data: { clientSecret: null, status: "placeholder" },
  }, 501);
});

// Placeholder: Stripe webhook handler (Session 05 gap)
app.post("/webhook", async (c) => {
  const signature = c.req.header("stripe-signature") || "";
  
  console.log("[billing/webhook] Received Stripe webhook placeholder", { type: c.req.header("stripe-event-type"), signature: signature.slice(0, 10) + "..." });
  return c.json({ received: true, placeholder: true, note: "Session 05: Stripe webhook handler not yet implemented." });
});

export default app;
