import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForge } from "@/forge/context";
import { cn } from "@/lib/utils";
import type { Story, StoryPhase } from "@/forge/types";

const phaseOrder: StoryPhase[] = ["Plan", "Design", "Develop", "Test", "Ship"];

function getNextPhase(current: StoryPhase): StoryPhase | null {
  const idx = phaseOrder.indexOf(current);
  return idx >= 0 && idx < phaseOrder.length - 1 ? phaseOrder[idx + 1] : null;
}

const gateRequirements: Record<string, string[]> = {
  "Plan-Design": ["Story brief documented", "Architecture impact assessed", "PDPL requirements identified"],
  "Design-Develop": ["Architecture gate approved", "Design rationale captured", "Service boundaries defined"],
  "Develop-Test": ["Code review completed", "Unit tests at 80% coverage", "SonarQube gate passed"],
  "Test-Ship": ["All tests passed", "Security scan clear", "Proof chain at 90% or above", "Compliance gate approved"],
};

type Props = {
  story: Story;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StoryTransitionDialog({ story, open, onOpenChange }: Props) {
  const { advanceStory, currentUser } = useForge();
  const [confirmed, setConfirmed] = useState(false);
  const nextPhase = getNextPhase(story.phase);
  const gateKey = nextPhase ? `${story.phase}-${nextPhase}` : null;
  const requirements = gateKey ? (gateRequirements[gateKey] ?? ["Gate requirements satisfied"]) : [];

  const handleConfirm = () => {
    if (!nextPhase) return;
    setConfirmed(true);
    setTimeout(() => {
      advanceStory(story.id, nextPhase);
      onOpenChange(false);
      setConfirmed(false);
    }, 800);
  };

  if (!nextPhase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)] text-xl text-slate-950">
            Advance story to {nextPhase}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Phase transition visual */}
          <div className="flex items-center justify-between rounded-[16px] border border-slate-200 bg-slate-50/60 px-5 py-4">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">From</p>
              <p className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-950">{story.phase}</p>
            </div>
            <ArrowRight className="size-5 text-sky-700" />
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">To</p>
              <p className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold text-emerald-700">{nextPhase}</p>
            </div>
          </div>

          {/* Story info */}
          <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{story.title}</p>
            <p className="mt-1 text-sm text-slate-500">Owner: {story.owner} · Confidence: {story.confidence}%</p>
          </div>

          {/* Gate requirements */}
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Gate requirements</p>
            <div className="space-y-2">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-[12px] border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <p className="text-sm text-slate-700">{req}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Approver */}
          <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-sky-700" />
              <p className="text-sm font-semibold text-slate-900">Approving as {currentUser.name}</p>
            </div>
            <p className="mt-1 text-sm text-slate-500">{currentUser.role}</p>
          </div>

          {/* Proof chain status */}
          <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-900">Proof chain completeness</p>
              <span className="text-sm font-semibold text-slate-950">{story.evidenceScore}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn("h-full rounded-full transition-all", story.evidenceScore >= 80 ? "bg-emerald-500" : "bg-amber-400")}
                style={{ width: `${story.evidenceScore}%` }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 text-slate-700">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={confirmed}
              className="bg-slate-950 text-white hover:bg-slate-800"
            >
              {confirmed ? (
                <span className="flex items-center gap-2">
                  <Clock className="size-4 animate-spin" />
                  Advancing
                </span>
              ) : (
                `Confirm: advance to ${nextPhase}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
