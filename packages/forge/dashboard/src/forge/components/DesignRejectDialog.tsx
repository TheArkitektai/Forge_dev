import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForge } from "@/forge/context";
import type { DesignArtifact, DesignArtifactType } from "@/forge/types";

const typeLabels: Record<DesignArtifactType, string> = {
  user_flow:         "User Flow",
  component_diagram: "Component Diagram",
  api_contract:      "API Contract",
  data_model:        "Data Model",
  wireframe:         "Wireframe",
};

type Props = {
  artifact: DesignArtifact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DesignRejectDialog({ artifact, open, onOpenChange }: Props) {
  const { rejectDesignArtifact } = useForge();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    rejectDesignArtifact(artifact.id, reason.trim());
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
              Reject Design Artifact
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Artifact</span>
              <span className="text-sm font-semibold text-slate-950">{artifact.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Type</span>
              <span className="text-sm font-semibold text-slate-950">
                {typeLabels[artifact.type] ?? artifact.type}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Story</span>
              <span className="text-sm font-semibold text-slate-950">{artifact.storyTitle}</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Reason for Rejection (required)
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe what needs to be corrected before this design artifact can be approved..."
              rows={4}
              className="w-full resize-none rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-1.5">
              What Happens Next
            </p>
            <p className="text-sm leading-6 text-slate-600">
              The AI agent will review your feedback and produce an updated version of this design artifact. You will receive a notification when the rework is ready for re review.
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
            disabled={!reason.trim() || submitting}
            className="rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? "Confirming..." : "Confirm Rejection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
