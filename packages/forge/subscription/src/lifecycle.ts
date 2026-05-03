import type { Subscription, SubscriptionStatus, Timestamp } from "@forge/contracts";

export type SubscriptionTransition =
  | { from: "trial"; to: "active"; trigger: "payment" }
  | { from: "trial"; to: "active"; trigger: "expiry" }
  | { from: "active"; to: "grace_period"; trigger: "expiry" }
  | { from: "active"; to: "upgraded"; trigger: "tier_change" }
  | { from: "active"; to: "downgraded"; trigger: "tier_change" }
  | { from: "grace_period"; to: "active"; trigger: "renewal" }
  | { from: "grace_period"; to: "suspended"; trigger: "grace_expiry" }
  | { from: "suspended"; to: "active"; trigger: "renewal_plus_payment" }
  | { from: "suspended"; to: "terminated"; trigger: "retention_expiry" };

export function canTransition(
  currentStatus: SubscriptionStatus,
  targetStatus: SubscriptionStatus
): boolean {
  const allowedTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
    trial: ["active"],
    active: ["grace_period", "upgraded", "downgraded"],
    grace_period: ["active", "suspended"],
    suspended: ["active", "terminated"],
    terminated: [],
    upgraded: ["active", "grace_period"],
    downgraded: ["active", "grace_period"],
  };
  return allowedTransitions[currentStatus]?.includes(targetStatus) ?? false;
}

export function isExpired(subscription: Subscription): boolean {
  if (!subscription.expiresAt) return false;
  return new Date(subscription.expiresAt) < new Date();
}

export function isInGracePeriod(subscription: Subscription): boolean {
  if (subscription.status !== "grace_period" || !subscription.expiresAt) return false;
  const graceEnd = new Date(subscription.expiresAt);
  graceEnd.setDate(graceEnd.getDate() + subscription.gracePeriodDays);
  return new Date() < graceEnd;
}

export function getEffectiveStatus(subscription: Subscription): SubscriptionStatus {
  if (subscription.status === "terminated") return "terminated";
  if (subscription.status === "suspended") return "suspended";
  if (subscription.status === "active" && isExpired(subscription)) return "grace_period";
  if (subscription.status === "grace_period" && !isInGracePeriod(subscription)) return "suspended";
  return subscription.status;
}

export function calculateExpiryDate(startDate: Timestamp, billingCycle: "monthly" | "annual"): Timestamp {
  const date = new Date(startDate);
  if (billingCycle === "annual") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString();
}
