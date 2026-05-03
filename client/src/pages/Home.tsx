/*
Design philosophy for this page
Swiss editorial futurism with enterprise calm.
This file must behave like a real product workspace, not a presentation page.
The interface should feel crisp, configurable, and operational with a strong left rail, a compact top bar, and connected work surfaces.
White carries clarity, blue carries structure, and green carries healthy flow and approval confidence.
*/

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BellDot,
  Binary,
  BookMarked,
  BrainCircuit,
  BriefcaseBusiness,
  Cable,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Cpu,
  Database,
  FileCheck2,
  Filter,
  LayoutDashboard,
  Layers3,
  ListChecks,
  Lock,
  MessagesSquare,
  Network,
  Orbit,
  PanelRightOpen,
  Puzzle,
  ScanSearch,
  ScrollText,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Waypoints,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";

type ScreenKey =
  | "command"
  | "delivery"
  | "context"
  | "architecture"
  | "governance"
  | "config";

type PersonaKey = "cto" | "lead" | "architect" | "developer";
type StoryPhase = "Plan" | "Design" | "Develop" | "Test" | "Ship";

type ScreenItem = {
  key: ScreenKey;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type PersonaMetric = {
  label: string;
  value: string;
  note: string;
  tone: string;
};

type PersonaView = {
  key: PersonaKey;
  label: string;
  summary: string;
  metrics: PersonaMetric[];
};

type Story = {
  id: string;
  title: string;
  phase: StoryPhase;
  owner: string;
  risk: string;
  memory: number;
  gate: string;
  confidence: string;
  summary: string;
  services: string[];
  evidence: string[];
};

type ApprovalItem = {
  title: string;
  owner: string;
  due: string;
  state: string;
};

type MemoryEvent = {
  time: string;
  title: string;
  note: string;
  tag: string;
};

type ServiceImpact = {
  name: string;
  state: string;
  note: string;
};

type ControlItem = {
  name: string;
  status: string;
  note: string;
};

type ConfigRule = {
  name: string;
  note: string;
  status: string;
};

const screens: ScreenItem[] = [
  {
    key: "command",
    label: "Command Center",
    title: "Command Center",
    description:
      "Portfolio confidence, active approvals, memory growth, and release posture for the live program.",
    icon: LayoutDashboard,
  },
  {
    key: "delivery",
    label: "Delivery Flow",
    title: "Delivery Flow",
    description:
      "A governed workspace across Plan, Design, Develop, Test, and Ship with story level detail.",
    icon: Workflow,
  },
  {
    key: "context",
    label: "Context Hub",
    title: "Context Hub",
    description:
      "Institutional memory, prior decisions, reusable patterns, and linked delivery intelligence.",
    icon: BrainCircuit,
  },
  {
    key: "architecture",
    label: "Architecture",
    title: "Architecture",
    description:
      "Layers, modules, impacted services, and design rationale tied directly to the active release.",
    icon: Network,
  },
  {
    key: "governance",
    label: "Governance",
    title: "Governance",
    description:
      "Proof chain, controls, approvals, and release evidence assembled as part of normal work.",
    icon: ShieldCheck,
  },
  {
    key: "config",
    label: "Config Studio",
    title: "Config Studio",
    description:
      "Workflow, policy, memory, and module configuration made visible through the interface.",
    icon: Settings2,
  },
];

const personas: PersonaView[] = [
  {
    key: "cto",
    label: "CTO Lens",
    summary:
      "Shows whether delivery is creating strategic confidence, controlled speed, and compounding organizational value.",
    metrics: [
      {
        label: "Release confidence",
        value: "94%",
        note: "Evidence remains complete across the current release train.",
        tone: "text-sky-700",
      },
      {
        label: "Memory reuse",
        value: "+31%",
        note: "Approved patterns are being reused across more stories this cycle.",
        tone: "text-emerald-600",
      },
      {
        label: "Governed stories",
        value: "43",
        note: "Live stories continue to move inside the formal operating model.",
        tone: "text-slate-900",
      },
      {
        label: "Cost guardrails",
        value: "On",
        note: "Token caps and scope boundaries remain active.",
        tone: "text-sky-700",
      },
    ],
  },
  {
    key: "lead",
    label: "Delivery Lead Lens",
    summary:
      "Highlights flow health, blocked work, pending approvals, and the places where intervention changes outcomes fastest.",
    metrics: [
      {
        label: "Flow efficiency",
        value: "86%",
        note: "Main slowdown sits between Design review and Ready Dev.",
        tone: "text-sky-700",
      },
      {
        label: "Blocked stories",
        value: "07",
        note: "Four are waiting on architecture approval.",
        tone: "text-amber-600",
      },
      {
        label: "Pending approvals",
        value: "12",
        note: "Average decision time is below thirty minutes.",
        tone: "text-emerald-600",
      },
      {
        label: "Cycle drift",
        value: "9%",
        note: "Risk remains concentrated in identity orchestration work.",
        tone: "text-slate-900",
      },
    ],
  },
  {
    key: "architect",
    label: "Architect Lens",
    summary:
      "Makes system impact, dependency shifts, design exceptions, and approved patterns the central story of the product.",
    metrics: [
      {
        label: "Impacted services",
        value: "09",
        note: "Identity and policy systems remain the main change surface.",
        tone: "text-sky-700",
      },
      {
        label: "Approved patterns",
        value: "18",
        note: "Design reuse is available directly inside the active story workspace.",
        tone: "text-emerald-600",
      },
      {
        label: "Design exceptions",
        value: "03",
        note: "All three require explicit sign off before build begins.",
        tone: "text-amber-600",
      },
      {
        label: "Reuse ratio",
        value: "73%",
        note: "Most architecture choices align with the approved reference model.",
        tone: "text-slate-900",
      },
    ],
  },
  {
    key: "developer",
    label: "Developer Lens",
    summary:
      "Brings next action, story context, prior implementations, and proof expectations into one practical working view.",
    metrics: [
      {
        label: "Ready story packs",
        value: "29",
        note: "Each pack includes context, acceptance logic, and memory links.",
        tone: "text-sky-700",
      },
      {
        label: "Cold starts avoided",
        value: "81%",
        note: "Relevant prior work is already surfaced before coding begins.",
        tone: "text-emerald-600",
      },
      {
        label: "Linked examples",
        value: "12",
        note: "The selected story includes code and design references.",
        tone: "text-slate-900",
      },
      {
        label: "Proof complete",
        value: "96%",
        note: "Most working stories already meet review and evidence expectations.",
        tone: "text-emerald-600",
      },
    ],
  },
];

const stories: Story[] = [
  {
    id: "identity",
    title: "Citizen Identity Verification",
    phase: "Design",
    owner: "Sara Malik",
    risk: "High",
    memory: 14,
    gate: "Architecture review due today",
    confidence: "88%",
    summary:
      "Build a governed identity verification orchestration that keeps residency, approval trace, and policy awareness intact from brief to release.",
    services: ["Identity Service", "Policy Engine", "Context Compiler", "Audit Graph"],
    evidence: ["Design rationale ready", "Risk assessment complete", "Memory links attached"],
  },
  {
    id: "briefing",
    title: "Permit Intake Brief Pack",
    phase: "Plan",
    owner: "Maha Noor",
    risk: "Medium",
    memory: 6,
    gate: "Brief approval waiting",
    confidence: "91%",
    summary:
      "Standardize intake context, estimate confidence, and release impact before downstream work begins.",
    services: ["Directive Intake", "Context Compiler"],
    evidence: ["Eight step brief ready", "Risk tags applied"],
  },
  {
    id: "policy",
    title: "Permit Policy Rules Engine",
    phase: "Develop",
    owner: "Omar Rahman",
    risk: "Medium",
    memory: 11,
    gate: "Code review next",
    confidence: "93%",
    summary:
      "Implement reusable permit policy rules with a human review gate before CI.",
    services: ["Policy Engine", "Rules Registry"],
    evidence: ["Test coverage linked", "Reuse pattern applied"],
  },
  {
    id: "notifications",
    title: "Decision Notification Service",
    phase: "Develop",
    owner: "Leen Haddad",
    risk: "Low",
    memory: 5,
    gate: "Testing in progress",
    confidence: "95%",
    summary:
      "Deliver event based notifications tied to governed decision outcomes and proof events.",
    services: ["Notification Service", "Event Bus"],
    evidence: ["Sandbox logs retained", "Secrets scan clean"],
  },
  {
    id: "regression",
    title: "Cross Ministry Regression Suite",
    phase: "Test",
    owner: "Rayan Fares",
    risk: "Medium",
    memory: 9,
    gate: "Proof validation running",
    confidence: "90%",
    summary:
      "Verify release readiness across identity, workflow, and evidence paths before ship.",
    services: ["Test Runner", "Proof Validator"],
    evidence: ["Hallucination checks active", "PII scan complete"],
  },
  {
    id: "release",
    title: "Release 24.4 Evidence Pack",
    phase: "Ship",
    owner: "Dana Youssef",
    risk: "Low",
    memory: 8,
    gate: "Ready for sponsor review",
    confidence: "97%",
    summary:
      "Assemble release record with approvals, controls, design rationale, and deployment proof.",
    services: ["Release Desk", "Evidence Pack"],
    evidence: ["Proof chain complete", "Approval record signed"],
  },
  {
    id: "mapping",
    title: "Control Mapping Update",
    phase: "Plan",
    owner: "Yara Adel",
    risk: "Low",
    memory: 4,
    gate: "Policy review next",
    confidence: "92%",
    summary:
      "Update control mapping for the latest policy library and tenant specific approval model.",
    services: ["Compliance Library", "Policy Engine"],
    evidence: ["Mapping diff recorded", "Retention note added"],
  },
  {
    id: "audit",
    title: "Audit Graph Optimization",
    phase: "Design",
    owner: "Adel Sami",
    risk: "Medium",
    memory: 10,
    gate: "Graph review tomorrow",
    confidence: "89%",
    summary:
      "Reduce proof retrieval time while preserving full traceability across release events.",
    services: ["Audit Graph", "Storage Tiering"],
    evidence: ["Benchmark attached", "Trade off documented"],
  },
];

const approvals: ApprovalItem[] = [
  {
    title: "Identity orchestration design review",
    owner: "Architecture Office",
    due: "Today 14:30",
    state: "Needs decision",
  },
  {
    title: "Workflow gate exception for test replay",
    owner: "Delivery Lead",
    due: "Today 16:00",
    state: "Reviewing",
  },
  {
    title: "Release 24.4 sponsor sign off",
    owner: "Program Director",
    due: "Tomorrow 09:00",
    state: "Ready",
  },
];

const memoryEvents: MemoryEvent[] = [
  {
    time: "2h ago",
    title: "Umrah permits pattern linked to active identity story",
    note: "The system surfaced a prior approval path and its accepted consent model.",
    tag: "Pattern reuse",
  },
  {
    time: "5h ago",
    title: "Health claims release pack reused for evidence structure",
    note: "Proof pack sections were cloned and adjusted instead of rebuilt from zero.",
    tag: "Evidence reuse",
  },
  {
    time: "Yesterday",
    title: "New lesson learned added on policy edge cases",
    note: "A failed approval chain is now available as guidance before build starts.",
    tag: "Lesson learned",
  },
  {
    time: "2 days ago",
    title: "Architecture rationale indexed into the Code Understanding Index",
    note: "Future stories can now retrieve why the audit graph stayed internal.",
    tag: "Reasoning stored",
  },
];

const serviceImpacts: ServiceImpact[] = [
  {
    name: "Identity Service",
    state: "Active change",
    note: "Adding a governed verification branch for citizen matching and exception review.",
  },
  {
    name: "Policy Engine",
    state: "Shared dependency",
    note: "New approval rules and residency checks flow through this service.",
  },
  {
    name: "Context Compiler",
    state: "High reuse",
    note: "Feeds story packs with prior designs, lessons learned, and release evidence.",
  },
  {
    name: "Audit Graph",
    state: "Performance focus",
    note: "Proof retrieval improvements are under design without weakening immutability.",
  },
  {
    name: "Workflow Runtime",
    state: "Stable",
    note: "Current tenant logic remains valid across the release train.",
  },
  {
    name: "Module Registry",
    state: "Configurable",
    note: "Tenant specific modules are active with clear governance boundaries.",
  },
];

const controls: ControlItem[] = [
  {
    name: "Proof chain completeness",
    status: "18 of 18 events linked",
    note: "Every transition for the active release remains tied to approval and artifact history.",
  },
  {
    name: "PII and residency posture",
    status: "Green",
    note: "Scanning and routing rules remain in force across identity handling paths.",
  },
  {
    name: "Human gate coverage",
    status: "100%",
    note: "No major phase transition can proceed without the required decision surface.",
  },
  {
    name: "Override visibility",
    status: "2 open",
    note: "Both overrides include named approvers, rationale, and expiry windows.",
  },
];

const configRules: ConfigRule[] = [
  {
    name: "Workflow phases",
    note: "Plan, Design, Develop, Test, and Ship remain tenant configurable with clear gate logic.",
    status: "Visual Builder ready",
  },
  {
    name: "Control library",
    note: "PII scan, secrets scan, hallucination checks, and release proof validation can block progression.",
    status: "Policy aware",
  },
  {
    name: "Memory retention",
    note: "Hot, warm, and archive tiers can be tuned by artifact class and regulatory need.",
    status: "Adaptive",
  },
  {
    name: "Module activation",
    note: "Context, workflow, governance, and domain modules can be activated without fragmenting the UI.",
    status: "Composable",
  },
];

const phaseOrder: StoryPhase[] = ["Plan", "Design", "Develop", "Test", "Ship"];

function SectionFrame({
  title,
  eyebrow,
  description,
  action,
  children,
  className,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-6",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700">
            {eyebrow}
          </p>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-slate-950">
            {title}
          </h2>
          {description ? (
            <p className="max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function MetricCard({ metric }: { metric: PersonaMetric }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.96))] p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-medium text-slate-500">{metric.label}</p>
      <p className={cn("mt-4 font-['Space_Grotesk'] text-3xl font-bold tracking-tight", metric.tone)}>
        {metric.value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{metric.note}</p>
    </div>
  );
}

function StoryCard({
  story,
  active,
  onSelect,
}: {
  story: Story;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-[22px] border p-4 text-left transition",
        active
          ? "border-sky-200 bg-sky-50/70 shadow-[0_12px_30px_rgba(37,99,235,0.08)]"
          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{story.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{story.owner}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
            story.risk === "High"
              ? "bg-amber-50 text-amber-700"
              : story.risk === "Medium"
                ? "bg-sky-50 text-sky-700"
                : "bg-emerald-50 text-emerald-700"
          )}
        >
          {story.risk} risk
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{story.summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">{story.memory} memory links</span>
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">{story.confidence} confidence</span>
      </div>
      <p className="mt-4 text-sm font-medium text-sky-700">{story.gate}</p>
    </button>
  );
}

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("command");
  const [activePersona, setActivePersona] = useState<PersonaKey>("cto");
  const [selectedStoryId, setSelectedStoryId] = useState<string>("identity");

  const currentScreen = useMemo(
    () => screens.find(screen => screen.key === activeScreen) ?? screens[0],
    [activeScreen]
  );

  const currentPersona = useMemo(
    () => personas.find(persona => persona.key === activePersona) ?? personas[0],
    [activePersona]
  );

  const selectedStory = useMemo(
    () => stories.find(story => story.id === selectedStoryId) ?? stories[0],
    [selectedStoryId]
  );

  const storiesByPhase = useMemo(
    () =>
      phaseOrder.map(phase => ({
        phase,
        items: stories.filter(story => story.phase === phase),
      })),
    []
  );

  const renderCommandCenter = () => (
    <div className="space-y-6">
      <SectionFrame
        eyebrow="Program pulse"
        title="A real operating view across confidence, flow, memory, and release posture"
        description="This opening screen now behaves like a live workspace. It is anchored to the same active release, the same stories, and the same evidence model used across the rest of the product."
        action={
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full bg-sky-700 px-5 text-white hover:bg-sky-800">
              Review approvals
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              onClick={() => setActiveScreen("config")}
            >
              Open workflow logic
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-4">
          {currentPersona.metrics.map(metric => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[26px] border border-slate-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(243,248,255,0.94))] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Lifecycle command
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    The governed SDLC remains visible at all times
                  </h3>
                </div>
                <Waypoints className="size-5 text-sky-700" />
              </div>
              <div className="mt-5 grid gap-3 xl:grid-cols-5">
                {storiesByPhase.map(group => (
                  <div key={group.phase} className="rounded-[22px] border border-white/80 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{group.phase}</p>
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {group.items.length}
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-['Space_Grotesk'] font-bold text-slate-950">
                      {group.items.length === 0 ? "0" : `${Math.min(99, group.items.length * 18 + 40)}%`}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {group.phase === "Plan"
                        ? "Briefs and context are prepared before work moves downstream."
                        : group.phase === "Design"
                          ? "Architecture and review logic are active before implementation."
                          : group.phase === "Develop"
                            ? "Agents propose and engineers govern the shape of execution."
                            : group.phase === "Test"
                              ? "Release confidence is formed through checks and proof validation."
                              : "Software becomes a defendable event with retained evidence."}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[26px] border border-slate-100 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Story spotlight
                    </p>
                    <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                      {selectedStory.title}
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() => setActiveScreen("delivery")}
                  >
                    Open workspace
                  </Button>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{selectedStory.summary}</p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    { label: "Current phase", value: selectedStory.phase },
                    { label: "Next gate", value: selectedStory.gate },
                    { label: "Confidence", value: selectedStory.confidence },
                  ].map(item => (
                    <div key={item.label} className="rounded-[18px] border border-slate-100 bg-slate-50/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {selectedStory.services.map(service => (
                    <span
                      key={service}
                      className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(236,253,245,0.92))] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                      Compounding value
                    </p>
                    <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                      Memory is now changing delivery outcomes
                    </h3>
                  </div>
                  <BrainCircuit className="size-5 text-emerald-600" />
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    "Approved identity patterns are reused before design review starts.",
                    "Release evidence packs are assembled from the same proof chain structure every cycle.",
                    "Lessons learned now appear inline before teams repeat risky architecture choices.",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3 rounded-[18px] bg-white/90 p-4 shadow-sm">
                      <div className="mt-1 flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="size-3.5" />
                      </div>
                      <p className="text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[26px] border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Approval queue
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    Decisions waiting in the operating model
                  </h3>
                </div>
                <BellDot className="size-5 text-amber-500" />
              </div>
              <div className="mt-5 space-y-3">
                {approvals.map(item => (
                  <div key={item.title} className="rounded-[20px] border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        {item.state}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.owner}</p>
                    <p className="mt-2 text-sm font-medium text-sky-700">{item.due}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Quick navigation
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    Follow one story through the whole product
                  </h3>
                </div>
                <PanelRightOpen className="size-5 text-sky-700" />
              </div>
              <div className="mt-5 space-y-3">
                {[
                  {
                    key: "delivery" as ScreenKey,
                    label: "Open Delivery Flow",
                    note: "See the active story inside the governed lifecycle.",
                  },
                  {
                    key: "context" as ScreenKey,
                    label: "Open Context Hub",
                    note: "Trace related lessons, patterns, and project memory.",
                  },
                  {
                    key: "governance" as ScreenKey,
                    label: "Open Governance",
                    note: "Inspect proof chain, approvals, and release readiness.",
                  },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setActiveScreen(item.key)}
                    className="flex w-full items-center justify-between rounded-[20px] border border-slate-100 bg-slate-50/80 px-4 py-4 text-left transition hover:border-sky-200 hover:bg-sky-50/70"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.note}</p>
                    </div>
                    <ChevronRight className="size-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionFrame>
    </div>
  );

  const renderDeliveryFlow = () => (
    <div className="space-y-6">
      <SectionFrame
        eyebrow="Governed execution"
        title="A believable end to end workspace across all five phases"
        description="This screen shows how Arkitekt Forge actually feels in use. Work moves through the SDLC, stories remain selectable, and the same story context follows the user into the rest of the product."
        action={
          <Button
            variant="outline"
            className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            onClick={() => setActiveScreen("context")}
          >
            Follow context
          </Button>
        }
      >
        <div className="grid gap-6 2xl:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[1120px] gap-4 grid-cols-5">
              {storiesByPhase.map(group => (
                <div key={group.phase} className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-['Space_Grotesk'] text-lg font-bold text-slate-950">{group.phase}</p>
                      <p className="text-sm text-slate-500">{group.items.length} active stories</p>
                    </div>
                    <div className="flex size-9 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                      <CircleDot className="size-4" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {group.items.map(story => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        active={story.id === selectedStory.id}
                        onSelect={() => setSelectedStoryId(story.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,246,255,0.92))] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Selected workspace
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    {selectedStory.title}
                  </h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-sky-100">
                  {selectedStory.phase}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{selectedStory.summary}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[18px] bg-white/90 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Next gate</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStory.gate}</p>
                </div>
                <div className="rounded-[18px] bg-white/90 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Linked memory</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStory.memory} contextual references</p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {selectedStory.evidence.map(item => (
                  <div key={item} className="flex items-center gap-3 rounded-[16px] bg-white/90 px-4 py-3 shadow-sm">
                    <BadgeCheck className="size-4 text-emerald-600" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Why this feels cohesive
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    The same story opens the rest of the product
                  </h3>
                </div>
                <ArrowRight className="size-5 text-sky-700" />
              </div>
              <div className="mt-5 space-y-3">
                {[
                  {
                    label: "Context Hub",
                    note: "Shows the prior projects, lessons learned, and retrieval logic attached to this story.",
                    target: "context" as ScreenKey,
                  },
                  {
                    label: "Architecture",
                    note: "Shows the services and layers touched by this exact change.",
                    target: "architecture" as ScreenKey,
                  },
                  {
                    label: "Governance",
                    note: "Shows the proof chain and control posture for the same work item.",
                    target: "governance" as ScreenKey,
                  },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setActiveScreen(item.target)}
                    className="flex w-full items-center justify-between rounded-[18px] border border-slate-100 bg-slate-50/70 px-4 py-4 text-left transition hover:border-sky-200 hover:bg-sky-50/70"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.note}</p>
                    </div>
                    <ChevronRight className="size-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionFrame>
    </div>
  );

  const renderContextHub = () => (
    <div className="space-y-6">
      <SectionFrame
        eyebrow="Institutional memory"
        title="Context becomes a working layer inside the product"
        description="The selected story is still the anchor, but now the user sees how prior decisions, lessons learned, and reusable patterns influence what happens next."
      >
        <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr_0.8fr]">
          <div className="rounded-[24px] border border-slate-100 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Story Memory
                </p>
                <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                  Live memory feed for {selectedStory.title}
                </h3>
              </div>
              <Clock3 className="size-5 text-sky-700" />
            </div>
            <div className="mt-5 space-y-4">
              {memoryEvents.map(event => (
                <div key={event.title} className="rounded-[20px] border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      {event.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{event.note}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    {event.tag}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(236,253,245,0.9))] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Delivery Memory Explorer
                </p>
                <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                  Reusable knowledge stays connected to active work
                </h3>
              </div>
              <Orbit className="size-5 text-emerald-600" />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Project Memory",
                  value: "1,284 artifacts",
                  note: "Directives, approvals, reviews, incidents, and release outcomes remain traceable.",
                  icon: BriefcaseBusiness,
                },
                {
                  title: "Pattern Library",
                  value: "312 patterns",
                  note: "Approved architecture and workflow choices are available before teams improvise.",
                  icon: Layers3,
                },
                {
                  title: "Code Understanding Index",
                  value: "94 relationships",
                  note: "Domains, modules, and dependencies remain linked to story context.",
                  icon: Binary,
                },
                {
                  title: "Lessons Learned",
                  value: "28 guidance notes",
                  note: "Past failures become practical guidance instead of tribal memory.",
                  icon: BookMarked,
                },
              ].map(item => (
                <div key={item.title} className="rounded-[20px] border border-white/70 bg-white/90 p-4 shadow-sm">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <item.icon className="size-4.5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-slate-950">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-100 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Selected story context
              </p>
              <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                Why {selectedStory.title} should not start from zero
              </h3>
              <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                <div className="rounded-[18px] bg-slate-50/80 p-4">Two prior identity approvals use the same residency pattern.</div>
                <div className="rounded-[18px] bg-slate-50/80 p-4">A rejected consent model is already stored, saving another design cycle.</div>
                <div className="rounded-[18px] bg-slate-50/80 p-4">Release evidence structure from Health Claims remains reusable for this story.</div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Continue the flow
              </p>
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => setActiveScreen("architecture")}
                  className="flex w-full items-center justify-between rounded-[18px] border border-slate-100 bg-slate-50/80 px-4 py-4 text-left transition hover:border-sky-200 hover:bg-sky-50/70"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Open Architecture</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">See where this memory connects to services and modules.</p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </button>
                <button
                  onClick={() => setActiveScreen("governance")}
                  className="flex w-full items-center justify-between rounded-[18px] border border-slate-100 bg-slate-50/80 px-4 py-4 text-left transition hover:border-sky-200 hover:bg-sky-50/70"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Open Governance</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">See how the same memory becomes evidence and control confidence.</p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionFrame>
    </div>
  );

  const renderArchitecture = () => (
    <div className="space-y-6">
      <SectionFrame
        eyebrow="System design"
        title="Architecture stays visible, reviewable, and connected to active delivery"
        description="This screen translates the architecture v11 thinking into a believable product view. The same selected story now reveals impacted layers, services, and design rationale."
      >
        <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,246,255,0.92))] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Layer view
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    The active story touches multiple architectural layers
                  </h3>
                </div>
                <Layers3 className="size-5 text-sky-700" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Customer Interaction", "Command surfaces, approval views, and story workspace"],
                  ["Intelligence and Orchestration", "Context assembly and governed agent proposals"],
                  ["Process and Governance", "State transitions, gates, and proof events"],
                  ["Data and Context", "Project memory, story memory, and retrieval lineage"],
                  ["Workflow Engine", "Tenant phase logic and transition validation"],
                  ["Module System", "Identity, evidence, and policy capabilities"],
                ].map(([name, note]) => (
                  <div key={name} className="rounded-[18px] border border-white/80 bg-white/95 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">{name}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Service impact map
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    The exact systems affected by {selectedStory.title}
                  </h3>
                </div>
                <Cable className="size-5 text-emerald-600" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {serviceImpacts.map(service => (
                  <div key={service.name} className="rounded-[20px] border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{service.name}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        {service.state}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{service.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(236,253,245,0.92))] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Design rationale ledger
              </p>
              <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                Decisions remain attached to the system, not hidden in slides
              </h3>
              <div className="mt-5 space-y-3">
                {[
                  "Identity verification stays inside the internal source of truth so audit lineage and residency remain simple.",
                  "Policy evaluation is shared across stories to preserve reusable governance logic across tenants.",
                  "Audit graph optimization improves retrieval speed without replacing the proof chain as the trust anchor.",
                ].map(item => (
                  <div key={item} className="rounded-[18px] bg-white/90 p-4 shadow-sm">
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Next move
              </p>
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => setActiveScreen("governance")}
                  className="flex w-full items-center justify-between rounded-[18px] border border-slate-100 bg-slate-50/80 px-4 py-4 text-left transition hover:border-sky-200 hover:bg-sky-50/70"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Inspect governance readiness</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Use the same design decisions to view proof and control posture.</p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </button>
                <button
                  onClick={() => setActiveScreen("config")}
                  className="flex w-full items-center justify-between rounded-[18px] border border-slate-100 bg-slate-50/80 px-4 py-4 text-left transition hover:border-sky-200 hover:bg-sky-50/70"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Inspect workflow configuration</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">See how tenant logic controls the lifecycle around this architecture.</p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionFrame>
    </div>
  );

  const renderGovernance = () => (
    <div className="space-y-6">
      <SectionFrame
        eyebrow="Trust model"
        title="Proof, controls, and release evidence are native parts of the product"
        description="This screen proves the platform is not only accelerating engineering. It is packaging accountability, approval logic, and release defensibility inside the working experience."
      >
        <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(236,253,245,0.92))] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                    Release 24.4 readiness
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    A release can be defended with confidence
                  </h3>
                </div>
                <FileCheck2 className="size-5 text-emerald-600" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {controls.map(control => (
                  <div key={control.name} className="rounded-[18px] border border-white/80 bg-white/95 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">{control.name}</p>
                    <p className="mt-2 font-['Space_Grotesk'] text-xl font-bold text-slate-950">{control.status}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{control.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Evidence pack
              </p>
              <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                What the sponsor receives for this release
              </h3>
              <div className="mt-5 space-y-3">
                {[
                  "Directive and approved brief",
                  "Architecture review and rationale",
                  "Implementation checks and test record",
                  "Proof chain event history",
                  "Named approvals and overrides",
                  "Deployment and retention note",
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 rounded-[18px] border border-slate-100 bg-slate-50/80 px-4 py-3">
                    <BadgeCheck className="size-4 text-emerald-600" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Proof chain view
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    The same story now as an evidence timeline
                  </h3>
                </div>
                <ScrollText className="size-5 text-sky-700" />
              </div>
              <div className="mt-5 space-y-3">
                {[
                  "Directive accepted and context pack generated",
                  "Design review completed with named approver",
                  "Pattern reuse approved from a prior government release",
                  "Code and tests linked to the active story",
                  "Proof validation passed before sponsor review",
                ].map((item, index) => (
                  <div key={item} className="flex gap-4 rounded-[18px] border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex w-10 shrink-0 items-start justify-center">
                      <div className="flex size-8 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                        {index + 1}
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Control posture
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    Governance logic stays visible to humans
                  </h3>
                </div>
                <Lock className="size-5 text-sky-700" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  "Zero autonomous action",
                  "Human gate on every major phase",
                  "Policy aware execution",
                  "Named override with expiry",
                ].map(item => (
                  <div key={item} className="rounded-[18px] border border-slate-100 bg-slate-50/80 p-4 text-sm font-medium text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionFrame>
    </div>
  );

  const renderConfigStudio = () => (
    <div className="space-y-6">
      <SectionFrame
        eyebrow="Tenant configurability"
        title="Workflow, policy, memory, and modules are all configurable through the UI"
        description="This screen makes configurability visible as part of the product itself. The logic that controls work is no longer hidden in backend settings or implementation notes."
      >
        <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,246,255,0.92))] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Workflow builder
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    The governed lifecycle can be shaped visually
                  </h3>
                </div>
                <Workflow className="size-5 text-sky-700" />
              </div>
              <div className="mt-5 grid gap-3 xl:grid-cols-5">
                {phaseOrder.map((phase, index) => (
                  <div key={phase} className="relative rounded-[20px] border border-white/80 bg-white/95 p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">{phase}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {phase === "Plan"
                        ? "Brief and risk gate"
                        : phase === "Design"
                          ? "Architecture and review gate"
                          : phase === "Develop"
                            ? "Build and review gate"
                            : phase === "Test"
                              ? "Validation and proof gate"
                              : "Release and retention gate"}
                    </p>
                    {index < phaseOrder.length - 1 ? (
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                        <span>Next</span>
                        <ArrowRight className="size-3.5" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {configRules.map(rule => (
                <div key={rule.name} className="rounded-[24px] border border-slate-100 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-slate-900">{rule.name}</p>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {rule.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{rule.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(236,253,245,0.9))] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                    Active module set
                  </p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-950">
                    Product capabilities stay modular without fragmenting the UX
                  </h3>
                </div>
                <Puzzle className="size-5 text-emerald-600" />
              </div>
              <div className="mt-5 space-y-3">
                {[
                  {
                    name: "Context Compiler",
                    note: "Builds governed story packs from prior work",
                    state: true,
                  },
                  {
                    name: "Proof Validator",
                    note: "Assembles release evidence and gate validation",
                    state: true,
                  },
                  {
                    name: "Policy Engine",
                    note: "Enforces tenant specific workflow controls",
                    state: true,
                  },
                  {
                    name: "External Connector Pack",
                    note: "Optional but disabled for this tenant",
                    state: false,
                  },
                ].map(module => (
                  <div key={module.name} className="flex items-start justify-between gap-4 rounded-[18px] bg-white/90 p-4 shadow-sm">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{module.name}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{module.note}</p>
                    </div>
                    <div
                      className={cn(
                        "mt-1 flex h-7 w-12 rounded-full p-1 transition",
                        module.state ? "bg-emerald-500" : "bg-slate-200"
                      )}
                    >
                      <div
                        className={cn(
                          "size-5 rounded-full bg-white shadow-sm transition",
                          module.state ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Why investors should care
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <div className="rounded-[18px] bg-slate-50/80 p-4">This proves Arkitekt Forge can adapt to enterprise process reality without becoming a services project.</div>
                <div className="rounded-[18px] bg-slate-50/80 p-4">The workflow engine is a visible product asset, not hidden implementation complexity.</div>
                <div className="rounded-[18px] bg-slate-50/80 p-4">Memory, policy, and modularity remain unified inside one operating system experience.</div>
              </div>
            </div>
          </div>
        </div>
      </SectionFrame>
    </div>
  );

  const renderCurrentScreen = () => {
    if (activeScreen === "command") return renderCommandCenter();
    if (activeScreen === "delivery") return renderDeliveryFlow();
    if (activeScreen === "context") return renderContextHub();
    if (activeScreen === "architecture") return renderArchitecture();
    if (activeScreen === "governance") return renderGovernance();
    return renderConfigStudio();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(18,126,255,0.08),_transparent_24%),radial-gradient(circle_at_88%_12%,_rgba(16,185,129,0.08),_transparent_22%),linear-gradient(180deg,_#f8fbff_0%,_#f5fbf8_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] gap-5 px-4 py-4 sm:px-6 xl:px-8">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[280px] shrink-0 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.06)] xl:block">
          <div className="flex h-full flex-col">
            <div className="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(243,248,255,0.96))] p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(37,99,235,0.12),_rgba(16,185,129,0.16))] text-sky-700">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Arkitekt Forge
                  </p>
                  <h1 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-slate-950">
                    Agentic OS
                  </h1>
                </div>
              </div>
              <div className="mt-4 rounded-[18px] border border-sky-100 bg-sky-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Active program
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">National Digital Permits Platform</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Release 24.4 with governed identity work, memory reuse, and sponsor ready evidence.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                Product navigation
              </p>
              <div className="mt-3 space-y-2">
                {screens.map(screen => (
                  <button
                    key={screen.key}
                    onClick={() => setActiveScreen(screen.key)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[20px] px-4 py-3 text-left transition",
                      activeScreen === screen.key
                        ? "bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.14)]"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-2xl",
                          activeScreen === screen.key ? "bg-white/10 text-white" : "bg-slate-50 text-sky-700"
                        )}
                      >
                        <screen.icon className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{screen.label}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn("size-4", activeScreen === screen.key ? "text-white/60" : "text-slate-300")} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-emerald-100 bg-[linear-gradient(160deg,_rgba(255,255,255,0.98),_rgba(236,253,245,0.92))] p-4 shadow-[0_12px_30px_rgba(16,185,129,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Memory signal
              </p>
              <p className="mt-3 font-['Space_Grotesk'] text-4xl font-bold text-slate-950">+31%</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Reuse is increasing because context, evidence, and design reasoning stay in the system.
              </p>
            </div>

            <div className="mt-auto rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Product truth
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div className="rounded-[18px] bg-white p-3 shadow-sm">
                  <p className="font-semibold text-slate-900">8</p>
                  <p>Layers</p>
                </div>
                <div className="rounded-[18px] bg-white p-3 shadow-sm">
                  <p className="font-semibold text-slate-900">17</p>
                  <p>States</p>
                </div>
                <div className="rounded-[18px] bg-white p-3 shadow-sm">
                  <p className="font-semibold text-slate-900">5</p>
                  <p>Phases</p>
                </div>
                <div className="rounded-[18px] bg-white p-3 shadow-sm">
                  <p className="font-semibold text-slate-900">1</p>
                  <p>System</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-5">
          <header className="sticky top-4 z-20 rounded-[30px] border border-slate-200/80 bg-white/88 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span className="rounded-full bg-slate-50 px-3 py-1">Ministry Sandbox</span>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">Release 24.4</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Zero autonomous action</span>
                </div>
                <div>
                  <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {currentScreen.title}
                  </h2>
                  <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
                    {currentScreen.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <span className="rounded-full bg-slate-50 px-3 py-1.5 ring-1 ring-slate-200">Active story: {selectedStory.title}</span>
                  <span className="rounded-full bg-slate-50 px-3 py-1.5 ring-1 ring-slate-200">Owner: {selectedStory.owner}</span>
                  <span className="rounded-full bg-slate-50 px-3 py-1.5 ring-1 ring-slate-200">Current phase: {selectedStory.phase}</span>
                </div>
              </div>

              <div className="space-y-4 xl:max-w-[640px] xl:text-right">
                <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                  {personas.map(persona => (
                    <button
                      key={persona.key}
                      onClick={() => setActivePersona(persona.key)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition",
                        activePersona === persona.key
                          ? "bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
                          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {persona.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-3 xl:items-end">
                  <div className="flex w-full items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 xl:max-w-[360px]">
                    <Search className="size-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Search stories, memory, approvals, and modules</span>
                  </div>
                  <p className="text-sm leading-7 text-slate-600 xl:max-w-[620px]">{currentPersona.summary}</p>
                </div>
              </div>
            </div>
          </header>

          {renderCurrentScreen()}
        </main>
      </div>
    </div>
  );
}
