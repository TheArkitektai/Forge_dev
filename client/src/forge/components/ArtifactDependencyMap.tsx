import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Lock,
  Loader2,
  Play,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Check,
  X,
} from "lucide-react";
import type { ReviewEntry } from "@shared/types/designArtifacts";
import { cn } from "@/lib/utils";
import { XYFlowDiagram } from "./XYFlowDiagram";
import { PlantUMLDiagram } from "./PlantUMLDiagram";
import { DesignArtifactExport } from "./DesignArtifactExport";
import {
  artifactRegistry,
  computeArtifactState,
  getArtifactConfig,
  getArtifactLayers,
  getStoryArtifactConfigs,
  stakeholderViews,
} from "@/forge/artifactRegistry";
import type {
  ArtifactTypeId,
  ArtifactStatus,
  ArtifactTypeConfig,
  StakeholderViewId,
  Story,
  StoryDesignArtifact,
} from "@/forge/types";
import type { ProjectDesignArtifact, EpicDesignArtifact } from "@shared/types/designArtifacts";

interface Props {
  story: Story;
  onGenerate: (typeId: ArtifactTypeId, regenerationContext?: string) => void;
  onApprove: (typeId: ArtifactTypeId) => void;
  onReject: (typeId: ArtifactTypeId, reason: string) => void;
  projectArtifacts?: ProjectDesignArtifact[];
  epicArtifacts?: EpicDesignArtifact[];
}

const statusConfig: Record<ArtifactStatus, { label: string; pill: string; border: string; bg: string }> = {
  locked:     { label: "Locked",       pill: "bg-slate-100 text-slate-500 ring-slate-200",       border: "border-slate-200", bg: "bg-slate-50/40" },
  available:  { label: "Available",    pill: "bg-sky-50 text-sky-700 ring-sky-200",              border: "border-sky-200",   bg: "bg-sky-50/30" },
  generating: { label: "Generating",   pill: "bg-amber-50 text-amber-700 ring-amber-200",        border: "border-amber-200", bg: "bg-amber-50/30" },
  draft:      { label: "Needs Review", pill: "bg-amber-50 text-amber-700 ring-amber-200",        border: "border-amber-200", bg: "bg-amber-50/30" },
  approved:   { label: "Approved",     pill: "bg-emerald-50 text-emerald-700 ring-emerald-100",  border: "border-emerald-200", bg: "bg-emerald-50/20" },
  rejected:   { label: "Rejected",     pill: "bg-red-50 text-red-700 ring-red-100",              border: "border-red-200",   bg: "bg-red-50/20" },
};

function StatusIcon({ status }: { status: ArtifactStatus }) {
  if (status === "locked")     return <Lock className="size-3.5 text-slate-400 shrink-0" />;
  if (status === "approved")   return <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />;
  if (status === "rejected")   return <XCircle className="size-3.5 text-red-600 shrink-0" />;
  if (status === "generating") return <Loader2 className="size-3.5 text-amber-600 shrink-0 animate-spin" />;
  return null;
}

function TableArtifactRenderer({ content }: { content: string }) {
  try {
    const rows = JSON.parse(content) as Record<string, string>[];
    if (!Array.isArray(rows) || rows.length === 0) throw new Error();
    const cols = Object.keys(rows[0]);
    return (
      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {cols.map(c => (
                <th key={c} className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                {cols.map(c => (
                  <td key={c} className="px-3 py-2 text-slate-700">{row[c] ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch {
    return <pre className="text-[10px] text-slate-600 whitespace-pre-wrap">{content}</pre>;
  }
}

function MarkdownArtifactRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-semibold text-slate-800 mt-3 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={i} className="text-base font-bold text-slate-900 mt-4 mb-1">{line.slice(2)}</h1>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-xs text-slate-700 ml-3">{line.slice(2)}</li>;
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return <p key={i} className="text-xs text-slate-700 leading-5">{line}</p>;
      })}
    </div>
  );
}

function renderArtifactContent(
  artifact: { content: string; renderedSvg?: string },
  config: ArtifactTypeConfig,
) {
  const { content, renderedSvg } = artifact;
  switch (config.renderer) {
    case "xyflow":
      return <XYFlowDiagram key={content} sourceContent={content} readOnly title={config.label} />;
    case "plantuml":
      return <PlantUMLDiagram source={renderedSvg ?? content} readOnly title={config.label} />;
    case "table":
      return <TableArtifactRenderer content={content} />;
    case "markdown":
      return <MarkdownArtifactRenderer content={content} />;
    default:
      return <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">{content}</p>;
  }
}

function ArtifactCard({
  typeId,
  storyDesignArtifacts,
  onGenerate,
  onApprove,
  onReject,
}: {
  typeId: ArtifactTypeId;
  storyDesignArtifacts: Partial<Record<ArtifactTypeId, StoryDesignArtifact>>;
  onGenerate: (id: ArtifactTypeId, regenerationContext?: string) => void;
  onApprove: (id: ArtifactTypeId) => void;
  onReject: (id: ArtifactTypeId, reason: string) => void;
}) {
  const config = getArtifactConfig(typeId);
  const status = computeArtifactState(typeId, storyDesignArtifacts);
  const sc = statusConfig[status];
  const artifact = storyDesignArtifacts[typeId];

  const [expanded, setExpanded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRegeneratePrompt, setShowRegeneratePrompt] = useState(false);
  const [regenerateContext, setRegenerateContext] = useState("");

  const missingPrereqs = status === "locked"
    ? config.prerequisites.filter(p => {
        const pr = storyDesignArtifacts[p];
        return !pr || pr.status !== "approved";
      }).map(p => getArtifactConfig(p).label)
    : [];

  const handleRegenerateSubmit = () => {
    if (!regenerateContext.trim()) return;
    onGenerate(typeId, regenerateContext.trim());
    setShowRegeneratePrompt(false);
    setRegenerateContext("");
  };

  return (
    <div className={cn("rounded-[16px] border p-4 transition-all", sc.border, sc.bg)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn("text-sm font-semibold", status === "locked" ? "text-slate-400" : "text-slate-900")}>
              {config.label}
            </p>
            {!config.mandatory && (
              <span className="text-[10px] rounded-full bg-slate-100 text-slate-500 px-1.5 py-0.5 ring-1 ring-slate-200 shrink-0">optional</span>
            )}
            <span className="text-[10px] rounded-full bg-violet-50 text-violet-600 px-1.5 py-0.5 ring-1 ring-violet-100 shrink-0">{config.renderer}</span>
          </div>
          <p className={cn("text-[11px] mt-0.5 leading-4", status === "locked" ? "text-slate-400" : "text-slate-500")}>
            {config.description}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {artifact?.content && (
            <DesignArtifactExport
              title={config.label}
              renderer={config.renderer}
              content={artifact.content}
              renderedSvg={artifact.renderedSvg}
            />
          )}
          <StatusIcon status={status} />
        </div>
      </div>

      {/* Status pill */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", sc.pill)}>
          {sc.label}
        </span>
        {artifact?.approvedBy && (
          <span className="text-[10px] text-slate-400">by {artifact.approvedBy}</span>
        )}
      </div>

      {/* Prerequisites needed */}
      {missingPrereqs.length > 0 && (
        <p className="mt-2 text-[11px] text-slate-400">
          Needs: {missingPrereqs.join(", ")}
        </p>
      )}

      {/* Rejection reason — persisted through regeneration cycles */}
      {(status === "rejected" || status === "draft") && artifact?.rejectionReason && (
        <div className={cn(
          "mt-2 rounded-[8px] border px-3 py-2",
          status === "rejected" ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
        )}>
          <p className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.1em] mb-0.5",
            status === "rejected" ? "text-red-400" : "text-amber-500"
          )}>
            {status === "rejected" ? "Rejection reason" : "Previous feedback"}
          </p>
          <p className={cn(
            "text-[11px] leading-4",
            status === "rejected" ? "text-red-700" : "text-amber-800"
          )}>
            {artifact.rejectionReason}
          </p>
        </div>
      )}

      {/* Actions */}
      {!rejecting && !showRegeneratePrompt && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {status === "available" && (
            <button
              onClick={() => onGenerate(typeId)}
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-600 bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-sky-700 transition"
            >
              <Play className="size-3" />
              Generate with AI
            </button>
          )}
          {status === "rejected" && (
            <button
              onClick={() => { setShowRegeneratePrompt(true); setRegenerateContext(""); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 transition"
            >
              <RefreshCw className="size-3" />
              Regenerate
            </button>
          )}
          {status === "draft" && (
            <>
              <button
                onClick={() => onApprove(typeId)}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
              >
                <ThumbsUp className="size-3" />
                Approve
              </button>
              <button
                onClick={() => { setRejecting(true); setRejectReason(""); }}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100 transition"
              >
                <ThumbsDown className="size-3" />
                Reject
              </button>
              <button
                onClick={() => onGenerate(typeId)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                <RefreshCw className="size-3" />
                Retry
              </button>
            </>
          )}
          {/* approved: no Regenerate — must reject first */}
          {(status === "draft" || status === "approved" || status === "rejected") && artifact?.content && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:border-slate-300 transition"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? "Hide" : "View"}
            </button>
          )}
        </div>
      )}

      {/* Rejection form */}
      {rejecting && (
        <div className="mt-3 space-y-2">
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={2}
            className="w-full resize-none rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-900 placeholder:text-slate-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (rejectReason.trim()) {
                  onReject(typeId, rejectReason.trim());
                  setRejecting(false);
                }
              }}
              disabled={!rejectReason.trim()}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                rejectReason.trim()
                  ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
                  : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => setRejecting(false)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Regenerate prompt — mandatory for rejected status */}
      {showRegeneratePrompt && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] font-medium text-slate-600">What should the AI fix?</p>
          <textarea
            value={regenerateContext}
            onChange={e => setRegenerateContext(e.target.value)}
            placeholder="Describe what needs to be corrected in the next version..."
            rows={2}
            autoFocus
            className="w-full resize-none rounded-[10px] border border-sky-200 bg-white px-3 py-2 text-xs leading-5 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
          <div className="flex gap-2">
            <button
              onClick={handleRegenerateSubmit}
              disabled={!regenerateContext.trim()}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                regenerateContext.trim()
                  ? "border-sky-600 bg-sky-600 text-white hover:bg-sky-700"
                  : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <RefreshCw className="size-3 inline mr-1" />
              Regenerate
            </button>
            <button
              onClick={() => setShowRegeneratePrompt(false)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content viewer */}
      {expanded && artifact?.content && (
        <div className="mt-4 rounded-[12px] border border-slate-100 bg-white p-4">
          {renderArtifactContent(artifact, config)}
        </div>
      )}

      {/* Review thread */}
      {artifact?.reviewThread && artifact.reviewThread.length > 0 && (
        <ReviewThread entries={artifact.reviewThread} />
      )}
    </div>
  );
}

function ReviewThread({ entries }: { entries: ReviewEntry[] }) {
  const [expanded, setExpanded] = useState(false);
  if (entries.length === 0) return null;
  const shown = expanded ? entries : entries.slice(-2);
  const hidden = entries.length - shown.length;

  const icon = (type: ReviewEntry["type"]) => {
    if (type === "approved")    return <Check className="size-3 text-emerald-600 shrink-0 mt-0.5" />;
    if (type === "rejected")    return <X className="size-3 text-red-500 shrink-0 mt-0.5" />;
    if (type === "regenerated") return <RefreshCw className="size-3 text-sky-500 shrink-0 mt-0.5" />;
    return <MessageSquare className="size-3 text-slate-400 shrink-0 mt-0.5" />;
  };

  const dot = (type: ReviewEntry["type"]) => {
    if (type === "approved")    return "bg-emerald-500";
    if (type === "rejected")    return "bg-red-400";
    if (type === "regenerated") return "bg-sky-500";
    return "bg-slate-300";
  };

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Review History</span>
        {entries.length > 2 && (
          <button onClick={() => setExpanded(e => !e)} className="text-[10px] text-sky-600 hover:underline">
            {expanded ? "Show less" : `Show all (${entries.length})`}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {hidden > 0 && !expanded && (
          <p className="text-[10px] text-slate-400 italic pl-4">{hidden} earlier {hidden === 1 ? "entry" : "entries"} hidden</p>
        )}
        {shown.map(entry => (
          <div key={entry.id} className="flex gap-2">
            <div className="flex flex-col items-center">
              <div className={cn("size-1.5 rounded-full mt-1 shrink-0", dot(entry.type))} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {icon(entry.type)}
                <span className="text-[10px] font-semibold text-slate-600">{entry.author}</span>
                <span className={cn("text-[10px] font-medium capitalize",
                  entry.type === "approved" ? "text-emerald-600" :
                  entry.type === "rejected" ? "text-red-500" :
                  entry.type === "regenerated" ? "text-sky-600" : "text-slate-500"
                )}>{entry.type}</span>
                <span className="text-[10px] text-slate-400 ml-auto">
                  {new Date(entry.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {entry.type !== "approved" && entry.message && (
                <p className="text-[10px] text-slate-500 italic mt-0.5 leading-4">"{entry.message}"</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TierContextBadge({ label, count, total }: { label: string; count: number; total: number }) {
  const allApproved = count === total;
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-[12px] border px-3 py-2 text-[11px]",
      allApproved ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-slate-50/40"
    )}>
      {allApproved
        ? <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
        : <Loader2 className="size-3.5 text-slate-400 shrink-0" />
      }
      <span className={allApproved ? "text-emerald-700 font-medium" : "text-slate-500"}>
        {label}: {count}/{total} approved
      </span>
    </div>
  );
}

export function ArtifactDependencyMap({ story, onGenerate, onApprove, onReject, projectArtifacts = [], epicArtifacts = [] }: Props) {
  const [activeView, setActiveView] = useState<StakeholderViewId | "all">("all");

  const storyConfigs = getStoryArtifactConfigs();
  const layers = (() => {
    const maxDepth = Math.max(...storyConfigs.map(a => {
      const depth = (id: string): number => {
        const c = artifactRegistry.find(r => r.id === id);
        if (!c || c.prerequisites.length === 0) return 0;
        return Math.max(...c.prerequisites.map(p => depth(p))) + 1;
      };
      return depth(a.id);
    }));
    const result: typeof storyConfigs[] = [];
    for (let d = 0; d <= maxDepth; d++) {
      result.push(storyConfigs.filter(a => {
        const depth = (id: string): number => {
          const c = artifactRegistry.find(r => r.id === id);
          if (!c || c.prerequisites.length === 0) return 0;
          return Math.max(...c.prerequisites.map(p => depth(p))) + 1;
        };
        return depth(a.id) === d;
      }));
    }
    return result;
  })();

  const artifacts = story.storyDesignArtifacts ?? {};

  const visibleIds = activeView === "all"
    ? storyConfigs.map(a => a.id)
    : stakeholderViews[activeView].artifactIds.filter(id => storyConfigs.some(c => c.id === id));

  const viewOptions: { id: StakeholderViewId | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "cto", label: "CTO" },
    { id: "engineer", label: "Engineer" },
    { id: "product", label: "Product" },
    { id: "security", label: "Security" },
    { id: "devops", label: "DevOps" },
  ];

  const tier1Approved = projectArtifacts.filter(a => a.status === "approved").length;
  const tier2Approved = epicArtifacts.filter(a => a.status === "approved").length;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 24 }}>
      {/* Tier 1 and Tier 2 context badges */}
      {(projectArtifacts.length > 0 || epicArtifacts.length > 0) && (
        <div className="mb-5 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">Upstream Context</p>
          {projectArtifacts.length > 0 && (
            <TierContextBadge label="Project artifacts" count={tier1Approved} total={projectArtifacts.length} />
          )}
          {epicArtifacts.length > 0 && (
            <TierContextBadge label="Epic artifacts" count={tier2Approved} total={epicArtifacts.length} />
          )}
          <div className="h-px bg-slate-100 mt-4" />
        </div>
      )}

      {/* Stakeholder view filter */}
      <div className="flex items-center gap-1.5 flex-wrap mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mr-1">View:</span>
        {viewOptions.map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
              activeView === v.id
                ? "bg-slate-900 text-white"
                : "border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Story-scope dependency layers */}
      {layers.map((layer, layerIdx) => {
        const visible = layer.filter(a => visibleIds.includes(a.id));
        if (visible.length === 0) return null;
        return (
          <div key={layerIdx} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                {layerIdx === 0 ? "Foundation" : `Step ${layerIdx + 1}`}
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {visible.map(config => (
                <ArtifactCard
                  key={config.id}
                  typeId={config.id}
                  storyDesignArtifacts={artifacts}
                  onGenerate={onGenerate}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
