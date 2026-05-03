import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ContextBudgetAllocation } from "@/forge/types";

type Props = {
  allocation: ContextBudgetAllocation;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: { container: "size-24", text: "text-lg", sub: "text-[10px]" },
  md: { container: "size-36", text: "text-2xl", sub: "text-xs" },
  lg: { container: "size-48", text: "text-3xl", sub: "text-sm" },
};

const segmentColors = {
  designArtifact: "#0ea5e9",
  codebaseUnderstanding: "#10b981",
  relatedPatterns: "#f59e0b",
  governanceRules: "#64748b",
};

export function ContextBudgetGauge({ allocation, size = "md" }: Props) {
  const { container, text, sub } = sizeClasses[size];
  const percent = Math.min(100, Math.round((allocation.used / allocation.total) * 100));

  const colorClass = useMemo(() => {
    if (percent < 60) return "text-emerald-600";
    if (percent < 85) return "text-amber-600";
    return "text-red-600";
  }, [percent]);

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percent / 100) * circumference;

  const segments = [
    { key: "designArtifact" as const, label: "Design Artifact", pct: allocation.breakdown.designArtifact.used / allocation.total },
    { key: "codebaseUnderstanding" as const, label: "Codebase", pct: allocation.breakdown.codebaseUnderstanding.used / allocation.total },
    { key: "relatedPatterns" as const, label: "Patterns", pct: allocation.breakdown.relatedPatterns.used / allocation.total },
    { key: "governanceRules" as const, label: "Governance", pct: allocation.breakdown.governanceRules.used / allocation.total },
  ];

  let runningOffset = 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn("relative", container)}>
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          {segments.map(seg => {
            const segCircumference = 2 * Math.PI * 40;
            const segOffset = segCircumference - seg.pct * segCircumference;
            const startOffset = runningOffset;
            runningOffset += seg.pct * segCircumference;
            return (
              <circle
                key={seg.key}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={segmentColors[seg.key]}
                strokeWidth="8"
                strokeDasharray={segCircumference}
                strokeDashoffset={segOffset}
                strokeLinecap="butt"
                style={{ transform: `rotate(${(startOffset / segCircumference) * 360}deg)`, transformOrigin: "50% 50%" }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-[family-name:var(--font-display)] font-semibold tracking-[-0.04em]", text, colorClass)}>{percent}%</span>
          <span className={cn("text-slate-400", sub)}>used</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {segments.map(seg => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: segmentColors[seg.key] }} />
            <span className="text-xs text-slate-500">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
