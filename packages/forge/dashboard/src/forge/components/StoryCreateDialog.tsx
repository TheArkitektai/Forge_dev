import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForge } from "@/forge/context";
import type { RiskLevel, StoryPhase } from "@/forge/types";
import { cn } from "@/lib/utils";

const owners = ["Sara Malik", "Maha Noor", "Omar Rahman", "Rayan Fares", "Dana Youssef", "Leen Haddad"];
const riskLevels: RiskLevel[] = ["Low", "Medium", "High"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StoryCreateDialog({ open, onOpenChange }: Props) {
  const { storyList, createStory } = useForge() as ReturnType<typeof useForge> & { createStory?: (data: unknown) => void };
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [owner, setOwner] = useState(owners[0]);
  const [risk, setRisk] = useState<RiskLevel>("Medium");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    setSubmitting(true);

    const id = `story-${Date.now()}`;
    const newStory = {
      id,
      title: title.trim(),
      phase: "Plan" as StoryPhase,
      owner,
      ownerRole: "Team Member",
      risk,
      confidence: 70,
      memoryLinks: 0,
      evidenceScore: 0,
      summary: summary.trim() || `New story: ${title.trim()}`,
      nextGate: "Brief approval waiting",
      services: [],
      dependencies: [],
      personaFocus: {} as Record<string, string>,
      personaActions: {} as Record<string, string[]>,
      phaseStates: [],
      memoryEvents: [],
      serviceImpacts: [],
      governanceQueue: [],
      controls: [],
      rationale: [],
      configNotes: [],
      description: summary.trim(),
      acceptanceCriteria: [],
      agentOutputs: {},
      feedbackHistory: [],
    };

    if (typeof (useForge as unknown as { createStory?: unknown }).createStory === "function") {
      (createStory as (data: unknown) => void)(newStory);
    }

    setTimeout(() => {
      setSubmitting(false);
      setTitle("");
      setSummary("");
      setOwner(owners[0]);
      setRisk("Medium");
      onOpenChange(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[20px] border border-slate-200 bg-white p-0 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)]">
        <DialogHeader className="border-b border-slate-100 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-sky-50 ring-1 ring-sky-100">
              <Plus className="size-4 text-sky-600" />
            </span>
            <DialogTitle className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
              Create Story
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Story title..."
              className="w-full rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Summary</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Brief description of the story..."
              rows={3}
              className="w-full resize-none rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Owner</label>
              <select
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="w-full rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 focus:border-sky-300 focus:outline-none"
              >
                {owners.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Risk Level</label>
              <div className="flex gap-2">
                {riskLevels.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRisk(r)}
                    className={cn(
                      "flex-1 rounded-full border py-2 text-xs font-semibold transition",
                      risk === r
                        ? "border-slate-900 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-slate-100 bg-slate-50/60 px-4 py-3">
            <p className="text-sm text-slate-500">Story will be created in <span className="font-semibold text-slate-700">Plan</span> phase and will appear in the Delivery Flow kanban.</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full border-slate-200 text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Story"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
