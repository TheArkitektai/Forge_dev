import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Code2, ExternalLink, GitPullRequest, GitMerge, RotateCcw, AlertTriangle, Sparkles, Timer, FileCode, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContextBudgetGauge } from "@/forge/components/ContextBudgetGauge";
import { ExplainabilityModal } from "@/forge/components/ExplainabilityModal";
import { cn } from "@/lib/utils";
import type { CodeExecutionRun, ExecutionIteration } from "@/forge/types";

type Props = {
  run: CodeExecutionRun;
};

const actionIcons: Record<string, typeof Code2> = {
  generate: Code2,
  test: TestTube,
  fix: RotateCcw,
  escalate: AlertTriangle,
};

const actionLabels: Record<string, string> = {
  generate: "Generate",
  test: "Test",
  fix: "Fix",
  escalate: "Escalate",
};

const statusConfig: Record<string, { label: string; tone: string; bg: string; icon: typeof CheckCircle2 }> = {
  idle: { label: "Idle", tone: "text-slate-600", bg: "bg-slate-100", icon: Timer },
  generating: { label: "Generating", tone: "text-sky-600", bg: "bg-sky-50", icon: Code2 },
  testing: { label: "Testing", tone: "text-amber-600", bg: "bg-amber-50", icon: TestTube },
  iterating: { label: "Iterating", tone: "text-sky-600", bg: "bg-sky-50", icon: RotateCcw },
  awaiting_review: { label: "Awaiting Review", tone: "text-amber-600", bg: "bg-amber-50", icon: GitPullRequest },
  merged: { label: "Merged", tone: "text-emerald-600", bg: "bg-emerald-50", icon: GitMerge },
  failed: { label: "Failed", tone: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
  escalated: { label: "Escalated", tone: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
};

function IterationCard({ iter, isLast }: { iter: ExecutionIteration; isLast: boolean }) {
  const Icon = actionIcons[iter.action] ?? Code2;
  const statusColor = iter.status === "success" ? "text-emerald-600" : iter.status === "failure" ? "text-red-600" : "text-amber-600";
  const statusBg = iter.status === "success" ? "bg-emerald-50" : iter.status === "failure" ? "bg-red-50" : "bg-amber-50";
  const statusRing = iter.status === "success" ? "ring-emerald-100" : iter.status === "failure" ? "ring-red-100" : "ring-amber-100";

  return (
    <div className="relative flex gap-4">
      {!isLast && <div className="absolute left-[19px] top-10 h-full w-px bg-slate-200" />}
      <div className={cn("relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-1", statusBg, statusRing)}>
        <Icon className={cn("size-4", statusColor)} />
      </div>
      <div className="flex-1 rounded-[14px] border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-950">Iteration {iter.iteration}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", statusBg, statusColor, statusRing)}>
                {actionLabels[iter.action]}
              </span>
              <span className={cn("text-[11px] font-semibold capitalize", statusColor)}>{iter.status}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{iter.summary}</p>
          </div>
          <span className="text-xs text-slate-400">{new Date(iter.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {iter.filesChanged > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <FileCode className="size-3.5" />
              {iter.filesChanged} files changed
            </span>
          )}
          {iter.testsPassed + iter.testsFailed > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <TestTube className="size-3.5" />
              {iter.testsPassed} passed, {iter.testsFailed} failed
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Sparkles className="size-3.5" />
            {(iter.tokensUsed / 1000).toFixed(1)}k tokens
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Timer className="size-3.5" />
            {(iter.durationMs / 1000).toFixed(0)}s
          </span>
        </div>
      </div>
    </div>
  );
}

export function ExecutionLoopPanel({ run }: Props) {
  const [explainOpen, setExplainOpen] = useState(false);
  const status = statusConfig[run.status] ?? statusConfig.idle;
  const StatusIcon = status.icon;

  const progressPercent = useMemo(() => {
    return Math.min(100, (run.currentIteration / run.maxIterations) * 100);
  }, [run.currentIteration, run.maxIterations]);

  return (
    <div className="space-y-5">
      {/* Status Header */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("rounded-xl p-2 ring-1", status.bg, status.tone, `ring-${status.bg.split("-")[1]}-100`)}>
                <StatusIcon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-950">{run.storyTitle}</p>
                <p className={cn("text-xs font-semibold", status.tone)}>{status.label}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Sandbox</p>
            <p className="text-xs font-mono text-slate-600">{run.sandboxId}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Iteration {run.currentIteration} of {run.maxIterations}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className={cn("h-full rounded-full", run.status === "failed" || run.status === "escalated" ? "bg-red-500" : "bg-sky-500")}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {run.prUrl && (
            <Button variant="outline" size="sm" className="rounded-full text-xs" asChild>
              <a href={run.prUrl} target="_blank" rel="noreferrer">
                <GitPullRequest className="mr-1 size-3.5" />
                Review PR #{run.prNumber}
                <ExternalLink className="ml-1 size-3" />
              </a>
            </Button>
          )}
          {run.explainabilityReport && (
            <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setExplainOpen(true)}>
              <Sparkles className="mr-1 size-3.5" />
              View Explainability Report
            </Button>
          )}
          {run.status === "awaiting_review" && (
            <>
              <Button size="sm" className="rounded-full bg-slate-950 text-xs text-white hover:bg-slate-800">
                <GitMerge className="mr-1 size-3.5" />
                Approve Merge
              </Button>
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                <RotateCcw className="mr-1 size-3.5" />
                Request Changes
              </Button>
            </>
          )}
          {(run.status === "failed" || run.status === "escalated") && (
            <Button variant="outline" size="sm" className="rounded-full text-xs">
              <AlertTriangle className="mr-1 size-3.5" />
              Escalate to Human
            </Button>
          )}
        </div>
      </div>

      {/* Iteration Timeline */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Iteration Timeline</p>
        <div className="mt-4 space-y-4">
          {run.iterations.map((iter, idx) => (
            <IterationCard key={iter.id} iter={iter} isLast={idx === run.iterations.length - 1} />
          ))}
        </div>
      </div>

      {/* Context Budget */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Context Budget</p>
        <div className="mt-4 flex items-center justify-between">
          <ContextBudgetGauge allocation={{ total: run.tokenBudget, used: run.tokensUsed, breakdown: {
            designArtifact: { allocated: Math.round(run.tokenBudget * 0.4), used: Math.round(run.tokensUsed * 0.55) },
            codebaseUnderstanding: { allocated: Math.round(run.tokenBudget * 0.25), used: Math.round(run.tokensUsed * 0.26) },
            relatedPatterns: { allocated: Math.round(run.tokenBudget * 0.20), used: Math.round(run.tokensUsed * 0.14) },
            governanceRules: { allocated: Math.round(run.tokenBudget * 0.15), used: Math.round(run.tokensUsed * 0.05) },
          }}} size="md" />
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Budget</p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-slate-950">{(run.tokenBudget / 1000).toFixed(0)}k</p>
            <p className="mt-1 text-sm text-slate-500">Used: {(run.tokensUsed / 1000).toFixed(1)}k</p>
            <p className="text-sm text-slate-500">Remaining: {((run.tokenBudget - run.tokensUsed) / 1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>

      {run.explainabilityReport && (
        <ExplainabilityModal report={run.explainabilityReport} open={explainOpen} onOpenChange={setExplainOpen} />
      )}
    </div>
  );
}
