import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowUpRight, BookOpenText, Layers3, Plus, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { buildScreenPath } from "@/forge/data";
import { useForge } from "@/forge/context";
import { cn } from "@/lib/utils";

const filters = ["All", "Pattern reuse", "Evidence reuse", "Lesson learned", "Operational lesson", "Context link"] as const;

type FilterKey = (typeof filters)[number];

export function ContextHubScreen() {
  const { activeModules, activePersona, selectedStory, addNotification, configuredPersonas } = useForge();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<FilterKey>("All");
  const [search, setSearch] = useState("");
  const [crossProject, setCrossProject] = useState(false);

  const orderedEvents = useMemo(() => {
    const filtered = selectedStory.memoryEvents.filter(event => {
      const matchesFilter = filter === "All" || event.kind === filter;
      const matchesSearch = !search || event.title.toLowerCase().includes(search.toLowerCase()) || event.detail.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    const personaPreset = configuredPersonas.find(p => p.key === activePersona);
    if (personaPreset?.memoryFeedOrder.length) {
      const order = personaPreset.memoryFeedOrder;
      return [...filtered].sort((a, b) => {
        const ia = order.indexOf(a.kind);
        const ib = order.indexOf(b.kind);
        const ra = ia === -1 ? order.length : ia;
        const rb = ib === -1 ? order.length : ib;
        return ra - rb;
      });
    }

    return filtered;
  }, [activePersona, configuredPersonas, filter, search, selectedStory.memoryEvents]);

  const compilerEnabled = activeModules.contextCompiler;

  const handleCreateMemory = () => {
    addNotification({
      title: "Memory item created",
      detail: "A new context item has been added to the active story's memory feed.",
      time: "Just now",
      tone: "green",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Institutional memory</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">Context becomes a working layer inside the product</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">The selected story remains the anchor, but the memory feed adapts to the current persona so teams see the right prior patterns, lessons, and proof context first.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search memory items"
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            {filters.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                  filter === item
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-slate-900"
                )}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={handleCreateMemory}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <Plus className="size-4" />
              Create memory
            </button>
          </div>

          {compilerEnabled ? (
            <div className="mt-5 space-y-3">
              {orderedEvents.map(event => (
                <article key={event.id} className="rounded-[18px] border border-slate-200 bg-slate-50/60 p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">{event.kind}</span>
                      <h4 className="mt-3 text-lg font-semibold text-slate-950">{event.title}</h4>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{event.detail}</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">{event.time}</span>
                  </div>
                  {crossProject && (
                    <div className="mt-3 rounded-[12px] border border-sky-100 bg-sky-50/60 px-3 py-2">
                      <p className="text-[11px] font-semibold text-sky-700">Also referenced in 2 other projects across this tenant</p>
                    </div>
                  )}
                </article>
              ))}

              {!orderedEvents.length ? (
                <div className="rounded-[18px] border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-900">No memory items match this filter</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Change the filter or search term to reveal other patterns, lessons, or retained proof links.</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 rounded-[18px] border border-dashed border-slate-200 bg-slate-50/60 px-5 py-14 text-center">
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">Context Compiler is currently disabled</p>
              <p className="mt-3 mx-auto max-w-2xl text-sm leading-7 text-slate-600">Memory feeds, prior story packs, and retrieved patterns are hidden because this tenant module is off. Re enable it in Config Studio to restore contextual continuity.</p>
              <button
                type="button"
                onClick={() => setLocation(buildScreenPath("config", selectedStory.id))}
                className="mt-5 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open Config Studio
              </button>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Memory scope</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Cross-project context</h3>
              </div>
              <Sparkles className="size-5 text-emerald-600" />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[16px] border border-slate-200 bg-slate-50/60 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Include cross-project memory</p>
                <p className="mt-1 text-sm text-slate-500">Surface patterns and lessons from related projects in this tenant</p>
              </div>
              <Switch
                checked={crossProject}
                onCheckedChange={setCrossProject}
              />
            </div>
            {crossProject && (
              <div className="mt-3 rounded-[14px] border border-sky-100 bg-sky-50/60 px-4 py-3">
                <p className="text-sm font-semibold text-sky-800">Cross-project memory active</p>
                <p className="mt-1 text-sm text-sky-700">Showing patterns from 3 related projects in this tenant</p>
              </div>
            )}
            <div className="mt-4 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-sm leading-7 text-slate-600">{selectedStory.personaFocus[activePersona] ?? ""}</p>
            </div>
            <div className="mt-4 space-y-3">
              {(selectedStory.personaActions[activePersona] ?? []).map(action => (
                <div key={action} className="flex items-center gap-3 rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-800">
                  <BookOpenText className="size-4 text-sky-700" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Context bridges</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Memory links stay connected to adjacent product surfaces</h3>
              </div>
              <ArrowUpRight className="size-4 text-sky-700" />
            </div>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setLocation(buildScreenPath("architecture", selectedStory.id))}
                className="flex w-full items-start gap-3 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:border-sky-200 hover:bg-white"
              >
                <span className="rounded-2xl bg-sky-50 p-2 text-sky-700 ring-1 ring-sky-100"><Layers3 className="size-4" /></span>
                <span>
                  <span className="block text-sm font-semibold text-slate-950">Open Architecture</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">See where this memory connects to services, modules, and design rationale.</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setLocation(buildScreenPath("governance", selectedStory.id))}
                className="flex w-full items-start gap-3 rounded-[16px] border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:border-sky-200 hover:bg-white"
              >
                <span className="rounded-2xl bg-amber-50 p-2 text-amber-700 ring-1 ring-amber-100"><ShieldCheck className="size-4" /></span>
                <span>
                  <span className="block text-sm font-semibold text-slate-950">Open Governance</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">See how the same memory becomes evidence coverage and control confidence.</span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
