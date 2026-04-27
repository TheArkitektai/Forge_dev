import { useState } from "react";
import { CheckCircle2, Download, ExternalLink, Plug, ShieldAlert, ShieldCheck, Sparkles, Workflow, XCircle } from "lucide-react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useForge } from "@/forge/context";
import { cn } from "@/lib/utils";
import { ApprovalActionDialog } from "@/forge/components/ApprovalActionDialog";
import { DesignArtifactModal } from "@/forge/components/DesignArtifactModal";
import { EvidenceExportModal } from "@/forge/components/EvidenceExportModal";
import { AuditTrailPanel } from "@/forge/components/AuditTrailPanel";
import { buildScreenPath } from "@/forge/data";
import type { DesignArtifact, GovernanceItem } from "@/forge/types";

export function GovernanceScreen() {
  const { activeModules, activePersona, selectedStory, designArtifacts, openStoryDrawer, rejectDesignArtifact, configuredPersonas, connectors } = useForge();
  const [exportOpen, setExportOpen] = useState(false);
  const [approvalItem, setApprovalItem] = useState<GovernanceItem | null>(null);
  const [approvalAction, setApprovalAction] = useState<"approved" | "rejected">("approved");
  const [, setLocation] = useLocation();
  const [artifactModal, setArtifactModal] = useState<DesignArtifact | null>(null);
  const [artifactModalOpen, setArtifactModalOpen] = useState(false);

  const proofEnabled = activeModules.proofValidator;
  const policyEnabled = activeModules.policyEngine;
  const proofValue = proofEnabled ? selectedStory.evidenceScore : 41;
  const controlTone = proofEnabled && policyEnabled ? "Healthy" : "Reduced";

  const personaPreset = configuredPersonas.find(p => p.key === activePersona);
  const canApprove = personaPreset?.actionPermissions.some(p => p.startsWith("approve-")) ?? false;

  const visibleQueue = selectedStory.governanceQueue.filter(item => {
    if (item.status === "Reviewing" || item.status === "Needs action") return canApprove;
    return true;
  });

  const openApproval = (item: GovernanceItem, action: "approved" | "rejected") => {
    setApprovalItem(item);
    setApprovalAction(action);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Release governance</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">Evidence, approvals, and control posture stay inside the working product</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Governance is not a slide after the work. It is a connected screen that reads the same story, the same approvals, and the same trace retained across the rest of the platform.</p>
            </div>
            <Button
              onClick={() => setExportOpen(true)}
              className="flex shrink-0 items-center gap-2 bg-slate-950 text-white hover:bg-slate-800"
            >
              <Download className="size-4" />
              Export evidence pack
            </Button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Proof readiness</p>
                    <p className="mt-2 text-sm text-slate-600">Release evidence connected to the active story.</p>
                  </div>
                  <ShieldCheck className="size-5 text-emerald-600" />
                </div>
                <div className="mt-4 flex flex-col items-center rounded-[16px] border border-slate-200 bg-white p-4">
                <div className="h-40 w-40">
                  <ChartContainer config={{ value: { label: "Proof", color: proofEnabled ? "oklch(0.63 0.17 246)" : "oklch(0.74 0.02 260)" } }} className="h-full w-full !aspect-square">
                    <RadialBarChart data={[{ name: "Proof", value: proofValue, fill: proofEnabled ? "oklch(0.63 0.17 246)" : "oklch(0.74 0.02 260)" }]} innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270}>
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar dataKey="value" background cornerRadius={999} />
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    </RadialBarChart>
                  </ChartContainer>
                </div>
                <p className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950">{proofValue}%</p>
                <p className="mt-2 text-center text-sm leading-6 text-slate-600">{proofEnabled ? "Evidence, rationale, and review events remain assembled into the release record." : "Proof Validator is off, so the workspace can only show partial readiness and manual trace checks."}</p>
              </div>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Governance principle</p>
                    <h4 className="mt-2 text-lg font-semibold text-slate-950">Supervised Autonomous Execution</h4>
                  </div>
                  <ShieldCheck className="size-5 text-sky-700" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">Agents can write and test code in sandboxes, but humans always approve before merge. Zero autonomous action has evolved to supervised autonomous execution in v12.</p>
              </div>
            </div>

            <div className="rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Approval queue</p>
                  <h4 className="mt-2 text-xl font-semibold text-slate-950">Visible release decisions for {selectedStory.title}</h4>
                </div>
                <Workflow className="size-5 text-sky-700" />
              </div>
              <div className="mt-4 space-y-3">
                {visibleQueue.length === 0 && (
                  <div className="rounded-[16px] border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
                    <p className="text-sm font-semibold text-slate-900">No items require your attention</p>
                    <p className="mt-1 text-sm text-slate-500">Approval actions for this story are assigned to other roles.</p>
                  </div>
                )}
                {visibleQueue.map(item => (
                  <div key={item.id} className="rounded-[16px] border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:bg-sky-50/30">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.owner}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">{item.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{item.time}</p>
                    {/* Contextual references */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.storyTitle && (
                        <button
                          type="button"
                          onClick={() => item.storyId && openStoryDrawer(item.storyId)}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition"
                        >
                          <ExternalLink className="size-3" />
                          Story: {item.storyTitle}
                        </button>
                      )}
                      {item.artifactTitle && item.artifactId && (
                        <button
                          type="button"
                          onClick={() => {
                            const art = designArtifacts.find(a => a.id === item.artifactId);
                            if (art) { setArtifactModal(art); setArtifactModalOpen(true); }
                          }}
                          className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100 transition"
                        >
                          <ExternalLink className="size-3" />
                          Design: {item.artifactTitle}
                        </button>
                      )}
                      {item.phaseContext && (
                        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                          {item.phaseContext}
                        </span>
                      )}
                    </div>
                    {(item.status === "Reviewing" || item.status === "Needs action") && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openApproval(item, "approved")}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-emerald-200 bg-emerald-50 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <CheckCircle2 className="size-4" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => openApproval(item, "rejected")}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          <XCircle className="size-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Compliance posture</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-950">Regulatory alignment at a glance</h4>
              </div>
              <ShieldCheck className="size-5 text-emerald-600" />
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: "PDPL Coverage", value: 94, color: "bg-emerald-500" },
                { label: "NCA ECC Alignment", value: 87, color: "bg-sky-500" },
                { label: "Audit Readiness", value: 91, color: "bg-violet-500" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-950">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <ShieldCheck className="size-3.5" />
                  PDPL Compliant
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
                  <ShieldCheck className="size-3.5" />
                  NCA ECC Aligned
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Control matrix</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-950">Control health stays tied to the same release story</h4>
              </div>
              {policyEnabled ? <ShieldCheck className="size-5 text-emerald-600" /> : <ShieldAlert className="size-5 text-amber-600" />}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {selectedStory.controls.map(control => (
                <div key={control.id} className="rounded-[16px] border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{control.title}</p>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">{control.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{control.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Audit posture</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Current governance state</h3>
              </div>
              <Sparkles className="size-4 text-sky-700" />
            </div>
            <div className="mt-4 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-sm text-slate-500">Active lens</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{activePersona}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{selectedStory.personaFocus[activePersona] ?? ""}</p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-800">Proof Validator: {proofEnabled ? "Enabled" : "Disabled"}</div>
              <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-800">Policy Engine: {policyEnabled ? "Enabled" : "Disabled"}</div>
              <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-800">Governance posture: {controlTone}</div>
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Connector action audit</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Recent bidirectional actions</h3>
              </div>
              <Plug className="size-5 text-sky-600" />
            </div>
            <div className="mt-4 space-y-3">
              {connectors.filter(c => c.actions && c.actions.length > 0).flatMap(c => c.actions!.map(a => ({ ...a, connectorName: c.name }))).slice(0, 6).map(action => (
                <div key={action.id} className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">{action.action}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                      action.requiresApproval ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"
                    )}>
                      {action.requiresApproval ? "Manual" : "Auto"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{action.connectorName} · {action.executionCount} executions</p>
                  {action.governanceGate && (
                    <p className="text-xs text-slate-400">Gate: {action.governanceGate}</p>
                  )}
                </div>
              ))}
              {connectors.filter(c => c.actions && c.actions.length > 0).length === 0 && (
                <p className="text-sm text-slate-400">No bidirectional connector actions configured</p>
              )}
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Recommended next moves</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">How this lens should respond</h3>
              </div>
              <ShieldCheck className="size-5 text-emerald-600" />
            </div>
            <div className="mt-4 space-y-3">
              {(selectedStory.personaActions[activePersona] ?? []).map(item => (
                <div key={item} className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-800">{item}</div>
              ))}
            </div>
          </div>

          <AuditTrailPanel />
        </section>
      </div>

      <DesignArtifactModal
        artifact={artifactModal}
        open={artifactModalOpen}
        onOpenChange={open => { setArtifactModalOpen(open); if (!open) setArtifactModal(null); }}
      />
      {approvalItem && (
        <ApprovalActionDialog
          item={approvalItem}
          action={approvalAction}
          open={!!approvalItem}
          onOpenChange={open => { if (!open) setApprovalItem(null); }}
        />
      )}
      <EvidenceExportModal open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}
