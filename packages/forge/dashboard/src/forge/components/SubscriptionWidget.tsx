import { BadgeCheck, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionData } from "@/forge/hooks/useApiData";

type Props = {
  subscription: SubscriptionData | null;
  loading?: boolean;
};

export function SubscriptionWidget({ subscription, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)] animate-pulse">
        <div className="h-4 w-1/3 bg-slate-200 rounded mb-3"></div>
        <div className="h-8 w-2/3 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Subscription</p>
        <p className="mt-2 text-sm text-slate-400">No subscription data available</p>
      </div>
    );
  }

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    active: { icon: <BadgeCheck className="size-4" />, color: "text-emerald-700", bg: "bg-emerald-50 ring-emerald-100" },
    grace_period: { icon: <AlertTriangle className="size-4" />, color: "text-amber-700", bg: "bg-amber-50 ring-amber-100" },
    suspended: { icon: <XCircle className="size-4" />, color: "text-red-700", bg: "bg-red-50 ring-red-100" },
    trial: { icon: <BadgeCheck className="size-4" />, color: "text-sky-700", bg: "bg-sky-50 ring-sky-100" },
  };

  const config = statusConfig[subscription.status] || statusConfig.active;

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Subscription</p>
        <span className={cn("flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ring-1", config.bg, config.color)}>
          {config.icon}
          {subscription.status}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-xl font-semibold text-slate-950">{subscription.tier_name}</p>
        <p className="mt-1 text-sm text-slate-500">
          {subscription.included_tokens_monthly.toLocaleString()} tokens / {subscription.billing_cycle}
        </p>
      </div>
    </div>
  );
}
