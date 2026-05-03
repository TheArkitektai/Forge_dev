import React from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  BellRing,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  CloudCog,
  Cpu,
  Database,
  GitBranch,
  GitCommit,
  GitPullRequest,
  HardDrive,
  Layers,
  Link2,
  ListChecks,
  Lock,
  Monitor,
  Package,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { personaMetricCards, releaseTrend } from "@/forge/data";
import { demoPullRequests, demoCommits, demoRepo } from "@/forge/githubData";
import { useForge } from "@/forge/context";
import { cn } from "@/lib/utils";
import { AIAgentPanel } from "@/forge/components/AIAgentPanel";
import { ContextBudgetGauge as ContextBudgetGaugeComponent } from "@/forge/components/ContextBudgetGauge";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const CARD = "rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]";
const LABEL = "text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500";
const TITLE = "text-xl font-semibold text-slate-950";

const toneStyles: Record<string, string> = {
  blue: "text-sky-700",
  green: "text-emerald-700",
  slate: "text-slate-900",
  amber: "text-amber-700",
};

// ---------------------------------------------------------------------------
// Persona widget layouts
// ---------------------------------------------------------------------------
const personaWidgetLayouts: Record<string, { main: string[]; sidebar: string[] }> = {
  "cto": {
    main: ["portfolio-kpis", "release-confidence-trend", "compounding-value"],
    sidebar: ["proof-chain-gauge", "governance-queue", "operate-incidents"],
  },
  "delivery-lead": {
    main: ["phase-distribution", "story-spotlight", "active-assignments"],
    sidebar: ["release-confidence-trend", "persona-metrics"],
  },
  "solution-architect": {
    main: ["architecture-impact", "story-spotlight", "cross-project-dependencies"],
    sidebar: ["context-quality", "proof-chain-gauge"],
  },
  "developer": {
    main: ["active-assignments", "context-quality", "ci-pipeline-status", "repository-activity"],
    sidebar: ["story-spotlight", "persona-metrics"],
  },
  "qa-lead": {
    main: ["test-coverage-matrix", "ci-pipeline-status", "story-spotlight"],
    sidebar: ["phase-distribution", "persona-metrics"],
  },
  "security-officer": {
    main: ["security-scan-results", "compliance-dashboard", "governance-queue", "operate-incidents"],
    sidebar: ["proof-chain-gauge", "persona-metrics"],
  },
  "compliance-officer": {
    main: ["compliance-dashboard", "governance-queue", "proof-chain-gauge"],
    sidebar: ["phase-distribution", "persona-metrics"],
  },
  "product-owner": {
    main: ["priority-matrix", "story-spotlight", "phase-distribution"],
    sidebar: ["compounding-value", "persona-metrics"],
  },
  "devops-lead": {
    main: ["ci-pipeline-status", "active-assignments", "cost-dashboard"],
    sidebar: ["story-spotlight", "persona-metrics", "operate-incidents", "repository-activity"],
  },
  "programme-director": {
    main: ["portfolio-kpis", "cross-project-dependencies", "compounding-value"],
    sidebar: ["release-confidence-trend", "governance-queue", "operate-incidents"],
  },
};

// ---------------------------------------------------------------------------
// Widget: Portfolio KPIs
// ---------------------------------------------------------------------------
function WidgetPortfolioKPIs() {
  const kpis = [
    { label: "Release confidence", value: "74%", tone: "text-sky-700" },
    { label: "Stories in flight", value: "4", tone: "text-slate-900" },
    { label: "Evidence coverage", value: "94%", tone: "text-emerald-700" },
    { label: "Pattern reuse", value: "+31%", tone: "text-emerald-700" },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Portfolio KPIs</p>
          <h3 className={cn("mt-2", TITLE)}>Live delivery posture across all active releases</h3>
        </div>
        <Sparkles className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-[16px] border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm text-slate-500">{k.label}</p>
            <p className={cn("mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold", k.tone)}>{k.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Release Confidence Trend
// ---------------------------------------------------------------------------
function WidgetReleaseConfidenceTrend() {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Release confidence trend</p>
          <h3 className={cn("mt-2", TITLE)}>Confidence and memory reuse moving together</h3>
        </div>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">6 week view</span>
      </div>
      <p className="mt-1 text-sm text-slate-600">Both signals are trending upward through the active release cycle.</p>
      <div className="mt-4 h-[260px] rounded-[14px] bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
        <ChartContainer
          config={{
            confidence: { label: "Release confidence", color: "oklch(0.63 0.17 246)" },
            reuse: { label: "Memory reuse", color: "oklch(0.72 0.14 161)" },
          }}
          className="h-full w-full !aspect-auto"
        >
          <LineChart data={releaseTrend} margin={{ left: 12, right: 12, top: 12, bottom: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="period" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="confidence" stroke="var(--color-confidence)" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="reuse" stroke="var(--color-reuse)" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Proof Chain Gauge
// ---------------------------------------------------------------------------
function WidgetProofChainGauge() {
  const { selectedStory } = useForge();
  const governanceRing = [{ name: "Proof", value: selectedStory.evidenceScore, fill: "oklch(0.63 0.17 246)" }];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Proof chain</p>
          <h3 className={cn("mt-2", TITLE)}>Evidence completeness</h3>
        </div>
        <BadgeCheck className="size-5 text-emerald-600" />
      </div>
      <div className="mt-4 flex items-center gap-6">
        <div className="h-32 w-32 shrink-0">
          <ChartContainer
            config={{ value: { label: "Proof", color: "oklch(0.63 0.17 246)" } }}
            className="h-full w-full !aspect-square"
          >
            <RadialBarChart data={governanceRing} innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar dataKey="value" background cornerRadius={999} />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            </RadialBarChart>
          </ChartContainer>
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950">{selectedStory.evidenceScore}%</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Evidence, rationale, and approvals remain connected to the same release story.</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Story Spotlight
// ---------------------------------------------------------------------------
function WidgetStorySpotlight() {
  const { selectedStory, openStoryDrawer } = useForge();
  const riskColor =
    selectedStory.risk === "Low" ? "text-emerald-700 ring-emerald-100 bg-emerald-50" :
    selectedStory.risk === "Medium" ? "text-amber-700 ring-amber-100 bg-amber-50" :
    "text-rose-700 ring-rose-100 bg-rose-50";
  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={LABEL}>Story spotlight</p>
          <h3 className={cn("mt-2", TITLE)}>{selectedStory.title}</h3>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", riskColor)}>
          {selectedStory.risk} risk
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{selectedStory.summary}</p>

      <div className="mt-4 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Current phase</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{selectedStory.phase}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Next gate</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{selectedStory.nextGate}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[14px] bg-white p-3 ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Confidence</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">{selectedStory.confidence}%</p>
          </div>
          <div className="rounded-[14px] bg-white p-3 ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Memory links</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold text-emerald-700">{selectedStory.memoryLinks}</p>
          </div>
        </div>
      </div>

      <Button
        className="mt-4 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800"
        onClick={() => openStoryDrawer(selectedStory.id)}
      >
        Open story detail
        <ChevronRight className="ml-1 size-4" />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Governance Queue
// ---------------------------------------------------------------------------
function WidgetGovernanceQueue() {
  const { selectedStory, approveGovernanceItem } = useForge();
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Governance queue</p>
          <h3 className={cn("mt-2", TITLE)}>Decisions waiting for action</h3>
        </div>
        <BellRing className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-3">
        {selectedStory.governanceQueue.map(item => {
          const isApproved = item.status === "Approved";
          return (
            <div key={item.id} className="rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 transition hover:border-sky-200 hover:bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.owner}</p>
                </div>
                {isApproved ? (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    Approved
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                    {item.status}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">{item.time}</span>
                {!isApproved && (
                  <Button
                    size="sm"
                    className="h-7 rounded-full bg-sky-700 px-3 text-xs text-white hover:bg-sky-600"
                    onClick={() => approveGovernanceItem(item.id, "approved")}
                  >
                    Approve
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: CI Pipeline Status
// ---------------------------------------------------------------------------
function WidgetCIPipelineStatus() {
  const stages = [
    { label: "Build", detail: "All checks passed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
    { label: "Unit tests", detail: "87 of 87 passing", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
    { label: "Deployment", detail: "Ready to deploy", icon: Circle, color: "text-sky-600", bg: "bg-sky-50", ring: "ring-sky-100" },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>CI pipeline status</p>
          <h3 className={cn("mt-2", TITLE)}>Build and test pipeline</h3>
        </div>
        <Zap className="size-5 text-amber-600" />
      </div>
      <div className="mt-4 space-y-3">
        {stages.map(s => (
          <div key={s.label} className="flex items-center gap-4 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4">
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full ring-1", s.bg, s.ring)}>
              <s.icon className={cn("size-4", s.color)} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-950">{s.label}</p>
              <p className="mt-0.5 text-sm text-slate-500">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-4 w-full rounded-full border-slate-200 text-slate-700">
        <RefreshCw className="mr-2 size-3.5" />
        Re-run pipeline
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Repository Activity
// ---------------------------------------------------------------------------
function WidgetRepositoryActivity() {
  const openPRs = demoPullRequests.filter(pr => pr.status === "open").length;
  const commitsToday = demoCommits.filter(c => c.timestamp.includes("hour") || c.timestamp.includes("Just now")).length;
  const branchCount = demoRepo.branches.length;
  const items = [
    { label: "Open PRs", value: openPRs, icon: GitPullRequest, color: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-100" },
    { label: "Commits today", value: commitsToday, icon: GitCommit, color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-100" },
    { label: "Branches", value: branchCount, icon: GitBranch, color: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-100" },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Repository activity</p>
          <h3 className={cn("mt-2", TITLE)}>{demoRepo.owner}/{demoRepo.name}</h3>
        </div>
        <GitBranch className="size-5 text-slate-600" />
      </div>
      <div className="mt-4 space-y-3">
        {items.map(s => (
          <div key={s.label} className="flex items-center gap-4 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4">
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full ring-1", s.bg, s.ring)}>
              <s.icon className={cn("size-4", s.color)} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-950">{s.label}</p>
            </div>
            <span className="text-lg font-semibold text-slate-950">{s.value}</span>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-4 w-full rounded-full border-slate-200 text-slate-700" onClick={() => window.open(demoRepo.url, "_blank")}>
        <GitPullRequest className="mr-2 size-3.5" />
        View repository
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Phase Distribution
// ---------------------------------------------------------------------------
function WidgetPhaseDistribution() {
  const { stories } = useForge();
  const phases = ["Plan", "Design", "Develop", "Test", "Ship"];
  const counts = phases.map(phase => ({
    phase,
    count: stories.filter(s => s.phase === phase).length,
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Phase distribution</p>
          <h3 className={cn("mt-2", TITLE)}>Stories across the SDLC</h3>
        </div>
        <TrendingUp className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-3">
        {counts.map(item => (
          <div key={item.phase} className="rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 transition hover:border-sky-200 hover:bg-white">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-950">{item.phase}</p>
              <span className="text-sm text-slate-500">{item.count} active</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-sky-700 transition-all"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Active Assignments
// ---------------------------------------------------------------------------
function WidgetActiveAssignments() {
  const { storyList, activePersona } = useForge();
  const assigned = storyList.filter(
    s => (s.personaActions[activePersona]?.length ?? 0) > 0,
  );
  const phaseColor: Record<string, string> = {
    Plan: "bg-slate-100 text-slate-700",
    Design: "bg-violet-50 text-violet-700",
    Develop: "bg-sky-50 text-sky-700",
    Test: "bg-amber-50 text-amber-700",
    Ship: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Active assignments</p>
          <h3 className={cn("mt-2", TITLE)}>Stories requiring your attention</h3>
        </div>
        <ListChecks className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-3">
        {assigned.length === 0 ? (
          <p className="text-sm text-slate-500">No active assignments for this persona.</p>
        ) : (
          assigned.map(s => (
            <div key={s.id} className="rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 transition hover:border-sky-200 hover:bg-white">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-950">{s.title}</p>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", phaseColor[s.phase] ?? "bg-slate-100 text-slate-700")}>
                  {s.phase}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-slate-500">{s.personaActions[activePersona]?.[0] ?? ""}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Persona Metrics
// ---------------------------------------------------------------------------
function WidgetPersonaMetrics() {
  const { selectedStory, activePersona } = useForge();
  const actions = selectedStory.personaActions[activePersona] ?? [];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Persona priorities</p>
          <h3 className={cn("mt-2", TITLE)}>What this lens should do next</h3>
        </div>
        <Clock3 className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-3">
        {actions.map(action => (
          <div
            key={action}
            className="flex items-center gap-3 rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-800"
          >
            <BookOpenText className="size-4 shrink-0 text-emerald-600" />
            <span>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Compounding Value
// ---------------------------------------------------------------------------
const compoundingData = [
  { week: "W1", value: 12 },
  { week: "W2", value: 19 },
  { week: "W3", value: 28 },
  { week: "W4", value: 41 },
  { week: "W5", value: 56 },
  { week: "W6", value: 74 },
];

function WidgetCompoundingValue() {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Compounding value</p>
          <h3 className={cn("mt-2", TITLE)}>Delivery velocity over 6 weeks</h3>
        </div>
        <TrendingUp className="size-5 text-emerald-600" />
      </div>
      <p className="mt-1 text-sm text-slate-600">Pattern reuse and memory maturity are accelerating value output week on week.</p>
      <div className="mt-4 h-[220px] rounded-[14px] bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
        <ChartContainer
          config={{ value: { label: "Value index", color: "oklch(0.72 0.14 161)" } }}
          className="h-full w-full !aspect-auto"
        >
          <BarChart data={compoundingData} margin={{ left: 0, right: 12, top: 12, bottom: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Test Coverage Matrix
// ---------------------------------------------------------------------------
function WidgetTestCoverageMatrix() {
  const rows = [
    { module: "Auth", coverage: 94 },
    { module: "Governance", coverage: 87 },
    { module: "API layer", coverage: 91 },
    { module: "Context compiler", coverage: 78 },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Test coverage matrix</p>
          <h3 className={cn("mt-2", TITLE)}>Coverage by module</h3>
        </div>
        <ListChecks className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-3">
        {rows.map(row => (
          <div key={row.module} className="rounded-[14px] border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-950">{row.module}</p>
              <span className={cn(
                "text-sm font-semibold",
                row.coverage >= 90 ? "text-emerald-700" : row.coverage >= 80 ? "text-sky-700" : "text-amber-700",
              )}>
                {row.coverage}%
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div
                className={cn("h-2 rounded-full transition-all", row.coverage >= 90 ? "bg-emerald-500" : row.coverage >= 80 ? "bg-sky-600" : "bg-amber-500")}
                style={{ width: `${row.coverage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Compliance Dashboard
// ---------------------------------------------------------------------------
function WidgetComplianceDashboard() {
  const bars = [
    { label: "PDPL", value: 94, color: "bg-emerald-500" },
    { label: "NCA ECC", value: 87, color: "bg-sky-600" },
    { label: "Audit readiness", value: 91, color: "bg-violet-500" },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Compliance dashboard</p>
          <h3 className={cn("mt-2", TITLE)}>Regulatory posture</h3>
        </div>
        <Shield className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-4">
        {bars.map(b => (
          <div key={b.label}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-950">{b.label}</p>
              <span className="text-sm font-semibold text-slate-700">{b.value}%</span>
            </div>
            <div className="mt-2 h-2.5 rounded-full bg-slate-200">
              <div className={cn("h-2.5 rounded-full transition-all", b.color)} style={{ width: `${b.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Security Scan Results
// ---------------------------------------------------------------------------
function WidgetSecurityScanResults() {
  const scans = [
    { label: "SAST scan", result: "0 critical", ok: true },
    { label: "Dependency audit", result: "2 low severity", ok: true },
    { label: "PDPL compliance", result: "Pass", ok: true },
    { label: "NCA ECC", result: "Pass", ok: true },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Security scan results</p>
          <h3 className={cn("mt-2", TITLE)}>Latest automated scan summary</h3>
        </div>
        <Lock className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-3">
        {scans.map(s => (
          <div key={s.label} className="flex items-center justify-between rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-950">{s.label}</p>
            </div>
            <span className="text-sm text-slate-500">{s.result}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Context Quality
// ---------------------------------------------------------------------------
function WidgetContextQuality() {
  const metrics = [
    { label: "Memory events", value: "4,447", icon: Database, color: "text-sky-700" },
    { label: "Active patterns", value: "186", icon: Sparkles, color: "text-violet-700" },
    { label: "Context freshness", value: "97%", icon: Zap, color: "text-emerald-700" },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Context quality</p>
          <h3 className={cn("mt-2", TITLE)}>Memory and pattern health</h3>
        </div>
        <Database className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-3">
        {metrics.map(m => (
          <div key={m.label} className="flex items-center gap-4 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
              <m.icon className={cn("size-4", m.color)} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">{m.label}</p>
              <p className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{m.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Cost Dashboard
// ---------------------------------------------------------------------------
function WidgetCostDashboard() {
  const costs = [
    { label: "Cloud (MTD)", value: "$4,240", icon: CloudCog, color: "text-sky-700" },
    { label: "AI compute", value: "$1,180", icon: Cpu, color: "text-violet-700" },
    { label: "Storage", value: "$320", icon: HardDrive, color: "text-slate-700" },
    { label: "Total", value: "$5,740", icon: Package, color: "text-emerald-700", highlight: true },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Cost dashboard</p>
          <h3 className={cn("mt-2", TITLE)}>Month to date spend breakdown</h3>
        </div>
        <Package className="size-5 text-slate-700" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {costs.map(c => (
          <div
            key={c.label}
            className={cn(
              "rounded-[16px] border p-4 transition",
              c.highlight
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50/60",
            )}
          >
            <div className="flex items-center gap-2">
              <c.icon className={cn("size-4", c.color)} />
              <p className="text-sm text-slate-500">{c.label}</p>
            </div>
            <p className={cn("mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold", c.color)}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Priority Matrix
// ---------------------------------------------------------------------------
function WidgetPriorityMatrix() {
  const quadrants = [
    {
      label: "High impact, low effort",
      stories: ["AI memory baseline", "PDPL policy rules"],
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badge: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "High impact, high effort",
      stories: ["Cross agency data mesh"],
      bg: "bg-sky-50",
      border: "border-sky-200",
      badge: "bg-sky-100 text-sky-700",
    },
    {
      label: "Low impact, low effort",
      stories: ["Notification polish"],
      bg: "bg-slate-50",
      border: "border-slate-200",
      badge: "bg-slate-100 text-slate-700",
    },
    {
      label: "Low impact, high effort",
      stories: ["Legacy migration prep"],
      bg: "bg-amber-50",
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-700",
    },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Priority matrix</p>
          <h3 className={cn("mt-2", TITLE)}>Stories by impact and effort</h3>
        </div>
        <Layers className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {quadrants.map(q => (
          <div key={q.label} className={cn("rounded-[16px] border p-4", q.bg, q.border)}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{q.label}</p>
            <div className="mt-2 space-y-1.5">
              {q.stories.map(s => (
                <span key={s} className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", q.badge)}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Architecture Impact
// ---------------------------------------------------------------------------
function WidgetArchitectureImpact() {
  const { selectedStory } = useForge();
  const services = selectedStory.services ?? [];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Architecture impact</p>
          <h3 className={cn("mt-2", TITLE)}>Impacted layers and services</h3>
        </div>
        <Layers className="size-5 text-sky-700" />
      </div>
      <p className="mt-1 text-sm text-slate-600">Services and components touched by the active story.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {services.length === 0 ? (
          <p className="text-sm text-slate-500">No services listed for this story.</p>
        ) : (
          services.map(svc => (
            <span
              key={svc}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700"
            >
              {svc}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget: Cross Project Dependencies
// ---------------------------------------------------------------------------
function WidgetCrossProjectDependencies() {
  const deps = [
    { from: "Citizen Portal", to: "Identity Service", type: "depends on" },
    { from: "Permit API", to: "Trade License", type: "shared with" },
    { from: "PDPL policy engine", to: "4 projects", type: "shared across" },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Cross project dependencies</p>
          <h3 className={cn("mt-2", TITLE)}>Shared services and coupling points</h3>
        </div>
        <Link2 className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-3">
        {deps.map(d => (
          <div key={d.from + d.to} className="flex items-center gap-3 rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
            <GitBranch className="size-4 shrink-0 text-slate-400" />
            <p className="text-sm text-slate-800">
              <span className="font-semibold text-slate-950">{d.from}</span>
              {" "}
              <span className="text-slate-500">{d.type}</span>
              {" "}
              <span className="font-semibold text-sky-700">{d.to}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// v12 Widgets
// ---------------------------------------------------------------------------

function WidgetExecutionLoopStatus() {
  const { executionRuns } = useForge();
  const activeRuns = executionRuns.filter(r => r.status === "generating" || r.status === "testing" || r.status === "iterating");
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Execution loops</p>
          <h3 className={cn("mt-2", TITLE)}>Active autonomous code generation</h3>
        </div>
        <Zap className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-3">
        {activeRuns.length === 0 && <p className="text-sm text-slate-500">No active execution loops</p>}
        {activeRuns.map(run => (
          <div key={run.id} className="flex items-center justify-between rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{run.storyTitle}</p>
              <p className="text-xs text-slate-500">Iteration {run.currentIteration} of {run.maxIterations}</p>
            </div>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-100">{run.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetContextBudgetGauge() {
  const { executionRuns } = useForge();
  const run = executionRuns[0];
  if (!run) return null;
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Context budget</p>
          <h3 className={cn("mt-2", TITLE)}>Token allocation health</h3>
        </div>
        <Sparkles className="size-5 text-violet-700" />
      </div>
      <div className="mt-4 flex justify-center">
        <ContextBudgetGaugeComponent allocation={{ total: run.tokenBudget, used: run.tokensUsed, breakdown: {
          designArtifact: { allocated: Math.round(run.tokenBudget * 0.4), used: Math.round(run.tokensUsed * 0.55) },
          codebaseUnderstanding: { allocated: Math.round(run.tokenBudget * 0.25), used: Math.round(run.tokensUsed * 0.26) },
          relatedPatterns: { allocated: Math.round(run.tokenBudget * 0.2), used: Math.round(run.tokensUsed * 0.14) },
          governanceRules: { allocated: Math.round(run.tokenBudget * 0.15), used: Math.round(run.tokensUsed * 0.05) },
        }}} size="sm" />
      </div>
    </div>
  );
}

function WidgetOperateIncidents() {
  const { operateMetrics, operateEvents, stories } = useForge();
  const [, setLocation] = useLocation();
  const liveStories = stories.filter(s => s.phase === "Operate");

  const severityDot = (status: string) => {
    if (status === "healthy") return "bg-emerald-500";
    if (status === "degraded") return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>System health</p>
          <h3 className={cn("mt-2", TITLE)}>Production operations at a glance</h3>
        </div>
        <Activity className="size-5 text-emerald-700" />
      </div>

      {/* Top metrics */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 p-3 text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">{operateMetrics.uptimePercent}%</p>
          <p className="text-xs text-slate-500">Uptime</p>
        </div>
        <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 p-3 text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">{operateMetrics.activeIncidents}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 p-3 text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">{operateMetrics.mttr}</p>
          <p className="text-xs text-slate-500">MTTR</p>
        </div>
      </div>

      {/* Service health map */}
      <div className="mt-4 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Services</p>
        {operateMetrics.serviceHealthMap.map(service => (
          <div key={service.service} className="flex items-center justify-between rounded-[12px] border border-slate-100 bg-slate-50/60 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", severityDot(service.status))} />
              <span className="text-sm font-medium text-slate-800">{service.service}</span>
            </div>
            <span className="text-xs font-semibold capitalize text-slate-500">{service.status}</span>
          </div>
        ))}
      </div>

      {/* Recent incidents */}
      {operateEvents.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Recent incidents</p>
          {operateEvents.slice(0, 2).map(evt => (
            <div key={evt.id} className="rounded-[12px] border border-slate-100 bg-slate-50/60 px-3 py-2">
              <p className="text-sm font-medium text-slate-800">{evt.title}</p>
              <p className="text-xs text-slate-500">{evt.severity} · {evt.status}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={() => setLocation(`/delivery/${liveStories[0]?.id ?? ""}`)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        View live production health
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function WidgetIDEConnections() {
  const { ideConnections } = useForge();
  const connected = ideConnections.filter(c => c.status === "connected" || c.status === "syncing");
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>IDE connections</p>
          <h3 className={cn("mt-2", TITLE)}>Developer tool sync</h3>
        </div>
        <Monitor className="size-5 text-sky-700" />
      </div>
      <div className="mt-4 space-y-2">
        {connected.map(ide => (
          <div key={ide.id} className="flex items-center justify-between rounded-[14px] border border-slate-200 bg-slate-50/60 px-3 py-2">
            <span className="text-sm font-semibold text-slate-800">{ide.provider === "vscode" ? "VS Code" : ide.provider === "jetbrains" ? "JetBrains" : ide.provider === "neovim" ? "Neovim" : "Cursor"}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", ide.status === "connected" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100")}>{ide.status}</span>
          </div>
        ))}
        {connected.length === 0 && <p className="text-sm text-slate-500">No IDE connections active</p>}
      </div>
    </div>
  );
}

function WidgetExplainabilityScore() {
  const { executionRuns } = useForge();
  const completed = executionRuns.filter(r => r.explainabilityReport);
  const avgConfidence = completed.length > 0
    ? Math.round(completed.reduce((sum, r) => sum + (r.explainabilityReport?.confidenceScore ?? 0), 0) / completed.length)
    : 0;
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL}>Explainability</p>
          <h3 className={cn("mt-2", TITLE)}>Autonomous execution confidence</h3>
        </div>
        <ShieldCheck className="size-5 text-emerald-700" />
      </div>
      <div className="mt-4 text-center">
        <p className={cn("font-[family-name:var(--font-display)] text-5xl font-semibold", avgConfidence >= 90 ? "text-emerald-600" : avgConfidence >= 70 ? "text-amber-600" : "text-red-600")}>{avgConfidence}%</p>
        <p className="mt-2 text-sm text-slate-500">Average confidence across {completed.length} completed run{completed.length !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// renderWidget dispatcher
// ---------------------------------------------------------------------------
function renderWidget(id: string): React.ReactNode {
  switch (id) {
    case "portfolio-kpis":              return <WidgetPortfolioKPIs />;
    case "release-confidence-trend":    return <WidgetReleaseConfidenceTrend />;
    case "proof-chain-gauge":           return <WidgetProofChainGauge />;
    case "story-spotlight":             return <WidgetStorySpotlight />;
    case "governance-queue":            return <WidgetGovernanceQueue />;
    case "ci-pipeline-status":          return <WidgetCIPipelineStatus />;
    case "phase-distribution":          return <WidgetPhaseDistribution />;
    case "active-assignments":          return <WidgetActiveAssignments />;
    case "persona-metrics":             return <WidgetPersonaMetrics />;
    case "compounding-value":           return <WidgetCompoundingValue />;
    case "test-coverage-matrix":        return <WidgetTestCoverageMatrix />;
    case "compliance-dashboard":        return <WidgetComplianceDashboard />;
    case "security-scan-results":       return <WidgetSecurityScanResults />;
    case "context-quality":             return <WidgetContextQuality />;
    case "cost-dashboard":              return <WidgetCostDashboard />;
    case "priority-matrix":             return <WidgetPriorityMatrix />;
    case "architecture-impact":         return <WidgetArchitectureImpact />;
    case "cross-project-dependencies":  return <WidgetCrossProjectDependencies />;
    case "execution-loop-status":       return <WidgetExecutionLoopStatus />;
    case "context-budget-gauge":        return <WidgetContextBudgetGauge />;
    case "operate-incidents":           return <WidgetOperateIncidents />;
    case "ide-connections":             return <WidgetIDEConnections />;
    case "explainability-score":        return <WidgetExplainabilityScore />;
    case "repository-activity":         return <WidgetRepositoryActivity />;
    default:                            return null;
  }
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export function CommandCenterScreen() {
  const {
    activePersona,
    selectedStory,
    dismissOnboarding,
    showOnboarding,
  } = useForge();

  const metrics = personaMetricCards[activePersona] ?? personaMetricCards.cto;
  const layout = personaWidgetLayouts[activePersona] ?? personaWidgetLayouts["cto"];

  return (
    <div className="space-y-4">
      {/* ── Onboarding banner ── */}
      {showOnboarding ? (
        <div className="rounded-[20px] border border-sky-100 bg-white p-5 shadow-[0_22px_55px_-38px_rgba(14,116,144,0.28)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Workspace onboarding</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                Start from one story and follow it through memory, architecture, governance, and configuration
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This workspace is personalized by persona, keeps the active story persistent across every screen, and exposes how workflow, controls, and modules shape delivery outcomes.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" onClick={dismissOnboarding} className="border-slate-200 text-slate-700">
                Dismiss guide
              </Button>
              <Button className="bg-slate-950 text-white hover:bg-slate-800">Open active story</Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Program pulse header ── */}
      <div className={CARD}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className={LABEL}>Program pulse</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">
              A real operating view across confidence, flow, memory, and release posture
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {selectedStory.personaFocus[activePersona] ?? ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full bg-sky-700 text-white hover:bg-sky-600">Review approvals</Button>
            <Button variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              Open workflow logic
            </Button>
          </div>
        </div>

        {/* Persona metrics 4-card grid */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(metric => (
            <div
              key={metric.label}
              className="rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white"
            >
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className={cn("mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold", toneStyles[metric.tone])}>
                {metric.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{metric.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Persona-adaptive widget layout ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePersona}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]"
        >
          <section className="space-y-4">
            {layout.main.map(id => (
              <React.Fragment key={id}>{renderWidget(id)}</React.Fragment>
            ))}
          </section>
          <section className="space-y-4">
            {layout.sidebar.map(id => (
              <React.Fragment key={id}>{renderWidget(id)}</React.Fragment>
            ))}
            <AIAgentPanel />
          </section>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
