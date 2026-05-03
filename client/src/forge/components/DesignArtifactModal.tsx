import { useState } from "react";
import { X, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForge } from "@/forge/context";
import { DesignArtifactCard } from "@/forge/components/DesignArtifactCard";
import { DesignRejectDialog } from "@/forge/components/DesignRejectDialog";
import { ReworkBadge } from "@/forge/components/ReworkBadge";
import { cn } from "@/lib/utils";
import type { DesignArtifact } from "@/forge/types";

type Props = {
  artifact: DesignArtifact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TYPE_LABELS: Record<string, string> = {
  user_flow: "User Flow",
  component_diagram: "Component Diagram",
  api_contract: "API Contract",
  data_model: "Data Model",
  wireframe: "Wireframe",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DesignArtifactModal({ artifact, open, onOpenChange }: Props) {
  const { approveDesignArtifact, addDesignFeedback, openStoryDrawer } = useForge();
  const [feedbackText, setFeedbackText] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!artifact) return null;

  const typeLabel = TYPE_LABELS[artifact.type] ?? artifact.type;
  const isApproved = artifact.status === "approved";

  function handleApprove() {
    approveDesignArtifact(artifact!.id);
    onOpenChange(false);
  }

  function handleSubmitFeedback() {
    if (!feedbackText.trim()) return;
    addDesignFeedback(artifact!.id, feedbackText.trim());
    setFeedbackText("");
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl rounded-[20px] border border-slate-200 bg-white p-0 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)] flex flex-col max-h-[90vh]">
          {/* Header */}
          <DialogHeader className="border-b border-slate-100 px-6 pt-6 pb-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <DialogTitle className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950 leading-tight">
                  {artifact.title}
                </DialogTitle>
                <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 bg-slate-50 text-slate-600 ring-slate-200 shrink-0">
                  {typeLabel}
                </span>
                <span className="text-xs font-medium text-slate-400 shrink-0">
                  v{artifact.version}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ReworkBadge status={artifact.status as Parameters<typeof ReworkBadge>[0]["status"]} />
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex size-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Body */}
          <div className="overflow-y-auto max-h-[70vh] px-6 py-5 space-y-6 flex-1">

            {/* Section 1: Design Artifact */}
            <div>
              <DesignArtifactCard artifact={artifact} />
            </div>

            {/* Section 2: Impacted Areas */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-3">
                Impacted Areas
              </p>
              <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 space-y-3">
                {artifact.impactedLayers.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-2">
                      Layers
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {artifact.impactedLayers.map((layer) => (
                        <span
                          key={layer}
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 bg-sky-50 text-sky-700 ring-sky-100"
                        >
                          {layer}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {artifact.impactedServices.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-2">
                      Services
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {artifact.impactedServices.map((service) => (
                        <span
                          key={service}
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 bg-violet-50 text-violet-700 ring-violet-100"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Feedback Thread */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-3">
                Feedback Thread
              </p>
              {artifact.feedback.length === 0 ? (
                <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-5 text-center">
                  <MessageSquare className="mx-auto mb-2 size-5 text-slate-300" />
                  <p className="text-sm text-slate-400">No feedback yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {artifact.feedback.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3",
                          entry.resolved && "opacity-50",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                            {getInitials(entry.author)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-semibold text-slate-700">
                                {entry.author}
                              </span>
                              <span className="text-[11px] text-slate-400 shrink-0">
                                {entry.timestamp}
                              </span>
                            </div>
                            <p
                              className={cn(
                                "text-sm leading-6 text-slate-600",
                                entry.resolved && "line-through",
                              )}
                            >
                              {entry.text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Section 4: Add Feedback */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-3">
                Add Feedback
              </p>
              <div className="space-y-3">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your feedback on this design artifact..."
                  rows={3}
                  className="w-full resize-none rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim()}
                  variant="outline"
                  className="rounded-full border-slate-200 text-sm text-slate-700 hover:border-slate-300 disabled:opacity-40"
                >
                  <MessageSquare className="mr-1.5 size-3.5" />
                  Submit Feedback
                </Button>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
            {/* Left: Story Reference */}
            <button
              onClick={() => openStoryDrawer(artifact.storyId)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors underline-offset-2 hover:underline truncate max-w-[40%]"
            >
              Story: {artifact.storyTitle}
            </button>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={() => setRejectOpen(true)}
                className="rounded-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 text-sm"
              >
                <ThumbsDown className="mr-1.5 size-3.5" />
                Reject and Rework
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isApproved}
                className="rounded-full bg-slate-950 text-white text-sm hover:bg-slate-800 disabled:opacity-40"
              >
                <ThumbsUp className="mr-1.5 size-3.5" />
                Approve Design
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DesignRejectDialog
        artifact={artifact}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />
    </>
  );
}
