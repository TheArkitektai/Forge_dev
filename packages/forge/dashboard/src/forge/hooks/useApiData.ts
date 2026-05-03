import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";

export interface SubscriptionData {
  id: string;
  status: string;
  tier_name: string;
  tier_slug: string;
  included_tokens_monthly: number;
  hard_cap_tokens_monthly: number;
  expires_at: string;
  billing_cycle: string;
}

export interface UsageData {
  includedTokensMonthly: number;
  hardCapTokensMonthly: number;
  usedTokens: number;
  remainingTokens: number;
  usagePercent: number;
  period: string;
}

export interface BudgetData {
  id: string;
  scope_type: string;
  scope_id: string;
  monthly_token_limit: number;
  alert_threshold_pct_1: number;
  alert_threshold_pct_2: number;
  alert_threshold_pct_3: number;
  on_limit_reached: string;
}

export function useApiData() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subRes, usageRes, budgetsRes] = await Promise.all([
        api.getSubscription(),
        api.getUsage(),
        api.getBudgets(),
      ]);
      setSubscription(subRes.data as SubscriptionData);
      setUsage(usageRes.data as UsageData);
      setBudgets((budgetsRes.data as BudgetData[]) ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { subscription, usage, budgets, loading, error, refetch: fetchAll };
}
