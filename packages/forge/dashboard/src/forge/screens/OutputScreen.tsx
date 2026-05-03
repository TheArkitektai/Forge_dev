import { useState } from "react";
import { Code2, FileText, FlaskConical, LayoutTemplate, Package, Play, ShieldCheck, Zap } from "lucide-react";
import { useForge } from "@/forge/context";
import { cn } from "@/lib/utils";
import type { OutputArtifact } from "@/forge/types";
import { DemoAppPreview } from "@/forge/components/DemoAppPreview";
import { DiagramViewer } from "@/forge/components/DiagramViewer";
import { ApiSpecViewer } from "@/forge/components/ApiSpecViewer";
import { TestReportViewer } from "@/forge/components/TestReportViewer";
import { ExecutionLoopPanel } from "@/forge/components/ExecutionLoopPanel";

type ArtifactType = OutputArtifact["type"] | "all";
type PhaseFilter = OutputArtifact["phase"] | "all";

const typeIcons: Record<OutputArtifact["type"], typeof Code2> = {
  "live-preview": Play,
  "code": Code2,
  "document": FileText,
  "diagram": LayoutTemplate,
  "api-spec": Package,
  "test-report": FlaskConical,
  "evidence-pack": ShieldCheck,
};

const typeLabels: Record<OutputArtifact["type"], string> = {
  "live-preview": "Live Preview",
  "code": "Code",
  "document": "Document",
  "diagram": "Diagram",
  "api-spec": "API Spec",
  "test-report": "Test Report",
  "evidence-pack": "Evidence Pack",
};

const typeBadgeColors: Record<OutputArtifact["type"], string> = {
  "live-preview": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "code": "bg-sky-50 text-sky-700 ring-sky-100",
  "document": "bg-slate-100 text-slate-700 ring-slate-200",
  "diagram": "bg-violet-50 text-violet-700 ring-violet-100",
  "api-spec": "bg-amber-50 text-amber-700 ring-amber-100",
  "test-report": "bg-rose-50 text-rose-700 ring-rose-100",
  "evidence-pack": "bg-indigo-50 text-indigo-700 ring-indigo-100",
};

function CodeViewer({ content, language }: { content: string; language?: string }) {
  return (
    <div className="relative h-full overflow-auto rounded-[14px] bg-slate-950 p-5">
      {language && (
        <span className="absolute right-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/60">
          {language}
        </span>
      )}
      <pre className="font-mono text-sm leading-7 text-slate-200 whitespace-pre-wrap">{content}</pre>
    </div>
  );
}

function LivePreviewViewer({ artifact }: { artifact: OutputArtifact }) {
  if (artifact.previewComponent) {
    return (
      <div className="h-full overflow-auto rounded-[14px] border border-slate-200 bg-white">
        <DemoAppPreview artifact={artifact} />
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-[14px] border border-slate-200 bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
          <Play className="size-8 text-emerald-700" />
        </div>
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{artifact.title}</p>
        <p className="mt-2 text-sm text-slate-600">{artifact.description}</p>
        {artifact.githubUrl && (
          <a
            href={artifact.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
          >
            View source on GitHub
          </a>
        )}
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Live preview available in full deployment</p>
      </div>
    </div>
  );
}

function EvidencePackViewer({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="h-full overflow-auto rounded-[14px] border border-slate-200 bg-white p-5">
      <div className="space-y-1">
        {lines.map((line, i) => (
          <p key={i} className={cn(
            "text-sm leading-7",
            line.startsWith("##") ? "mt-4 font-[family-name:var(--font-display)] text-base font-semibold text-slate-950" :
            line.startsWith("###") ? "mt-3 text-sm font-semibold text-slate-700" :
            line.match(/^\d+\./) ? "pl-4 text-slate-700" :
            line === "" ? "h-2" :
            "text-slate-600"
          )}>
            {line || " "}
          </p>
        ))}
      </div>
    </div>
  );
}

function ArtifactViewer({ artifact }: { artifact: OutputArtifact }) {
  if (!artifact) return (
    <div className="flex h-full items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-white">
      <p className="text-sm text-slate-500">Select an artifact to view</p>
    </div>
  );

  const TypeIcon = typeIcons[artifact.type];

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", typeBadgeColors[artifact.type])}>
              {typeLabels[artifact.type]}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
              {artifact.phase}
            </span>
          </div>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{artifact.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{artifact.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {artifact.githubUrl && (
            <a
              href={artifact.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
            >
              Open in GitHub
            </a>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {artifact.type === "live-preview" ? (
          <LivePreviewViewer artifact={artifact} />
        ) : artifact.type === "evidence-pack" ? (
          <EvidencePackViewer content={artifact.codeSnippet ?? ""} />
        ) : artifact.type === "diagram" ? (
          <DiagramViewer artifact={artifact} />
        ) : artifact.type === "api-spec" ? (
          <ApiSpecViewer artifact={artifact} />
        ) : artifact.type === "test-report" ? (
          <TestReportViewer artifact={artifact} />
        ) : artifact.codeSnippet ? (
          <CodeViewer content={artifact.codeSnippet} language={artifact.language} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-[14px] border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">No preview available</p>
          </div>
        )}
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span>Generated by: <span className="font-semibold text-slate-900">{artifact.generatedBy}</span></span>
          <span>Timestamp: <span className="font-semibold text-slate-900">{artifact.timestamp}</span></span>
          {artifact.githubUrl && (
            <span>Proof hash: <span className="font-mono font-semibold text-slate-900">{artifact.id.slice(-8)}</span></span>
          )}
        </div>
      </div>
    </div>
  );
}

export function OutputScreen({ routeArtifactId }: { routeArtifactId?: string }) {
  const { outputArtifactsList, executionRuns } = useForge();
  const [typeFilter, setTypeFilter] = useState<ArtifactType>("all");
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [selectedId, setSelectedId] = useState<string>(routeArtifactId ?? outputArtifactsList[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<"artifacts" | "execution">("artifacts");
  const [selectedRunId, setSelectedRunId] = useState<string>(executionRuns[0]?.id ?? "");

  const types: ArtifactType[] = ["all", "live-preview", "code", "document", "diagram", "api-spec", "test-report", "evidence-pack"];
  const phases: PhaseFilter[] = ["all", "Plan", "Design", "Develop", "Test", "Ship"];

  const filtered = outputArtifactsList.filter(a => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (phaseFilter !== "all" && a.phase !== phaseFilter) return false;
    return true;
  });

  const selected = outputArtifactsList.find(a => a.id === selectedId) ?? filtered[0];

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[600px] gap-4">
      {/* Viewer area */}
      <div className="min-w-0 flex-1">
        <div className="h-full rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
          {activeTab === "execution" ? (
            <div className="h-full overflow-auto">
              {executionRuns.find(r => r.id === selectedRunId) ? (
                <ExecutionLoopPanel run={executionRuns.find(r => r.id === selectedRunId)!} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-500">Select an execution run to view</p>
                </div>
              )}
            </div>
          ) : (
            <ArtifactViewer artifact={selected} />
          )}
        </div>
      </div>

      {/* Artifact list */}
      <div className="w-[340px] shrink-0 space-y-3">
        {/* Tab switcher */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("artifacts")}
            className={cn(
              "flex-1 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              activeTab === "artifacts"
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
            )}
          >
            Artifacts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("execution")}
            className={cn(
              "flex-1 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              activeTab === "execution"
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
            )}
          >
            Execution Runs
          </button>
        </div>

        {activeTab === "execution" ? (
          <div className="space-y-3">
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Code Execution Loop</p>
              <p className="text-sm text-slate-600">Autonomous code generation, testing, and iteration with human approval gates.</p>
            </div>
            <div className="overflow-auto rounded-[20px] border border-slate-200 bg-white shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
              <div className="space-y-0 divide-y divide-slate-100">
                {executionRuns.map(run => {
                  const isActive = run.id === selectedRunId;
                  return (
                    <button
                      key={run.id}
                      type="button"
                      onClick={() => setSelectedRunId(run.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-sky-50/60",
                        isActive && "bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-2xl ring-1",
                        isActive ? "bg-slate-950 ring-slate-900" : "bg-slate-50 ring-slate-200"
                      )}>
                        <Zap className={cn("size-4", isActive ? "text-white" : "text-sky-700")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{run.storyTitle}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1",
                            run.status === "merged" || run.status === "awaiting_review" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" :
                            run.status === "failed" || run.status === "escalated" ? "bg-red-50 text-red-700 ring-red-100" :
                            "bg-sky-50 text-sky-700 ring-sky-100"
                          )}>
                            {run.status.replace("_", " ")}
                          </span>
                          <span className="text-[11px] text-slate-500">Iter {run.currentIteration}/{run.maxIterations}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Type filter */}
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Filter by type</p>
          <div className="flex flex-wrap gap-1.5">
            {types.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                  typeFilter === t
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                )}
              >
                {t === "all" ? "All" : typeLabels[t]}
              </button>
            ))}
          </div>
          <p className="mt-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Filter by phase</p>
          <div className="flex flex-wrap gap-1.5">
            {phases.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPhaseFilter(p)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                  phaseFilter === p
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                )}
              >
                {p === "all" ? "All" : p}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="overflow-auto rounded-[20px] border border-slate-200 bg-white shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
          <div className="space-y-0 divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm font-semibold text-slate-900">No artifacts match</p>
                <p className="mt-1 text-sm text-slate-500">Try adjusting the filters above.</p>
              </div>
            ) : filtered.map(artifact => {
              const TypeIcon = typeIcons[artifact.type];
              const isActive = artifact.id === selected?.id;
              return (
                <button
                  key={artifact.id}
                  type="button"
                  onClick={() => setSelectedId(artifact.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-sky-50/60",
                    isActive && "bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-2xl ring-1",
                    isActive ? "bg-slate-950 ring-slate-900" : "bg-slate-50 ring-slate-200"
                  )}>
                    <TypeIcon className={cn("size-4", isActive ? "text-white" : "text-sky-700")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{artifact.title}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1", typeBadgeColors[artifact.type])}>
                        {typeLabels[artifact.type]}
                      </span>
                      <span className="text-[11px] text-slate-500">{artifact.timestamp}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
