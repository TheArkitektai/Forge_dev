import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowDown, CheckCircle2, Clock, History, RotateCcw, Scale, Server, ShieldAlert, Sparkles, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForge } from "@/forge/context";
import type { Story } from "@/forge/types";
import { cn } from "@/lib/utils";

export function ProductionRightRail({ story }: { story: Story }) {
  const { operateEvents, operateMetrics, resolveIncident, rollbackStory, scaleStory, reportProductionIssue } = useForge();
  const health = story.productionHealth;

  const storyIncidents = useMemo(() =>
    operateEvents.filter(e =>
      e.correlatedStoryId === story.id ||
      e.affectedServices.some(s => story.services.includes(s))
    ),
    [operateEvents, story]
  );

  const storyServices = useMemo(() =>
    operateMetrics.serviceHealthMap.filter(s => story.services.includes(s.service)),
    [operateMetrics, story]
  );

  if (!health) return null;

  return (
    <div className="space-y-4">
      {/* Health status panel */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.18)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Production health</p>
        <div className="mt-3 flex items-center gap-3">
          {health.status === "healthy" && <CheckCircle2 className="size-6 text-emerald-500" />}
          {health.status === "degraded" && <ShieldAlert className="size-6 text-amber-500" />}
          {health.status === "down" && <XCircle className="size-6 text-red-500" />}
          <div>
            <p className="text-lg font-semibold text-slate-950 capitalize">{health.status}</p>
            <p className="text-sm text-slate-500">{health.version} · {story.owner}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-[14px] border border-slate-100 bg-slate-50/60 px-3 py-2">
            <p className="text-[11px] text-slate-500">SLO</p>
            <p className="text-sm font-semibold text-slate-900">{health.sloCompliance}%</p>
          </div>
          <div className="rounded-[14px] border border-slate-100 bg-slate-50/60 px-3 py-2">
            <p className="text-[11px] text-slate-500">Errors</p>
            <p className="text-sm font-semibold text-slate-900">{health.errorRate}%</p>
          </div>
        </div>
      </motion.div>

      {/* Active incidents */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Active incidents</p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{storyIncidents.filter(e => e.status !== "resolved" && e.status !== "learning_captured").length}</span>
        </div>
        <div className="mt-3 space-y-2">
          <AnimatePresence>
            {storyIncidents.length > 0 ? (
              storyIncidents.slice(0, 4).map(event => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-[12px] border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{event.title}</p>
                    <span className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                      event.severity === "critical" ? "bg-red-50 text-red-700 ring-1 ring-red-100" :
                      event.severity === "warning" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100" :
                      "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                    )}>
                      {event.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{event.source}</p>
                  {event.status !== "resolved" && event.status !== "learning_captured" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveIncident(event.id)}
                      className="mt-2 h-auto rounded-full px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="mr-1 size-3" />
                      Resolve
                    </Button>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No incidents affecting this story.</p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Service health */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.18)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Service health</p>
        <div className="mt-3 space-y-2">
          {storyServices.map(service => (
            <div key={service.service} className="flex items-center justify-between rounded-[12px] border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">{service.service}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", service.status === "healthy" ? "bg-emerald-500" : service.status === "degraded" ? "bg-amber-500" : "bg-red-500")} />
                <span className="text-xs font-semibold capitalize text-slate-600">{service.status}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Deployment history */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.18)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Deployment history</p>
        <div className="mt-3 space-y-2">
          {health.deploymentHistory.map((deploy, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-[12px] border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <History className="size-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">{deploy.version}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {new Date(deploy.deployedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  deploy.status === "success" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" :
                  deploy.status === "rollback" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100" :
                  "bg-red-50 text-red-700 ring-1 ring-red-100"
                )}>
                  {deploy.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.18)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Quick actions</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => rollbackStory(story.id)}
            className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Rollback
          </Button>
          <Button
            variant="outline"
            onClick={() => scaleStory(story.id)}
            className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Scale className="mr-1.5 size-3.5" />
            Scale
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => reportProductionIssue(story.id, `Issue on ${story.title}`, "warning")}
          className="mt-2 w-full rounded-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
        >
          <Sparkles className="mr-1.5 size-3.5" />
          Report issue
        </Button>
      </motion.div>
    </div>
  );
}
