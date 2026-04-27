import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2, ChevronRight, Cpu, Database, FolderOpen, GitMerge, Layers, Plug, Plus, Settings2, Shield, Sliders, Sparkles, User, Users, XCircle, Zap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForge } from "@/forge/context";
import { workflowNodes } from "@/forge/data";
import { policyRules as seedPolicyRules } from "@/forge/policyRules";
import { cn } from "@/lib/utils";
import type { Connector, ConnectorStatus, PolicySeverity } from "@/forge/types";
import { ConnectorSetupWizard } from "@/forge/components/ConnectorSetupWizard";
import { PersonaBuilderDialog } from "@/forge/components/PersonaBuilderDialog";

/* ─── Connectors Tab ─────────────────────────────────────────────────── */

const categoryFilters = ["All", "Dev Tools", "CI/CD", "Enterprise", "Communication", "Cloud", "Compliance", "Identity", "Storage"] as const;

const statusColors: Record<ConnectorStatus, string> = {
  Connected: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Available: "bg-sky-50 text-sky-700 ring-sky-100",
  "Pending setup": "bg-amber-50 text-amber-700 ring-amber-100",
  Disabled: "bg-slate-100 text-slate-600 ring-slate-200",
  "Coming soon": "bg-slate-50 text-slate-400 ring-slate-100",
};

function ConnectorsTab() {
  const { connectors, updateConnectorStatus, ideConnections } = useForge();
  const [catFilter, setCatFilter] = useState<string>("All");
  const [setupConnector, setSetupConnector] = useState<Connector | null>(null);
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());

  const filtered = catFilter === "All" ? connectors : connectors.filter(c => c.category === catFilter);

  const toggleActions = (id: string) => {
    setExpandedActions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">External connectors</p>
        <div className="flex flex-wrap gap-1.5">
          {categoryFilters.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCatFilter(cat)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                catFilter === cat
                  ? "border-slate-900 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(connector => (
            <div
              key={connector.id}
              className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.12)] transition hover:border-sky-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                    {connector.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{connector.name}</p>
                    <p className="text-[11px] text-slate-500">{connector.category}</p>
                  </div>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", statusColors[connector.status])}>
                  {connector.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">{connector.description}</p>

              {connector.direction && (
                <div className="mt-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                    connector.direction === "bidirectional" ? "bg-violet-50 text-violet-700 ring-violet-100" : "bg-slate-50 text-slate-500 ring-slate-200"
                  )}>
                    {connector.direction === "bidirectional" ? "Bidirectional" : "Read Only"}
                  </span>
                </div>
              )}

              {connector.status === "Connected" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {connector.version && (
                    <div className="rounded-[10px] border border-slate-200 bg-slate-50/60 px-2.5 py-1.5">
                      <p className="text-[10px] text-slate-400">Version</p>
                      <p className="text-[11px] font-semibold text-slate-700">{connector.version}</p>
                    </div>
                  )}
                  {connector.eventsPerDay !== undefined && (
                    <div className="rounded-[10px] border border-slate-200 bg-slate-50/60 px-2.5 py-1.5">
                      <p className="text-[10px] text-slate-400">Events per day</p>
                      <p className="text-[11px] font-semibold text-slate-700">{connector.eventsPerDay}</p>
                    </div>
                  )}
                </div>
              )}

              {connector.actions && connector.actions.length > 0 && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => toggleActions(connector.id)}
                    className="text-[11px] font-semibold text-sky-700 hover:text-sky-800"
                  >
                    {expandedActions.has(connector.id) ? "Hide" : "Show"} available actions ({connector.actions.length})
                  </button>
                  <AnimatePresence>
                    {expandedActions.has(connector.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-2">
                          {connector.actions.map(action => (
                            <div key={action.id} className="rounded-[10px] border border-slate-200 bg-slate-50/60 px-3 py-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-800">{action.action}</span>
                                {action.requiresApproval && (
                                  <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 ring-1 ring-amber-100">Requires approval</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500">{action.description}</p>
                              {action.governanceGate && (
                                <p className="text-[10px] text-slate-400">Gate: {action.governanceGate}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="mt-3">
                {connector.status === "Coming soon" ? (
                  <span className="text-[11px] text-slate-400">Coming soon</span>
                ) : connector.status === "Connected" ? (
                  <button
                    type="button"
                    onClick={() => updateConnectorStatus(connector.id, "Disabled")}
                    className="text-[11px] font-semibold text-slate-500 underline decoration-dashed hover:text-rose-600"
                  >
                    Disconnect
                  </button>
                ) : connector.status === "Disabled" ? (
                  <button
                    type="button"
                    onClick={() => updateConnectorStatus(connector.id, "Connected")}
                    className="text-[11px] font-semibold text-sky-700 underline decoration-dashed hover:text-sky-800"
                  >
                    Re-enable
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSetupConnector(connector)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800"
                  >
                    Connect
                    <ChevronRight className="size-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {setupConnector && (
          <ConnectorSetupWizard
            connector={setupConnector}
            open={!!setupConnector}
            onOpenChange={open => { if (!open) setSetupConnector(null); }}
          />
        )}
      </div>

      {/* IDE Integrations */}
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">IDE integrations</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ideConnections.map(ide => (
            <div key={ide.id} className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                    {ide.provider.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{ide.provider === "vscode" ? "VS Code" : ide.provider === "jetbrains" ? "JetBrains" : ide.provider === "neovim" ? "Neovim" : "Cursor"}</p>
                    <p className="text-[11px] text-slate-500">{ide.userId}</p>
                  </div>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                  ide.status === "connected" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" :
                  ide.status === "syncing" ? "bg-amber-50 text-amber-700 ring-amber-100" :
                  "bg-slate-100 text-slate-500 ring-slate-200"
                )}>
                  {ide.status}
                </span>
              </div>
              {ide.activeFile && (
                <p className="mt-3 text-xs text-slate-500">{ide.activeFile}</p>
              )}
              {ide.activeBranch && (
                <p className="text-xs text-slate-400">{ide.activeBranch}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-1">
                {["context_injection", "gate_approval", "inline_governance", "memory_sidebar"].map(cap => (
                  <span key={cap} className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                    ide.capabilities.includes(cap as typeof ide.capabilities[number]) ? "bg-sky-50 text-sky-700 ring-sky-100" : "bg-slate-50 text-slate-400 ring-slate-200"
                  )}>
                    {cap.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Workflow Tab ─────────────────────────────────────────────────────── */

const nodeColors: Record<string, string> = {
  phase: "border-sky-300 bg-sky-50 text-sky-700",
  gate: "border-emerald-300 bg-emerald-50 text-emerald-700",
  connector: "border-amber-300 bg-amber-50 text-amber-700",
  policy: "border-rose-300 bg-rose-50 text-rose-700",
  memory: "border-violet-300 bg-violet-50 text-violet-700",
};

const WORKFLOW_PRESETS = ["Standard SDLC", "Lightweight Agile", "Enterprise Governed", "Compliance Heavy"] as const;
type WorkflowPreset = typeof WORKFLOW_PRESETS[number];

const presetPositions: Record<WorkflowPreset, Record<string, { x: number; y: number }>> = {
  "Standard SDLC": Object.fromEntries(workflowNodes.map(n => [n.id, { x: n.x, y: n.y }])),
  "Lightweight Agile": {
    "wn-plan": { x: 40, y: 100 }, "wn-gate-brief": { x: 190, y: 100 },
    "wn-design": { x: 320, y: 100 }, "wn-gate-arch": { x: 470, y: 100 },
    "wn-develop": { x: 600, y: 100 }, "wn-gate-review": { x: 750, y: 100 },
    "wn-test": { x: 880, y: 100 }, "wn-gate-proof": { x: 1030, y: 100 },
    "wn-ship": { x: 1160, y: 100 }, "wn-gate-operate": { x: 1310, y: 100 }, "wn-operate": { x: 1460, y: 100 },
    "wn-jira": { x: 40, y: 30 }, "wn-github": { x: 600, y: 30 },
    "wn-ga": { x: 880, y: 30 }, "wn-sonar": { x: 880, y: 180 },
    "wn-gcp": { x: 1160, y: 30 }, "wn-pdpl": { x: 320, y: 180 },
    "wn-nca": { x: 470, y: 180 }, "wn-slack": { x: 750, y: 180 },
    "wn-memory": { x: 190, y: 30 }, "wn-sn": { x: 1030, y: 180 },
  },
  "Enterprise Governed": {
    "wn-plan": { x: 80, y: 160 }, "wn-gate-brief": { x: 260, y: 160 },
    "wn-design": { x: 440, y: 160 }, "wn-gate-arch": { x: 620, y: 160 },
    "wn-develop": { x: 800, y: 160 }, "wn-gate-review": { x: 980, y: 160 },
    "wn-test": { x: 1160, y: 160 }, "wn-gate-proof": { x: 1340, y: 160 },
    "wn-ship": { x: 1520, y: 160 }, "wn-gate-operate": { x: 1700, y: 160 }, "wn-operate": { x: 1880, y: 160 },
    "wn-jira": { x: 80, y: 60 }, "wn-github": { x: 800, y: 60 },
    "wn-ga": { x: 1160, y: 60 }, "wn-sonar": { x: 1160, y: 280 },
    "wn-gcp": { x: 1520, y: 60 }, "wn-pdpl": { x: 440, y: 280 },
    "wn-nca": { x: 620, y: 280 }, "wn-slack": { x: 980, y: 280 },
    "wn-memory": { x: 260, y: 60 }, "wn-sn": { x: 1340, y: 280 },
  },
  "Compliance Heavy": {
    "wn-plan": { x: 60, y: 40 }, "wn-gate-brief": { x: 220, y: 40 },
    "wn-design": { x: 380, y: 40 }, "wn-gate-arch": { x: 540, y: 40 },
    "wn-develop": { x: 700, y: 40 }, "wn-gate-review": { x: 860, y: 40 },
    "wn-test": { x: 1020, y: 40 }, "wn-gate-proof": { x: 1180, y: 40 },
    "wn-ship": { x: 1340, y: 40 }, "wn-gate-operate": { x: 1500, y: 40 }, "wn-operate": { x: 1660, y: 40 },
    "wn-jira": { x: 60, y: 150 }, "wn-github": { x: 700, y: 150 },
    "wn-ga": { x: 1020, y: 150 }, "wn-sonar": { x: 1020, y: 270 },
    "wn-gcp": { x: 1340, y: 150 }, "wn-pdpl": { x: 380, y: 165 },
    "wn-nca": { x: 540, y: 165 }, "wn-slack": { x: 860, y: 150 },
    "wn-memory": { x: 220, y: 150 }, "wn-sn": { x: 1180, y: 270 },
  },
};

function WorkflowTab() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<WorkflowPreset>("Standard SDLC");
  const selected = workflowNodes.find(n => n.id === selectedNode);
  const positions = presetPositions[activePreset];

  const canvasWidth = useMemo(() => {
    const maxX = Math.max(...workflowNodes.map(n => (positions[n.id]?.x ?? n.x) + 120));
    return maxX + 40;
  }, [positions]);

  const canvasHeight = useMemo(() => {
    const maxY = Math.max(...workflowNodes.map(n => (positions[n.id]?.y ?? n.y) + 60));
    return maxY + 40;
  }, [positions]);

  return (
    <div className="space-y-4">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {WORKFLOW_PRESETS.map(preset => (
          <button
            key={preset}
            type="button"
            onClick={() => setActivePreset(preset)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
              activePreset === preset
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {(["phase", "gate", "connector", "policy", "memory"] as const).map(kind => (
          <div key={kind} className="flex items-center gap-1.5">
            <div className={cn("size-3 rounded-full border", nodeColors[kind].split(" ").filter(c => c.startsWith("border-") || c.startsWith("bg-")).join(" "))} />
            <span className="text-[11px] font-semibold capitalize text-slate-500">{kind}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {workflowNodes.filter(n => n.kind === "phase").length} phases
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            {workflowNodes.filter(n => n.kind === "gate").length} gates
          </span>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
            {workflowNodes.filter(n => n.kind === "connector").length} connectors
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-[18px] border border-slate-200 bg-slate-50/60">
        <div className="p-4" style={{ minWidth: canvasWidth, height: canvasHeight + 40 }}>
          <svg className="pointer-events-none absolute inset-4" style={{ width: canvasWidth, height: canvasHeight }}>
            {workflowNodes.map(node =>
              node.connectedTo.map(targetId => {
                const target = workflowNodes.find(n => n.id === targetId);
                if (!target) return null;
                const pos = positions[node.id] ?? { x: node.x, y: node.y };
                const tpos = positions[target.id] ?? { x: target.x, y: target.y };
                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={pos.x + 60}
                    y1={pos.y + 18}
                    x2={tpos.x}
                    y2={tpos.y + 18}
                    stroke="#CBD5E1"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                );
              })
            )}
          </svg>
          {workflowNodes.map(node => {
            const pos = positions[node.id] ?? { x: node.x, y: node.y };
            return (
              <motion.button
                key={node.id}
                type="button"
                animate={{ left: pos.x, top: pos.y }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                className={cn(
                  "absolute flex h-9 min-w-[120px] items-center justify-center rounded-[12px] border px-3 text-[11px] font-semibold transition",
                  nodeColors[node.kind],
                  selectedNode === node.id && "ring-2 ring-slate-950 ring-offset-1"
                )}
              >
                {node.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-[16px] border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{selected.kind}</p>
                <p className="mt-1 text-base font-semibold text-slate-950">{selected.label}</p>
                <p className="mt-1 text-sm text-slate-500">Status: {selected.status}</p>
                {selected.connectedTo.length > 0 && (
                  <p className="mt-1 text-sm text-slate-500">
                    Connects to: {selected.connectedTo.map(id => workflowNodes.find(n => n.id === id)?.label).filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setSelectedNode(null)}>
                <XCircle className="size-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Policies Tab ─────────────────────────────────────────────────────── */

const severityColors: Record<PolicySeverity, string> = {
  Blocking: "bg-rose-50 text-rose-700 ring-rose-100",
  Advisory: "bg-amber-50 text-amber-700 ring-amber-100",
  Info: "bg-slate-100 text-slate-600 ring-slate-200",
};

const categoryFiltersPolicy = ["All", "Compliance", "Security", "Quality", "Performance"] as const;

function PoliciesTab() {
  const { policyStates, togglePolicy, updatePolicySeverity } = useForge();
  const [catFilter, setCatFilter] = useState<string>("All");

  const filtered = catFilter === "All" ? seedPolicyRules : seedPolicyRules.filter(r => r.category === catFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {categoryFiltersPolicy.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCatFilter(cat)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
              catFilter === cat
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(rule => {
          const state = policyStates[rule.id] ?? { enabled: rule.enabled, severity: rule.severity };
          return (
            <div
              key={rule.id}
              className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.1)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", severityColors[state.severity])}>
                      {state.severity}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                      {rule.category}
                    </span>
                    {rule.applicableFrameworks.map(f => (
                      <span key={f} className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-100">
                        {f}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{rule.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{rule.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePolicy(rule.id)}
                  aria-pressed={state.enabled}
                  className={cn(
                    "relative h-7 w-14 shrink-0 rounded-full transition",
                    state.enabled ? "bg-slate-950" : "bg-slate-200"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-5 w-5 rounded-full bg-white transition-all",
                      state.enabled ? "left-[1.9rem]" : "left-1"
                    )}
                  />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <p className="text-[11px] text-slate-500">Override severity:</p>
                {(["Blocking", "Advisory", "Info"] as PolicySeverity[]).map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => updatePolicySeverity(rule.id, sev)}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 transition",
                      state.severity === sev ? severityColors[sev] : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300"
                    )}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Memory Tab ─────────────────────────────────────────────────────────── */

function MemoryTab() {
  const { auditTrailEvents } = useForge();
  const [retention, setRetention] = useState(90);
  const [crossProject, setCrossProject] = useState(true);
  const [autoArchival, setAutoArchival] = useState(true);
  const [indexFreq, setIndexFreq] = useState("Real time");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total memory events", value: "4,447" },
          { label: "Active patterns", value: "186" },
          { label: "Pattern reuse rate", value: "+31%" },
        ].map(stat => (
          <div key={stat.label} className="rounded-[18px] border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{stat.label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-5 space-y-5">
        {/* Retention slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-900">Event retention period</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{retention} days</span>
          </div>
          <input
            type="range"
            min={30}
            max={365}
            step={30}
            value={retention}
            onChange={e => setRetention(Number(e.target.value))}
            className="w-full accent-slate-950"
          />
          <div className="flex justify-between mt-1">
            {[30, 90, 180, 365].map(v => (
              <span key={v} className="text-[10px] text-slate-400">{v}d</span>
            ))}
          </div>
        </div>

        {/* Toggles */}
        {[
          { label: "Cross project sharing", detail: "Memory events visible across all projects in this tenant", value: crossProject, set: setCrossProject },
          { label: "Auto archival", detail: "Archive events older than the retention period automatically", value: autoArchival, set: setAutoArchival },
        ].map(item => (
          <div key={item.label} className="flex items-start justify-between gap-4 rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="mt-0.5 text-sm text-slate-500">{item.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => item.set(!item.value)}
              className={cn("relative h-7 w-14 shrink-0 rounded-full transition", item.value ? "bg-slate-950" : "bg-slate-200")}
            >
              <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white transition-all", item.value ? "left-[1.9rem]" : "left-1")} />
            </button>
          </div>
        ))}

        {/* Indexing frequency */}
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-900">Indexing frequency</p>
          <div className="flex gap-2">
            {["Real time", "Hourly", "Daily"].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setIndexFreq(f)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                  indexFreq === f
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Personas Tab ───────────────────────────────────────────────────────── */

function PersonasTab() {
  const { configuredPersonas } = useForge();
  const [enabledPersonas, setEnabledPersonas] = useState<Set<string>>(new Set(configuredPersonas.map(p => p.key)));
  const [builderOpen, setBuilderOpen] = useState(false);

  const togglePersona = (key: string) => {
    setEnabledPersonas(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{configuredPersonas.length} personas configured</p>
        <button
          type="button"
          onClick={() => setBuilderOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 transition"
        >
          <Plus className="size-3" />
          Create Custom Persona
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {configuredPersonas.map(persona => {
          const isEnabled = enabledPersonas.has(persona.key);
          return (
            <div
              key={persona.key}
              className={cn(
                "rounded-[18px] border p-4 transition",
                isEnabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/60 opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-950">{persona.name}</p>
                    {persona.isCustom && (
                      <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-semibold text-violet-700">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">{persona.role}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{persona.sidebarSummary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePersona(persona.key)}
                  className={cn(
                    "relative h-7 w-14 shrink-0 rounded-full transition",
                    isEnabled ? "bg-slate-950" : "bg-slate-200"
                  )}
                >
                  <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white transition-all", isEnabled ? "left-[1.9rem]" : "left-1")} />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {persona.dashboardWidgets.slice(0, 3).map(w => (
                  <span key={w} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {w.split("-").join(" ")}
                  </span>
                ))}
                {persona.dashboardWidgets.length > 3 && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    +{persona.dashboardWidgets.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <PersonaBuilderDialog open={builderOpen} onOpenChange={setBuilderOpen} />
    </div>
  );
}

/* ─── Main Screen ─────────────────────────────────────────────────────────── */

export function ConfigStudioScreen() {
  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Tenant configuration</p>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">
          Real configuration surfaces that affect workflow, context, and release posture
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Configure connectors, workflow phases, policy rules, memory settings, and persona layouts. Every change affects the rest of the platform in real time.
        </p>
        <div className="mt-4 flex gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="size-3.5" />
            NDMO Ready
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
            <Shield className="size-3.5" />
            PDPL Controls Active
          </span>
        </div>
      </div>

      <Tabs defaultValue="connectors" className="space-y-4">
        <TabsList className="flex h-auto gap-1 rounded-[18px] border border-slate-200 bg-white p-1.5 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.12)]">
          {[
            { value: "connectors", label: "Connectors", icon: Plug },
            { value: "workflow", label: "Workflow", icon: GitMerge },
            { value: "policies", label: "Policies", icon: Shield },
            { value: "memory", label: "Memory", icon: Sparkles },
            { value: "personas", label: "Personas", icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex flex-1 items-center justify-center gap-2 rounded-[14px] px-3 py-2.5 text-sm font-semibold text-slate-600 data-[state=active]:bg-slate-950 data-[state=active]:text-white"
              >
                <Icon className="size-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="connectors"><ConnectorsTab /></TabsContent>
        <TabsContent value="workflow"><WorkflowTab /></TabsContent>
        <TabsContent value="policies"><PoliciesTab /></TabsContent>
        <TabsContent value="memory"><MemoryTab /></TabsContent>
        <TabsContent value="personas"><PersonasTab /></TabsContent>
      </Tabs>
    </div>
  );
}
