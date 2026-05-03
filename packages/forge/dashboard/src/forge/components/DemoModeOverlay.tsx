import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useLocation } from "wouter";
import { useForge } from "@/forge/context";
import { buildScreenPath } from "@/forge/data";
import {
  unifiedJourneySteps,
  ctoDeepDiveSteps,
  developerDeepDiveSteps,
  complianceDeepDiveSteps,
} from "@/forge/demoSteps";
import { cn } from "@/lib/utils";
import type { DemoStep } from "@/forge/types";

type JourneyKey = "unified" | "cto" | "developer" | "compliance";

const journeys: { key: JourneyKey; label: string; steps: DemoStep[] }[] = [
  { key: "unified", label: "Full platform tour", steps: unifiedJourneySteps },
  { key: "cto", label: "CTO deep dive", steps: ctoDeepDiveSteps },
  { key: "developer", label: "Developer journey", steps: developerDeepDiveSteps },
  { key: "compliance", label: "Compliance officer", steps: complianceDeepDiveSteps },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DemoModeOverlay({ open, onClose }: Props) {
  const { setActivePersona, selectedStory } = useForge();
  const [, setLocation] = useLocation();
  const [selectedJourney, setSelectedJourney] = useState<JourneyKey>("unified");
  const [stepIndex, setStepIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const journey = journeys.find(j => j.key === selectedJourney)!;
  const steps = journey.steps;
  const currentStep = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!started || !autoAdvance || isLast) return;
    const timer = setInterval(() => {
      setStepIndex(prev => {
        const next = prev + 1;
        const step = steps[next];
        if (step) {
          if (step.persona) setActivePersona(step.persona);
          setLocation(buildScreenPath(step.screen, selectedStory.id));
        }
        return next;
      });
    }, 8000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, autoAdvance, isLast, stepIndex]);

  const goToStep = (index: number) => {
    const step = steps[index];
    setStepIndex(index);
    if (step.persona) {
      setActivePersona(step.persona);
    }
    setLocation(buildScreenPath(step.screen, selectedStory.id));
  };

  const handleStart = () => {
    setStepIndex(0);
    setStarted(true);
    const firstStep = steps[0];
    if (firstStep.persona) setActivePersona(firstStep.persona);
    setLocation(buildScreenPath(firstStep.screen, selectedStory.id));
  };

  const handleClose = () => {
    setStarted(false);
    setStepIndex(0);
    onClose();
  };

  const handleJourneyChange = (key: JourneyKey) => {
    setSelectedJourney(key);
    setStepIndex(0);
    setStarted(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
        >
          <div className="rounded-[24px] border border-slate-200 bg-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-950/5">
            {!started ? (
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-xl bg-sky-600">
                        <Play className="size-3.5 fill-white text-white" />
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Demo mode</p>
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-100">v12</span>
                    </div>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">Choose a guided journey</h3>
                    <p className="mt-1 text-sm text-slate-600">Each journey navigates screens automatically and sets the persona for each step.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {journeys.map(j => (
                    <button
                      key={j.key}
                      type="button"
                      onClick={() => handleJourneyChange(j.key)}
                      className={cn(
                        "flex items-center justify-between rounded-[16px] border px-4 py-3 text-left transition",
                        selectedJourney === j.key
                          ? "border-slate-900 bg-slate-950 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-200 hover:bg-white"
                      )}
                    >
                      <div>
                        <p className="text-sm font-semibold">{j.label}</p>
                        <p className={cn("mt-0.5 text-[11px]", selectedJourney === j.key ? "text-white/60" : "text-slate-500")}>
                          {j.steps.length} steps
                        </p>
                      </div>
                      <div className={cn("size-4 rounded-full border-2", selectedJourney === j.key ? "border-white bg-white" : "border-slate-300")} />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleStart}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Play className="size-4 fill-white" />
                  Start {journey.label}
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-xl bg-sky-600">
                      <Play className="size-3.5 fill-white text-white" />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      {journey.label} · step {stepIndex + 1} of {steps.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAutoAdvance(v => !v)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                        autoAdvance
                          ? "border-sky-600 bg-sky-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                      )}
                    >
                      <span className={cn("inline-block size-1.5 rounded-full", autoAdvance ? "bg-white" : "bg-slate-400")} />
                      Auto
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-sky-600"
                    animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {autoAdvance && !isLast && (
                  <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      key={`auto-${stepIndex}`}
                      className="h-full rounded-full bg-emerald-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 8, ease: "linear" }}
                    />
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4"
                  >
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{currentStep.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{currentStep.narration}</p>
                    {currentStep.persona && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
                          {currentStep.persona}
                        </span>
                        {currentStep.action && (
                          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-100">
                            Action: {currentStep.action}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => goToStep(stepIndex - 1)}
                      disabled={isFirst}
                      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="size-4" />
                      Back
                    </button>
                    {!isLast ? (
                      <button
                        type="button"
                        onClick={() => goToStep(stepIndex + 1)}
                        className="flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Next
                        <ChevronRight className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                      >
                        Finish tour
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goToStep(i)}
                        className={cn(
                          "rounded-full transition",
                          i === stepIndex ? "w-6 h-2 bg-slate-950" : "size-2 bg-slate-200 hover:bg-slate-400"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
