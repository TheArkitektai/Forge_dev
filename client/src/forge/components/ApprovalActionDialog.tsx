import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForge } from "@/forge/context";
import type { GovernanceItem } from "@/forge/types";

type Props = {
  item: GovernanceItem;
  action: "approved" | "rejected";
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ApprovalActionDialog({ item, action, open, onOpenChange }: Props) {
  const { approveGovernanceItem, rejectDesignArtifact, addStoryFeedback } = useForge();
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    approveGovernanceItem(item.id, action, reason || undefined);
    if (action === "rejected") {
      if (item.artifactId && reason.trim()) {
        rejectDesignArtifact(item.artifactId, reason.trim());
      }
      if (item.storyId && reason.trim()) {
        addStoryFeedback(item.storyId, reason.trim());
      }
    }
    onOpenChange(false);
    setReason("");
  };

  const isApprove = action === "approved";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)] text-xl text-slate-950">
            {isApprove ? "Approve governance item" : "Reject governance item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className={`flex items-start gap-3 rounded-[14px] border px-4 py-3.5 ${
            isApprove ? "border-emerald-100 bg-emerald-50/60" : "border-red-100 bg-red-50/60"
          }`}>
            {isApprove ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">Owner: {item.owner} · {item.time}</p>
            </div>
          </div>

          {!isApprove && (
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Reason for rejection (required)
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Describe why this item is being rejected and what is needed to proceed"
                rows={3}
                className="w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100 resize-none"
              />
            </div>
          )}

          {isApprove && (
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Notes (optional)
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Add any notes for the audit trail"
                rows={2}
                className="w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100 resize-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 text-slate-700">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isApprove && !reason.trim()}
              className={isApprove
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "bg-red-700 text-white hover:bg-red-800"
              }
            >
              {isApprove ? "Confirm approval" : "Confirm rejection"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
