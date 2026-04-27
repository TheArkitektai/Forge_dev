import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2, ChevronRight, Layers3, Database, Zap, Smartphone, Server,
  Landmark, Globe, ShieldCheck, PenTool, Plus, Minus,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForge } from "@/forge/context";
import { projectTemplates } from "@/forge/projectTemplates";
import { cn } from "@/lib/utils";
import type { ProjectTypeKey } from "@/forge/types";
import { PersonaBuilderDialog } from "@/forge/components/PersonaBuilderDialog";

type Mode = "quick" | "advanced";

const templateIcons: Record<string, typeof Layers3> = {
  Layers3, Database, Zap, Smartphone, Server, Landmark, Globe, ShieldCheck, PenTool,
};

const governanceColors = {
  Standard: "bg-sky-50 text-sky-700 ring-sky-100",
  Enhanced: "bg-amber-50 text-amber-700 ring-amber-100",
  Maximum: "bg-rose-50 text-rose-700 ring-rose-100",
};

const OWNERS = ["Sara Malik", "Maha Noor", "Omar Rahman", "Rayan Fares", "Dana Youssef", "Leen Haddad"];
const COMPLIANCE_OPTIONS = ["PDPL", "NCA ECC", "SOC2", "ISO 27001", "NDMO"];
const POSTURES = ["Standard", "Enhanced", "Maximum"] as const;
const EVIDENCE_LEVELS = ["None", "Summary", "Full"] as const;
type GovernancePosture = "Standard" | "Enhanced" | "Maximum";
type EvidenceLevel = "None" | "Summary" | "Full";

const ADVANCED_STEPS = ["Identity", "Workflow", "Connectors", "Personas", "Governance", "Review"] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/* ─── Advanced Stepper ─────────────────────────────────────────────────── */

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {ADVANCED_STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition",
                i < step
                  ? "bg-emerald-600 text-white"
                  : i === step
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 text-slate-400 bg-white"
              )}
            >
              {i < step ? <CheckCircle2 className="size-3" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold whitespace-nowrap hidden sm:inline",
                i === step ? "text-slate-900" : i < step ? "text-emerald-600" : "text-slate-400"
              )}
            >
              {label}
            </span>
          </div>
          {i < total - 1 && (
            <div
              className={cn("mx-1.5 h-px flex-1 min-w-[12px] transition", i < step ? "bg-emerald-300" : "bg-slate-200")}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function ProjectCreateWizard({ open, onOpenChange }: Props) {
  const { createProject, connectors, configuredPersonas } = useForge();
  const [mode, setMode] = useState<Mode>("quick");

  /* Quick + shared state */
  const [projectName, setProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTypeKey | null>(null);
  const [launched, setLaunched] = useState(false);

  /* Advanced state */
  const [advStep, setAdvStep] = useState(0);
  const [advDescription, setAdvDescription] = useState("");
  const [advOwner, setAdvOwner] = useState(OWNERS[0]);
  const [advPhases, setAdvPhases] = useState<{ id: string; name: string }[]>([]);
  const [advConnectors, setAdvConnectors] = useState<Set<string>>(new Set());
  const [advPersonas, setAdvPersonas] = useState<Set<string>>(new Set());
  const [advGovernance, setAdvGovernance] = useState<GovernancePosture>("Standard");
  const [advCompliance, setAdvCompliance] = useState<Set<string>>(new Set());
  const [advEvidenceLevel, setAdvEvidenceLevel] = useState<Record<string, EvidenceLevel>>({});
  const [personaBuilderOpen, setPersonaBuilderOpen] = useState(false);

  const template = projectTemplates.find(t => t.key === selectedTemplate);

  const initAdvancedFromTemplate = (key: ProjectTypeKey) => {
    const tpl = projectTemplates.find(t => t.key === key);
    if (!tpl) return;
    setAdvPhases(tpl.phases.map(p => ({ id: p.id, name: p.name })));
    setAdvConnectors(new Set(tpl.recommendedConnectors.map(name =>
      connectors.find(c => c.name === name)?.id ?? name
    )));
    setAdvPersonas(new Set(tpl.recommendedPersonas));
    setAdvGovernance(tpl.governancePosture as GovernancePosture);
    setAdvCompliance(new Set(tpl.complianceDefaults));
    const evidenceMap: Record<string, EvidenceLevel> = {};
    tpl.phases.forEach(p => { evidenceMap[p.id] = "Summary"; });
    setAdvEvidenceLevel(evidenceMap);
  };

  const handleLaunch = () => {
    if (!projectName.trim() || !selectedTemplate) return;
    setLaunched(true);
    setTimeout(() => {
      createProject(projectName.trim(), selectedTemplate);
      onOpenChange(false);
      setLaunched(false);
      setProjectName("");
      setSelectedTemplate(null);
      setMode("quick");
      setAdvStep(0);
    }, 1400);
  };

  const advCanAdvance = () => {
    if (advStep === 0) return !!(projectName.trim() && selectedTemplate);
    return true;
  };

  const handleAdvNext = () => {
    if (advStep < ADVANCED_STEPS.length - 1) setAdvStep(s => s + 1);
  };

  const handleAdvBack = () => {
    if (advStep > 0) setAdvStep(s => s - 1);
  };

  const complexityScore = Math.min(
    100,
    (advPhases.length * 10) +
    (advConnectors.size * 3) +
    (advPersonas.size * 2) +
    (advCompliance.size * 15) +
    (advGovernance === "Maximum" ? 20 : advGovernance === "Enhanced" ? 10 : 0)
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)] text-2xl text-slate-950">
              Create Project
            </DialogTitle>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="flex gap-2">
            {(["quick", "advanced"] as Mode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setAdvStep(0); }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                  mode === m
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                )}
              >
                {m === "quick" ? "Quick Start" : "Advanced Setup"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {launched ? (
              <motion.div
                key="launched"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                  <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
                <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                  Launching project
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Configuring phases, gates, and connectors from the {template?.name} template
                </p>
                <div className="mt-6 flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      className="size-2.5 rounded-full bg-slate-950"
                    />
                  ))}
                </div>
              </motion.div>
            ) : mode === "quick" ? (
              <motion.div
                key="quick"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Project name
                  </label>
                  <Input
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g. National Digital Permits Platform"
                    className="rounded-[14px] border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Project type
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {projectTemplates.map(t => {
                      const Icon = templateIcons[t.icon] ?? Layers3;
                      const isSelected = selectedTemplate === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setSelectedTemplate(t.key)}
                          className={cn(
                            "rounded-[16px] border p-4 text-left transition",
                            isSelected
                              ? "border-slate-900 bg-slate-950 text-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.75)]"
                              : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/60"
                          )}
                        >
                          <div className={cn(
                            "mb-3 flex size-9 items-center justify-center rounded-2xl ring-1",
                            isSelected ? "bg-white/10 ring-white/15" : "bg-slate-50 ring-slate-200 text-sky-700"
                          )}>
                            <Icon className="size-4.5" />
                          </div>
                          <p className={cn("text-sm font-semibold", isSelected ? "text-white" : "text-slate-900")}>
                            {t.name}
                          </p>
                          <p className={cn("mt-1 text-[11px] leading-5", isSelected ? "text-white/70" : "text-slate-500")}>
                            {t.phases.length} phases
                          </p>
                          <div className="mt-2">
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                              isSelected ? "bg-white/15 text-white ring-white/20" : governanceColors[t.governancePosture]
                            )}>
                              {t.governancePosture}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {template && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="rounded-[16px] border border-slate-200 bg-slate-50/60 p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-3">
                        Auto configured from template
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Phases</p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {template.phases.map(p => p.name).join(", ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Governance posture</p>
                          <p className="mt-1 font-semibold text-slate-900">{template.governancePosture}</p>
                        </div>
                        {template.complianceDefaults.length > 0 && (
                          <div>
                            <p className="text-slate-500">Compliance defaults</p>
                            <p className="mt-1 font-semibold text-slate-900">
                              {template.complianceDefaults.join(", ")}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-500">Recommended connectors</p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {template.recommendedConnectors.slice(0, 4).join(", ")}
                            {template.recommendedConnectors.length > 4 && ` +${template.recommendedConnectors.length - 4} more`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 text-slate-700">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLaunch}
                    disabled={!projectName.trim() || !selectedTemplate}
                    className="bg-slate-950 text-white hover:bg-slate-800"
                  >
                    Launch project
                    <ChevronRight className="ml-1.5 size-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <StepBar step={advStep} total={ADVANCED_STEPS.length} />

                <AnimatePresence mode="wait">
                  {/* Step 0: Identity */}
                  {advStep === 0 && (
                    <motion.div
                      key="adv-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                          Project name
                        </label>
                        <Input
                          value={projectName}
                          onChange={e => setProjectName(e.target.value)}
                          placeholder="e.g. National Digital Permits Platform"
                          className="rounded-[14px] border-slate-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                          Description
                        </label>
                        <textarea
                          value={advDescription}
                          onChange={e => setAdvDescription(e.target.value)}
                          placeholder="Briefly describe this project's goals..."
                          rows={2}
                          className="w-full resize-none rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                          Owner
                        </label>
                        <select
                          value={advOwner}
                          onChange={e => setAdvOwner(e.target.value)}
                          className="w-full rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 focus:border-sky-300 focus:outline-none"
                        >
                          {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                          Project type
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {projectTemplates.map(t => {
                            const Icon = templateIcons[t.icon] ?? Layers3;
                            const isSelected = selectedTemplate === t.key;
                            return (
                              <button
                                key={t.key}
                                type="button"
                                onClick={() => {
                                  setSelectedTemplate(t.key);
                                  initAdvancedFromTemplate(t.key);
                                }}
                                className={cn(
                                  "rounded-[14px] border p-3 text-left transition",
                                  isSelected
                                    ? "border-slate-900 bg-slate-950 text-white"
                                    : "border-slate-200 bg-white hover:border-sky-200"
                                )}
                              >
                                <Icon className={cn("mb-2 size-4", isSelected ? "text-white" : "text-sky-700")} />
                                <p className={cn("text-sm font-semibold", isSelected ? "text-white" : "text-slate-900")}>
                                  {t.name}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Workflow */}
                  {advStep === 1 && (
                    <motion.div
                      key="adv-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">Phases</p>
                        <button
                          type="button"
                          onClick={() => setAdvPhases(p => [...p, { id: `phase-${Date.now()}`, name: "New Phase" }])}
                          className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 transition"
                        >
                          <Plus className="size-3" />
                          Add Phase
                        </button>
                      </div>
                      <div className="space-y-2">
                        {advPhases.map((phase, i) => (
                          <div key={phase.id} className="flex items-center gap-3">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                              {i + 1}
                            </div>
                            <input
                              type="text"
                              value={phase.name}
                              onChange={e => setAdvPhases(p => p.map((ph, j) => j === i ? { ...ph, name: e.target.value } : ph))}
                              className="flex-1 rounded-[12px] border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-sky-300 focus:outline-none"
                            />
                            {advPhases.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setAdvPhases(p => p.filter((_, j) => j !== i))}
                                className="flex size-7 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                              >
                                <Minus className="size-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        {advPhases.length === 0 && (
                          <p className="text-sm text-slate-400 text-center py-4">
                            Select a project type in Step 1 to populate phases, or add custom ones.
                          </p>
                        )}
                      </div>
                      {template && (
                        <div className="rounded-[14px] border border-slate-100 bg-slate-50/60 px-4 py-3">
                          <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Gate configuration</p>
                          <div className="space-y-1.5">
                            {template.defaultGates.map(gate => (
                              <div key={`${gate.fromPhase}-${gate.toPhase}`} className="flex items-center justify-between">
                                <span className="text-sm text-slate-700">{gate.fromPhase} to {gate.toPhase}</span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                  {gate.approvers} approver{gate.approvers !== 1 ? "s" : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: Connectors */}
                  {advStep === 2 && (
                    <motion.div
                      key="adv-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-slate-600">
                        Recommended connectors for this project type are pre-selected.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {connectors.filter(c => c.status !== "Coming soon").map(c => {
                          const isSelected = advConnectors.has(c.id);
                          return (
                            <label
                              key={c.id}
                              className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-[14px] border p-3 transition",
                                isSelected ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white hover:border-sky-200"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const next = new Set(advConnectors);
                                  if (next.has(c.id)) next.delete(c.id); else next.add(c.id);
                                  setAdvConnectors(next);
                                }}
                                className="size-3.5 accent-slate-950"
                              />
                              <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-bold text-slate-600">
                                {c.icon}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                                <p className="text-[10px] text-slate-500">{c.category}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {advConnectors.size} connector{advConnectors.size !== 1 ? "s" : ""} selected
                      </p>
                    </motion.div>
                  )}

                  {/* Step 3: Personas */}
                  {advStep === 3 && (
                    <motion.div
                      key="adv-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Select personas that will use this project.</p>
                        <button
                          type="button"
                          onClick={() => setPersonaBuilderOpen(true)}
                          className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 transition"
                        >
                          <Plus className="size-3" />
                          Create Custom
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {configuredPersonas.map(persona => {
                          const isSelected = advPersonas.has(persona.key);
                          return (
                            <label
                              key={persona.key}
                              className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-[14px] border p-3 transition",
                                isSelected ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white hover:border-violet-200"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const next = new Set(advPersonas);
                                  if (next.has(persona.key)) next.delete(persona.key); else next.add(persona.key);
                                  setAdvPersonas(next);
                                }}
                                className="mt-0.5 size-3.5 accent-slate-950"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-semibold text-slate-900">{persona.name}</p>
                                  {persona.isCustom && (
                                    <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-semibold text-violet-700">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500">{persona.role}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      {advPersonas.size > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Array.from(advPersonas).map(key => {
                            const p = configuredPersonas.find(x => x.key === key);
                            return p ? (
                              <span key={key} className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-100">
                                {p.shortLabel}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 4: Governance */}
                  {advStep === 4 && (
                    <motion.div
                      key="adv-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                          Governance posture
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {POSTURES.map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setAdvGovernance(p)}
                              className={cn(
                                "rounded-[14px] border p-3 text-left transition",
                                advGovernance === p
                                  ? "border-slate-900 bg-slate-950 text-white"
                                  : "border-slate-200 bg-white hover:border-sky-200"
                              )}
                            >
                              <p className={cn("text-sm font-semibold", advGovernance === p ? "text-white" : "text-slate-900")}>
                                {p}
                              </p>
                              <p className={cn("mt-1 text-[11px]", advGovernance === p ? "text-white/70" : "text-slate-500")}>
                                {p === "Standard" ? "SDLC gates, basic audit" : p === "Enhanced" ? "Full evidence chain" : "Full compliance + controls"}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                          Compliance standards
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {COMPLIANCE_OPTIONS.map(opt => (
                            <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 transition hover:border-sky-200">
                              <input
                                type="checkbox"
                                checked={advCompliance.has(opt)}
                                onChange={() => {
                                  const next = new Set(advCompliance);
                                  if (next.has(opt)) next.delete(opt); else next.add(opt);
                                  setAdvCompliance(next);
                                }}
                                className="size-3 accent-slate-950"
                              />
                              <span className="text-[11px] font-semibold text-slate-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {advPhases.length > 0 && (
                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                            Evidence level per phase
                          </p>
                          <div className="space-y-2">
                            {advPhases.map(phase => (
                              <div key={phase.id} className="flex items-center justify-between rounded-[12px] border border-slate-200 bg-white px-4 py-2.5">
                                <span className="text-sm font-semibold text-slate-900">{phase.name}</span>
                                <div className="flex gap-1">
                                  {EVIDENCE_LEVELS.map(lvl => (
                                    <button
                                      key={lvl}
                                      type="button"
                                      onClick={() => setAdvEvidenceLevel(prev => ({ ...prev, [phase.id]: lvl }))}
                                      className={cn(
                                        "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition",
                                        advEvidenceLevel[phase.id] === lvl
                                          ? "border-slate-900 bg-slate-950 text-white"
                                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                      )}
                                    >
                                      {lvl}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 5: Review */}
                  {advStep === 5 && (
                    <motion.div
                      key="adv-5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[14px] border border-slate-200 bg-white p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-2">Identity</p>
                          <p className="text-sm font-semibold text-slate-900">{projectName || "Unnamed project"}</p>
                          {advDescription && <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">{advDescription}</p>}
                          <p className="mt-1 text-[11px] text-slate-500">Owner: {advOwner}</p>
                          {template && <p className="mt-1 text-[11px] text-slate-500">Type: {template.name}</p>}
                        </div>
                        <div className="rounded-[14px] border border-slate-200 bg-white p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-2">Workflow</p>
                          <div className="flex flex-wrap gap-1">
                            {advPhases.map(p => (
                              <span key={p.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                {p.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-[14px] border border-slate-200 bg-white p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-2">
                            Connectors ({advConnectors.size})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(advConnectors).slice(0, 6).map(id => {
                              const c = connectors.find(x => x.id === id);
                              return c ? (
                                <span key={id} className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-100">
                                  {c.name}
                                </span>
                              ) : null;
                            })}
                            {advConnectors.size > 6 && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                +{advConnectors.size - 6}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="rounded-[14px] border border-slate-200 bg-white p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 mb-2">Governance</p>
                          <p className="text-sm font-semibold text-slate-900">{advGovernance}</p>
                          {advCompliance.size > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {Array.from(advCompliance).map(c => (
                                <span key={c} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Complexity score */}
                      <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Estimated complexity</p>
                          <span className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                            complexityScore >= 70 ? "bg-rose-50 text-rose-700 ring-rose-100" :
                            complexityScore >= 40 ? "bg-amber-50 text-amber-700 ring-amber-100" :
                            "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          )}>
                            {complexityScore >= 70 ? "High" : complexityScore >= 40 ? "Medium" : "Low"} ({complexityScore}/100)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${complexityScore}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full",
                              complexityScore >= 70 ? "bg-rose-500" :
                              complexityScore >= 40 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={advStep === 0 ? () => onOpenChange(false) : handleAdvBack}
                    className="border-slate-200 text-slate-700"
                  >
                    {advStep === 0 ? "Cancel" : "Back"}
                  </Button>
                  {advStep < ADVANCED_STEPS.length - 1 ? (
                    <Button
                      onClick={handleAdvNext}
                      disabled={!advCanAdvance()}
                      className="bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="ml-1.5 size-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleLaunch}
                      disabled={!projectName.trim() || !selectedTemplate}
                      className="bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      Launch project
                      <ChevronRight className="ml-1.5 size-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <PersonaBuilderDialog open={personaBuilderOpen} onOpenChange={setPersonaBuilderOpen} />
    </>
  );
}
