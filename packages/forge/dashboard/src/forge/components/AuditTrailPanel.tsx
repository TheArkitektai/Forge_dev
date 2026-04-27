import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, ChevronUp, FileCheck, GitMerge, Settings2, ShieldCheck, Zap } from "lucide-react";
import { useForge } from "@/forge/context";
import { cn } from "@/lib/utils";
import type { AuditEvent } from "@/forge/types";

const typeIcons: Record<AuditEvent["type"], typeof ShieldCheck> = {
  "state-change": GitMerge,
  "approval": ShieldCheck,
  "ai-action": Bot,
  "config-change": Settings2,
  "connector-event": Zap,
  "evidence-generated": FileCheck,
};

const typeColors: Record<AuditEvent["type"], string> = {
  "state-change": "bg-sky-50 text-sky-700 ring-sky-100",
  "approval": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "ai-action": "bg-violet-50 text-violet-700 ring-violet-100",
  "config-change": "bg-slate-100 text-slate-700 ring-slate-200",
  "connector-event": "bg-amber-50 text-amber-700 ring-amber-100",
  "evidence-generated": "bg-indigo-50 text-indigo-700 ring-indigo-100",
};

const typeLabels: Record<AuditEvent["type"], string> = {
  "state-change": "State change",
  "approval": "Approval",
  "ai-action": "AI action",
  "config-change": "Config",
  "connector-event": "Connector",
  "evidence-generated": "Evidence",
};

export function AuditTrailPanel() {
  const { auditTrailEvents } = useForge();
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<AuditEvent["type"] | "all">("all");

  const filtered = auditTrailEvents.filter(e => filter === "all" || e.type === filter);
  const visible = expanded ? filtered : filtered.slice(0, 5);

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Audit trail</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">Immutable event log</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
          {auditTrailEvents.length} events
        </span>
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["all", "state-change", "approval", "ai-action", "connector-event", "evidence-generated"] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
              filter === f
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
            )}
          >
            {f === "all" ? "All" : typeLabels[f]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.map((event, i) => {
          const Icon = typeIcons[event.type];
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3"
            >
              <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl ring-1", typeColors[event.type])}>
                <Icon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  <span className="shrink-0 text-[11px] text-slate-400">{event.timestamp.split(" ").slice(-2).join(" ")}</span>
                </div>
                <p className="mt-0.5 text-sm text-slate-600 line-clamp-2">{event.detail}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">{event.actor}</span>
                  <span className="text-[11px] text-slate-300">·</span>
                  <span className="font-mono text-[11px] text-slate-400">{event.proofHash}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-slate-200 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-700"
        >
          {expanded ? (
            <><ChevronUp className="size-4" /> Show fewer</>
          ) : (
            <><ChevronDown className="size-4" /> Show all {filtered.length} events</>
          )}
        </button>
      )}
    </div>
  );
}
