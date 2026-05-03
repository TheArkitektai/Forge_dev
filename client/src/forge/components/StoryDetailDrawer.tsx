import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  Maximize2,
  MessageSquare,
  Minimize2,
  Paperclip,
  Play,
  X,
} from "lucide-react";
import { useForge } from "@/forge/context";
import { StoryTransitionDialog } from "@/forge/components/StoryTransitionDialog";
import { StoryRejectDialog } from "@/forge/components/StoryRejectDialog";
import { ReworkBadge } from "@/forge/components/ReworkBadge";
import { ArtifactDependencyMap } from "@/forge/components/ArtifactDependencyMap";
import { checkDesignGate } from "@/forge/artifactRegistry";
import { cn } from "@/lib/utils";
import type { Story, StoryPhase, StoryTransition, AIAgentStatus, AgentOutputSection, ArtifactTypeId } from "@/forge/types";

const phaseOrder: StoryPhase[] = ["Plan", "Design", "Develop", "Test", "Ship"];

function getRiskColor(risk: Story["risk"]) {
  if (risk === "High") return "bg-red-50 text-red-700 ring-red-100";
  if (risk === "Medium") return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
}

function getFeedbackTypeColor(type: "feedback" | "rejection" | "approval") {
  if (type === "rejection") return "bg-red-50 text-red-700 ring-red-100";
  if (type === "approval") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  return "bg-sky-50 text-sky-700 ring-sky-100";
}

function getFeedbackTypeLabel(type: "feedback" | "rejection" | "approval") {
  if (type === "rejection") return "Rejection";
  if (type === "approval") return "Approval";
  return "Feedback";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface StoryDetailBodyProps {
  story: Story;
  isOwner: boolean;
  hasRework: boolean;
  selectedFeedbackIds: string[];
  toggleFeedback: (id: string) => void;
  handleReRunWithFeedback: () => void;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  handleSendFeedback: () => void;
  aiAgentStatus: AIAgentStatus;
  agentSections: AgentOutputSection[];
  relevantTransitions: StoryTransition[];
  currentPhaseIndex: number;
  setTransitionOpen: (open: boolean) => void;
  setRejectOpen: (open: boolean) => void;
  runPlanningAgent: (storyId: string) => void;
  agentSectionsInLeft?: boolean;
}

function StoryDetailBody({
  story,
  isOwner,
  hasRework,
  selectedFeedbackIds,
  toggleFeedback,
  handleReRunWithFeedback,
  feedbackText,
  setFeedbackText,
  handleSendFeedback,
  aiAgentStatus,
  agentSections,
  relevantTransitions,
  currentPhaseIndex,
  setTransitionOpen,
  setRejectOpen,
  runPlanningAgent,
  agentSectionsInLeft,
}: StoryDetailBodyProps) {
  return (
    <div className="space-y-7">
      {/* Phase Timeline */}
      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
          Phase Progress
        </p>
        <div className="flex items-center gap-0">
          {phaseOrder.map((phase, idx) => {
            const isCompleted = idx < currentPhaseIndex;
            const isCurrent = idx === currentPhaseIndex;
            const isFuture = idx > currentPhaseIndex;
            const isLast = idx === phaseOrder.length - 1;

            return (
              <div key={phase} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                      isCompleted && "bg-slate-950 text-white",
                      isCurrent && "bg-sky-600 text-white",
                      isFuture && "bg-slate-100 text-slate-500"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium whitespace-nowrap",
                      isCompleted && "text-slate-700",
                      isCurrent && "text-sky-700",
                      isFuture && "text-slate-400"
                    )}
                  >
                    {phase}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "mx-1 mb-4 h-px flex-1",
                      idx < currentPhaseIndex ? "bg-slate-950" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Description */}
      {story.description && (
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Description
          </p>
          <p className="text-sm leading-6 text-slate-700">{story.description}</p>
        </section>
      )}

      {/* Acceptance Criteria */}
      {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Acceptance Criteria
          </p>
          <div className="space-y-2">
            {story.acceptanceCriteria.map((criterion) => (
              <div key={criterion.id} className="flex items-start gap-2.5">
                {criterion.met ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-slate-400" />
                )}
                <span
                  className={cn(
                    "text-sm leading-6",
                    criterion.met ? "text-emerald-700" : "text-slate-600"
                  )}
                >
                  {criterion.text}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Attachments */}
      {story.attachments && story.attachments.length > 0 && (
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Attachments
          </p>
          <div className="space-y-1.5">
            {story.attachments.map((file, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-[10px] border border-slate-200 bg-slate-50/60 px-3 py-2">
                <Paperclip className="size-3.5 shrink-0 text-slate-400" />
                <span className="flex-1 truncate text-sm text-slate-700">{file.name}</span>
                <span className="text-[11px] text-slate-400 shrink-0">{file.size}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reference Links */}
      {story.links && story.links.length > 0 && (
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Reference Links
          </p>
          <div className="space-y-1.5">
            {story.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-[10px] border border-slate-200 bg-slate-50/60 px-3 py-2 hover:border-sky-200 hover:bg-sky-50/40 transition-colors"
              >
                <ExternalLink className="size-3.5 shrink-0 text-sky-500" />
                <span className="flex-1 truncate text-sm text-sky-700">{link.label || link.url}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Agent Output for Current Phase */}
      {!agentSectionsInLeft && (
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Agent Output — {story.phase}
          </p>

          {agentSections.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-slate-200 bg-slate-50/40 px-5 py-6 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-sky-50 ring-1 ring-sky-100">
                <Bot className="size-5 text-sky-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No agent output yet</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                The Planning Agent hasn't run for this story. Activate it to generate a brief, acceptance criteria, and structured output.
              </p>
              <button
                onClick={() => story && runPlanningAgent(story.id)}
                disabled={aiAgentStatus !== "idle"}
                className={cn(
                  "mt-4 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all",
                  aiAgentStatus === "idle"
                    ? "border-sky-600 bg-sky-600 text-white hover:bg-sky-700"
                    : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                {aiAgentStatus !== "idle" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {aiAgentStatus === "thinking" && "Thinking..."}
                    {aiAgentStatus === "compiling-context" && "Compiling context..."}
                    {aiAgentStatus === "generating" && "Generating brief..."}
                    {aiAgentStatus === "complete" && "Complete"}
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    Run Planning Agent
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {agentSections.map((section, idx) => (
                <div
                  key={idx}
                  className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                    <ReworkBadge status={section.status} />
                  </div>

                  {(() => {
                    const raw = section.content ?? "";
                    const stripped = raw
                      .replace(/^```(?:mermaid)?\s*/im, "")
                      .replace(/\s*```\s*$/m, "")
                      .trim();
                    const keywords = ["graph ", "graph\n", "sequenceDiagram", "erDiagram", "classDiagram", "flowchart "];
                    const isMermaid = keywords.some(kw => stripped.includes(kw));
                    return isMermaid ? (
                      <pre className="text-[10px] font-mono text-slate-600 bg-slate-50 rounded-[10px] border border-slate-100 p-3 overflow-auto max-h-48 whitespace-pre-wrap">{stripped}</pre>
                    ) : (
                      <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">{raw}</p>
                    );
                  })()}

                  {section.items && section.items.length > 0 && (
                    <ul className="space-y-1 pl-1">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Bot className="size-3.5 text-slate-400" />
                      Generated by {section.agentName}
                    </span>
                    {section.reviewedBy && (
                      <>
                        <span className="text-slate-300" aria-hidden>·</span>
                        <span className="text-[11px] text-slate-500">
                          Reviewed by {section.reviewedBy}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Feedback History */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="size-3.5 text-slate-400" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Feedback
          </p>
        </div>

        {story.feedbackHistory && story.feedbackHistory.length > 0 ? (
          <div className="mb-4 space-y-3">
            {story.feedbackHistory.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <input
                        type="checkbox"
                        checked={selectedFeedbackIds.includes(entry.id)}
                        onChange={() => toggleFeedback(entry.id)}
                        className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                    )}
                    <span className="flex size-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                      {getInitials(entry.author)}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {entry.author}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                        "bg-slate-100 text-slate-600 ring-slate-200"
                      )}
                    >
                      {entry.phase}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                        getFeedbackTypeColor(entry.type)
                      )}
                    >
                      {getFeedbackTypeLabel(entry.type)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{entry.timestamp}</span>
                </div>
                <p className="text-sm leading-6 text-slate-700">{entry.text}</p>
              </div>
            ))}
            {isOwner && (
              <div className="flex justify-end">
                <button
                  onClick={handleReRunWithFeedback}
                  disabled={aiAgentStatus !== "idle"}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    aiAgentStatus === "idle"
                      ? "border-sky-600 bg-sky-600 text-white hover:bg-sky-700"
                      : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  {aiAgentStatus !== "idle" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Re-running...
                    </>
                  ) : (
                    <>
                      <Bot className="size-4" />
                      {selectedFeedbackIds.length > 0
                        ? `Re-run Agent with ${selectedFeedbackIds.length} comment${selectedFeedbackIds.length === 1 ? "" : "s"}`
                        : "Re-run Agent"}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="mb-4 text-sm text-slate-400">No feedback yet.</p>
        )}

        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Add feedback or notes for this story..."
          rows={3}
          className="w-full resize-none rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
        />
        <div className="mt-2.5 flex justify-end">
          <button
            onClick={handleSendFeedback}
            disabled={!feedbackText.trim()}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              feedbackText.trim()
                ? "border-slate-900 bg-slate-950 text-white hover:bg-slate-800"
                : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            Send Feedback
          </button>
        </div>
      </section>

      {/* Transition History */}
      {relevantTransitions.length > 0 && (
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Transition History
          </p>
          <div className="space-y-2.5">
            {relevantTransitions.map((transition) => (
              <div
                key={transition.id}
                className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                      {transition.fromPhase}
                    </span>
                    <ArrowRight className="size-3.5 text-sky-600" />
                    <span className="rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                      {transition.toPhase}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{transition.timestamp}</span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Approved by {transition.approvedBy}
                </p>
                {transition.notes && (
                  <p className="mt-1 text-sm text-slate-600">{transition.notes}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function StoryDetailDrawer() {
  const {
    storyDrawerOpen,
    closeStoryDrawer,
    drawerStoryId,
    storyList,
    addStoryFeedback,
    storyTransitions,
    runPlanningAgent,
    runAgentWithFeedback,
    aiAgentStatus,
    currentUser,
    activeProjectId,
    generateDesignArtifact,
    approveStoryDesignArtifact,
    rejectStoryDesignArtifact,
    projectDesignArtifacts,
    epicDesignArtifacts,
  } = useForge();

  const story = drawerStoryId
    ? storyList.find((s) => s.id === drawerStoryId)
    : undefined;

  const [transitionOpen, setTransitionOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  useEffect(() => {
    setExpanded(false);
    setActiveSectionIdx(0);
  }, [drawerStoryId]);

  const handleSendFeedback = () => {
    if (!feedbackText.trim() || !drawerStoryId) return;
    addStoryFeedback(drawerStoryId, feedbackText.trim());
    setFeedbackText("");
  };

  const isOwner = true;

  const hasRework = (story?.agentOutputs?.[story.phase]?.sections ?? [])
    .some(s => s.status === "reworked");

  // Design phase gate: all mandatory artifacts must be approved before advancing
  const storyProjectArtifacts = projectDesignArtifacts.filter(a => a.projectId === activeProjectId);
  const storyEpicArtifacts = story?.epicId
    ? epicDesignArtifacts.filter(a => a.epicId === story.epicId)
    : [];
  const designGate = story?.phase === "Design"
    ? checkDesignGate(story.storyDesignArtifacts ?? {}, storyProjectArtifacts, storyEpicArtifacts)
    : { passed: true, missing: [], tier1Passed: true, tier2Passed: true, tier3Passed: true, approvedCount: 0, totalRequired: 0 };

  const canAdvance = story
    && story.phase !== "Ship"
    && !hasRework
    && aiAgentStatus === "idle"
    && designGate.passed;

  const toggleFeedback = (id: string) => {
    setSelectedFeedbackIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleReRunWithFeedback = () => {
    if (!drawerStoryId) return;
    runAgentWithFeedback(drawerStoryId, selectedFeedbackIds);
    setSelectedFeedbackIds([]);
  };

  const currentPhaseIndex = story ? phaseOrder.indexOf(story.phase) : -1;

  const relevantTransitions: StoryTransition[] = story
    ? storyTransitions.filter((t) => t.storyId === story.id)
    : [];

  const agentSections = story?.agentOutputs?.[story.phase]?.sections ?? [];

  const bodyProps: StoryDetailBodyProps = {
    story: story!,
    isOwner,
    hasRework,
    selectedFeedbackIds,
    toggleFeedback,
    handleReRunWithFeedback,
    feedbackText,
    setFeedbackText,
    handleSendFeedback,
    aiAgentStatus,
    agentSections,
    relevantTransitions,
    currentPhaseIndex,
    setTransitionOpen,
    setRejectOpen,
    runPlanningAgent,
  };

  return (
    <>
      <AnimatePresence>
        {storyDrawerOpen && story && !expanded && (
          <>
            {/* Overlay */}
            <motion.div
              key="story-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-950/30"
              onClick={closeStoryDrawer}
            />

            {/* Drawer panel */}
            <motion.div
              key="story-drawer-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[560px] flex-col bg-white shadow-[-20px_0_60px_-20px_rgba(15,23,42,0.2)]"
            >
              {/* ── Header ── */}
              <div className="shrink-0 border-b border-slate-100 bg-white px-6 pt-5 pb-4">
                <div className="mb-3 flex items-start justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Story Detail
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpanded(true)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                      title="Expand to full view"
                    >
                      <Maximize2 className="size-4" />
                    </button>
                    <button
                      onClick={closeStoryDrawer}
                      className="flex size-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Close drawer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
                  {story.title}
                </h2>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="text-sm text-slate-500">
                    Owner: <span className="font-medium text-slate-700">{story.owner}</span>
                  </span>
                  <span className="text-slate-300" aria-hidden>·</span>
                  <span className="text-sm text-slate-500">
                    Phase: <span className="font-medium text-slate-700">{story.phase}</span>
                  </span>
                  <span className="text-slate-300" aria-hidden>·</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                      getRiskColor(story.risk)
                    )}
                  >
                    {story.risk} Risk
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-sm text-slate-500">
                    Confidence:{" "}
                    <span className="font-semibold text-slate-800">{story.confidence}%</span>
                  </span>
                </div>
              </div>

              {/* ── Scrollable body ── */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <StoryDetailBody {...bodyProps} />
              </div>

              {/* ── Footer ── */}
              <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setRejectOpen(true)}
                    disabled={story.phase === "Plan"}
                    className={cn(
                      "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                      story.phase === "Plan"
                        ? "border-slate-200 text-slate-400 cursor-not-allowed"
                        : "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100"
                    )}
                  >
                    Reject and Rework
                  </button>
                  <button
                    onClick={() => setTransitionOpen(true)}
                    disabled={!canAdvance}
                    className={cn(
                      "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                      !canAdvance
                        ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "border-slate-900 bg-slate-950 text-white hover:bg-slate-800"
                    )}
                  >
                    Approve and Advance
                  </button>
                </div>
                {hasRework && (
                  <p className="mt-2 text-xs text-center text-amber-600">
                    Design rejected. Click "Re-run Agent" in the Feedback tab to regenerate before advancing.
                  </p>
                )}
                {story.phase === "Design" && !designGate.passed && (
                  <p className="mt-2 text-xs text-center text-amber-600">
                    {designGate.missing.length} mandatory artifact{designGate.missing.length === 1 ? "" : "s"} need approval before advancing.
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Expanded dialog — plain AnimatePresence, no Radix Dialog (avoids scroll lock) */}
      <AnimatePresence>
        {storyDrawerOpen && !!story && expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              key="expand-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setExpanded(false)}
            />
            {/* Dialog panel */}
            <motion.div
              key="expand-panel"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[92vh] flex flex-col bg-white rounded-[20px] shadow-2xl overflow-hidden"
            >
          {/* Dialog header */}
          <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {story?.phase} Phase
                </p>
                <h2 className="mt-0.5 text-xl font-semibold text-slate-950">{story?.title}</h2>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                  getRiskColor(story?.risk!)
                )}
              >
                {story?.risk} Risk
              </span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-sky-200 hover:text-sky-700 transition"
            >
              <Minimize2 className="size-4" />
              Back to panel
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>

            {/* Left — artifact viewer / dependency map */}
            <div style={{ flex: 1, minWidth: 0, position: "relative", overflow: "hidden" }}>

              {story?.phase === "Design" ? (
                /* ── Design Phase: Artifact Dependency Map ── */
                <ArtifactDependencyMap
                  story={story!}
                  onGenerate={(typeId: ArtifactTypeId, regenerationContext?: string) => generateDesignArtifact(story!.id, typeId, regenerationContext)}
                  onApprove={(typeId: ArtifactTypeId) => approveStoryDesignArtifact(story!.id, typeId)}
                  onReject={(typeId: ArtifactTypeId, reason: string) => rejectStoryDesignArtifact(story!.id, typeId, reason)}
                  projectArtifacts={storyProjectArtifacts}
                  epicArtifacts={storyEpicArtifacts}
                />
              ) : agentSections.length === 0 ? (
                /* ── Other phases: empty state ── */
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-sky-50 ring-1 ring-sky-100">
                      <Bot className="size-6 text-sky-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No agent output yet</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Run the agent from the panel on the right to generate output for this phase.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Other phases: section tab view ── */
                <>
                  {/* Tab bar — sits at top, natural height */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 }}
                    className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 overflow-x-auto">
                    {agentSections.map((section, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSectionIdx(idx)}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
                          activeSectionIdx === idx
                            ? "bg-slate-900 text-white"
                            : "text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                        )}
                      >
                        {section.title}
                      </button>
                    ))}
                    <div className="ml-auto shrink-0">
                      <ReworkBadge status={agentSections[activeSectionIdx]?.status} />
                    </div>
                  </div>

                  {/* Scroll area — absolutely fills space below tab bar (tab bar ~45px) */}
                  {(() => {
                    const section = agentSections[activeSectionIdx];
                    if (!section) return null;
                    const raw = section.content ?? "";
                    const stripped = raw
                      .replace(/^```(?:mermaid)?\s*/im, "")
                      .replace(/\s*```\s*$/m, "")
                      .trim();
                    const keywords = ["graph ", "graph\n", "sequenceDiagram", "erDiagram", "classDiagram", "flowchart "];
                    const isMermaid = keywords.some(kw => stripped.includes(kw));

                    return (
                      <div style={{ position: "absolute", top: 45, left: 0, right: 0, bottom: 0, overflowY: "auto", padding: 32 }}>
                        {isMermaid ? (
                          <pre className="text-[10px] font-mono text-slate-600 bg-slate-50 rounded-[10px] border border-slate-100 p-4 overflow-auto whitespace-pre-wrap">{stripped}</pre>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{raw}</p>
                            {section.items && section.items.length > 0 && (
                              <ul className="space-y-2 pl-1">
                                {section.items.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        <div className="mt-6 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Bot className="size-3.5" />
                          Generated by {section.agentName}
                          {section.reviewedBy && (
                            <span className="ml-1">· Reviewed by {section.reviewedBy}</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Right — metadata, acceptance criteria, feedback */}
            <div style={{ width: 400, flexShrink: 0, overflowY: "auto", borderLeft: "1px solid #f1f5f9" }} className="px-6 py-5">
              <StoryDetailBody {...bodyProps} agentSectionsInLeft />
            </div>
          </div>

          {/* Dialog footer — Approve / Reject */}
          <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setRejectOpen(true)}
                disabled={story?.phase === "Plan"}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                  story?.phase === "Plan"
                    ? "border-slate-200 text-slate-400 cursor-not-allowed"
                    : "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100"
                )}
              >
                Reject and Rework
              </button>
              <button
                onClick={() => setTransitionOpen(true)}
                disabled={!canAdvance}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                  !canAdvance
                    ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "border-slate-900 bg-slate-950 text-white hover:bg-slate-800"
                )}
              >
                Approve and Advance
              </button>
            </div>
            {hasRework && (
              <p className="mt-2 text-xs text-center text-amber-600">
                Design rejected. Click "Re-run Agent" in the Feedback panel to regenerate before advancing.
              </p>
            )}
            {story?.phase === "Design" && !designGate.passed && (
              <p className="mt-2 text-xs text-center text-amber-600">
                {designGate.missing.length} mandatory artifact{designGate.missing.length === 1 ? "" : "s"} need approval: {designGate.missing.slice(0, 3).join(", ")}{designGate.missing.length > 3 ? "..." : ""}
              </p>
            )}
          </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dialogs — rendered outside AnimatePresence so they survive drawer exit */}
      {story && (
        <>
          <StoryTransitionDialog
            story={story}
            open={transitionOpen}
            onOpenChange={setTransitionOpen}
          />
          <StoryRejectDialog
            story={story}
            open={rejectOpen}
            onOpenChange={setRejectOpen}
          />
        </>
      )}
    </>
  );
}
