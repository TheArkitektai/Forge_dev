import type { OutputArtifact } from "@/forge/types";
import { cn } from "@/lib/utils";

type TestSummary = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number | null;
};

function parseTestSummary(text: string): TestSummary {
  const extract = (pattern: RegExp): number => {
    const m = text.match(pattern);
    return m ? parseInt(m[1], 10) : 0;
  };

  const coverageMatch = text.match(/Coverage:\s*([\d.]+)%/i);

  return {
    total: extract(/Total tests?:\s*(\d+)/i),
    passed: extract(/Passed:\s*(\d+)/i),
    failed: extract(/Failed:\s*(\d+)/i),
    skipped: extract(/Skipped:\s*(\d+)/i),
    coverage: coverageMatch ? parseFloat(coverageMatch[1]) : null,
  };
}

function ProgressBar({
  passed,
  failed,
  skipped,
  total,
}: {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}) {
  if (total === 0) return null;
  const passedPct = (passed / total) * 100;
  const failedPct = (failed / total) * 100;
  const skippedPct = (skipped / total) * 100;

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 flex">
      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${passedPct}%` }} />
      <div className="h-full bg-red-500 transition-all" style={{ width: `${failedPct}%` }} />
      <div className="h-full bg-slate-400 transition-all" style={{ width: `${skippedPct}%` }} />
    </div>
  );
}

function CoverageBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={cn("h-full transition-all", color)} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function colorLine(line: string): string {
  if (/^PASS\b/i.test(line)) return "text-emerald-600";
  if (/^FAIL\b/i.test(line)) return "text-red-600";
  // ALL-CAPS section headings (at least 4 uppercase letters, no lowercase)
  if (/^[A-Z][A-Z\s\-_:]{3,}$/.test(line.trim())) return "font-bold text-slate-900";
  return "text-slate-600";
}

export function TestReportViewer({ artifact }: { artifact: OutputArtifact }) {
  const raw = artifact.codeSnippet ?? "";
  const summary = parseTestSummary(raw);
  const lines = raw.split("\n");

  return (
    <div className="h-full overflow-auto space-y-4 pr-1">
      {/* Summary bar */}
      <div className="rounded-[14px] border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-700">
          <span>
            Total: <span className="text-slate-950">{summary.total}</span>
          </span>
          <span>
            Passed: <span className="text-emerald-600">{summary.passed}</span>
          </span>
          <span>
            Failed: <span className="text-red-600">{summary.failed}</span>
          </span>
          <span>
            Skipped: <span className="text-slate-500">{summary.skipped}</span>
          </span>
        </div>
        {summary.total > 0 && (
          <ProgressBar
            passed={summary.passed}
            failed={summary.failed}
            skipped={summary.skipped}
            total={summary.total}
          />
        )}
      </div>

      {/* Coverage */}
      {summary.coverage !== null && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Code Coverage</p>
            <span
              className={cn(
                "text-sm font-bold",
                summary.coverage >= 80
                  ? "text-emerald-600"
                  : summary.coverage >= 60
                  ? "text-amber-500"
                  : "text-red-600"
              )}
            >
              {summary.coverage.toFixed(1)}%
            </span>
          </div>
          <CoverageBar pct={summary.coverage} />
        </div>
      )}

      {/* Full output */}
      {raw && (
        <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-4 overflow-auto max-h-96">
          <div className="font-mono text-sm leading-6 space-y-0">
            {lines.map((line, i) => (
              <p key={i} className={cn("whitespace-pre-wrap", colorLine(line))}>
                {line || " "}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
