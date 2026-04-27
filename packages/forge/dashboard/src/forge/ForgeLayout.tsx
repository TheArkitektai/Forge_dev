import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  LayoutDashboard,
  Menu,
  Network,
  Package,
  PanelLeftClose,
  Play,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Waypoints,
  Workflow,
  X,
} from "lucide-react";
import { IDEStatusBar } from "@/forge/components/IDEStatusBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { buildScreenPath, projects as allProjectsList } from "@/forge/data";
import { useForge } from "@/forge/context";
import type { MetricTone, ScreenKey } from "@/forge/types";

import { DemoModeOverlay } from "@/forge/components/DemoModeOverlay";

type ForgeLayoutProps = {
  screenKey: ScreenKey;
  title: string;
  summary: string;
  children: ReactNode;
};

const iconMap: Record<string, typeof LayoutDashboard> = {
  portfolio: Building2,
  command: LayoutDashboard,
  delivery: Workflow,
  context: Sparkles,
  architecture: Network,
  governance: ShieldCheck,
  config: Settings2,
  output: Package,
  operate: Activity,
};

const toneMap: Record<MetricTone, string> = {
  blue: "bg-sky-50 text-sky-700 ring-sky-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
};

export function ForgeLayout({ screenKey, title, summary, children }: ForgeLayoutProps) {
  const {
    activePersona,
    setActivePersona,
    personas,
    screens,
    stories,
    selectedStory,
    notifications,
    searchResults,
    currentUser,
    pendingModule,
    modules,
    cancelModuleToggle,
    confirmModuleToggle,
    tenants,
    tenantProjects,
    activeTenant,
    activeProject,
    setActiveTenantId,
    setActiveProjectId,
    pendingConnector,
    connectors: allConnectors,
    cancelConnectorAction,
    confirmConnectorAction,
  } = useForge();
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [demoOpen, setDemoOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setNavOpen(false);
  }, [screenKey]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }

      if (event.key === "/" && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setShowNotifications(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activePersonaDefinition = personas.find(persona => persona.key === activePersona) ?? personas[0];
  const currentModule = modules.find(module => module.key === pendingModule) ?? null;

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return searchResults.slice(0, 8);
    }

    const normalized = query.toLowerCase();
    return searchResults.filter(result => {
      return `${result.title} ${result.detail} ${result.category}`.toLowerCase().includes(normalized);
    });
  }, [query, searchResults]);

  const unreadCount = notifications.length;

  const openPath = (nextScreen: ScreenKey, storyId?: string) => {
    setLocation(buildScreenPath(nextScreen, storyId ?? selectedStory.id));
    setSearchOpen(false);
    setShowNotifications(false);
  };

  const breadcrumbText = `Arkitekt Forge / Release 24.4 / ${title}`;

  const navigation = (
    <div className="flex h-full flex-col bg-white">
      <div className="rounded-[18px] border border-slate-200 bg-slate-50/90 p-4 shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Arkitekt Forge</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.65rem] font-semibold text-slate-950">Agentic OS</h1>
          </div>
          <div className="rounded-2xl bg-white p-2 text-sky-700 ring-1 ring-slate-200">
            <Sparkles className="size-5" />
          </div>
        </div>

        {/* Tenant and project switcher */}
        <div className="mt-5 relative">
          <button
            type="button"
            onClick={() => setTenantDropdownOpen(v => !v)}
            className="w-full rounded-[16px] border border-sky-100 bg-white p-4 text-left transition hover:border-sky-200"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Active workspace</p>
              <ChevronDown className={cn("size-4 text-slate-400 transition", tenantDropdownOpen && "rotate-180")} />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">{activeTenant.name}</p>
            <p className="mt-1 text-sm text-sky-700">{activeProject.name}</p>
            <p className="mt-1 text-sm text-slate-500">{activeProject.release}</p>
          </button>
          <AnimatePresence>
            {tenantDropdownOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.4)]"
              >
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Switch workspace</p>
                <div className="max-h-[320px] space-y-1 overflow-y-auto">
                  {tenants.map(tenant => {
                    const tProjects = allProjectsList.filter(p => p.tenantId === tenant.id);
                    return (
                      <div key={tenant.id}>
                        <p className="mt-2 mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{tenant.name}</p>
                        {tProjects.map(project => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => {
                              setActiveTenantId(tenant.id);
                              setActiveProjectId(project.id);
                              setTenantDropdownOpen(false);
                              openPath("command");
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left transition",
                              project.id === activeProject.id && tenant.id === activeTenant.id
                                ? "bg-slate-950 text-white"
                                : "hover:bg-sky-50 text-slate-700"
                            )}
                          >
                            <div className="min-w-0">
                              <p className={cn("text-sm font-semibold truncate", project.id === activeProject.id && tenant.id === activeTenant.id ? "text-white" : "text-slate-900")}>{project.name}</p>
                              <p className={cn("text-[11px]", project.id === activeProject.id && tenant.id === activeTenant.id ? "text-white/60" : "text-slate-500")}>{project.release}</p>
                            </div>
                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", project.id === activeProject.id && tenant.id === activeTenant.id ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500")}>{project.status}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Product navigation</p>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">{activePersonaDefinition.shortLabel}</span>
        </div>
        <div className="space-y-3">
          {/* OVERVIEW */}
          <div>
            <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Overview</p>
            <div className="space-y-1.5">
              {screens.filter(s => s.key === "portfolio" || s.key === "command").map(screen => {
                const Icon = iconMap[screen.key];
                const isActive = screen.key === screenKey;
                return (
                  <button
                    key={screen.key}
                    type="button"
                    onClick={() => openPath(screen.key)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-[14px] border px-3.5 py-2.5 text-left transition",
                      isActive
                        ? "border-slate-900 bg-slate-950 text-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.75)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60 hover:text-slate-950"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={cn("rounded-xl p-1.5 ring-1", isActive ? "bg-white/10 ring-white/15" : "bg-slate-50 text-sky-700 ring-slate-200")}>
                        <Icon className="size-4" />
                      </span>
                      <span className="text-sm font-semibold">{screen.label}</span>
                    </span>
                    <ChevronRight className={cn("size-4 transition", isActive ? "text-white" : "text-slate-400 group-hover:text-sky-700")} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* DELIVERY */}
          <div>
            <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Delivery</p>
            <div className="space-y-1.5">
              {screens.filter(s => s.key === "delivery" || s.key === "output").map(screen => {
                const Icon = iconMap[screen.key];
                const isActive = screen.key === screenKey;
                const liveCount = screen.key === "delivery" ? stories.filter(s => s.phase === "Operate").length : 0;
                return (
                  <button
                    key={screen.key}
                    type="button"
                    onClick={() => openPath(screen.key)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-[14px] border px-3.5 py-2.5 text-left transition",
                      isActive
                        ? "border-slate-900 bg-slate-950 text-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.75)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60 hover:text-slate-950"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={cn("rounded-xl p-1.5 ring-1", isActive ? "bg-white/10 ring-white/15" : "bg-slate-50 text-sky-700 ring-slate-200")}>
                        <Icon className="size-4" />
                      </span>
                      <span className="text-sm font-semibold">{screen.label}</span>
                      {liveCount > 0 && (
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", isActive ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100")}>
                          {liveCount} live
                        </span>
                      )}
                    </span>
                    <ChevronRight className={cn("size-4 transition", isActive ? "text-white" : "text-slate-400 group-hover:text-sky-700")} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* INTELLIGENCE + CONFIG */}
          <div>
            <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Intelligence &amp; Config</p>
            <div className="space-y-1.5">
              {screens.filter(s => s.key === "context" || s.key === "architecture" || s.key === "governance" || s.key === "config").map(screen => {
                const Icon = iconMap[screen.key];
                const isActive = screen.key === screenKey;
                return (
                  <button
                    key={screen.key}
                    type="button"
                    onClick={() => openPath(screen.key)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-[14px] border px-3.5 py-2.5 text-left transition",
                      isActive
                        ? "border-slate-900 bg-slate-950 text-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.75)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60 hover:text-slate-950"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={cn("rounded-xl p-1.5 ring-1", isActive ? "bg-white/10 ring-white/15" : "bg-slate-50 text-sky-700 ring-slate-200")}>
                        <Icon className="size-4" />
                      </span>
                      <span className="text-sm font-semibold">{screen.label}</span>
                    </span>
                    <ChevronRight className={cn("size-4 transition", isActive ? "text-white" : "text-slate-400 group-hover:text-sky-700")} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)]">
        <div className="flex items-center gap-3">
          <Avatar className="size-11 border border-slate-200 bg-slate-100 text-slate-900">
            <AvatarFallback>{currentUser.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-950">{currentUser.name}</p>
            <p className="text-sm text-slate-600">{currentUser.role}</p>
          </div>
          <button type="button" className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900" aria-label="Open account settings">
            <UserRound className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(248,252,255,1)_0%,rgba(245,250,248,1)_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1720px] gap-4 px-3 py-3 sm:px-4 xl:px-5">
        {!isMobile ? (
          <aside className="sticky top-3 hidden h-[calc(100vh-1.5rem)] w-[300px] shrink-0 rounded-[22px] border border-slate-200 bg-white/95 p-4 shadow-[0_30px_80px_-54px_rgba(15,23,42,0.3)] xl:flex xl:flex-col">
            {navigation}
          </aside>
        ) : null}

        <AnimatePresence>
          {isMobile && navOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm xl:hidden"
              onClick={() => setNavOpen(false)}
            >
              <motion.aside
                initial={{ x: -32, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -32, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full w-[92vw] max-w-[340px] rounded-r-[22px] bg-white p-4 shadow-[0_30px_80px_-54px_rgba(15,23,42,0.45)]"
                onClick={event => event.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Workspace navigation</p>
                  <button type="button" onClick={() => setNavOpen(false)} className="rounded-full bg-slate-100 p-2 text-slate-600">
                    <X className="size-4" />
                  </button>
                </div>
                {navigation}
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          <div className="sticky top-3 z-30 mb-4 rounded-[22px] border border-slate-200 bg-white/92 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)] backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {isMobile ? (
                  <button
                    type="button"
                    onClick={() => setNavOpen(true)}
                    className="mt-1 rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200 xl:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="size-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setHeaderExpanded(value => !value)}
                    className="mt-1 rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
                    aria-label="Toggle header details"
                  >
                    {headerExpanded ? <PanelLeftClose className="size-4" /> : <Menu className="size-4" />}
                  </button>
                )}

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{breadcrumbText}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h2 className="font-[family-name:var(--font-display)] text-[1.65rem] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[1.85rem]">{title}</h2>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 ring-1 ring-emerald-100">Zero autonomous action</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
                <IDEStatusBar />
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                >
                  <Play className="size-3.5 fill-sky-700" />
                  Demo
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(value => !value)}
                    className="relative rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                    aria-label="Open notifications"
                  >
                    <Bell className="size-4.5" />
                    <span className="absolute -right-1 -top-1 rounded-full bg-slate-950 px-1.5 py-0.5 text-[10px] font-semibold text-white">{unreadCount}</span>
                  </button>
                  <AnimatePresence>
                    {showNotifications ? (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[320px] rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]"
                      >
                        <div className="mb-2 flex items-center justify-between px-1">
                          <p className="text-sm font-semibold text-slate-950">Notification Center</p>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{unreadCount} new</span>
                        </div>
                        <div className="space-y-2">
                          {notifications.map(item => (
                            <div key={item.id} className="rounded-[14px] border border-slate-200 bg-slate-50/70 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                                </div>
                                <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold ring-1", toneMap[item.tone])}>{item.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {headerExpanded ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.95fr)]">
                    <div>
                      <p className="max-w-3xl text-sm leading-7 text-slate-600">{summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">Active story: {selectedStory.title}</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">Owner: {selectedStory.owner}</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">Current phase: {selectedStory.phase}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <div className="flex items-center gap-2 rounded-[18px] border border-slate-200 bg-slate-50/70 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                          <Search className="size-4 text-slate-400" />
                          <Input
                            ref={inputRef}
                            value={query}
                            onChange={event => {
                              setQuery(event.target.value);
                              setSearchOpen(true);
                            }}
                            onFocus={() => setSearchOpen(true)}
                            placeholder="Search stories, memory, approvals, and modules"
                            className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
                          />
                          <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">Ctrl K</span>
                        </div>

                        <AnimatePresence>
                          {searchOpen ? (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-40 rounded-[18px] border border-slate-200 bg-white p-2 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.34)]"
                            >
                              <div className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
                                {filteredResults.length ? (
                                  filteredResults.map(result => (
                                    <button
                                      key={result.id}
                                      type="button"
                                      onClick={() => openPath(result.screen, result.storyId)}
                                      className="flex w-full items-start justify-between rounded-[14px] px-3 py-2.5 text-left transition hover:bg-sky-50"
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">{result.title}</p>
                                        <p className="mt-1 text-sm text-slate-600">{result.detail}</p>
                                      </div>
                                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{result.category}</span>
                                    </button>
                                  ))
                                ) : (
                                  <div className="rounded-[14px] border border-dashed border-slate-200 px-4 py-8 text-center">
                                    <p className="text-sm font-semibold text-slate-900">No matching results</p>
                                    <p className="mt-2 text-sm text-slate-600">Try a story title, approval item, or module name.</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {personas.map(persona => (
                          <button
                            key={persona.key}
                            type="button"
                            onClick={() => setActivePersona(persona.key)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                              activePersona === persona.key
                                ? "border-slate-900 bg-slate-950 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-slate-900"
                            )}
                          >
                            {persona.label}
                          </button>
                        ))}
                      </div>

                      <p className="text-sm leading-6 text-slate-600">{activePersonaDefinition.commandSummary}</p>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="pb-10">{children}</div>
        </div>
      </div>

      <DemoModeOverlay open={demoOpen} onClose={() => setDemoOpen(false)} />

      <Dialog open={!!pendingModule} onOpenChange={open => (!open ? cancelModuleToggle() : undefined)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)] text-2xl text-slate-950">Update module activation</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-600">
              {currentModule
                ? `${currentModule.title} affects ${currentModule.dependencyLabel}. Confirm the change to see the workspace adapt.`
                : "Confirm the module change."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={cancelModuleToggle} className="border-slate-200 text-slate-700">
              Keep current state
            </Button>
            <Button onClick={confirmModuleToggle} className="bg-slate-950 text-white hover:bg-slate-800">
              Apply change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
