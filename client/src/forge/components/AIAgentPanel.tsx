import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, ChevronUp, Cpu, Loader2, Zap } from "lucide-react";
import { useForge } from "@/forge/context";
import { useTypedText } from "@/forge/hooks/useTypedText";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  idle: "Ready",
  thinking: "Thinking",
  "compiling-context": "Compiling context",
  generating: "Generating",
  complete: "Complete",
  "generating-code": "Generating code",
  testing: "Running tests",
  iterating: "Iterating",
  "awaiting-review": "Awaiting review",
};

const statusColors: Record<string, string> = {
  idle: "bg-slate-300",
  thinking: "bg-amber-400",
  "compiling-context": "bg-sky-400",
  generating: "bg-violet-400",
  complete: "bg-emerald-400",
  "generating-code": "bg-violet-400",
  testing: "bg-amber-400",
  iterating: "bg-sky-400",
  "awaiting-review": "bg-emerald-400",
};

const triggers = [
  { id: "brief-generation", label: "Generate Brief" },
  { id: "architecture-impact", label: "Architecture Impact" },
  { id: "governance-check", label: "Governance Check" },
  { id: "code-review", label: "Code Review" },
  { id: "release-readiness", label: "Release Readiness" },
  { id: "context-compilation", label: "Compile Context" },
  { id: "execute-code", label: "Execute Code" },
  { id: "connector-action", label: "Connector Action" },
  { id: "explain-reasoning", label: "Explain Reasoning" },
];

function TypedSection({ heading, content, type, enabled }: { heading: string; content: string; type: string; enabled: boolean }) {
  const { displayed } = useTypedText(content, 8, enabled);
  return (
    <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
          type === "analysis" ? "bg-sky-50 text-sky-700 ring-sky-100" :
          type === "recommendation" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" :
          type === "evidence" ? "bg-violet-50 text-violet-700 ring-violet-100" :
          type === "metric" ? "bg-amber-50 text-amber-700 ring-amber-100" :
          "bg-slate-100 text-slate-600 ring-slate-200"
        )}>
          {type}
        </span>
        <p className="text-sm font-semibold text-slate-900">{heading}</p>
      </div>
      <p className="text-sm leading-7 text-slate-600 whitespace-pre-line">{displayed}</p>
    </div>
  );
}

export function AIAgentPanel() {
  const { aiAgentStatus, activeAiScript, triggerAiAgent, stopAiAgent } = useForge();
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleSections, setVisibleSections] = useState(0);

  const isActive = aiAgentStatus !== "idle";
  const isComplete = aiAgentStatus === "complete";

  const handleTrigger = (scriptId: string) => {
    setIsExpanded(true);
    setVisibleSections(0);
    triggerAiAgent(scriptId);
    const sectionInterval = setInterval(() => {
      setVisibleSections(prev => {
        const max = activeAiScript?.sections.length ?? 4;
        if (prev >= max) { clearInterval(sectionInterval); return prev; }
        return prev + 1;
      });
    }, 2000);
    setTimeout(() => {
      setVisibleSections(activeAiScript?.sections.length ?? 4);
      clearInterval(sectionInterval);
    }, 10000);
  };

  const handleStop = () => {
    stopAiAgent();
    setVisibleSections(0);
  };

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        className="flex w-full items-center justify-between rounded-[20px] p-5 text-left transition hover:bg-slate-50/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white ring-1 ring-slate-800">
            <Bot className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Forge AI Agent</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn("size-2 rounded-full", statusColors[aiAgentStatus])} />
              <p className="text-[11px] text-slate-500">{statusLabels[aiAgentStatus]}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && !isComplete && (
            <Loader2 className="size-4 animate-spin text-slate-400" />
          )}
          {isExpanded ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-5 pb-5">
              {/* Trigger buttons */}
              {!isActive && (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Select a task</p>
                  <div className="flex flex-wrap gap-2">
                    {triggers.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleTrigger(t.id)}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                      >
                        <Zap className="size-3.5" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active script header */}
              {activeAiScript && (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{activeAiScript.title}</p>
                  <button
                    type="button"
                    onClick={handleStop}
                    className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:border-rose-200 hover:text-rose-600"
                  >
                    {isComplete ? "Clear" : "Stop"}
                  </button>
                </div>
              )}

              {/* Tool calls */}
              {isActive && activeAiScript && aiAgentStatus === "compiling-context" && (
                <div className="flex flex-wrap gap-2">
                  {activeAiScript.toolCalls.map((tc, i) => (
                    <motion.div
                      key={tc.tool}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.3 }}
                      className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-700"
                    >
                      <Cpu className="size-3" />
                      {tc.tool}
                      <span className="text-slate-400">{tc.duration}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Sections */}
              {activeAiScript && (aiAgentStatus === "generating" || aiAgentStatus === "complete") && (
                <div className="space-y-3">
                  {activeAiScript.sections.slice(0, visibleSections || activeAiScript.sections.length).map((section, i) => (
                    <motion.div
                      key={section.heading}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      <TypedSection
                        heading={section.heading}
                        content={section.content}
                        type={section.type}
                        enabled={aiAgentStatus === "generating"}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Confidence score */}
              {isComplete && activeAiScript && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between rounded-[14px] border border-emerald-100 bg-emerald-50/60 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-emerald-900">Confidence score</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-emerald-100">
                      <motion.div
                        className="h-full rounded-full bg-emerald-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${activeAiScript.confidenceScore}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">{activeAiScript.confidenceScore}%</span>
                  </div>
                </motion.div>
              )}

              {/* Thinking/compiling state */}
              {isActive && (aiAgentStatus === "thinking" || aiAgentStatus === "compiling-context") && (
                <div className="rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="size-4 animate-spin text-slate-500" />
                    <p className="text-sm text-slate-600">
                      {aiAgentStatus === "thinking" ? "Analysing request and loading story context" : "Traversing memory graph across related projects"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
