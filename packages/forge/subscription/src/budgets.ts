import type { TenantBudget, UUID } from "@forge/contracts";

export interface BudgetCheckResult {
  withinBudget: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  alertLevel: "none" | "warning" | "critical";
  action: "allow" | "warn" | "block";
}

export function checkBudget(
  budget: TenantBudget,
  currentUsage: number
): BudgetCheckResult {
  const limit = budget.monthlyTokenLimit;
  const remaining = Math.max(0, limit - currentUsage);
  const percentUsed = limit > 0 ? (currentUsage / limit) * 100 : 0;

  let alertLevel: "none" | "warning" | "critical" = "none";
  let action: "allow" | "warn" | "block" = "allow";

  if (percentUsed >= budget.alertThresholdPct3) {
    alertLevel = "critical";
    action = budget.onLimitReached === "block" ? "block" : "warn";
  } else if (percentUsed >= budget.alertThresholdPct2) {
    alertLevel = "warning";
    action = "warn";
  } else if (percentUsed >= budget.alertThresholdPct1) {
    alertLevel = "warning";
    action = "allow";
  }

  return {
    withinBudget: currentUsage < limit,
    currentUsage,
    limit,
    remaining,
    percentUsed: Math.round(percentUsed * 100) / 100,
    alertLevel,
    action,
  };
}

export function createBudget(
  organizationId: UUID,
  scopeType: TenantBudget["scopeType"],
  scopeId: UUID,
  monthlyTokenLimit: number,
  options: {
    alertThresholdPct1?: number;
    alertThresholdPct2?: number;
    alertThresholdPct3?: number;
    onLimitReached?: TenantBudget["onLimitReached"];
  } = {}
): Omit<TenantBudget, "id" | "createdAt" | "updatedAt"> {
  return {
    organizationId,
    scopeType,
    scopeId,
    monthlyTokenLimit,
    alertThresholdPct1: options.alertThresholdPct1 ?? 80,
    alertThresholdPct2: options.alertThresholdPct2 ?? 90,
    alertThresholdPct3: options.alertThresholdPct3 ?? 100,
    onLimitReached: options.onLimitReached ?? "block",
  };
}
