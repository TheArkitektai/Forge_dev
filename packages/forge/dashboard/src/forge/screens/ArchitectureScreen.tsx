import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowUpRight, Binary, CheckCircle2, ChevronRight, Code2, FileText,
  Folder, FolderOpen, Layers3, Pencil, ShieldCheck, Waypoints, XCircle, Eye,
} from "lucide-react";
import { buildScreenPath } from "@/forge/data";
import { demoFileTree, demoRepo } from "@/forge/githubData";
import { useForge } from "@/forge/context";
import { GitHubPanel } from "@/forge/components/GitHubPanel";
import { ReworkBadge } from "@/forge/components/ReworkBadge";
import { DesignArtifactCard } from "@/forge/components/DesignArtifactCard";
import { DesignArtifactModal } from "@/forge/components/DesignArtifactModal";
import { DesignRejectDialog } from "@/forge/components/DesignRejectDialog";
import { cn } from "@/lib/utils";
import type { DesignArtifact, GitHubFileNode } from "@/forge/types";

function FileNode({ node, depth = 0, expanded, onToggle }: {
  node: GitHubFileNode;
  depth?: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isExpanded = expanded.has(node.path);
  const isDir = node.type === "directory";
  const fileUrl = `${demoRepo.url}/blob/${demoRepo.defaultBranch}/${node.path}`;

  return (
    <div>
      {isDir ? (
        <button
          type="button"
          onClick={() => onToggle(node.path)}
          className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-sm transition hover:bg-slate-100"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          {isExpanded
            ? <FolderOpen className="size-3.5 shrink-0 text-amber-500" />
            : <Folder className="size-3.5 shrink-0 text-amber-500" />
          }
          <span className="text-[12px] font-semibold text-slate-800">{node.name}</span>
          <ChevronRight className={cn("ml-auto size-3 text-slate-400 transition", isExpanded && "rotate-90")} />
        </button>
      ) : (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left transition hover:bg-slate-100"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          {node.language === "typescript" || node.language === "javascript"
            ? <Code2 className="size-3.5 shrink-0 text-sky-500" />
            : <FileText className="size-3.5 shrink-0 text-slate-400" />
          }
          <span className="text-[12px] text-slate-700">{node.name}</span>
          {node.size && (
            <span className="ml-auto text-[10px] text-slate-400">{node.size}</span>
          )}
        </a>
      )}
      {isDir && isExpanded && node.children?.map(child => (
        <FileNode key={child.path} node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
      ))}
    </div>
  );
}

export function ArchitectureScreen() {
  const { activeModules, activePersona, selectedStory, designArtifacts, approveDesignArtifact, openStoryDrawer } = useForge();
  const [, setLocation] = useLocation();
  const [modalArtifact, setModalArtifact] = useState<DesignArtifact | null>(null);
  const [rejectArtifact, setRejectArtifact] = useState<DesignArtifact | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["src"]));
  const [repoExpanded, setRepoExpanded] = useState(false);

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  };

  const compilerOn = activeModules.contextCompiler;
  const policyOn = activeModules.policyEngine;

  const personaLayerMap: Record<string, string[]> = {
    cto: ["Intelligence and Orchestration", "Process and Governance"],
    "delivery-lead": ["Process and Governance", "Workflow Engine"],
    architect: ["Customer Interaction", "Data and Context", "Module System"],
    developer: ["Customer Interaction", "Data and Context", "Workflow Engine"],
    "qa-engineer": ["Process and Governance", "Module System"],
    "security-engineer": ["Process and Governance", "Data and Context"],
    "compliance-officer": ["Process and Governance", "Data and Context"],
    "product-owner": ["Customer Interaction", "Workflow Engine"],
    "devops-lead": ["Workflow Engine", "Module System"],
    "programme-director": ["Intelligence and Orchestration", "Process and Governance"],
  };
  const responsibleLayers = new Set(personaLayerMap[activePersona] ?? []);

  const storyArtifacts = designArtifacts.filter(
    a => a.storyId === selectedStory.id && (a.status === "in_review" || a.status === "reworked")
  );

  function toReworkBadgeStatus(s: DesignArtifact["status"]) {
    return (s === "in_review" ? "awaiting_review" : s) as "draft" | "awaiting_review" | "approved" | "rejected" | "reworked" | "reworking";
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">System design</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">Architecture stays visible, reviewable, and connected to active delivery</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">The same selected story now reveals impacted layers, service boundaries, and the rationale that made this design acceptable for the release.</p>
          </div>

          <div className="mt-5 rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Layer view</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-950">The active story touches multiple architectural layers</h4>
              </div>
              <Layers3 className="size-5 text-sky-700" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                { title: "Customer Interaction", note: "Command surfaces, review views, and story workspace" },
                { title: "Intelligence and Orchestration", note: compilerOn ? "Context assembly and governed agent proposals" : "Context assembly is reduced because the compiler module is off" },
                { title: "Process and Governance", note: policyOn ? "State transitions, gates, and proof events" : "Policy based gating is weakened while the policy engine is off" },
                { title: "Data and Context", note: "Project memory, story memory, and retrieval lineage" },
                { title: "Workflow Engine", note: "Tenant phase logic and transition validation" },
                { title: "Module System", note: selectedStory.services.join(", ") },
                { title: "Code Execution Loop", note: "Autonomous generation, testing, iteration, and explainability reporting with human approval gates" },
              ].map(item => {
                const isResponsible = responsibleLayers.has(item.title);
                return (
                  <div
                    key={item.title}
                    className={cn(
                      "rounded-[16px] border bg-white p-4 transition hover:-translate-y-0.5",
                      isResponsible
                        ? "border-sky-300 bg-sky-50/40 hover:border-sky-400 shadow-[0_0_0_3px_rgba(125,211,252,0.25)]"
                        : "border-slate-200 hover:border-sky-200"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                      {isResponsible && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">Your layer</span>}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Service impact map</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-950">The exact systems affected by {selectedStory.title}</h4>
              </div>
              <Waypoints className="size-5 text-emerald-600" />
            </div>
            <div className="mt-4 space-y-3">
              {selectedStory.serviceImpacts.map(item => (
                <div key={item.id} className="rounded-[16px] border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:bg-sky-50/30">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.layer}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">{item.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {storyArtifacts.length > 0 && (
            <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Design Artifacts Under Review</p>
                  <h4 className="mt-2 text-xl font-semibold text-slate-950">Generated for this story</h4>
                </div>
                <Pencil className="size-5 text-sky-700" />
              </div>
              <button
                type="button"
                onClick={() => openStoryDrawer(selectedStory.id)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                Story: {selectedStory.title}
              </button>
              <div className="mt-4 space-y-3">
                {storyArtifacts.map(artifact => (
                  <div key={artifact.id} className="rounded-[16px] border border-slate-200 bg-white p-4 transition hover:border-sky-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-950">{artifact.title}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <ReworkBadge status={toReworkBadgeStatus(artifact.status)} version={artifact.version} />
                          <span className="text-[11px] text-slate-500">Version {artifact.version}</span>
                          <span className="text-[11px] text-slate-500">·</span>
                          <span className="text-[11px] text-slate-500">{artifact.createdBy}</span>
                        </div>
                        {artifact.impactedLayers.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {artifact.impactedLayers.map(layer => (
                              <span key={layer} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200">
                                {layer}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => { setModalArtifact(artifact); setModalOpen(true); }}
                        className="flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                      >
                        <Eye className="size-4" />
                        View Full Design
                      </button>
                      {artifact.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => approveDesignArtifact(artifact.id)}
                          className="flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <CheckCircle2 className="size-4" />
                          Approve
                        </button>
                      )}
                      {artifact.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => { setRejectArtifact(artifact); setRejectOpen(true); }}
                          className="flex items-center gap-1.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          <XCircle className="size-4" />
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Design rationale</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-950">Accepted decisions that now shape the build path</h4>
              </div>
              <Binary className="size-5 text-slate-700" />
            </div>
            <div className="mt-4 space-y-3">
              {selectedStory.rationale.map(point => (
                <div key={point} className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <GitHubPanel defaultView="commits" maxItems={4} />

          {/* Repository file tree */}
          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
            <button
              type="button"
              onClick={() => setRepoExpanded(x => !x)}
              className="flex w-full items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Repository</p>
                <h4 className="mt-1 text-base font-semibold text-slate-950">{demoRepo.owner}/{demoRepo.name}</h4>
              </div>
              <ChevronRight className={cn("size-4 text-slate-400 transition", repoExpanded && "rotate-90")} />
            </button>
            {repoExpanded && (
              <div className="mt-3 rounded-[14px] border border-slate-200 bg-slate-50/60 p-2">
                <div className="max-h-[320px] overflow-y-auto">
                  {demoFileTree.map(node => (
                    <FileNode key={node.path} node={node} depth={0} expanded={expandedNodes} onToggle={toggleNode} />
                  ))}
                </div>
                <div className="mt-2 border-t border-slate-200 pt-2">
                  <a
                    href={demoRepo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 hover:text-sky-800"
                  >
                    View on GitHub
                    <ArrowUpRight className="size-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Persona emphasis</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Why this design matters from the active lens</h3>
              </div>
              <ArrowUpRight className="size-4 text-sky-700" />
            </div>
            <p className="mt-4 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 text-sm leading-7 text-slate-600">{selectedStory.personaFocus[activePersona] ?? ""}</p>
            <div className="mt-4 space-y-3">
              {selectedStory.dependencies.map(item => (
                <div key={item} className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-800">{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Cross product continuity</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Keep the same story in view elsewhere</h3>
              </div>
              <ShieldCheck className="size-5 text-amber-600" />
            </div>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setLocation(buildScreenPath("governance", selectedStory.id))}
                className="flex w-full items-start gap-3 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:border-sky-200 hover:bg-white"
              >
                <span className="rounded-2xl bg-amber-50 p-2 text-amber-700 ring-1 ring-amber-100"><ShieldCheck className="size-4" /></span>
                <span>
                  <span className="block text-sm font-semibold text-slate-950">Inspect governance readiness</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">Use the same design decisions to view proof coverage and control posture.</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setLocation(buildScreenPath("config", selectedStory.id))}
                className="flex w-full items-start gap-3 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:border-sky-200 hover:bg-white"
              >
                <span className="rounded-2xl bg-emerald-50 p-2 text-emerald-700 ring-1 ring-emerald-100"><Layers3 className="size-4" /></span>
                <span>
                  <span className="block text-sm font-semibold text-slate-950">Inspect workflow configuration</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">See how tenant logic controls the lifecycle around this architecture.</span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
      <DesignArtifactModal
        artifact={modalArtifact}
        open={modalOpen}
        onOpenChange={open => { setModalOpen(open); if (!open) setModalArtifact(null); }}
      />
      {rejectArtifact && (
        <DesignRejectDialog
          artifact={rejectArtifact}
          open={rejectOpen}
          onOpenChange={open => { setRejectOpen(open); if (!open) setRejectArtifact(null); }}
        />
      )}
    </div>
  );
}
