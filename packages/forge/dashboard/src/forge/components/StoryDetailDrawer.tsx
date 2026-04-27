import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  MessageSquare,
  X,
} from "lucide-react";
import { useForge } from "@/forge/context";
import { StoryTransitionDialog } from "@/forge/components/StoryTransitionDialog";
import { StoryRejectDialog } from "@/forge/components/StoryRejectDialog";
import { ReworkBadge } from "@/forge/components/ReworkBadge";
import { cn } from "@/lib/utils";
import type { Story, StoryPhase, StoryTransition } from "@/forge/types";

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

export function StoryDetailDrawer() {
  const {
    storyDrawerOpen,
    closeStoryDrawer,
    drawerStoryId,
    storyList,
    addStoryFeedback,
    storyTransitions,
  } = useForge();

  const story = drawerStoryId
    ? storyList.find((s) => s.id === drawerStoryId)
    : undefined;

  const [transitionOpen, setTransitionOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const handleSendFeedback = () => {
    if (!feedbackText.trim() || !drawerStoryId) return;
    addStoryFeedback(drawerStoryId, feedbackText.trim());
    setFeedbackText("");
  };

  const currentPhaseIndex = story ? phaseOrder.indexOf(story.phase) : -1;

  const relevantTransitions: StoryTransition[] = story
    ? storyTransitions.filter((t) => t.storyId === story.id)
    : [];

  const agentSections = story?.agentOutputs?.[story.phase]?.sections ?? [];

  return (
    <>
      <AnimatePresence>
        {storyDrawerOpen && story && (
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
                  <button
                    onClick={closeStoryDrawer}
                    className="flex size-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close drawer"
                  >
                    <X className="size-4" />
                  </button>
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
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

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

                {/* Agent Output for Current Phase */}
                {agentSections.length > 0 && (
                  <section>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Agent Output for {story.phase}
                    </p>
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

                          <p className="text-sm leading-6 text-slate-700">{section.content}</p>

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
                    disabled={story.phase === "Ship"}
                    className={cn(
                      "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                      story.phase === "Ship"
                        ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "border-slate-900 bg-slate-950 text-white hover:bg-slate-800"
                    )}
                  >
                    Approve and Advance
                  </button>
                </div>
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
