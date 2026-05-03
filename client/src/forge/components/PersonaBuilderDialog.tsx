import { useState } from "react";
import {
  Crown, Shield, Code2, Star, Cpu, BarChart2, GitBranch, Users,
  Database, Globe, Lock, Settings2, Layers, Zap, Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForge } from "@/forge/context";
import { cn } from "@/lib/utils";
import type { DashboardWidget, PersonaKey, PersonaPreset } from "@/forge/types";

const ICON_OPTIONS = [
  { name: "Crown", icon: Crown },
  { name: "Shield", icon: Shield },
  { name: "Code2", icon: Code2 },
  { name: "Star", icon: Star },
  { name: "Cpu", icon: Cpu },
  { name: "BarChart2", icon: BarChart2 },
  { name: "GitBranch", icon: GitBranch },
  { name: "Users", icon: Users },
  { name: "Database", icon: Database },
  { name: "Globe", icon: Globe },
  { name: "Lock", icon: Lock },
  { name: "Settings2", icon: Settings2 },
  { name: "Layers", icon: Layers },
  { name: "Zap", icon: Zap },
  { name: "Sparkles", icon: Sparkles },
];

const WIDGET_OPTIONS: { id: DashboardWidget; label: string }[] = [
  { id: "portfolio-kpis", label: "Portfolio KPIs" },
  { id: "release-confidence-trend", label: "Release Confidence" },
  { id: "proof-chain-gauge", label: "Proof Chain Gauge" },
  { id: "phase-distribution", label: "Phase Distribution" },
  { id: "story-spotlight", label: "Story Spotlight" },
  { id: "governance-queue", label: "Governance Queue" },
  { id: "persona-metrics", label: "Persona Metrics" },
  { id: "compounding-value", label: "Compounding Value" },
  { id: "ci-pipeline-status", label: "CI Pipeline Status" },
  { id: "test-coverage-matrix", label: "Test Coverage" },
  { id: "compliance-dashboard", label: "Compliance Dashboard" },
  { id: "security-scan-results", label: "Security Scans" },
  { id: "active-assignments", label: "Active Assignments" },
  { id: "context-quality", label: "Context Quality" },
  { id: "cost-dashboard", label: "Cost Dashboard" },
  { id: "priority-matrix", label: "Priority Matrix" },
];

const METRIC_OPTIONS = [
  "Release confidence",
  "Evidence completeness",
  "Story velocity",
  "Policy compliance",
  "Memory patterns",
  "Test coverage",
];

const NOTIFICATION_OPTIONS = [
  "Story advances",
  "Design artifact reviews",
  "Rework completions",
  "Governance decisions",
  "Memory patterns",
];

const PERMISSION_OPTIONS = [
  "approve-story-advance",
  "reject-design-artifact",
  "approve-governance-item",
  "export-evidence",
  "manage-connectors",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PersonaBuilderDialog({ open, onOpenChange }: Props) {
  const { createCustomPersona } = useForge();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Crown");
  const [selectedWidgets, setSelectedWidgets] = useState<Set<DashboardWidget>>(
    new Set<DashboardWidget>(["story-spotlight", "governance-queue", "persona-metrics"])
  );
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(["Release confidence", "Story velocity"])
  );
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(
    new Set(["Story advances", "Governance decisions"])
  );
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(["approve-governance-item"])
  );

  const toggle = <T,>(set: Set<T>, item: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item); else next.add(item);
    setter(next);
  };

  const handleSave = () => {
    if (!name.trim() || !role.trim()) return;
    const key: PersonaKey = `custom-${Date.now()}`;
    const preset: PersonaPreset = {
      key,
      name: name.trim(),
      shortLabel: name.trim().slice(0, 2).toUpperCase(),
      role: role.trim(),
      icon: selectedIcon,
      sidebarSummary: `Custom persona: ${role.trim()}`,
      commandSummary: `${name.trim()} focuses on ${Array.from(selectedMetrics).slice(0, 2).join(" and ").toLowerCase()}.`,
      dashboardWidgets: Array.from(selectedWidgets),
      metricPriorities: Array.from(selectedMetrics),
      notificationFilters: Array.from(selectedNotifications),
      actionPermissions: Array.from(selectedPermissions),
      memoryFeedOrder: ["Pattern reuse", "Lesson learned"],
      isCustom: true,
    };
    createCustomPersona(preset);
    onOpenChange(false);
    setName("");
    setRole("");
    setSelectedIcon("Crown");
    setSelectedWidgets(new Set<DashboardWidget>(["story-spotlight", "governance-queue", "persona-metrics"]));
    setSelectedMetrics(new Set(["Release confidence", "Story velocity"]));
    setSelectedNotifications(new Set(["Story advances", "Governance decisions"]));
    setSelectedPermissions(new Set(["approve-governance-item"]));
  };

  const widgetList = Array.from(selectedWidgets);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[20px] border border-slate-200 bg-white p-0 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)]">
        <DialogHeader className="border-b border-slate-100 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-violet-50 ring-1 ring-violet-100">
              <Users className="size-4 text-violet-600" />
            </span>
            <DialogTitle className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
              Create Custom Persona
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {/* Name and role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Programme Director"
                className="w-full rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Role title
              </label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Senior Programme Director"
                className="w-full rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(({ name: iconName, icon: Icon }) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-[12px] border transition",
                    selectedIcon === iconName
                      ? "border-slate-900 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Widget selector */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Dashboard widgets
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {WIDGET_OPTIONS.map(w => (
                <label
                  key={w.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 hover:border-sky-200 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedWidgets.has(w.id)}
                    onChange={() => toggle(selectedWidgets, w.id, setSelectedWidgets)}
                    className="size-3.5 accent-slate-950"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">{w.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Metric priorities */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Metric priorities
            </label>
            <div className="flex flex-wrap gap-1.5">
              {METRIC_OPTIONS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggle(selectedMetrics, m, setSelectedMetrics)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                    selectedMetrics.has(m)
                      ? "border-slate-900 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Notification filters */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Notification filters
            </label>
            <div className="flex flex-wrap gap-1.5">
              {NOTIFICATION_OPTIONS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggle(selectedNotifications, n, setSelectedNotifications)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                    selectedNotifications.has(n)
                      ? "border-sky-700 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Action permissions */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Action permissions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PERMISSION_OPTIONS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggle(selectedPermissions, p, setSelectedPermissions)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                    selectedPermissions.has(p)
                      ? "border-emerald-700 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                  )}
                >
                  {p.split("-").join(" ")}
                </button>
              ))}
            </div>
          </div>

          {/* Preview panel */}
          <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Command center preview
            </p>
            {name ? (
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {name}
                  {role ? ` · ${role}` : ""}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {widgetList.slice(0, 6).map(w => {
                    const label = WIDGET_OPTIONS.find(wo => wo.id === w)?.label ?? w;
                    return (
                      <div key={w} className="rounded-[8px] border border-slate-200 bg-white px-2 py-1.5">
                        <p className="text-[10px] font-semibold text-slate-600">{label}</p>
                      </div>
                    );
                  })}
                  {widgetList.length > 6 && (
                    <div className="rounded-[8px] border border-dashed border-slate-200 px-2 py-1.5 text-center">
                      <p className="text-[10px] text-slate-400">+{widgetList.length - 6} more</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Enter a name to see the preview.</p>
            )}
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
            onClick={handleSave}
            disabled={!name.trim() || !role.trim()}
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Save Persona
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
