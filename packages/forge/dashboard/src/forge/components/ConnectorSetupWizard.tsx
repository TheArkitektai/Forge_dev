import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForge } from "@/forge/context";
import { cn } from "@/lib/utils";
import type { Connector } from "@/forge/types";

type Props = {
  connector: Connector;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const STEP_LABELS = ["Configure", "Authorize", "Test Connection", "Configure Actions"];
const TEST_STEP_LABELS = ["Connectivity check", "Authentication verification", "Data sync test"];

export function ConnectorSetupWizard({ connector, open, onOpenChange }: Props) {
  const { updateConnectorStatus, addNotification } = useForge();
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [region, setRegion] = useState("me-central2");
  const [authorizing, setAuthorizing] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [testSteps, setTestSteps] = useState([false, false, false]);
  const [testing, setTesting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [actionConfig, setActionConfig] = useState<Record<string, { enabled: boolean; requiresApproval: boolean }>>({});

  const endpoint = `https://api.${connector.name.toLowerCase().replace(/[\s/]+/g, "")}.example.com/v1`;

  const handleAuthorize = () => {
    setAuthorizing(true);
    setTimeout(() => {
      setAuthorizing(false);
      setAuthorized(true);
    }, 2000);
  };

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => setTestSteps([true, false, false]), 1000);
    setTimeout(() => setTestSteps([true, true, false]), 2000);
    setTimeout(() => {
      setTestSteps([true, true, true]);
      setTesting(false);
      setTestComplete(true);
    }, 3000);
  };

  const reset = () => {
    setStep(0);
    setApiKey("");
    setAuthorized(false);
    setAuthorizing(false);
    setTestSteps([false, false, false]);
    setTesting(false);
    setTestComplete(false);
    setActionConfig({});
  };

  const handleFinish = () => {
    updateConnectorStatus(connector.id, "Connected");
    addNotification({
      title: `${connector.name} connected`,
      detail: "Connector is active and syncing data.",
      time: "Just now",
      tone: "green",
    });
    onOpenChange(false);
    reset();
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const maxSteps = connector.direction === "bidirectional" ? 4 : 3;
  const completedCount = testSteps.filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg rounded-[20px] border border-slate-200 bg-white p-0 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)]">
        <DialogHeader className="border-b border-slate-100 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-sky-50 ring-1 ring-sky-100 text-xs font-bold text-sky-700">
              {connector.icon}
            </div>
            <DialogTitle className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
              Connect {connector.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-0 px-6 pt-5 pb-1">
          {STEP_LABELS.slice(0, maxSteps).map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition",
                    i < step
                      ? "bg-emerald-600 text-white"
                      : i === step
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 text-slate-400"
                  )}
                >
                  {i < step ? <CheckCircle2 className="size-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-semibold whitespace-nowrap",
                    i === step ? "text-slate-900" : "text-slate-400"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < maxSteps - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1 transition",
                    i < step ? "bg-emerald-300" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 px-6 py-5"
            >
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  API Endpoint
                </label>
                <input
                  type="text"
                  defaultValue={endpoint}
                  readOnly
                  className="w-full rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Region
                </label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 focus:border-sky-300 focus:outline-none"
                >
                  <option value="me-central2">GCP me-central2 (Dammam, Saudi Arabia)</option>
                  <option value="me-west1">GCP me-west1 (Tel Aviv)</option>
                  <option value="eu-west1">GCP eu-west1 (Belgium)</option>
                  <option value="us-central1">GCP us-central1 (Iowa)</option>
                </select>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 px-6 py-5"
            >
              <div className="rounded-[14px] border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-sm text-slate-600">
                  Authorize Arkitekt Forge to access your {connector.name} account. This will open a secure OAuth flow.
                </p>
              </div>
              <button
                type="button"
                onClick={authorized ? undefined : handleAuthorize}
                disabled={authorizing || authorized}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-sm font-semibold transition",
                  authorized
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-900 bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-70"
                )}
              >
                {authorizing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="size-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Authorizing...
                  </>
                ) : authorized ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    Authorization successful
                  </>
                ) : (
                  "Authorize with OAuth"
                )}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 px-6 py-5"
            >
              <div className="space-y-2">
                {TEST_STEP_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-[12px] border border-slate-200 bg-white px-4 py-3"
                  >
                    {testSteps[i] ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      </motion.div>
                    ) : (
                      <div
                        className={cn(
                          "size-4 shrink-0 rounded-full border-2 transition",
                          testing && !testSteps[i] && i === completedCount
                            ? "border-sky-600 border-t-transparent animate-spin"
                            : "border-slate-200"
                        )}
                      />
                    )}
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        testSteps[i] ? "text-emerald-700" : "text-slate-600"
                      )}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {testComplete ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-emerald-700">
                      Connection verified. Ready to use.
                    </p>
                  </motion.div>
                ) : (
                  <Button
                    onClick={handleTest}
                    disabled={testing || testComplete}
                    className="w-full rounded-[14px] bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-70"
                  >
                    {testing ? "Testing..." : "Test Connection"}
                  </Button>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 3 && connector.direction === "bidirectional" && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 px-6 py-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Configure Actions</p>
              <p className="text-sm text-slate-600">Select which actions this connector can perform and whether they require human approval.</p>
              <div className="space-y-3">
                {connector.actions?.map(action => (
                  <div key={action.id} className="rounded-[14px] border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{action.action}</p>
                        <p className="text-xs text-slate-500">{action.description}</p>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={actionConfig[action.id]?.enabled ?? true}
                          onChange={e => setActionConfig(prev => ({ ...prev, [action.id]: { ...(prev[action.id] ?? { enabled: true, requiresApproval: action.requiresApproval }), enabled: e.target.checked } }))}
                          className="size-4 rounded border-slate-300"
                        />
                        <span className="text-xs text-slate-600">Enabled</span>
                      </label>
                    </div>
                    <div className="mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={actionConfig[action.id]?.requiresApproval ?? action.requiresApproval}
                          onChange={e => setActionConfig(prev => ({ ...prev, [action.id]: { ...(prev[action.id] ?? { enabled: true, requiresApproval: action.requiresApproval }), requiresApproval: e.target.checked } }))}
                          className="size-4 rounded border-slate-300"
                        />
                        <span className="text-xs text-slate-600">Requires approval</span>
                      </label>
                    </div>
                    {action.governanceGate && (
                      <p className="mt-2 text-xs text-slate-400">Governance gate: {action.governanceGate}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <Button
            variant="outline"
            onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}
            className="rounded-full border-slate-200 text-slate-600"
          >
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < maxSteps - 1 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !authorized}
              className="rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Next
              <ChevronRight className="ml-1.5 size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={!testComplete}
              className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Finish Setup
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
