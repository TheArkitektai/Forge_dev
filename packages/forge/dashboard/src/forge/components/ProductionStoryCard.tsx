import { motion } from "framer-motion";
import { ArrowDown, CheckCircle2, AlertTriangle, XCircle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Story } from "@/forge/types";
import { ServiceHealthSparkline } from "./ServiceHealthSparkline";

export function ProductionStoryCard({
  story,
  isSelected,
  onClick,
}: {
  story: Story;
  isSelected: boolean;
  onClick: () => void;
}) {
  const health = story.productionHealth;
  if (!health) return null;

  const healthConfig = {
    healthy: { icon: CheckCircle2, color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-100", label: "Healthy" },
    degraded: { icon: AlertTriangle, color: "#f59e0b", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-100", label: "Degraded" },
    down: { icon: XCircle, color: "#ef4444", bg: "bg-red-50", text: "text-red-700", ring: "ring-red-100", label: "Down" },
  }[health.status];

  const HealthIcon = healthConfig.icon;

  const deployedAgo = (() => {
    const days = Math.floor((Date.now() - new Date(health.deployedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  })();

  const errorTrendColor = health.errorRate > 1.0 ? "#ef4444" : health.errorRate > 0.5 ? "#f59e0b" : "#10b981";

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[16px] border p-4 text-left transition",
        isSelected
          ? "border-slate-900 bg-slate-950 text-white shadow-[0_20px_40px_-30px_rgba(15,23,42,0.7)]"
          : "border-slate-200 bg-white hover:border-sky-200 hover:shadow-lg hover:scale-[1.01]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("rounded-xl p-1.5 ring-1", isSelected ? "bg-white/10 text-white ring-white/20" : `${healthConfig.bg} ${healthConfig.text} ${healthConfig.ring}`)}>
            <HealthIcon className="size-4" />
          </span>
          <span className={cn("text-sm font-semibold", isSelected ? "text-white" : "text-slate-950")}>
            {healthConfig.label}
          </span>
        </div>
        {health.activeIncidentCount > 0 && (
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold",
            isSelected ? "bg-red-400/20 text-red-200" : "bg-red-50 text-red-700 ring-1 ring-red-100"
          )}>
            {health.activeIncidentCount} active
          </span>
        )}
      </div>

      <p className={cn("mt-3 text-base font-semibold", isSelected ? "text-white" : "text-slate-950")}>
        {story.title}
      </p>
      <p className={cn("mt-1 text-sm", isSelected ? "text-white/70" : "text-slate-500")}>
        {story.owner}
      </p>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className={cn("flex items-center gap-1.5 text-xs", isSelected ? "text-white/60" : "text-slate-500")}>
            <Clock className="size-3.5" />
            Deployed {deployedAgo}
          </span>
          <span className={cn("text-xs font-semibold", isSelected ? "text-white/80" : "text-slate-700")}>
            {health.version}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={cn("text-xs", isSelected ? "text-white/60" : "text-slate-500")}>SLO</span>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-semibold", health.sloCompliance >= 99 ? (isSelected ? "text-emerald-300" : "text-emerald-700") : health.sloCompliance >= 95 ? (isSelected ? "text-amber-300" : "text-amber-700") : (isSelected ? "text-red-300" : "text-red-700"))}>
              {health.sloCompliance.toFixed(1)}%
            </span>
            {health.sloCompliance >= 99 ? <CheckCircle2 className={cn("size-3.5", isSelected ? "text-emerald-300" : "text-emerald-600")} /> : <AlertTriangle className={cn("size-3.5", isSelected ? "text-amber-300" : "text-amber-600")} />}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={cn("text-xs", isSelected ? "text-white/60" : "text-slate-500")}>Error rate</span>
          <div className="flex items-center gap-2">
            <ServiceHealthSparkline data={health.errorRateTrend} color={isSelected ? "#ffffff" : errorTrendColor} />
            <span className={cn("text-sm font-semibold", isSelected ? "text-white/80" : "text-slate-700")}>
              {health.errorRate}%
            </span>
            {health.errorRateTrend[health.errorRateTrend.length - 1] > health.errorRateTrend[0] ? (
              <ArrowDown className={cn("size-3 rotate-180", isSelected ? "text-red-300" : "text-red-500")} />
            ) : (
              <ArrowDown className={cn("size-3", isSelected ? "text-emerald-300" : "text-emerald-500")} />
            )}
          </div>
        </div>
      </div>

      <div className={cn("mt-4 flex items-center gap-2 text-[11px] font-semibold", isSelected ? "text-white/60" : "text-slate-500")}>
        <Zap className="size-3.5" />
        {health.deploymentHistory[0]?.status === "success" ? "Last deploy succeeded" : "Last deploy rolled back"}
      </div>
    </motion.button>
  );
}
