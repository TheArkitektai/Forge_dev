import { createMiddleware } from "hono/factory";
import type { Variables } from "./auth.js";
import { sql } from "@forge/db";

export interface SubscriptionCheck {
  status: string;
  tierSlug: string;
  expiresAt: string;
  isActive: boolean;
  isInGrace: boolean;
}

export async function getSubscriptionStatus(orgId: string): Promise<SubscriptionCheck> {
  const rows = await sql`
    SELECT s.status, t.slug as tier_slug, s.expires_at, s.grace_period_days
    FROM subscriptions s
    JOIN subscription_tiers t ON s.tier_id = t.id
    WHERE s.organization_id = ${orgId}
    ORDER BY s.created_at DESC
    LIMIT 1
  `;
  if (rows.length === 0) {
    return { status: "none", tierSlug: "none", expiresAt: "", isActive: false, isInGrace: false };
  }
  const row = rows[0];
  const now = new Date();
  const expiresAt = new Date(row.expires_at);
  const graceEnd = new Date(expiresAt.getTime() + (row.grace_period_days || 0) * 86400000);
  const isActive = row.status === "active" || row.status === "trial" || row.status === "upgraded" || row.status === "downgraded";
  const isInGrace = row.status === "grace_period" || (now > expiresAt && now <= graceEnd && row.status !== "suspended" && row.status !== "terminated");
  return {
    status: row.status,
    tierSlug: row.tier_slug,
    expiresAt: row.expires_at,
    isActive: isActive || isInGrace,
    isInGrace,
  };
}

export const subscriptionMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const user = c.get("user");
    const sub = await getSubscriptionStatus(user.org);
    if (!sub.isActive) {
      return c.json({
        code: "SUBSCRIPTION_EXPIRED",
        message: sub.isInGrace
          ? "Subscription is in grace period. Renew to restore full access."
          : "Subscription is not active. Please renew your subscription.",
        details: { status: sub.status, expiresAt: sub.expiresAt },
      }, 403);
    }
    c.set("subscription", sub);
    return await next();
  }
);
