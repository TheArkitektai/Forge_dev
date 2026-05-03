import { AlertTriangle, Ban, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BudgetData, UsageData } from "@/forge/hooks/useApiData";

type Props = {
  budgets: BudgetData[];
  usage: UsageData | null;
  loading?: boolean;
};

export function BudgetAlertBanner({ budgets, usage, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)] animate-pulse">
        <div className="h-4 w-1/3 bg-slate-200 rounded mb-3"></div>
        <div className="h-8 w-2/3 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (!usage || budgets.length === 0) {
    return (
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Budget Alerts</p>
        <p className="mt-2 text-sm text-slate-400">No budget alerts configured</p>
      </div>
    );
  }

  const alerts: { level: number; message: string; action: string; color: string; bg: string; icon: React.ReactNode }[] = [];

  for (const budget of budgets) {
    const pct = usage.includedTokensMonthly > 0
      ? (usage.usedTokens / budget.monthly_token_limit) * 100
      : 0;

    if (pct >= budget.alert_threshold_pct_3) {
      alerts.push({
        level: 3,
        message: `Budget ${budget.scope_type} at ${Math.round(pct)}%`,
        action: budget.on_limit_reached,
        color: "text-red-700",
        bg: "bg-red-50 border-red-100",
        icon: <Ban className="size-4" />,
      });
    } else if (pct >= budget.alert_threshold_pct_2) {
      alerts.push({
        level: 2,
        message: `Budget ${budget.scope_type} at ${Math.round(pct)}%`,
        action: budget.on_limit_reached,
        color: "text-amber-700",
        bg: "bg-amber-50 border-amber-100",
        icon: <AlertTriangle className="size-4" />,
      });
    } else if (pct >= budget.alert_threshold_pct_1) {
      alerts.push({
        level: 1,
        message: `Budget ${budget.scope_type} at ${Math.round(pct)}%`,
        action: budget.on_limit_reached,
        color: "text-sky-700",
        bg: "bg-sky-50 border-sky-100",
        icon: <ArrowUpCircle className="size-4" />,
      });
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/60 p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 p-1.5 text-emerald-700">
            <BadgeCheck className="size-4" />
          </span>
          <p className="text-sm font-semibold text-emerald-800">All budgets within limits</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div key={i} className={cn("rounded-[20px] border p-5", alert.bg)}>
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full p-1.5", alert.color)}>{alert.icon}</span>
            <div>
              <p className={cn("text-sm font-semibold", alert.color)}>{alert.message}</p>
              <p className="text-xs text-slate-500">Action: {alert.action}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BadgeCheck(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
