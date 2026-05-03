import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type DeliveryMode = "development" | "production";

type DeliveryModeSwitcherProps = {
  mode: DeliveryMode;
  onChange: (mode: DeliveryMode) => void;
  devCount: number;
  liveCount: number;
};

export function DeliveryModeSwitcher({ mode, onChange, devCount, liveCount }: DeliveryModeSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() => onChange("development")}
        className={cn(
          "relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
          mode === "development" ? "text-white" : "text-slate-600 hover:text-slate-900"
        )}
      >
        {mode === "development" && (
          <motion.div
            layoutId="delivery-mode-bg"
            className="absolute inset-0 rounded-full bg-slate-950"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          />
        )}
        <span className="relative z-10">In Development</span>
        <span className={cn(
          "relative z-10 rounded-full px-2 py-0.5 text-[10px] font-bold",
          mode === "development" ? "bg-white/15 text-white" : "bg-slate-200 text-slate-600"
        )}>
          {devCount}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange("production")}
        className={cn(
          "relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
          mode === "production" ? "text-white" : "text-slate-600 hover:text-slate-900"
        )}
      >
        {mode === "production" && (
          <motion.div
            layoutId="delivery-mode-bg"
            className="absolute inset-0 rounded-full bg-slate-950"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          />
        )}
        <span className="relative z-10">Live in Production</span>
        <span className={cn(
          "relative z-10 rounded-full px-2 py-0.5 text-[10px] font-bold",
          mode === "production" ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
        )}>
          {liveCount}
        </span>
      </button>
    </div>
  );
}
