import { useState } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForge } from "@/forge/context";
import type { Story, StoryPhase } from "@/forge/types";

const phaseOrder: StoryPhase[] = ["Plan", "Design", "Develop", "Test", "Ship"];

function getPreviousPhase(current: StoryPhase): StoryPhase | null {
  const idx = phaseOrder.indexOf(current);
  return idx > 0 ? phaseOrder[idx - 1] : null;
}

type Props = {
  story: Story;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StoryRejectDialog({ story, open, onOpenChange }: Props) {
  const { rejectStory } = useForge();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const previousPhase = getPreviousPhase(story.phase);

  const handleConfirm = () => {
    if (!reason.trim() || !previousPhase) return;
    setSubmitting(true);
    rejectStory(story.id, reason.trim());
    setTimeout(() => {
      setSubmitting(false);
      setReason("");
      onOpenChange(false);
    }, 400);
  };

  const handleClose = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg rounded-[20px] border border-slate-200 bg-white p-0 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)]">
        <DialogHeader className="border-b border-slate-100 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
              <AlertTriangle className="size-4 text-red-600" />
            </span>
            <DialogTitle className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
              Reject and Send Back
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Story</span>
              <span className="text-sm font-semibold text-slate-950">{story.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Current phase</span>
              <span className="text-sm font-semibold text-slate-950">{story.phase}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Will be sent back to</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <ArrowLeft className="size-3.5" />
                {previousPhase ?? "Cannot reject further"}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Reason for Rejection (required)
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe what needs to be corrected before this story can proceed..."
              rows={4}
              className="w-full resize-none rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-1.5">What Happens Next</p>
            <p className="text-sm leading-6 text-slate-600">
              The AI agent will automatically pick up this story, review your feedback, and produce an updated deliverable. You will receive a notification when the rework is ready for your review.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-full border-slate-200 text-slate-600 hover:border-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || !previousPhase || submitting}
            className="rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? "Sending back..." : "Confirm Rejection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
