import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, RefreshCw, ShieldCheck, X } from "lucide-react";
import { useForge } from "@/forge/context";
import { cn } from "@/lib/utils";

const providerLabels: Record<string, string> = {
  vscode: "VS Code",
  jetbrains: "JetBrains",
  neovim: "Neovim",
  cursor: "Cursor",
};

const capabilityLabels: Record<string, string> = {
  context_injection: "Context Injection",
  gate_approval: "Gate Approval",
  inline_governance: "Inline Governance",
  memory_sidebar: "Memory Sidebar",
};

export function IDEStatusBar() {
  const { ideConnections } = useForge();
  const [open, setOpen] = useState(false);

  const connected = ideConnections.filter(c => c.status === "connected" || c.status === "syncing");
  if (connected.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
      >
        <div className="flex -space-x-1">
          {connected.map(c => (
            <div key={c.id} className="relative flex size-6 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white">
              <Monitor className="size-3 text-slate-600" />
              <span className={cn("absolute -right-0.5 -top-0.5 size-2 rounded-full ring-2 ring-white", c.status === "connected" ? "bg-emerald-500" : "bg-amber-400")} />
            </div>
          ))}
        </div>
        <span className="hidden sm:inline">{connected.length} IDE{connected.length > 1 ? "s" : ""}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">IDE Integrations</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="size-4 text-slate-400" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {connected.map(c => (
                <div key={c.id} className="rounded-[14px] border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="size-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-950">{providerLabels[c.provider]}</span>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", c.status === "connected" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100")}>
                      {c.status}
                    </span>
                  </div>
                  {c.activeFile && (
                    <p className="mt-2 text-xs text-slate-500">{c.activeFile}</p>
                  )}
                  {c.activeBranch && (
                    <p className="text-xs text-slate-400">{c.activeBranch}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.capabilities.map(cap => (
                      <span key={cap} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">{capabilityLabels[cap]}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700">
                <RefreshCw className="size-3" />
                Sync context
              </button>
              <button className="flex flex-1 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700">
                <ShieldCheck className="size-3" />
                Push governance
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
