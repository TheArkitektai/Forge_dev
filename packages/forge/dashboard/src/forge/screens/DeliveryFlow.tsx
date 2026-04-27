import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Filter,
  ListFilter,
  MessageSquare,
  Network,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildScreenPath } from "@/forge/data";
import { useForge } from "@/forge/context";
import type { RiskLevel, StoryPhase } from "@/forge/types";
import { cn } from "@/lib/utils";
import { StoryTransitionDialog } from "@/forge/components/StoryTransitionDialog";
import { GitHubPanel } from "@/forge/components/GitHubPanel";
import { StoryDetailDrawer } from "@/forge/components/StoryDetailDrawer";
import { StoryCreateDialog } from "@/forge/components/StoryCreateDialog";
import { ReworkBadge } from "@/forge/components/ReworkBadge";
import { ExecutionLoopPanel } from "@/forge/components/ExecutionLoopPanel";
import { DeliveryModeSwitcher } from "@/forge/components/DeliveryModeSwitcher";
import { ProductionStoryCard } from "@/forge/components/ProductionStoryCard";
import { ProductionRightRail } from "@/forge/components/ProductionRightRail";

const devPhases: StoryPhase[] = ["Plan", "Design", "Develop", "Test", "Ship"];
const riskOptions: Array<RiskLevel | "All"> = ["All", "Low", "Medium", "High"];

type SortKey = "priority" | "confidence" | "owner";
type DeliveryMode = "development" | "production";

export function DeliveryFlowScreen() {
  const {
    activePersona,
    selectedStory,
    setSelectedStoryId,
    stories,
    openStoryDrawer,
    executionRuns,
    operateMetrics,
  } = useForge();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<DeliveryMode>("development");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [myStories, setMyStories] = useState(false);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const devStories = useMemo(() => stories.filter(s => s.phase !== "Operate"), [stories]);
  const prodStories = useMemo(() => stories.filter(s => s.phase === "Operate"), [stories]);

  /* Auto-select appropriate story when switching modes */
  useEffect(() => {
    if (mode === "production") {
      const firstProd = prodStories[0];
      if (firstProd && selectedStory.phase !== "Operate") {
        setSelectedStoryId(firstProd.id);
      }
    } else {
      const firstDev = devStories[0];
      if (firstDev && selectedStory.phase === "Operate") {
        setSelectedStoryId(firstDev.id);
      }
    }
  }, [mode, prodStories, devStories, selectedStory.phase, setSelectedStoryId]);

  const visibleStories = useMemo(() => {
    const source = mode === "development" ? devStories : prodStories;
    const filtered = source.filter(story => {
      if (riskFilter !== "All" && story.risk !== riskFilter) return false;
      if (myStories && (story.personaActions[activePersona] ?? []).length === 0) return false;
      return true;
    });

    return [...filtered].sort((left, right) => {
      if (sortKey === "confidence") {
        return right.confidence - left.confidence;
      }
      if (sortKey === "owner") {
        return left.owner.localeCompare(right.owner);
      }
      const riskWeight: Record<RiskLevel, number> = { High: 3, Medium: 2, Low: 1 };
      return riskWeight[right.risk] - riskWeight[left.risk];
    });
  }, [mode, devStories, prodStories, riskFilter, sortKey, myStories, activePersona]);

  const grouped = useMemo(() => {
    if (mode === "production") return [];
    return devPhases.map(phase => ({
      phase,
      stories: visibleStories.filter(story => story.phase === phase),
    }));
  }, [visibleStories, mode]);

  const relatedContext = selectedStory.memoryEvents.slice(0, 2);
  const relatedControls = selectedStory.controls.slice(0, 2);

  const openStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    setLocation(buildScreenPath("delivery", storyId));
    openStoryDrawer(storyId);
  };

  const totalIncidents = operateMetrics.activeIncidents;
  const uptime = operateMetrics.uptimePercent;

  return (
    <div className="space-y-4">
      {/* Mode-aware header */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Governed execution</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">
              {mode === "development" ? "A believable end to end workspace across all phases" : "Live production health and operational continuity"}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {mode === "development"
                ? "The selected story remains active while filters, sorting, memory, architecture, and governance stay connected to the same work item."
                : "Stories that have reached production show real time health, SLO compliance, active incidents, and deployment history in one place."}
            </p>
          </div>
          <DeliveryModeSwitcher
            mode={mode}
            onChange={setMode}
            devCount={devStories.length}
            liveCount={prodStories.length}
          />
        </div>
      </div>

      {/* Active incidents alert banner */}
      <AnimatePresence>
        {mode === "production" && totalIncidents > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 shadow-[0_12px_30px_-28px_rgba(245,158,11,0.3)]">
              <ShieldAlert className="size-5 shrink-0 text-amber-600" />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold text-amber-800">{totalIncidents} active {totalIncidents === 1 ? "incident" : "incidents"} affecting production</span>
                <span className="text-sm text-amber-700">Review the incident panel on any live story to investigate and resolve.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {mode === "development" ? (
          <motion.div
            key="development"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                <div className="flex flex-wrap gap-2">
                  {riskOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRiskFilter(option)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                        riskFilter === option
                          ? "border-slate-900 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-slate-900"
                      )}
                    >
                      {option} risk
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setMyStories(v => !v)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                    myStories
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-slate-900"
                  )}
                >
                  <User className="size-4" />
                  My stories
                </button>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                  <ListFilter className="size-4 text-slate-400" />
                  <select
                    value={sortKey}
                    onChange={event => setSortKey(event.target.value as SortKey)}
                    className="bg-transparent font-semibold text-slate-700 outline-none"
                  >
                    <option value="priority">Sort by priority</option>
                    <option value="confidence">Sort by confidence</option>
                    <option value="owner">Sort by owner</option>
                  </select>
                </div>
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-slate-950 text-white hover:bg-slate-800"
                >
                  <Plus className="size-4" />
                  Create Story
                </Button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_360px]">
              {/* Kanban */}
              <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Delivery board</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">Flow stays readable across desktop and smaller workspaces</h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
                    <Filter className="size-4" />
                    {visibleStories.length} visible stories
                  </div>
                </div>

                <LayoutGroup>
                  <div className="mt-5 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
                    {grouped.map(group => (
                      <div key={group.phase} className="snap-start min-w-[280px] max-w-[300px] flex-1 rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">{group.phase}</p>
                              <p className="text-sm text-slate-500">{group.stories.length} active stories</p>
                            </div>
                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                              {group.phase === selectedStory.phase ? "Current" : "Phase"}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            {group.stories.length > 0 ? (
                              <>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span>Avg confidence</span>
                                    <span className="font-semibold text-slate-600">
                                      {Math.round(group.stories.reduce((sum, s) => sum + s.confidence, 0) / group.stories.length)}%
                                    </span>
                                  </div>
                                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                      className="h-full rounded-full bg-sky-400 transition-all"
                                      style={{ width: `${Math.round(group.stories.reduce((sum, s) => sum + s.confidence, 0) / group.stories.length)}%` }}
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400">No stories</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCreateOpen(true)}
                              className="ml-2 rounded-full bg-white p-1.5 text-slate-400 ring-1 ring-slate-200 transition hover:text-sky-700 hover:ring-sky-200"
                              title={`Create story in ${group.phase}`}
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <AnimatePresence mode="popLayout">
                            {group.stories.length ? (
                              group.stories.map(story => (
                                <motion.button
                                  key={story.id}
                                  layoutId={story.id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.96 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.96 }}
                                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                  type="button"
                                  onClick={() => openStory(story.id)}
                                  className={cn(
                                    "w-full rounded-[16px] border p-4 text-left",
                                    story.id === selectedStory.id
                                      ? "border-slate-900 bg-slate-950 text-white shadow-[0_20px_40px_-30px_rgba(15,23,42,0.7)]"
                                      : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40"
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className={cn("text-base font-semibold", story.id === selectedStory.id ? "text-white" : "text-slate-950")}>
                                        {story.title}
                                      </p>
                                      <p className={cn("mt-1 text-sm", story.id === selectedStory.id ? "text-white/70" : "text-slate-500")}>
                                        {story.owner}
                                      </p>
                                    </div>
                                    <span className={cn(
                                      "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                                      story.id === selectedStory.id
                                        ? "bg-white/10 text-white ring-white/20"
                                        : story.risk === "High"
                                          ? "bg-amber-50 text-amber-700 ring-amber-100"
                                          : story.risk === "Medium"
                                            ? "bg-sky-50 text-sky-700 ring-sky-100"
                                            : "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                    )}>
                                      {story.risk} risk
                                    </span>
                                  </div>
                                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                                    <motion.div
                                      className={cn("h-full rounded-full", story.id === selectedStory.id ? "bg-white" : "bg-sky-500")}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${story.confidence}%` }}
                                      transition={{ duration: 0.6, ease: "easeOut" }}
                                    />
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", story.id === selectedStory.id ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600")}>
                                      {story.memoryLinks} memory links
                                    </span>
                                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", story.id === selectedStory.id ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600")}>
                                      {story.confidence}% confidence
                                    </span>
                                  </div>
                                  {story.agentOutputs?.[story.phase]?.sections?.some(s => s.status === "reworked") && (
                                    <div className="mt-2">
                                      <ReworkBadge status="reworked" />
                                    </div>
                                  )}
                                  {(() => {
                                    const run = executionRuns.find(r => r.storyId === story.id);
                                    if (!run) return null;
                                    if (run.status === "awaiting_review") return (
                                      <div className={cn("mt-2 flex items-center gap-1.5 text-[11px] font-semibold", story.id === selectedStory.id ? "text-white/70" : "text-amber-600")}>
                                        <ShieldCheck className="size-3.5" />
                                        Awaiting review: PR #{run.prNumber}
                                      </div>
                                    );
                                    if (run.status === "escalated") return (
                                      <div className={cn("mt-2 flex items-center gap-1.5 text-[11px] font-semibold", story.id === selectedStory.id ? "text-white/70" : "text-red-600")}>
                                        <Network className="size-3.5" />
                                        Escalated to human
                                      </div>
                                    );
                                    return (
                                      <div className={cn("mt-2 flex items-center gap-1.5 text-[11px] font-semibold", story.id === selectedStory.id ? "text-white/70" : "text-sky-600")}>
                                        <Zap className="size-3.5" />
                                        Agent coding: iteration {run.currentIteration}/{run.maxIterations}
                                      </div>
                                    );
                                  })()}
                                  {(story.feedbackHistory?.length ?? 0) > 0 && (
                                    <div className={cn("mt-2 flex items-center gap-1.5 text-[11px] font-semibold", story.id === selectedStory.id ? "text-white/70" : "text-slate-500")}>
                                      <MessageSquare className="size-3.5" />
                                      {story.feedbackHistory!.length} {story.feedbackHistory!.length === 1 ? "comment" : "comments"}
                                    </div>
                                  )}
                                </motion.button>
                              ))
                            ) : (
                              <div className="flex flex-col items-center rounded-[16px] border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
                                <div className="rounded-xl bg-slate-50 p-2 text-slate-300 ring-1 ring-slate-200">
                                  <Plus className="size-4" />
                                </div>
                                <p className="mt-3 text-sm font-semibold text-slate-900">No stories in {group.phase}</p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">Create a story or move one forward to populate this phase.</p>
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>
                </LayoutGroup>
              </section>

              {/* Development right rail */}
              <section className="space-y-4">
                <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Active story</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">{selectedStory.title}</h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">{selectedStory.phase}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{selectedStory.personaFocus[activePersona] ?? ""}</p>
                  <div className="mt-4 space-y-3">
                    {(selectedStory.personaActions[activePersona] ?? []).map(action => (
                      <div key={action} className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-800">{action}</div>
                    ))}
                  </div>
                  {selectedStory.phase !== "Operate" ? (
                    <Button
                      onClick={() => setTransitionOpen(true)}
                      className="mt-4 flex w-full items-center justify-center gap-2 bg-slate-950 text-white hover:bg-slate-800"
                    >
                      <ArrowUpRight className="size-4" />
                      Advance to next phase
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setMode("production")}
                      className="mt-4 flex w-full items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Activity className="size-4" />
                      View production health
                    </Button>
                  )}
                </div>

                <GitHubPanel defaultView="prs" maxItems={4} />

                {selectedStory.phase === "Develop" && executionRuns.find(r => r.storyId === selectedStory.id) && (
                  <ExecutionLoopPanel run={executionRuns.find(r => r.storyId === selectedStory.id)!} />
                )}

                <StoryTransitionDialog story={selectedStory} open={transitionOpen} onOpenChange={setTransitionOpen} />

                {/* Related surfaces with inline previews */}
                <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Related surfaces</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">This story is already connected beyond delivery</h3>
                    </div>
                    <ChevronRight className="size-4 text-sky-700" />
                  </div>

                  <div className="mt-4 space-y-3">
                    {/* Context Hub preview */}
                    <button
                      type="button"
                      onClick={() => setLocation(buildScreenPath("context", selectedStory.id))}
                      className="flex w-full items-start gap-3 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:border-sky-200 hover:bg-white"
                    >
                      <span className="rounded-2xl bg-emerald-50 p-2 text-emerald-700 ring-1 ring-emerald-100"><Sparkles className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-950">Context Hub</span>
                        {relatedContext.length > 0 ? (
                          <div className="mt-2 space-y-1.5">
                            {relatedContext.map(evt => (
                              <p key={evt.id} className="truncate text-xs text-slate-600">{evt.title}</p>
                            ))}
                          </div>
                        ) : (
                          <span className="mt-1 block text-sm leading-6 text-slate-600">Memory links are available for this story.</span>
                        )}
                      </div>
                    </button>

                    {/* Architecture preview */}
                    <button
                      type="button"
                      onClick={() => setLocation(buildScreenPath("architecture", selectedStory.id))}
                      className="flex w-full items-start gap-3 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:border-sky-200 hover:bg-white"
                    >
                      <span className="rounded-2xl bg-sky-50 p-2 text-sky-700 ring-1 ring-sky-100"><Network className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-950">Architecture</span>
                        {selectedStory.serviceImpacts.length > 0 ? (
                          <div className="mt-2 space-y-1.5">
                            {selectedStory.serviceImpacts.slice(0, 2).map(imp => (
                              <p key={imp.id} className="truncate text-xs text-slate-600">{imp.name} — {imp.detail}</p>
                            ))}
                          </div>
                        ) : (
                          <span className="mt-1 block text-sm leading-6 text-slate-600">Service impact data will appear once design is approved.</span>
                        )}
                      </div>
                    </button>

                    {/* Governance preview */}
                    <button
                      type="button"
                      onClick={() => setLocation(buildScreenPath("governance", selectedStory.id))}
                      className="flex w-full items-start gap-3 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:border-sky-200 hover:bg-white"
                    >
                      <span className="rounded-2xl bg-amber-50 p-2 text-amber-700 ring-1 ring-amber-100"><ShieldCheck className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-950">Governance</span>
                        {selectedStory.governanceQueue.length > 0 ? (
                          <div className="mt-2 space-y-1.5">
                            {selectedStory.governanceQueue.slice(0, 2).map(item => (
                              <p key={item.id} className="truncate text-xs text-slate-600">{item.title} — <span className={cn("font-semibold", item.status === "Needs action" ? "text-amber-700" : item.status === "Approved" ? "text-emerald-700" : "text-sky-700")}>{item.status}</span></p>
                            ))}
                          </div>
                        ) : (
                          <span className="mt-1 block text-sm leading-6 text-slate-600">Control posture is being tracked for this story.</span>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="production"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-4"
          >
            {/* Production metrics strip */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Live Stories", value: prodStories.length.toString(), note: "In production", tone: "green" as const },
                { label: "Active Incidents", value: totalIncidents.toString(), note: `${operateMetrics.incidentsThisWeek} this week`, tone: totalIncidents > 0 ? "amber" as const : "green" as const },
                { label: "Uptime", value: `${uptime}%`, note: "Last 30 days", tone: "green" as const },
                { label: "MTTR", value: operateMetrics.mttr, note: "Mean time to resolve", tone: "green" as const },
              ].map(metric => (
                <div key={metric.label} className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
                  <p className="text-sm text-slate-500">{metric.label}</p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.04em] text-slate-950">{metric.value}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                      metric.tone === "green" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" :
                      metric.tone === "amber" ? "bg-amber-50 text-amber-700 ring-amber-100" :
                      "bg-sky-50 text-sky-700 ring-sky-100"
                    )}>
                      {metric.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_360px]">
              {/* Production grid */}
              <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Live in production</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">Stories running in production with real time health</h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
                    <Filter className="size-4" />
                    {visibleStories.length} stories
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {visibleStories.length > 0 ? (
                      visibleStories.map(story => (
                        <ProductionStoryCard
                          key={story.id}
                          story={story}
                          isSelected={story.id === selectedStory.id}
                          onClick={() => openStory(story.id)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center rounded-[16px] border border-dashed border-slate-200 bg-white px-4 py-14 text-center">
                        <div className="rounded-2xl bg-slate-50 p-3 text-slate-400 ring-1 ring-slate-200">
                          <Zap className="size-6" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-900">No stories in production yet</p>
                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Stories appear here once they are advanced through all development phases and released. Switch to In Development to move stories forward.</p>
                        <Button
                          onClick={() => setMode("development")}
                          variant="outline"
                          className="mt-4 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          Go to Development
                        </Button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Production right rail */}
              {selectedStory.phase === "Operate" && selectedStory.productionHealth ? (
                <ProductionRightRail story={selectedStory} />
              ) : (
                <section className="space-y-4">
                  <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.18)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Production detail</p>
                    <p className="mt-4 text-sm text-slate-400">Select a live story to view production health, incidents, and deployment history.</p>
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StoryDetailDrawer />
      <StoryCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
