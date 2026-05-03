import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, HelpCircle, FilePlus, FileEdit, ShieldCheck } from "lucide-react";
import { ContextBudgetGauge } from "@/forge/components/ContextBudgetGauge";
import { cn } from "@/lib/utils";
import type { ExplainabilityReport } from "@/forge/types";

type Props = {
  report: ExplainabilityReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExplainabilityModal({ report, open, onOpenChange }: Props) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.04em] text-slate-950">
            <ShieldCheck className="size-5 text-sky-600" />
            Explainability Report
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          {/* Summary */}
          <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Summary</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{report.summary}</p>
          </div>

          {/* Confidence Score */}
          <div className="flex items-center gap-4">
            <div className="rounded-[14px] border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Confidence Score</p>
              <div className="mt-2 flex items-center gap-3">
                <span className={cn(
                  "font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-0.04em]",
                  report.confidenceScore >= 90 ? "text-emerald-600" : report.confidenceScore >= 70 ? "text-amber-600" : "text-red-600"
                )}>
                  {report.confidenceScore}%
                </span>
                <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full", report.confidenceScore >= 90 ? "bg-emerald-500" : report.confidenceScore >= 70 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${report.confidenceScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Test Coverage</p>
              <div className="mt-2 flex items-center gap-3">
                <span className={cn(
                  "font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-0.04em]",
                  report.testsCoverage >= 90 ? "text-emerald-600" : report.testsCoverage >= 70 ? "text-amber-600" : "text-red-600"
                )}>
                  {report.testsCoverage}%
                </span>
                <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full", report.testsCoverage >= 90 ? "bg-emerald-500" : report.testsCoverage >= 70 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${report.testsCoverage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Design Decisions */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Design Decisions</p>
            <div className="mt-3 space-y-3">
              {report.designDecisions.map((dec, idx) => (
                <div key={idx} className="rounded-[14px] border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">{dec.decision}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{dec.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Files Created</p>
              <div className="mt-3 space-y-2">
                {report.filesCreated.map(file => (
                  <div key={file} className="flex items-center gap-2 text-sm text-slate-700">
                    <FilePlus className="size-4 text-emerald-500" />
                    <span className="font-mono text-xs">{file}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Files Modified</p>
              <div className="mt-3 space-y-2">
                {report.filesModified.map(file => (
                  <div key={file} className="flex items-center gap-2 text-sm text-slate-700">
                    <FileEdit className="size-4 text-sky-500" />
                    <span className="font-mono text-xs">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Governance Checks */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Governance Checks</p>
            <div className="mt-3 space-y-2">
              {report.governanceChecks.map((check, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-[14px] border border-slate-200 bg-white px-4 py-3">
                  <span className="text-sm text-slate-700">{check.check}</span>
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                    check.result === "pass" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" :
                    check.result === "fail" ? "bg-red-50 text-red-700 ring-red-100" :
                    "bg-slate-50 text-slate-600 ring-slate-100"
                  )}>
                    {check.result === "pass" ? <CheckCircle2 className="size-3" /> : check.result === "fail" ? <XCircle className="size-3" /> : <HelpCircle className="size-3" />}
                    {check.result === "pass" ? "Pass" : check.result === "fail" ? "Fail" : "Skipped"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Context Budget */}
          <div className="rounded-[14px] border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Context Budget Usage</p>
            <div className="mt-3 flex justify-center">
              <ContextBudgetGauge allocation={report.contextBudgetUsage} size="lg" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
