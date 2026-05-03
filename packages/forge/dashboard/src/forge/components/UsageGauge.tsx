import { cn } from "@/lib/utils";
import type { UsageData } from "@/forge/hooks/useApiData";

type Props = {
  usage: UsageData | null;
  loading?: boolean;
};

export function UsageGauge({ usage, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)] animate-pulse">
        <div className="h-4 w-1/3 bg-slate-200 rounded mb-3"></div>
        <div className="h-8 w-2/3 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Usage</p>
        <p className="mt-2 text-sm text-slate-400">No usage data available</p>
      </div>
    );
  }

  const percent = usage.usagePercent ?? 0;
  const colorClass = percent < 60 ? "text-emerald-600" : percent < 85 ? "text-amber-600" : "text-red-600";
  const barColor = percent < 60 ? "bg-emerald-500" : percent < 85 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Token Usage</p>
        <span className={cn("text-sm font-semibold", colorClass)}>{percent}%</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
        <div
          className={cn("h-2 rounded-full transition-all", barColor)}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-sm text-slate-600">
        <span>{usage.usedTokens.toLocaleString()} used</span>
        <span>{usage.remainingTokens.toLocaleString()} remaining</span>
      </div>
    </div>
  );
}
