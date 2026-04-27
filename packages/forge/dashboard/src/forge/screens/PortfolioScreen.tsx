import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowUpRight, Building2, CheckCircle2, FolderOpen, Layers3, Plus, Plug2, ShieldCheck, Sparkles } from "lucide-react";
import { buildScreenPath } from "@/forge/data";
import { useForge } from "@/forge/context";
import { ProjectCreateWizard } from "@/forge/components/ProjectCreateWizard";
import { cn } from "@/lib/utils";

export function PortfolioScreen() {
  const {
    tenants,
    projects,
    activeTenantId,
    setActiveTenantId,
    setActiveProjectId,
    connectors,
    operateMetrics,
  } = useForge();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"tenants" | "projects">("tenants");
  const [wizardOpen, setWizardOpen] = useState(false);

  const connectedCount = useMemo(() => connectors.filter(c => c.status === "Connected").length, [connectors]);
  const totalArtifacts = useMemo(() => tenants.reduce((sum, t) => sum + t.memoryArtifacts, 0), [tenants]);
  const patternReuseRate = 31;
  const complianceCoverage = 97;

  const openProject = (tenantId: string, projectId: string) => {
    setActiveTenantId(tenantId);
    setActiveProjectId(projectId);
    setLocation(buildScreenPath("command"));
  };

  const tenantProjects = useMemo(() => {
    return projects.filter(p => p.tenantId === activeTenantId);
  }, [activeTenantId, projects]);

  const healthColor = (health: string) => {
    if (health === "Healthy") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    if (health === "Watch") return "bg-amber-50 text-amber-700 ring-amber-100";
    return "bg-red-50 text-red-700 ring-red-100";
  };

  const statusColor = (status: string) => {
    if (status === "Active") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    if (status === "Planning") return "bg-sky-50 text-sky-700 ring-sky-100";
    if (status === "Completed") return "bg-slate-100 text-slate-600 ring-slate-200";
    return "bg-amber-50 text-amber-700 ring-amber-100";
  };

  return (
    <div className="space-y-4">
      {/* Compounding value strip */}
      <div className="rounded-[20px] border border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-sky-50/60 p-5 shadow-[0_20px_50px_-40px_rgba(16,185,129,0.3)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Compounding platform value</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-700">
              Pattern reuse is increasing across all tenants. Every project adds to institutional memory that accelerates future delivery.
            </p>
          </div>
          <div className="flex gap-6">
            {[
              { label: "Pattern reuse rate", value: `+${patternReuseRate}%`, color: "text-emerald-700" },
              { label: "Memory artifacts", value: totalArtifacts.toLocaleString(), color: "text-sky-700" },
              { label: "Compliance coverage", value: `${complianceCoverage}%`, color: "text-slate-900" },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className={cn("font-[family-name:var(--font-display)] text-2xl font-semibold", stat.color)}>{stat.value}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio summary strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active tenants", value: String(tenants.length), icon: Building2, tone: "bg-sky-50 text-sky-700 ring-sky-100" },
          { label: "Total projects", value: String(projects.length), icon: FolderOpen, tone: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
          { label: "Connected systems", value: String(connectedCount), icon: Plug2, tone: "bg-amber-50 text-amber-700 ring-amber-100" },
          { label: "Saudi compliance", value: "PDPL + NCA ECC", icon: ShieldCheck, tone: "bg-slate-100 text-slate-700 ring-slate-200" },
        ].map(item => (
          <div key={item.label} className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:border-sky-200">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
              <span className={cn("rounded-2xl p-2 ring-1", item.tone)}><item.icon className="size-4" /></span>
            </div>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>

      {/* View toggle + actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["tenants", "projects"] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold capitalize transition",
                viewMode === mode
                  ? "border-slate-900 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-slate-900"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-2 rounded-full border border-slate-900 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="size-4" />
            Create project
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_380px]">
        <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
          {viewMode === "tenants" ? (
            <>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Tenant overview</p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">Every tenant operates inside the same governed platform</h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Each tenant gets its own workspace, connectors, workflow configuration, memory, and governance posture while sharing the same platform infrastructure. Deployed on GCP me-central2 (Dammam, Saudi Arabia).</p>
              </div>
              <div className="mt-5 space-y-3">
                {tenants.map(tenant => (
                  <button
                    key={tenant.id}
                    type="button"
                    onClick={() => { setActiveTenantId(tenant.id); setViewMode("projects"); }}
                    className={cn(
                      "w-full rounded-[18px] border p-5 text-left transition hover:-translate-y-0.5",
                      tenant.id === activeTenantId
                        ? "border-slate-900 bg-slate-950 text-white shadow-[0_20px_40px_-30px_rgba(15,23,42,0.7)]"
                        : "border-slate-200 bg-slate-50/60 hover:border-sky-200 hover:bg-white"
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className={cn("text-lg font-semibold", tenant.id === activeTenantId ? "text-white" : "text-slate-950")}>{tenant.name}</p>
                        <p className={cn("mt-1 text-sm", tenant.id === activeTenantId ? "text-white/70" : "text-slate-500")}>{tenant.region}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", tenant.id === activeTenantId ? "bg-white/10 text-white ring-white/20" : healthColor(tenant.health))}>{tenant.health}</span>
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", tenant.id === activeTenantId ? "bg-white/10 text-white ring-white/20" : "bg-slate-100 text-slate-600 ring-slate-200")}>{tenant.tier}</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {[
                        { label: "Projects", value: tenant.projectCount },
                        { label: "Connectors", value: tenant.connectorCount },
                        { label: "Artifacts", value: tenant.memoryArtifacts.toLocaleString() },
                        { label: "Release", value: tenant.activeRelease },
                      ].map(stat => (
                        <div key={stat.label}>
                          <p className={cn("text-sm", tenant.id === activeTenantId ? "text-white/60" : "text-slate-500")}>{stat.label}</p>
                          <p className={cn("mt-1 text-base font-semibold", tenant.id === activeTenantId ? "text-white" : "text-slate-950")}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Projects for {tenants.find(t => t.id === activeTenantId)?.name}</p>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">Each project has its own release, stories, and governed delivery flow</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("tenants")}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-sky-200 hover:text-slate-900"
                >
                  Back to tenants
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {tenantProjects.map(project => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => openProject(project.tenantId, project.id)}
                    className="w-full rounded-[18px] border border-slate-200 bg-slate-50/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">{project.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{project.release} · {project.owner}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", statusColor(project.status))}>{project.status}</span>
                        <ArrowUpRight className="size-4 text-sky-700" />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {[
                        { label: "Stories", value: project.storyCount },
                        { label: "Phase", value: project.phase },
                        { label: "Confidence", value: `${project.confidence}%` },
                        { label: "Memory links", value: project.memoryLinks },
                      ].map(stat => (
                        <div key={stat.label}>
                          <p className="text-sm text-slate-500">{stat.label}</p>
                          <p className="mt-1 text-base font-semibold text-slate-950">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                        operateMetrics.activeIncidents > 0 ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"
                      )}>
                        {operateMetrics.activeIncidents > 0 ? `${operateMetrics.activeIncidents} active incident${operateMetrics.activeIncidents > 1 ? "s" : ""}` : "No active incidents"}
                      </span>
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-100">
                        Uptime {operateMetrics.uptimePercent}%
                      </span>
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-slate-200 p-5 text-sm font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-700"
                >
                  <Plus className="size-4" />
                  Add project to this tenant
                </button>
              </div>
            </>
          )}
        </section>

        {/* Right rail: platform health */}
        <section className="space-y-4">
          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Platform health</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Cross tenant operating posture</h3>
              </div>
              <ShieldCheck className="size-5 text-emerald-600" />
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: "Tenants at healthy status", value: `${tenants.filter(t => t.health === "Healthy").length} of ${tenants.length}` },
                { label: "Active projects across tenants", value: `${projects.filter(p => p.status === "Active").length}` },
                { label: "Connected integrations", value: `${connectedCount} systems` },
                { label: "Governance coverage", value: "97% across all tenants" },
                { label: "Deployment region", value: "GCP me-central2 (Dammam)" },
              ].map(item => (
                <div key={item.label} className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-1 text-base font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Saudi compliance badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                <ShieldCheck className="size-3.5" />
                PDPL Compliant
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
                <ShieldCheck className="size-3.5" />
                NCA ECC Aligned
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                <Sparkles className="size-3.5" />
                NDMO Ready
              </span>
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Quick actions</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Navigate to any workspace</h3>
              </div>
              <CheckCircle2 className="size-5 text-sky-700" />
            </div>
            <div className="mt-4 space-y-3">
              {projects.filter(p => p.status === "Active").slice(0, 4).map(project => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => openProject(project.tenantId, project.id)}
                  className="flex w-full items-center justify-between rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-white"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{project.name}</p>
                    <p className="text-sm text-slate-500">{tenants.find(t => t.id === project.tenantId)?.name}</p>
                  </div>
                  <ArrowUpRight className="size-4 text-sky-700" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <ProjectCreateWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
